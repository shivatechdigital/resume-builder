import React, { useState } from 'react';
import { useResumeStore } from '../store/resumeStore';
import { HexColorPicker } from 'react-colorful';
import {
  Type, Palette, Minus, Plus,
  AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, ChevronDown, ChevronUp
} from 'lucide-react';

const FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
  'Courier New', 'Verdana', 'Trebuchet MS', 'Palatino',
  'Garamond', 'Bookman', 'Comic Sans MS', 'Impact'
];

const StyleControls = ({ fields }) => {
  const {
    globalFont, setGlobalFont,
    globalColor, setGlobalColor,
    globalFontSize, setGlobalFontSize,
    fieldStyles, setFieldStyle
  } = useResumeStore();

  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const selectedField = fields.find(f => f.id === selectedFieldId);
  const currentStyle = selectedFieldId ? (fieldStyles[selectedFieldId] || {}) : {};

  return (
    <div className="bg-gray-900 border-t border-gray-800 shrink-0">
      {/* Toggle Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-800/50 transition"
      >
        <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          🎨 Style Controls
        </span>
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Global Controls */}
          <div className="bg-gray-800/50 rounded-xl p-3 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Global Styles (All Fields)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {/* Font Family */}
              <div>
                <label className="text-[11px] text-gray-500 mb-1 block">Font</label>
                <select
                  value={globalFont}
                  onChange={(e) => setGlobalFont(e.target.value)}
                  className="w-full px-2 py-1.5 bg-gray-900 border border-gray-700 rounded-lg 
                    text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {FONTS.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div>
                <label className="text-[11px] text-gray-500 mb-1 block">Size: {globalFontSize}px</label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setGlobalFontSize(Math.max(8, globalFontSize - 1))}
                    className="p-1 bg-gray-900 border border-gray-700 rounded hover:bg-gray-700"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={globalFontSize}
                    onChange={(e) => setGlobalFontSize(Number(e.target.value))}
                    className="flex-1 accent-purple-500"
                  />
                  <button
                    onClick={() => setGlobalFontSize(Math.min(32, globalFontSize + 1))}
                    className="p-1 bg-gray-900 border border-gray-700 rounded hover:bg-gray-700"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">Text Color</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-8 h-8 rounded-lg border-2 border-gray-600 hover:border-purple-500 transition"
                  style={{ backgroundColor: globalColor }}
                />
                <span className="text-xs text-gray-400 font-mono">{globalColor}</span>
                <div className="flex gap-1 ml-auto">
                  {['#000000', '#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560'].map(c => (
                    <button
                      key={c}
                      onClick={() => setGlobalColor(c)}
                      className={`w-5 h-5 rounded-full border ${
                        globalColor === c ? 'border-purple-400 scale-125' : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              {showColorPicker && (
                <div className="mt-2">
                  <HexColorPicker color={globalColor} onChange={setGlobalColor} />
                </div>
              )}
            </div>
          </div>

          {/* Per-Field Override (Optional) */}
          {fields.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-3 space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Per-Field Override (Optional)
              </h4>
              <select
                value={selectedFieldId || ''}
                onChange={(e) => setSelectedFieldId(e.target.value || null)}
                className="w-full px-2 py-1.5 bg-gray-900 border border-gray-700 rounded-lg 
                  text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">-- Field Select Karo --</option>
                {fields.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>

              {selectedField && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-500">Font:</label>
                    <select
                      value={currentStyle.fontFamily || globalFont}
                      onChange={(e) => setFieldStyle(selectedFieldId, { fontFamily: e.target.value })}
                      className="flex-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-xs"
                    >
                      {FONTS.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-500">Size:</label>
                    <input
                      type="number"
                      min="6"
                      max="48"
                      value={currentStyle.fontSize || globalFontSize}
                      onChange={(e) => setFieldStyle(selectedFieldId, { fontSize: Number(e.target.value) })}
                      className="w-16 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-xs"
                    />
                    <label className="text-[11px] text-gray-500">Color:</label>
                    <input
                      type="color"
                      value={currentStyle.color || globalColor}
                      onChange={(e) => setFieldStyle(selectedFieldId, { color: e.target.value })}
                      className="w-8 h-6 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setFieldStyle(selectedFieldId, {
                        fontWeight: currentStyle.fontWeight === 'bold' ? 'normal' : 'bold'
                      })}
                      className={`p-1 rounded ${
                        currentStyle.fontWeight === 'bold' ? 'bg-purple-600' : 'bg-gray-900 border border-gray-700'
                      }`}
                    >
                      <Bold className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setFieldStyle(selectedFieldId, {
                        textAlign: currentStyle.textAlign === 'center' ? 'left' : 'center'
                      })}
                      className={`p-1 rounded ${
                        currentStyle.textAlign === 'center' ? 'bg-purple-600' : 'bg-gray-900 border border-gray-700'
                      }`}
                    >
                      <AlignCenter className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setFieldStyle(selectedFieldId, {
                        textAlign: 'left'
                      })}
                      className="p-1 rounded bg-gray-900 border border-gray-700"
                    >
                      <AlignLeft className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StyleControls;
