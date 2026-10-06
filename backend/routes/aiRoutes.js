import express from 'express';
import { detectFields, applyAIFields } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/detect', protect, detectFields);
router.post('/apply', protect, applyAIFields);

export default router;
