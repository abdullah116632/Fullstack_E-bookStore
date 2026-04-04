import express from 'express';
import { protect } from '../middlewares/auth.js';
import {
  getAllBooksForAdmin,
  updateBookAdminControls,
  deleteBookAsAdmin,
} from '../controllers/adminBookController.js';

const router = express.Router();

router.get('/', protect, getAllBooksForAdmin);
router.patch('/:id', protect, updateBookAdminControls);
router.delete('/:id', protect, deleteBookAsAdmin);

export default router;
