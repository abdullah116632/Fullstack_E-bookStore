import express from 'express';
import { protect } from '../middlewares/auth.js';
import {
	getAllReadersForAdmin,
	getAllPublishersForAdmin,
	updatePublisherActiveStatus,
} from '../controllers/adminUserController.js';
import { handleValidationErrors } from '../middlewares/common.js';
import {
	paginationValidation,
	updatePublisherActiveValidation,
} from '../validators/validation.js';

const router = express.Router();

router.get('/readers', protect, paginationValidation, handleValidationErrors, getAllReadersForAdmin);
router.get('/publishers', protect, paginationValidation, handleValidationErrors, getAllPublishersForAdmin);
router.patch(
	'/publishers/:id/active',
	protect,
	updatePublisherActiveValidation,
	handleValidationErrors,
	updatePublisherActiveStatus
);

export default router;
