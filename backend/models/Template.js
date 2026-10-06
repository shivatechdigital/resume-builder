import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  label: { type: String, required: true },       // "fullName", "email"
  type: { type: String, default: 'text' },        // "text", "textarea", "date"
  x: { type: Number, required: true },             // X coordinate (0-100%)
  y: { type: Number, required: true },             // Y coordinate (0-100%)
  width: { type: Number, default: 20 },            // Width %
  height: { type: Number, default: 5 },            // Height %
  fontSize: { type: Number, default: 14 },
  fontFamily: { type: String, default: 'Arial' },
  color: { type: String, default: '#000000' },
  detectedBy: { type: String, default: 'manual' },  // "manual" | "ai"
  confidence: { type: Number },                     // AI confidence score (0-100)
  reason: { type: String }                          // AI detection reason
});

const templateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Template ka naam do'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String    // Cloudinary delete ke liye
  },
  originalWidth: Number,
  originalHeight: Number,
  fields: [fieldSchema]
}, { timestamps: true });

export default mongoose.model('Template', templateSchema);