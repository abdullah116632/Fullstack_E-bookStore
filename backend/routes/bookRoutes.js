import express from 'express';
import { getFeaturedBooks, getPublicBooks, getBookPreviewPdf } from '../controllers/bookController.js';

const router = express.Router();

router.get('/featured', getFeaturedBooks);
router.get('/', getPublicBooks);
router.get('/:id/preview', getBookPreviewPdf);

export default router;
