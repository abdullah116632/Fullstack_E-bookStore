import crypto from 'crypto';
import Book from '../models/Book.js';
import Purchase from '../models/Purchase.js';
import Reader from '../models/Reader.js';
import { HTTP_STATUS, ORDER_STATUS, PAYMENT_STATUS } from '../config/constants.js';
import { sendGuestPurchaseAccountEmail, sendManualPurchaseSubmittedEmail } from '../utils/emailService.js';
import { runAutoActivation } from '../utils/purchaseActivation.js';
import { getSignedRawFileUrl } from '../utils/cloudinaryUpload.js';
import { generateAccountSetupToken } from '../utils/tokenUtils.js';

const RECEIVER_MOBILE_NUMBER = '01768899941';

const fetchPdfBuffer = async (url) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ebook-marketplace-reader/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed with status ${response.status}`);
  }

  return response.arrayBuffer();
};

const buildGuestNameFromEmail = (email) => {
  const prefix = String(email || 'reader').split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').trim();
  if (!prefix) return 'Reader User';
  return prefix
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .slice(0, 50);
};

const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  const randomBytes = crypto.randomBytes(10);
  return Array.from(randomBytes, (byte) => chars[byte % chars.length]).join('');
};

const ensureReader = (req, res) => {
  if (!req.user || req.user.constructor?.modelName !== 'Reader') {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Only readers can access this route.',
    });
    return false;
  }
  return true;
};

export const createManualPurchase = async (req, res, next) => {
  try {
    const { bookId, paymentMethod, senderMobileNumber, transactionId, email } = req.body;

    const book = await Book.findOne({ _id: bookId, visibility: 'public' })
      .select('title author price visibility')
      .lean();

    if (!book) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Book not found or unavailable for purchase.',
      });
    }

    const normalizedTransactionId = String(transactionId || '').trim();
    const existingTransaction = await Purchase.findOne({
      'paymentDetails.transactionId': normalizedTransactionId,
    }).lean();

    if (existingTransaction) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'This transaction ID has already been submitted.',
      });
    }

    let buyer = null;
    let buyerEmail = '';
    let accountCreated = false;
    let generatedPassword = null;

    const loggedInEmail = req.user?.email ? String(req.user.email).trim().toLowerCase() : '';
    const formEmail = String(email || '').trim().toLowerCase();

    const resolveOrCreateReaderByEmail = async (candidateEmail, fallbackName) => {
      const existingReader = await Reader.findOne({ email: candidateEmail });
      if (existingReader) {
        return {
          reader: existingReader,
          email: existingReader.email,
          accountCreatedNow: false,
        };
      }

      generatedPassword = generateTemporaryPassword();
      const createdReader = await Reader.create({
        fullName: fallbackName || buildGuestNameFromEmail(candidateEmail),
        email: candidateEmail,
        password: generatedPassword,
        isEmailVerified: true,
        isActive: true,
      });

      const accountSetupToken = generateAccountSetupToken({
        readerId: createdReader._id,
        email: createdReader.email,
      });
      const frontendBaseUrl = String(process.env.FRONTEND_URL || 'http://localhost:3000')
        .split(',')[0]
        .trim();
      const setupPasswordLink = `${frontendBaseUrl}/setup-password?token=${encodeURIComponent(accountSetupToken)}`;

      try {
        await sendGuestPurchaseAccountEmail(
          createdReader.email,
          createdReader.fullName,
          generatedPassword,
          setupPasswordLink
        );
      } catch (emailError) {
        console.error('Failed to send auto-created reader account email:', emailError);
      }

      return {
        reader: createdReader,
        email: createdReader.email,
        accountCreatedNow: true,
      };
    };

    if (loggedInEmail) {
      const readerByLoggedInEmail = await Reader.findOne({ email: loggedInEmail });

      if (readerByLoggedInEmail) {
        buyer = readerByLoggedInEmail;
        buyerEmail = readerByLoggedInEmail.email;
      } else {
        if (!formEmail) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Reader account not found for logged-in email. Please provide an email in the form to create a reader account.',
          });
        }

        const resolved = await resolveOrCreateReaderByEmail(formEmail, req.user?.fullName);
        buyer = resolved.reader;
        buyerEmail = resolved.email;
        accountCreated = resolved.accountCreatedNow;
      }
    } else {
      if (!formEmail) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Email is required for guest purchase.',
        });
      }

      const resolved = await resolveOrCreateReaderByEmail(formEmail);
      buyer = resolved.reader;
      buyerEmail = resolved.email;
      accountCreated = resolved.accountCreatedNow;
    }

    if (!buyer.isActive) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Your reader account is deactivated.',
      });
    }

    const existingActiveOrder = await Purchase.findOne({
      buyer: buyer._id,
      'books.bookId': book._id,
      'accessControl.isUnlocked': true,
      status: ORDER_STATUS.COMPLETED,
      paymentStatus: PAYMENT_STATUS.COMPLETED,
    })
      .select('orderNumber status accessControl.isUnlocked')
      .lean();

    if (existingActiveOrder) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'You already have an active order for this book. Please wait for activation or visit Active Book.',
        data: {
          orderNumber: existingActiveOrder.orderNumber,
          status: existingActiveOrder.status,
          isUnlocked: Boolean(existingActiveOrder.accessControl?.isUnlocked),
        },
      });
    }

    const amount = Number(book.price || 0);

    const order = await Purchase.create({
      buyer: buyer._id,
      buyerEmail,
      books: [
        {
          bookId: book._id,
          price: amount,
          discount: 0,
        },
      ],
      totalAmount: amount,
      discountAmount: 0,
      taxAmount: 0,
      finalAmount: amount,
      status: ORDER_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.PENDING,
      paymentMethod,
      paymentDetails: {
        senderMobileNumber: String(senderMobileNumber || '').trim(),
        transactionId: normalizedTransactionId,
        gateway: paymentMethod,
        receiverMobileNumber: RECEIVER_MOBILE_NUMBER,
      },
      accessControl: {
        isUnlocked: false,
      },
      notes: 'Submitted via manual mobile banking purchase form.',
    });

    try {
      await sendManualPurchaseSubmittedEmail(buyerEmail, buyer.fullName, order.orderNumber, book.title);
    } catch (emailError) {
      console.error('Failed to send purchase submission email:', emailError);
    }

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Purchase submitted successfully. Your book will be unlocked shortly (maximum 1 hour).',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        unlockStatus: order.accessControl?.isUnlocked,
        buyerEmail,
        accountCreated,
        accountSetupRequired: accountCreated,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyUnlockedBooks = async (req, res, next) => {
  try {
    if (!ensureReader(req, res)) return;

    await runAutoActivation();

    const orders = await Purchase.find({
      buyer: req.user._id,
      status: ORDER_STATUS.COMPLETED,
      paymentStatus: PAYMENT_STATUS.COMPLETED,
      'accessControl.isUnlocked': true,
    })
      .populate('books.bookId', 'title author coverImage fileUrl price')
      .sort({ createdAt: -1 })
      .lean();

    const uniqueBooks = new Map();

    orders.forEach((order) => {
      order.books.forEach((item) => {
        if (!item.bookId?._id) return;

        const key = String(item.bookId._id);
        if (uniqueBooks.has(key)) return;

        uniqueBooks.set(key, {
          _id: item.bookId._id,
          title: item.bookId.title,
          author: item.bookId.author,
          coverImage: item.bookId.coverImage,
          price: item.price,
          fileUrl: item.bookId.fileUrl,
          purchasedOn: order.createdAt,
          orderNumber: order.orderNumber,
        });
      });
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        books: Array.from(uniqueBooks.values()),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPurchasedBooks = async (req, res, next) => {
  try {
    if (!ensureReader(req, res)) return;

    await runAutoActivation();

    const orders = await Purchase.find({
      buyer: req.user._id,
      books: { $exists: true, $ne: [] },
    })
      .populate('books.bookId', 'title author coverImage fileUrl price visibility isVisible')
      .sort({ createdAt: -1 })
      .lean();

    const uniqueBooks = new Map();

    orders.forEach((order) => {
      order.books.forEach((item) => {
        if (!item.bookId?._id) return;
        if (item.bookId.visibility === 'private' || item.bookId.visibility === false) return;
        if (item.bookId.isVisible === false) return;

        const key = String(item.bookId._id);
        if (uniqueBooks.has(key)) return;

        const isUnlocked = Boolean(order.accessControl?.isUnlocked);

        uniqueBooks.set(key, {
          _id: item.bookId._id,
          title: item.bookId.title,
          author: item.bookId.author,
          coverImage: item.bookId.coverImage,
          price: item.price,
          fileUrl: item.bookId.fileUrl,
          visibility: item.bookId.visibility,
          isVisible: item.bookId.isVisible,
          purchasedOn: order.createdAt,
          orderNumber: order.orderNumber,
          isUnlocked,
          purchaseStatus: order.status,
        });
      });
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        books: Array.from(uniqueBooks.values()),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUnlockedBookPdf = async (req, res, next) => {
  try {
    if (!ensureReader(req, res)) return;

    await runAutoActivation();

    const { id } = req.params;

    const unlockedOrder = await Purchase.findOne({
      buyer: req.user._id,
      'books.bookId': id,
      'accessControl.isUnlocked': true,
      status: ORDER_STATUS.COMPLETED,
      paymentStatus: PAYMENT_STATUS.COMPLETED,
    }).lean();

    if (!unlockedOrder) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'This book is not unlocked for your account yet.',
      });
    }

    const book = await Book.findById(id).select('title fileUrl filePublicId');
    if (!book || !book.fileUrl) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Book file not found.',
      });
    }

    let sourceBytes;
    try {
      sourceBytes = await fetchPdfBuffer(book.fileUrl);
    } catch (primaryError) {
      let signedCandidates = [];
      if (book.filePublicId) {
        try {
          signedCandidates = getSignedRawFileUrl({ publicId: book.filePublicId });
        } catch (signedUrlError) {
          signedCandidates = [];
        }
      }

      let fetched = false;
      for (const signedUrl of signedCandidates) {
        try {
          // eslint-disable-next-line no-await-in-loop
          sourceBytes = await fetchPdfBuffer(signedUrl);
          fetched = true;
          break;
        } catch (signedError) {
          // Try next candidate.
        }
      }

      if (!fetched) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Unable to fetch source PDF for reading.',
        });
      }
    }

    const fileName = `${String(book.title || 'book').replace(/\s+/g, '-').toLowerCase()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(HTTP_STATUS.OK).send(Buffer.from(sourceBytes));
  } catch (error) {
    next(error);
  }
};
