import express from 'express';
import { protect } from '../middlewares/auth.js';
import { getAllReadersForAdmin, getAllPublishersForAdmin } from '../controllers/adminUserController.js';
import { handleValidationErrors } from '../middlewares/common.js';
import { paginationValidation } from '../validators/validation.js';

const router = express.Router();

router.get('/readers', protect, paginationValidation, handleValidationErrors, getAllReadersForAdmin);
router.get('/publishers', protect, paginationValidation, handleValidationErrors, getAllPublishersForAdmin);

export default router;
