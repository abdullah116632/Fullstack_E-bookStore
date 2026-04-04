import express from 'express';
import { createManualPurchase, getMyUnlockedBooks, getMyPurchasedBooks, getUnlockedBookPdf } from '../controllers/purchaseController.js';
import { optionalProtect, protect } from '../middlewares/auth.js';
import { handleValidationErrors } from '../middlewares/common.js';
import { createManualPurchaseValidation } from '../validators/validation.js';

const router = express.Router();

router.post('/', optionalProtect, createManualPurchaseValidation, handleValidationErrors, createManualPurchase);
router.get('/my-unlocked', protect, getMyUnlockedBooks);
router.get('/my-books', protect, getMyPurchasedBooks);
router.get('/books/:id/read', protect, getUnlockedBookPdf);

export default router;
