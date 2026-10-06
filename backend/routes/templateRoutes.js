import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  uploadTemplate,
  getTemplates,
  getTemplateById,
  saveFields,
  deleteTemplate
} from '../controllers/templateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer config (local storage, uploads/ folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('❌ Sirf JPEG, PNG, WEBP allowed hai'));
    }
  }
});

router.post('/upload', protect, upload.single('template'), uploadTemplate);
router.get('/', protect, getTemplates);
router.get('/:id', protect, getTemplateById);
router.put('/:id/fields', protect, saveFields);
router.delete('/:id', protect, deleteTemplate);


export default router;