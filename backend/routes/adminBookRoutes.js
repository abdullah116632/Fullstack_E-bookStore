import express from 'express';
import { protect } from '../middlewares/auth.js';
import { handleValidationErrors } from '../middlewares/common.js';
import {
  getAllBooksForAdmin,
  updateBookAdminControls,
  deleteBookAsAdmin,
} from '../controllers/adminBookController.js';
import { paginationValidation } from '../validators/validation.js';

const router = express.Router();

router.get('/', protect, paginationValidation, handleValidationErrors, getAllBooksForAdmin);
router.patch('/:id', protect, updateBookAdminControls);
router.delete('/:id', protect, deleteBookAsAdmin);

export default router;
