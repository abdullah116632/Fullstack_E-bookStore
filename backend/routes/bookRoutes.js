import express from 'express';
import { getFeaturedBooks, getPublicBooks, getAllBooks, getPublicBookById, getBookPreviewPdf } from '../controllers/bookController.js';

const router = express.Router();

router.get('/featured', getFeaturedBooks);
router.get('/', getPublicBooks);
router.get('/all', getAllBooks);
router.get('/:id/preview', getBookPreviewPdf);
router.get('/:id', getPublicBookById);

export default router;
