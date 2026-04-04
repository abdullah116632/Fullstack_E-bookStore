import express from 'express';
import { getFeaturedBooks, getPublicBooks, getPublicBookById, getBookPreviewPdf } from '../controllers/bookController.js';

const router = express.Router();

router.get('/featured', getFeaturedBooks);
router.get('/', getPublicBooks);
router.get('/:id/preview', getBookPreviewPdf);
router.get('/:id', getPublicBookById);

export default router;
