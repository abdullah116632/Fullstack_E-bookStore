import Book from '../models/Book.js';
import { HTTP_STATUS } from '../config/constants.js';
import { PDFDocument } from 'pdf-lib';
import { getSignedRawFileUrl } from '../utils/cloudinaryUpload.js';

const fetchPdfBuffer = async (url) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ebook-marketplace-preview/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed with status ${response.status}`);
  }

  return response.arrayBuffer();
};

const fetchBookPdfBuffer = async (book) => {
  try {
    return await fetchPdfBuffer(book.fileUrl);
  } catch (primaryError) {
    let signedCandidates = [];
    if (book.filePublicId) {
      try {
        signedCandidates = getSignedRawFileUrl({ publicId: book.filePublicId });
      } catch (signedUrlError) {
        signedCandidates = [];
      }
    }

    for (const signedUrl of signedCandidates) {
      try {
        // eslint-disable-next-line no-await-in-loop
        return await fetchPdfBuffer(signedUrl);
      } catch (signedError) {
        // Try next signed URL candidate.
      }
    }

    throw primaryError;
  }
};

export const getFeaturedBooks = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 6);

    const books = await Book.find({
      isFeatured: true,
      visibility: 'public',
    })
      .select('title author coverImage price fileUrl description isFeatured visibility createdAt')
      .sort({ createdAt: -1 })
      .limit(Number.isNaN(limit) ? 6 : Math.max(1, Math.min(limit, 20)))
      .lean();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        books,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicBooks = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 100);

    const books = await Book.find({
      visibility: 'public',
    })
      .select('title author coverImage price fileUrl description isFeatured visibility createdAt')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(Number.isNaN(limit) ? 100 : Math.max(1, Math.min(limit, 500)))
      .lean();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        books,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBooks = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 200);

    const books = await Book.find({})
      .select('title author coverImage price fileUrl description isFeatured visibility createdAt')
      .sort({ createdAt: -1 })
      .limit(Number.isNaN(limit) ? 200 : Math.max(1, Math.min(limit, 1000)))
      .lean();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        books,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicBookById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const book = await Book.findOne({ _id: id, visibility: 'public' })
      .select('title author coverImage price description pages language isFeatured fileUrl filePublicId fileType createdAt');

    if (!book) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Book not found.',
      });
    }

    const storedPages = Number(book.pages || 0);
    if (book.fileType === 'pdf' && book.fileUrl && storedPages <= 1) {
      try {
        const sourceBytes = await fetchBookPdfBuffer(book);
        const sourcePdf = await PDFDocument.load(sourceBytes);
        const computedPages = Math.max(1, sourcePdf.getPageCount());

        if (computedPages !== storedPages) {
          book.pages = computedPages;
          await book.save();
        }
      } catch (error) {
        // Keep stored pages value if PDF metadata cannot be read.
      }
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        book: book.toObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookPreviewPdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestedPages = Number(req.query.pages || 7);
    const previewPagesLimit = Math.max(1, Math.min(requestedPages, 7));

    const book = await Book.findById(id).select('title fileUrl filePublicId visibility');
    if (!book) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Book not found.',
      });
    }

    if (book.visibility !== 'public') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Preview is not available for this book.',
      });
    }

    if (!book.fileUrl) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Book file URL is missing.',
      });
    }

    let sourceBytes;

    try {
      sourceBytes = await fetchBookPdfBuffer(book);
    } catch (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Unable to fetch source PDF for preview.',
      });
    }

    const sourcePdf = await PDFDocument.load(sourceBytes);
    const pageCount = sourcePdf.getPageCount();
    const copyCount = Math.min(previewPagesLimit, pageCount);

    const previewPdf = await PDFDocument.create();
    const pageIndexes = Array.from({ length: copyCount }, (_, index) => index);
    const copiedPages = await previewPdf.copyPages(sourcePdf, pageIndexes);
    copiedPages.forEach((page) => previewPdf.addPage(page));

    const previewBytes = await previewPdf.save();
    const fileName = `${String(book.title || 'book-preview').replace(/\s+/g, '-').toLowerCase()}-preview.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(HTTP_STATUS.OK).send(Buffer.from(previewBytes));
  } catch (error) {
    next(error);
  }
};
