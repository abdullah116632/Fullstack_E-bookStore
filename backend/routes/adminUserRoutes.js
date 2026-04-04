import express from 'express';
import { protect } from '../middlewares/auth.js';
import { getAllReadersForAdmin, getAllPublishersForAdmin } from '../controllers/adminUserController.js';

const router = express.Router();

router.get('/readers', protect, getAllReadersForAdmin);
router.get('/publishers', protect, getAllPublishersForAdmin);

export default router;
