import Book from '../models/Book.js';
import { HTTP_STATUS } from '../config/constants.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';
import { PDFDocument } from 'pdf-lib';

const getWordCount = (text = '') => text.trim().split(/\s+/).filter(Boolean).length;

export const uploadPublisherBook = async (req, res, next) => {
  try {
    if (!req.user || req.user.constructor?.modelName !== 'Publisher') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Only publishers can upload books.',
      });
    }

    const { title, author, description } = req.body;

    if (!title || !author || !description) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Title, author and description are required.',
      });
    }

    const descriptionWordCount = getWordCount(description);
    if (descriptionWordCount < 100) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Book description must be at least 100 words.',
      });
    }

    const coverImage = req.files?.coverImage?.[0];
    const bookFile = req.files?.bookFile?.[0];

    if (!coverImage || !bookFile) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Cover image and PDF file are required.',
      });
    }

    if (!coverImage.mimetype.startsWith('image/')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Cover image must be an image file.',
      });
    }

    if (bookFile.mimetype !== 'application/pdf') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Main book file must be a PDF.',
      });
    }

    let totalPages = 1;
    try {
      const pdfDoc = await PDFDocument.load(bookFile.buffer);
      totalPages = Math.max(1, pdfDoc.getPageCount());
    } catch (pdfError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Unable to read PDF pages. Please upload a valid PDF file.',
      });
    }

    const [coverUpload, pdfUpload] = await Promise.all([
      uploadBufferToCloudinary({
        buffer: coverImage.buffer,
        fileName: coverImage.originalname,
        mimeType: coverImage.mimetype,
        folder: 'ebook-marketplace/book-covers',
        resourceType: 'image',
      }),
      uploadBufferToCloudinary({
        buffer: bookFile.buffer,
        fileName: bookFile.originalname,
        mimeType: bookFile.mimetype,
        folder: 'ebook-marketplace/book-files',
        resourceType: 'raw',
      }),
    ]);

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      description: description.trim(),
      publisher: req.user._id,
      coverImage: coverUpload.url,
      coverImagePublicId: coverUpload.publicId,
      fileUrl: pdfUpload.url,
      filePublicId: pdfUpload.publicId,
      fileType: 'pdf',
      pages: totalPages,
      visibility: 'draft',
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Book uploaded successfully.',
      data: {
        book,
      },
    });
  } catch (error) {
    next(error);
  }
};
