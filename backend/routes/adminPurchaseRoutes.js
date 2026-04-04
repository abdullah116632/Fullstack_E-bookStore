import express from 'express';
import { getAllPurchasesForAdmin, approvePurchaseByAdmin, deactivatePurchaseByAdmin } from '../controllers/adminPurchaseController.js';
import { protect } from '../middlewares/auth.js';
import { handleValidationErrors } from '../middlewares/common.js';
import { idValidation } from '../validators/validation.js';

const router = express.Router();

router.get('/', protect, getAllPurchasesForAdmin);
router.patch('/:id/approve', protect, idValidation, handleValidationErrors, approvePurchaseByAdmin);
router.patch('/:id/deactivate', protect, idValidation, handleValidationErrors, deactivatePurchaseByAdmin);

export default router;
