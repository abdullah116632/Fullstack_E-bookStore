import express from 'express';
import multer from 'multer';
import { protect } from '../middlewares/auth.js';
import { uploadPublisherBook } from '../controllers/publisherBookController.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024,
  },
});

router.post(
  '/upload',
  protect,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'bookFile', maxCount: 1 },
  ]),
  uploadPublisherBook
);

export default router;
