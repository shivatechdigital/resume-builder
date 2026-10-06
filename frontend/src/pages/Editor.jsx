import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTemplateStore } from '../store/templateStore';
import { useResumeStore } from '../store/resumeStore';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter
} from '@dnd-kit/core';
import FieldPalette from '../components/FieldPalette';
import TemplateCanvas from '../components/TemplateCanvas';
import ResumeForm from '../components/ResumeForm';
import LivePreview from '../components/LivePreview';
import StyleControls from '../components/StyleControls';
import AIDetector from '../components/AIDetector';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Save, ZoomIn, ZoomOut,
  RotateCcw, Loader2, MapPin, Edit3,
  Eye, ChevronLeft, ChevronRight, Bot
} from 'lucide-react';

const TABS = [
  { id: 'map', label: 'Map Fields', icon: MapPin },
  { id: 'ai', label: 'AI Detect', icon: Bot },
  { id: 'fill', label: 'Fill Details', icon: Edit3 },
  { id: 'preview', label: 'Full Preview', icon: Eye }
];

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { fetchTemplateById, saveFields, loading } = useTemplateStore();
  const { resetResume } = useResumeStore();

  const [template, setTemplate] = useState(null);
  const [fields, setFields] = useState([]);
  const [zoom, setZoom] = useState(100);
  const [activeDrag, setActiveDrag] = useState(null);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('map');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    })
  );

  // Load Template
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const data = await fetchTemplateById(token, id);
        setTemplate(data);
        setFields(data.fields || []);
        resetResume();
      } catch (error) {
        toast.error('❌ Template load nahi hua');
        navigate('/dashboard');
      }
    };
    loadTemplate();
  }, [id]);

  // Save to History (Undo ke liye)
  const pushHistory = useCallback((currentFields) => {
    setHistory((prev) => [...prev.slice(-19), currentFields]);
  }, []);

  // 🔥 Field Drop Handler (Palette → Canvas)
  const handleDragEnd = (event) => {
    const { active, over, delta } = event;
    setActiveDrag(null);

    if (!over || over.id !== 'template-canvas') return;

    // Palette se naya field aaya hai
    if (active.data.current?.type === 'palette-item') {
      const canvasRect = over.rect;
      const x = ((delta.x + active.rect.current.translated.left - canvasRect.left) / canvasRect.width) * 100;
      const y = ((delta.y + active.rect.current.translated.top - canvasRect.top) / canvasRect.height) * 100;

      const newField = {
        id: `field-${Date.now()}`,
        label: active.data.current.label,
        type: active.data.current.fieldType || 'text',
        x: Math.max(0, Math.min(x, 80)),
        y: Math.max(0, Math.min(y, 95)),
        width: 25,
        height: 5,
        fontSize: 14,
        fontFamily: 'Arial',
        color: '#000000',
        detectedBy: 'manual'
      };

      pushHistory(fields);
      setFields((prev) => [...prev, newField]);
      toast.success(`✅ "${newField.label}" field add ho gaya!`);
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    if (active.data.current?.type === 'palette-item') {
      setActiveDrag(active.data.current);
    }
  };

  // AI detected fields apply handler
  const handleAIFieldsDetected = (aiFields) => {
    pushHistory(fields);
    setFields((prev) => {
      // Duplicate labels hatao
      const existingLabels = new Set(prev.map(f => f.label.toLowerCase()));
      const newFields = aiFields.filter(
        f => !existingLabels.has(f.label.toLowerCase())
      );
      return [...prev, ...newFields];
    });
    setActiveTab('map');   // Map tab pe switch karo taaki fields dikhe
    toast.success('🤖 AI fields template pe lag gaye!');
  };
  // Field Update (Move / Resize)
  const updateField = (fieldId, updates) => {
    pushHistory(fields);
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
    );
  };

  // Field Delete
  const deleteField = (fieldId) => {
    pushHistory(fields);
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    toast('🗑️ Field deleted');
  };

  // Undo
  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFields(prev);
    toast('↩️ Undo!');
  };

  // Save to Backend
  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFields(token, id, fields);
      toast.success('✅ Fields saved!');
    } catch (error) {
      toast.error('❌ Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !template) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="animate-spin w-12 h-12 text-purple-500" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* ═══════════ TOP TOOLBAR ═══════════ */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-sm">{template.name}</h1>
            <p className="text-[10px] text-gray-500">{fields.length} fields</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-800 rounded-xl p-1 gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'map' && (
            <>
              <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1.5 hover:bg-gray-800 rounded-lg">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-500 w-10 text-center">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="p-1.5 hover:bg-gray-800 rounded-lg">
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-gray-700" />
              <button onClick={handleUndo} disabled={history.length === 0} className="p-1.5 hover:bg-gray-800 rounded-lg disabled:opacity-30">
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg font-semibold text-xs disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </button>
        </div>
      </div>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ─── TAB 1: MAP FIELDS ─── */}
        {activeTab === 'map' && (
          <>
            <FieldPalette />
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <TemplateCanvas
                template={template}
                fields={fields}
                zoom={zoom}
                updateField={updateField}
                deleteField={deleteField}
              />
              <DragOverlay>
                {activeDrag ? (
                  <div className="px-3 py-2 bg-purple-600 text-white rounded-lg shadow-2xl text-sm font-semibold opacity-90">
                    {activeDrag.label}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </>
        )}

        {/* ─── TAB 2: AI DETECT ─── */}
        {activeTab === 'ai' && (
          <>
            <AIDetector
              templateId={id}
              onFieldsDetected={handleAIFieldsDetected}
            />
            <div className="flex-1 overflow-auto bg-gray-950 p-6 flex justify-center">
              <div
                className="relative bg-white shadow-2xl rounded-lg overflow-hidden"
                style={{
                  width: `${(template.originalWidth || 595) * (zoom / 100)}px`,
                  maxWidth: '100%',
                  aspectRatio: template.originalWidth && template.originalHeight
                    ? `${template.originalWidth} / ${template.originalHeight}`
                    : '210 / 297'
                }}
              >
                <img
                  src={
                    template.imageUrl.startsWith('http')
                      ? template.imageUrl
                      : `http://localhost:5000${template.imageUrl}`
                  }
                  alt="Template"
                  className="w-full h-full object-contain"
                  draggable={false}
                />

                {/* AI Detected Fields Preview */}
                {fields.filter(f => f.detectedBy === 'ai').map((field) => (
                  <div
                    key={field.id}
                    className="absolute border-2 border-green-400 bg-green-400/10 rounded"
                    style={{
                      left: `${field.x}%`,
                      top: `${field.y}%`,
                      width: `${field.width}%`,
                      height: `${field.height}%`
                    }}
                  >
                    <span className="text-[9px] text-green-600 font-bold px-1">
                      🤖 {field.label} ({field.confidence}%)
                    </span>
                  </div>
                ))}

                {/* Manual Fields */}
                {fields.filter(f => f.detectedBy !== 'ai').map((field) => (
                  <div
                    key={field.id}
                    className="absolute border-2 border-red-400 bg-red-400/10 rounded"
                    style={{
                      left: `${field.x}%`,
                      top: `${field.y}%`,
                      width: `${field.width}%`,
                      height: `${field.height}%`
                    }}
                  >
                    <span className="text-[9px] text-red-600 font-bold px-1">
                      ✋ {field.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ─── TAB 2: FILL DETAILS (Split Layout) ─── */}
        {activeTab === 'fill' && (
          <>
            {/* Left Panel - Form */}
            <div className={`bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 transition-all duration-300
              ${leftPanelOpen ? 'w-96' : 'w-0'}`}>
              {leftPanelOpen && (
                <>
                  <div className="flex-1 overflow-hidden">
                    <ResumeForm fields={fields} />
                  </div>
                  <StyleControls fields={fields} />
                </>
              )}
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => setLeftPanelOpen(!leftPanelOpen)}
              className="w-6 bg-gray-800 hover:bg-gray-700 flex items-center justify-center border-r border-gray-700 shrink-0"
            >
              {leftPanelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {/* Right Panel - Live Preview */}
            <div className="flex-1 overflow-hidden">
              <LivePreview template={template} fields={fields} />
            </div>
          </>
        )}

        {/* ─── TAB 3: FULL PREVIEW ─── */}
        {activeTab === 'preview' && (
          <div className="flex-1 overflow-hidden">
            <LivePreview template={template} fields={fields} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
