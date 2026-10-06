import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { imageSize } from 'image-size';
import Template from '../models/Template.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Upload Template
export const uploadTemplate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '❌ Koi image upload nahi hui' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: '❌ Template ka naam do' });
    }

    // Local disk pe hi image rakhte hain (uploads/ folder static serve hoti hai)
    const dimensions = imageSize(fs.readFileSync(req.file.path));

    const template = await Template.create({
      userId: req.user._id,
      name,
      imageUrl: `/uploads/${req.file.filename}`,
      originalWidth: dimensions.width,
      originalHeight: dimensions.height,
      fields: []   // Abhi empty, Phase 2 mein fill hoga
    });

    res.status(201).json({
      message: '✅ Template uploaded successfully!',
      template
    });
  } catch (error) {
    console.error('Upload Template Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Templates of User
export const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ templates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Single Template (Editor ke liye)
export const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: '❌ Template nahi mila' });
    }

    if (template.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '❌ Permission nahi hai' });
    }

    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save Fields (Phase 2 ka main kaam!)
export const saveFields = async (req, res) => {
  try {
    const { fields } = req.body;
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: '❌ Template nahi mila' });
    }

    if (template.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '❌ Permission nahi hai' });
    }

    template.fields = fields;
    await template.save();

    res.json({
      message: '✅ Fields saved!',
      template
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Template
export const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: '❌ Template nahi mila' });
    }

    if (template.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '❌ Permission nahi hai' });
    }

    // Local disk se bhi delete karo
    const filePath = path.join(__dirname, '..', template.imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await template.deleteOne();
    res.json({ message: '✅ Template deleted!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};