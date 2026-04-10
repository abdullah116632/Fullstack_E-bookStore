import express from 'express';
import {
	getAllPurchasesForAdmin,
	approvePurchaseByAdmin,
	deactivatePurchaseByAdmin,
	markPurchaseCheckedByAdmin,
} from '../controllers/adminPurchaseController.js';
import { protect } from '../middlewares/auth.js';
import { handleValidationErrors } from '../middlewares/common.js';
import { idValidation, paginationValidation } from '../validators/validation.js';

const router = express.Router();

router.get('/', protect, paginationValidation, handleValidationErrors, getAllPurchasesForAdmin);
router.patch('/:id/approve', protect, idValidation, handleValidationErrors, approvePurchaseByAdmin);
router.patch('/:id/deactivate', protect, idValidation, handleValidationErrors, deactivatePurchaseByAdmin);
router.patch('/:id/check', protect, idValidation, handleValidationErrors, markPurchaseCheckedByAdmin);

export default router;
