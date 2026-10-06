import React, { useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import FieldBox from './FieldBox';

const TemplateCanvas = ({ template, fields, zoom, updateField, deleteField }) => {
  const containerRef = useRef(null);

  // Drop Zone
  const { setNodeRef, isOver } = useDroppable({
    id: 'template-canvas'
  });

  const backendUrl = 'http://localhost:5000';
  const imageUrl = template.imageUrl.startsWith('http')
    ? template.imageUrl
    : `${backendUrl}${template.imageUrl}`;

  return (
    <div className="flex-1 overflow-auto bg-gray-950 p-6" ref={containerRef}>
      <div className="flex justify-center">
        <div
          ref={setNodeRef}
          className={`relative bg-white shadow-2xl rounded-lg overflow-hidden transition-all
            ${isOver ? 'ring-4 ring-purple-500 ring-offset-2 ring-offset-gray-950' : ''}`}
          style={{
            width: `${(template.originalWidth || 595) * (zoom / 100)}px`,
            maxWidth: '100%',
            aspectRatio: template.originalWidth && template.originalHeight
              ? `${template.originalWidth} / ${template.originalHeight}`
              : '210 / 297'   // A4 default
          }}
        >
          {/* Template Image */}
          <img
            src={imageUrl}
            alt="Resume Template"
            className="w-full h-full object-contain select-none pointer-events-none"
            draggable={false}
          />

          {/* Drop Zone Overlay (jab drag ho raha ho) */}
          {isOver && (
            <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center pointer-events-none">
              <div className="bg-purple-600/90 text-white px-6 py-3 rounded-xl font-bold text-lg animate-pulse">
                📍 Yahan Drop Karo!
              </div>
            </div>
          )}

          {/* 🔥 Mapped Fields */}
          {fields.map((field) => (
            <FieldBox
              key={field.id}
              field={field}
              onUpdate={updateField}
              onDelete={deleteField}
            />
          ))}

          {/* Empty State */}
          {fields.length === 0 && !isOver && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center bg-black/50 backdrop-blur-sm px-8 py-6 rounded-2xl">
                <p className="text-white text-lg font-bold">👈 Left Side Se Fields Drag Karo</p>
                <p className="text-gray-300 text-sm mt-2">
                  Aur is template pe drop karo
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateCanvas;
