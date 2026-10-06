import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAIStore } from '../store/aiStore';
import toast from 'react-hot-toast';
import {
  Bot, Zap, Loader2, CheckCircle, XCircle,
  AlertTriangle, Sparkles, RefreshCw,
  ChevronDown, ChevronUp, Eye, Trash2,
  Edit3, Check, X, Brain, Target, Clock
} from 'lucide-react';

const AIDetector = ({ templateId, onFieldsDetected }) => {
  const { token } = useAuthStore();
  const {
    isScanning, scanProgress, scanStatus,
    detectedFields, scanResult, error,
    detectFields, removeDetectedField,
    updateDetectedField, resetScan
  } = useAIStore();

  const [showDetails, setShowDetails] = useState(false);
  const [selectedFields, setSelectedFields] = useState(new Set());

  // 🔥 Start AI Scan
  const handleScan = async (mode = 'accurate') => {
    try {
      const result = await detectFields(token, templateId, mode);
      // Auto-select all high confidence fields
      const autoSelected = new Set(
        result.fields
          .filter(f => f.confidence >= 75)
          .map(f => f.id)
      );
      setSelectedFields(autoSelected);
      toast.success(`🤖 ${result.totalDetected} fields detected!`);
    } catch (err) {
      toast.error(err);
    }
  };

  // Toggle field selection
  const toggleField = (fieldId) => {
    setSelectedFields(prev => {
      const next = new Set(prev);
      if (next.has(fieldId)) next.delete(fieldId);
      else next.add(fieldId);
      return next;
    });
  };

  // Select All / Deselect All
  const selectAll = () => {
    setSelectedFields(new Set(detectedFields.map(f => f.id)));
  };
  const deselectAll = () => setSelectedFields(new Set());

  // Apply selected fields
  const handleApply = () => {
    const selected = detectedFields.filter(f => selectedFields.has(f.id));
    if (selected.length === 0) {
      return toast.error('❌ Kam se kam ek field select karo!');
    }
    onFieldsDetected(selected);
    toast.success(`✅ ${selected.length} fields applied to template!`);
  };

  // Confidence Badge
  const ConfidenceBadge = ({ score }) => {
    if (score >= 85) return (
      <span className="flex items-center gap-1 text-[10px] bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full">
        <CheckCircle className="w-3 h-3" /> {score}%
      </span>
    );
    if (score >= 70) return (
      <span className="flex items-center gap-1 text-[10px] bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded-full">
        <AlertTriangle className="w-3 h-3" /> {score}%
      </span>
    );
    return (
      <span className="flex items-center gap-1 text-[10px] bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full">
        <XCircle className="w-3 h-3" /> {score}%
      </span>
    );
  };

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm">AI Field Detection</h2>
            <p className="text-[10px] text-gray-500">Powered by GPT-4o Vision</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* ─── IDLE STATE ─── */}
        {!isScanning && detectedFields.length === 0 && !error && (
          <div className="p-4 space-y-4">
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-800/50 rounded-xl p-4">
              <Sparkles className="w-8 h-8 text-purple-400 mb-2" />
              <h3 className="font-bold text-sm text-white">Auto-Detect Fields</h3>
              <p className="text-xs text-gray-400 mt-1">
                AI aapke template ko scan karega aur automatically saare fields 
                (Name, Email, Experience, etc.) detect karega with exact positions!
              </p>
            </div>

            <button
              onClick={() => handleScan('accurate')}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl 
                font-semibold text-sm flex items-center justify-center gap-2 transition-all
                hover:shadow-lg hover:shadow-purple-500/20"
            >
              <Bot className="w-5 h-5" />
              🤖 AI Scan (Accurate)
            </button>

            <button
              onClick={() => handleScan('fast')}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 
                rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              ⚡ Fast Scan (Quick)
            </button>

            <div className="space-y-2 mt-4">
              <p className="text-[10px] text-gray-600 uppercase font-bold">Kaise kaam karta hai:</p>
              {[
                'Template image AI ko bheji jaati hai',
                'GPT-4o Vision labels & spaces detect karta hai',
                'Har field ki exact position milti hai',
                'Aap verify karo aur apply karo!'
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-[10px] text-purple-400 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-gray-400">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── SCANNING STATE ─── */}
        {isScanning && (
          <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
            {/* Animated Brain */}
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center animate-pulse">
                <Brain className="w-10 h-10 text-purple-400" />
              </div>
              <div className="absolute inset-0 w-20 h-20 border-2 border-purple-500/30 rounded-full animate-ping" />
            </div>

            <h3 className="font-bold text-lg mb-2">AI Scanning...</h3>
            <p className="text-sm text-gray-400 mb-6 text-center">{scanStatus}</p>

            {/* Progress Bar */}
            <div className="w-full max-w-[250px]">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                {Math.round(scanProgress)}%
              </p>
            </div>

            <p className="text-[10px] text-gray-600 mt-6 text-center">
              ⏱️ Yeh 10-30 seconds le sakta hai<br />
              Please wait karo...
            </p>
          </div>
        )}

        {/* ─── RESULTS STATE ─── */}
        {!isScanning && detectedFields.length > 0 && (
          <div className="p-4 space-y-3">
            {/* Summary Card */}
            <div className="bg-gray-800/50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm flex items-center gap-1">
                  <Target className="w-4 h-4 text-green-400" />
                  Detection Results
                </h3>
                <button
                  onClick={resetScan}
                  className="text-xs text-gray-500 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Rescan
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-900/30 rounded-lg p-2">
                  <p className="text-lg font-bold text-green-400">
                    {scanResult?.highConfidence || 0}
                  </p>
                  <p className="text-[9px] text-green-500">High</p>
                </div>
                <div className="bg-yellow-900/30 rounded-lg p-2">
                  <p className="text-lg font-bold text-yellow-400">
                    {scanResult?.mediumConfidence || 0}
                  </p>
                  <p className="text-[9px] text-yellow-500">Medium</p>
                </div>
                <div className="bg-red-900/30 rounded-lg p-2">
                  <p className="text-lg font-bold text-red-400">
                    {scanResult?.lowConfidence || 0}
                  </p>
                  <p className="text-[9px] text-red-500">Low</p>
                </div>
              </div>

              {scanResult?.notes && (
                <p className="text-[10px] text-gray-500 mt-2 italic">
                  💡 {scanResult.notes}
                </p>
              )}
            </div>

            {/* Select All / Deselect */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {selectedFields.size}/{detectedFields.length} selected
              </span>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[10px] text-purple-400 hover:underline">
                  Select All
                </button>
                <button onClick={deselectAll} className="text-[10px] text-gray-500 hover:underline">
                  Deselect
                </button>
              </div>
            </div>

            {/* Detected Fields List */}
            <div className="space-y-2">
              {detectedFields.map((field) => {
                const isSelected = selectedFields.has(field.id);
                return (
                  <div
                    key={field.id}
                    className={`bg-gray-800 rounded-xl p-3 border transition-all cursor-pointer
                      ${isSelected
                        ? 'border-purple-500/50 bg-purple-900/10'
                        : 'border-gray-700 hover:border-gray-600'
                      }`}
                    onClick={() => toggleField(field.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center
                          ${isSelected ? 'bg-purple-600 border-purple-500' : 'border-gray-600'}`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="font-semibold text-sm">{field.label}</span>
                      </div>
                      <ConfidenceBadge score={field.confidence} />
                    </div>

                    <div className="flex items-center gap-2 ml-6">
                      <span className="text-[10px] text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded">
                        {field.type}
                      </span>
                      <span className="text-[10px] text-gray-600">
                        x:{Math.round(field.x)}% y:{Math.round(field.y)}%
                      </span>
                    </div>

                    {showDetails && field.reason && (
                      <p className="text-[10px] text-gray-500 mt-1 ml-6 italic">
                        💡 {field.reason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Details Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-xs text-gray-500 hover:text-gray-300 flex items-center justify-center gap-1"
            >
              {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showDetails ? 'Hide' : 'Show'} AI Reasons
            </button>
          </div>
        )}

        {/* ─── ERROR STATE ─── */}
        {error && !isScanning && (
          <div className="p-4">
            <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 mb-4">
              <XCircle className="w-8 h-8 text-red-400 mb-2" />
              <h3 className="font-bold text-sm text-red-300">Detection Failed</h3>
              <p className="text-xs text-red-400/70 mt-1">{error}</p>
            </div>

            <button
              onClick={() => { resetScan(); handleScan('fast'); }}
              className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-700 rounded-xl 
                font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> Try Fast Mode
            </button>

            <button
              onClick={resetScan}
              className="w-full py-2 mt-2 text-gray-500 hover:text-white text-sm"
            >
              ← Back to Manual
            </button>
          </div>
        )}
      </div>

      {/* Apply Button (Fixed Bottom) */}
      {detectedFields.length > 0 && !isScanning && (
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <button
            onClick={handleApply}
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl 
              font-bold text-sm flex items-center justify-center gap-2 transition-all
              hover:shadow-lg hover:shadow-green-500/20"
          >
            <Check className="w-5 h-5" />
            Apply {selectedFields.size} Fields to Template
          </button>
        </div>
      )}
    </div>
  );
};

export default AIDetector;
