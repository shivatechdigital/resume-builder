import express from 'express';
import multer from 'multer';
import { uploadTemplate, getTemplates, deleteTemplate } from '../controllers/templateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer config (temporary local storage → Cloudinary pe bhejenge)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
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
router.delete('/:id', protect, deleteTemplate);

export default router;