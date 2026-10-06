import axios from 'axios';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const GITHUB_API_URL = 'https://models.inference.ai.azure.com/chat/completions';

/**
 * Image ko base64 mein convert karo (optimized)
 * GPT-4o Vision ke liye image size limit hoti hai
 */
const imageToBase64 = async (imagePath) => {
  try {
    const fullUrl = imagePath.startsWith('http')
      ? imagePath
      : `http://localhost:5000${imagePath}`;

    // Agar local file hai toh sharp se optimize karo
    if (!imagePath.startsWith('http')) {
      const absolutePath = path.join(process.cwd(), imagePath);

      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Image file nahi mili: ${absolutePath}`);
      }

      // Resize karo agar bahut badi hai (max 2000px)
      const optimizedBuffer = await sharp(absolutePath)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      const base64 = optimizedBuffer.toString('base64');
      return `data:image/jpeg;base64,${base64}`;
    }

    // Remote URL hai toh fetch karo
    const response = await axios.get(fullUrl, { responseType: 'arraybuffer' });
    const buffer = await sharp(response.data)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('Image processing error:', error.message);
    throw new Error(`Image process nahi hui: ${error.message}`);
  }
};

/**
 * 🔥 MAIN AI FUNCTION - Template analyze karo
 */
export const analyzeTemplate = async (imageUrl, imageWidth, imageHeight) => {
  const token = process.env.GITHUB_AI_TOKEN;

  if (!token) {
    throw new Error('GITHUB_AI_TOKEN .env mein set nahi hai!');
  }

  // Step 1: Image ko base64 mein convert
  console.log('📸 Image processing...');
  const base64Image = await imageToBase64(imageUrl);
  console.log('✅ Image processed, calling AI...');

  // Step 2: Smart Prompt Design (Bahut Important!)
  const systemPrompt = `You are an expert resume template analyzer. 
Your job is to detect ALL input fields/placeholders in a resume template image.

RULES:
1. Look for labels like "Name:", "Email:", "Phone:", "Address:", "Objective", "Experience", "Education", "Skills", "Certifications", "Date of Birth", "Website", "LinkedIn", "Summary", "References", "Languages", "Hobbies", "Declaration", etc.
2. Also detect empty lines, underlines (___), boxes, or blank spaces that clearly indicate where user data should go.
3. For EACH detected field, provide EXACT pixel coordinates relative to the image.
4. The image dimensions are ${imageWidth}x${imageHeight} pixels.
5. Return coordinates as PERCENTAGES (0-100) of image width/height, NOT pixels.
6. Be precise with coordinates - they will be used to overlay text on the template.

RESPOND ONLY WITH VALID JSON in this exact format:
{
  "fields": [
    {
      "label": "Full Name",
      "type": "text",
      "x": 15.5,
      "y": 8.2,
      "width": 35.0,
      "height": 4.0,
      "confidence": 95,
      "reason": "Label 'Name:' found at top-left section"
    },
    {
      "label": "Email",
      "type": "text",
      "x": 15.5,
      "y": 12.1,
      "width": 40.0,
      "height": 3.5,
      "confidence": 92,
      "reason": "Label 'Email:' found below name"
    }
  ],
  "templateType": "modern",
  "language": "english",
  "sections": ["header", "contact", "objective", "experience", "education", "skills"],
  "notes": "Clean modern template with left sidebar"
}

FIELD TYPES allowed: "text", "textarea", "date"
- Use "textarea" for large sections like Experience, Education, Objective, Skills
- Use "date" for Date of Birth or date fields
- Use "text" for everything else

CONFIDENCE scoring:
- 90-100: Very clear label and space
- 70-89: Likely a field but slightly ambiguous
- 50-69: Possible field, needs user verification
- Below 50: Don't include

IMPORTANT: Only include fields with confidence >= 60. Be accurate with coordinates!`;

  const userPrompt = `Analyze this resume template image (${imageWidth}x${imageHeight}px). 
Detect all fields where user data should be placed. 
Return JSON with exact percentage coordinates for each field.`;

  // Step 3: Call GitHub Models API
  try {
    const response = await axios.post(
      GITHUB_API_URL,
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
                  detail: 'high'   // High detail for better accuracy
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0.1,   // Low temperature = more consistent JSON
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000   // 60 second timeout (AI can be slow)
      }
    );

    // Step 4: Parse AI Response
    const aiContent = response.data.choices[0].message.content;
    console.log('🤖 AI Response received!');

    let parsed;
    try {
      parsed = JSON.parse(aiContent);
    } catch (parseError) {
      // Sometimes AI wraps JSON in markdown code blocks
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI ne valid JSON nahi diya');
      }
    }

    // Step 5: Validate & Clean fields
    const validFields = (parsed.fields || [])
      .filter(f => f.confidence >= 60)
      .map((f, index) => ({
        id: `ai-field-${Date.now()}-${index}`,
        label: f.label || 'Unknown',
        type: ['text', 'textarea', 'date'].includes(f.type) ? f.type : 'text',
        x: Math.max(0, Math.min(f.x || 0, 95)),
        y: Math.max(0, Math.min(f.y || 0, 95)),
        width: Math.max(5, Math.min(f.width || 20, 90)),
        height: Math.max(2, Math.min(f.height || 4, 50)),
        fontSize: f.type === 'textarea' ? 12 : 14,
        fontFamily: 'Arial',
        color: '#000000',
        detectedBy: 'ai',
        confidence: f.confidence || 70,
        reason: f.reason || ''
      }));

    return {
      success: true,
      fields: validFields,
      templateType: parsed.templateType || 'unknown',
      language: parsed.language || 'english',
      sections: parsed.sections || [],
      notes: parsed.notes || '',
      totalDetected: validFields.length,
      highConfidence: validFields.filter(f => f.confidence >= 85).length,
      mediumConfidence: validFields.filter(f => f.confidence >= 70 && f.confidence < 85).length,
      lowConfidence: validFields.filter(f => f.confidence < 70).length
    };

  } catch (error) {
    console.error('❌ AI Analysis Failed:', error.message);

    // Rate limit check
    if (error.response?.status === 429) {
      throw new Error('⚠️ AI rate limit hit! Thodi der baad try karo.');
    }

    if (error.response?.status === 401) {
      throw new Error('❌ GitHub AI token invalid hai. .env check karo.');
    }

    throw new Error(`AI Analysis Failed: ${error.message}`);
  }
};

/**
 * Fallback: GPT-4o-mini (faster, less quota)
 */
export const analyzeTemplateFast = async (imageUrl, imageWidth, imageHeight) => {
  // Same logic but model: 'gpt-4o-mini'
  // Yeh tab use karo jab gpt-4o rate limit ho
  const token = process.env.GITHUB_AI_TOKEN;
  const base64Image = await imageToBase64(imageUrl);

  try {
    const response = await axios.post(
      GITHUB_API_URL,
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this resume template (${imageWidth}x${imageHeight}px). 
                Detect all input fields with percentage coordinates (0-100). 
                Return JSON: {"fields": [{"label","type","x","y","width","height","confidence"}]}`
              },
              {
                type: 'image_url',
                image_url: { url: base64Image, detail: 'low' }
              }
            ]
          }
        ],
        max_tokens: 2048,
        temperature: 0.1
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const aiContent = response.data.choices[0].message.content;
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { fields: [] };

    return {
      success: true,
      fields: (parsed.fields || []).map((f, i) => ({
        id: `ai-fast-${Date.now()}-${i}`,
        label: f.label || 'Unknown',
        type: f.type || 'text',
        x: Math.max(0, Math.min(f.x || 0, 95)),
        y: Math.max(0, Math.min(f.y || 0, 95)),
        width: Math.max(5, Math.min(f.width || 20, 90)),
        height: Math.max(2, Math.min(f.height || 4, 50)),
        fontSize: 14,
        fontFamily: 'Arial',
        color: '#000000',
        detectedBy: 'ai',
        confidence: f.confidence || 60,
        reason: 'Fast detection (gpt-4o-mini)'
      })),
      templateType: 'unknown',
      notes: 'Fast mode used',
      totalDetected: parsed.fields?.length || 0
    };
  } catch (error) {
    throw new Error(`Fast AI Failed: ${error.message}`);
  }
};
