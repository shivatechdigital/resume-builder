import React, { useState, useRef, useEffect } from 'react';
import { X, Move, GripHorizontal } from 'lucide-react';

const FieldBox = ({ field, onUpdate, onDelete }) => {
  const boxRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

  // 🔥 DRAG Logic (Move field on template)
  const handleMouseDown = (e) => {
    if (e.target.closest('.resize-handle') || e.target.closest('.delete-btn')) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const parent = boxRef.current.parentElement;
    const parentRect = parent.getBoundingClientRect();

    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      fieldX: field.x,
      fieldY: field.y,
      parentWidth: parentRect.width,
      parentHeight: parentRect.height
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const dx = ((e.clientX - dragStart.mouseX) / dragStart.parentWidth) * 100;
      const dy = ((e.clientY - dragStart.mouseY) / dragStart.parentHeight) * 100;

      const newX = Math.max(0, Math.min(dragStart.fieldX + dx, 95));
      const newY = Math.max(0, Math.min(dragStart.fieldY + dy, 95));

      onUpdate(field.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // 🔥 RESIZE Logic
  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const parent = boxRef.current.parentElement;
    const parentRect = parent.getBoundingClientRect();

    setResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: field.width,
      height: field.height,
      parentWidth: parentRect.width,
      parentHeight: parentRect.height
    });
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const dx = ((e.clientX - resizeStart.mouseX) / resizeStart.parentWidth) * 100;
      const dy = ((e.clientY - resizeStart.mouseY) / resizeStart.parentHeight) * 100;

      const newW = Math.max(10, Math.min(resizeStart.width + dx, 90));
      const newH = Math.max(3, Math.min(resizeStart.height + dy, 50));

      onUpdate(field.id, { width: newW, height: newH });
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart]);

  return (
    <div
      ref={boxRef}
      className={`absolute border-2 rounded-md group transition-colors
        ${isDragging ? 'border-blue-500 bg-blue-500/20 z-50' : 'border-red-400 bg-red-400/10 hover:border-red-300 hover:bg-red-400/20'}
        ${isEditing ? 'border-green-500 bg-green-500/20' : ''}`}
      style={{
        left: `${field.x}%`,
        top: `${field.y}%`,
        width: `${field.width}%`,
        height: `${field.height}%`,
        cursor: isDragging ? 'grabbing' : 'grab',
        fontSize: `${field.fontSize * 0.7}px`,
        color: field.color
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => setIsEditing(!isEditing)}
    >
      {/* Field Label */}
      <div className="flex items-center h-full px-1 overflow-hidden">
        <Move className="w-3 h-3 text-red-400 shrink-0 mr-1 opacity-0 group-hover:opacity-100" />
        <span className="font-semibold truncate text-[10px] sm:text-xs">
          {isEditing ? (
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate(field.id, { label: e.target.value })}
              className="bg-transparent border-b border-green-400 outline-none w-full text-green-300"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-red-300 drop-shadow-sm">
              [{field.label}]
            </span>
          )}
        </span>
      </div>

      {/* Delete Button */}
      <button
        className="delete-btn absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full 
          flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity
          hover:bg-red-500 shadow-lg"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(field.id);
        }}
      >
        <X className="w-3 h-3" />
      </button>

      {/* Resize Handle (Bottom-Right Corner) */}
      <div
        className="resize-handle absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-sm
          cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity
          flex items-center justify-center"
        onMouseDown={handleResizeStart}
      >
        <GripHorizontal className="w-2.5 h-2.5 text-white rotate-45" />
      </div>
    </div>
  );
};

export default FieldBox;
