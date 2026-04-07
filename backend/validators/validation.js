import { body, param, query } from 'express-validator';

export const signupValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const verifySignupValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').trim().notEmpty().withMessage('OTP is required').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 characters'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const adminSignupOTPRequestValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phoneNumber').optional().trim(),
];

export const adminSignupOTPVerifyValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').trim().notEmpty().withMessage('OTP is required').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 characters'),
];

export const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
];

export const verifyResetOTPValidation = [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 characters')
    .matches(/^\d{6}$/)
    .withMessage('OTP must be exactly 6 digits'),
];

export const resetPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const completeAutoAccountSetupValidation = [
  body('token').trim().notEmpty().withMessage('Setup token is required'),
  body('temporaryPassword').trim().notEmpty().withMessage('Temporary password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const updatePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

export const updateProfileValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
];

export const requestEmailChangeOTPValidation = [
  body('newEmail').isEmail().withMessage('Please provide a valid new email'),
  body('currentPassword').notEmpty().withMessage('Current password is required'),
];

export const verifyEmailChangeOTPValidation = [
  body('otp').trim().notEmpty().withMessage('OTP is required').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 characters'),
];

export const publisherSignupValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('publisherName').trim().notEmpty().withMessage('Publisher name is required').isLength({ min: 2 }).withMessage('Publisher name must be at least 2 characters'),
  body('phoneNumber').trim().notEmpty().withMessage('Phone number is required').matches(/^\d{11}$/).withMessage('Phone number must be exactly 11 digits'),
  body('address.street').trim().notEmpty().withMessage('Street address is required'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.zipCode').trim().notEmpty().withMessage('Zip code is required'),
];

export const publisherUpdateProfileValidation = [
  body('fullName').optional().trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('publisherName').optional().trim().isLength({ min: 2 }).withMessage('Publisher name must be at least 2 characters'),
  body('phoneNumber').optional().trim().matches(/^\d{11}$/).withMessage('Phone number must be exactly 11 digits'),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.zipCode').optional().trim(),
];

export const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['reader', 'publisher']).withMessage('Invalid role'),
];

export const bookValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('author').trim().notEmpty().withMessage('Author name is required'),
  body('description').notEmpty().withMessage('Description is required').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').notEmpty().withMessage('Price is required').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('pages').notEmpty().withMessage('Pages is required').isInt({ min: 1 }).withMessage('Pages must be at least 1'),
  body('publicationDate').notEmpty().withMessage('Publication date is required').isISO8601().withMessage('Invalid date format'),
  body('language').optional().isIn(['English', 'Arabic', 'French', 'Spanish', 'German', 'Chinese', 'Japanese', 'Hindi']),
];

export const reviewValidation = [
  body('rating').notEmpty().withMessage('Rating is required').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required').isLength({ min: 10, max: 5000 }).withMessage('Comment must be between 10 and 5000 characters'),
  body('title').optional().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
];

export const orderValidation = [
  body('books').notEmpty().withMessage('At least one book is required').isArray({ min: 1 }).withMessage('Books must be an array with at least 1 item'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required').isIn(['credit-card', 'debit-card', 'paypal', 'stripe']),
];

export const createManualPurchaseValidation = [
  body('bookId').isMongoId().withMessage('Valid book ID is required'),
  body('paymentMethod').isIn(['bkash', 'nagad', 'rocket', 'upay']).withMessage('Invalid mobile banking account'),
  body('senderMobileNumber')
    .trim()
    .matches(/^\d{11}$/)
    .withMessage('Sender mobile number must be exactly 11 digits'),
  body('transactionId').trim().isLength({ min: 6, max: 100 }).withMessage('Transaction ID must be between 6 and 100 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
];

export const idValidation = [param('id').isMongoId().withMessage('Invalid ID format')];

export const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be greater than 0'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];
