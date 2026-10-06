import React, { useRef, useState, useEffect } from 'react';
import { useResumeStore } from '../store/resumeStore';
import { ZoomIn, ZoomOut, Maximize2, Grid3X3, Eye } from 'lucide-react';

const LivePreview = ({ template, fields }) => {
  const {
    resumeData,
    fieldStyles,
    globalFont,
    globalColor,
    globalFontSize,
    previewZoom,
    setPreviewZoom,
    showBorders,
    toggleBorders
  } = useResumeStore();

  const previewRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const backendUrl = 'http://localhost:5000';
  const imageUrl = template.imageUrl.startsWith('http')
    ? template.imageUrl
    : `${backendUrl}${template.imageUrl}`;

  // Container size track karo
  useEffect(() => {
    const updateSize = () => {
      if (previewRef.current) {
        const rect = previewRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Zoom controls
  const zoomIn = () => setPreviewZoom(Math.min(200, previewZoom + 10));
  const zoomOut = () => setPreviewZoom(Math.max(30, previewZoom - 10));
  const fitToScreen = () => setPreviewZoom(100);

  // Get effective style for a field
  const getFieldStyle = (field) => {
    const override = fieldStyles[field.id] || {};
    return {
      fontFamily: override.fontFamily || globalFont || field.fontFamily || 'Arial',
      fontSize: override.fontSize || globalFontSize || field.fontSize || 14,
      color: override.color || globalColor || field.color || '#000000',
      fontWeight: override.fontWeight || 'normal',
      textAlign: override.textAlign || 'left',
      lineHeight: override.lineHeight || '1.4'
    };
  };

  // Scale font size based on zoom and template size
  const getScaledFontSize = (baseFontSize) => {
    const scaleFactor = (previewZoom / 100) * 0.6;
    return Math.max(6, baseFontSize * scaleFactor);
  };

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Preview Toolbar */}
      <div className="bg-gray-900/80 border-b border-gray-800 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-green-400" />
          <span className="text-sm font-semibold text-gray-300">Live Preview</span>
          <span className="text-[10px] bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full">
            REAL-TIME
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Borders Toggle (Debug) */}
          <button
            onClick={toggleBorders}
            className={`p-1.5 rounded-lg transition ${
              showBorders ? 'bg-yellow-600 text-white' : 'hover:bg-gray-800 text-gray-400'
            }`}
            title="Toggle Field Borders"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-700 mx-1" />

          {/* Zoom */}
          <button onClick={zoomOut} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 w-10 text-center">{previewZoom}%</span>
          <button onClick={zoomIn} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={fitToScreen} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400" title="Fit">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="flex-1 overflow-auto p-6 flex justify-center" ref={previewRef}>
        <div
          className="relative bg-white shadow-2xl rounded-lg overflow-hidden shrink-0"
          style={{
            width: `${(template.originalWidth || 595) * (previewZoom / 100)}px`,
            aspectRatio: template.originalWidth && template.originalHeight
              ? `${template.originalWidth} / ${template.originalHeight}`
              : '210 / 297'
          }}
        >
          {/* Template Background Image */}
          <img
            src={imageUrl}
            alt="Template"
            className="w-full h-full object-contain select-none pointer-events-none"
            draggable={false}
          />

          {/* 🔥 LIVE TEXT OVERLAY - Yeh hai main magic! */}
          {fields.map((field) => {
            const text = resumeData[field.label] || '';
            const style = getFieldStyle(field);
            const scaledFontSize = getScaledFontSize(style.fontSize);

            if (!text && !showBorders) return null;

            return (
              <div
                key={field.id}
                className={`absolute overflow-hidden ${
                  showBorders ? 'border border-dashed border-blue-400/60 bg-blue-400/5' : ''
                }`}
                style={{
                  left: `${field.x}%`,
                  top: `${field.y}%`,
                  width: `${field.width}%`,
                  height: `${field.height}%`,
                  padding: '2px 4px'
                }}
              >
                <p
                  style={{
                    fontFamily: style.fontFamily,
                    fontSize: `${scaledFontSize}px`,
                    color: style.color,
                    fontWeight: style.fontWeight,
                    textAlign: style.textAlign,
                    lineHeight: style.lineHeight,
                    whiteSpace: field.type === 'textarea' ? 'pre-wrap' : 'nowrap',
                    overflow: 'hidden',
                    margin: 0
                  }}
                >
                  {text || (showBorders ? `[${field.label}]` : '')}
                </p>
              </div>
            );
          })}

          {/* Empty State */}
          {fields.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/60 backdrop-blur-sm px-6 py-4 rounded-xl text-center">
                <p className="text-white font-bold">📝 Pehle Fields Map Karo</p>
                <p className="text-gray-300 text-xs mt-1">
                  "Map Fields" tab → Drag & Drop
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
