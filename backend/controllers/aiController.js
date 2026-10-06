import Template from '../models/Template.js';
import { analyzeTemplate, analyzeTemplateFast } from '../utils/githubAI.js';

// @desc    AI se template analyze karo
export const detectFields = async (req, res) => {
  try {
    const { templateId, mode = 'accurate' } = req.body;

    if (!templateId) {
      return res.status(400).json({ message: '❌ Template ID zaroori hai' });
    }

    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: '❌ Template nahi mila' });
    }

    if (template.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '❌ Permission nahi hai' });
    }

    console.log(`🤖 AI Detection started (${mode} mode) for: ${template.name}`);

    let result;

    if (mode === 'fast') {
      result = await analyzeTemplateFast(
        template.imageUrl,
        template.originalWidth || 595,
        template.originalHeight || 842
      );
    } else {
      result = await analyzeTemplate(
        template.imageUrl,
        template.originalWidth || 595,
        template.originalHeight || 842
      );
    }

    console.log(`✅ AI detected ${result.totalDetected} fields!`);

    res.json({
      message: '✅ AI Detection Complete!',
      ...result
    });

  } catch (error) {
    console.error('AI Detection Error:', error.message);
    res.status(500).json({
      message: error.message,
      fallback: true   // Frontend ko batao ki fallback use kare
    });
  }
};

// @desc    AI detected fields ko template mein save karo (after user verification)
export const applyAIFields = async (req, res) => {
  try {
    const { templateId, fields } = req.body;

    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: '❌ Template nahi mila' });
    }

    if (template.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '❌ Permission nahi hai' });
    }

    // Existing fields ke saath merge karo ya replace karo
    const { merge = false } = req.body;

    if (merge) {
      // Existing + New AI fields
      const existingLabels = template.fields.map(f => f.label.toLowerCase());
      const newFields = fields.filter(
        f => !existingLabels.includes(f.label.toLowerCase())
      );
      template.fields = [...template.fields, ...newFields];
    } else {
      // Replace all
      template.fields = fields;
    }

    await template.save();

    res.json({
      message: `✅ ${fields.length} AI fields applied!`,
      template
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
