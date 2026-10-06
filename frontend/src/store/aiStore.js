import { create } from 'zustand';
import axios from 'axios';

const API = '/api/ai';

export const useAIStore = create((set, get) => ({
  // AI Detection State
  isScanning: false,
  scanProgress: 0,
  scanStatus: '',
  detectedFields: [],
  scanResult: null,
  error: null,

  // 🔥 AI Detection Call
  detectFields: async (token, templateId, mode = 'accurate') => {
    set({
      isScanning: true,
      scanProgress: 0,
      scanStatus: '🔍 Template scan ho raha hai...',
      error: null,
      detectedFields: []
    });

    // Fake progress animation (real progress nahi milta API se)
    const progressInterval = setInterval(() => {
      set((state) => {
        if (state.scanProgress >= 90) {
          clearInterval(progressInterval);
          return state;
        }
        const newProgress = state.scanProgress + Math.random() * 8;
        const statuses = [
          '📸 Image analyze ho rahi hai...',
          '🔤 Text detect ho raha hai...',
          '📐 Layout samjha ja raha hai...',
          '📍 Field coordinates calculate ho rahe hain...',
          '🧠 AI soch raha hai...',
          '✨ Fields finalize ho rahe hain...',
          '🎯 Almost done...'
        ];
        const statusIndex = Math.min(
          Math.floor(newProgress / 15),
          statuses.length - 1
        );
        return {
          scanProgress: Math.min(newProgress, 90),
          scanStatus: statuses[statusIndex]
        };
      });
    }, 800);

    try {
      const { data } = await axios.post(
        `${API}/detect`,
        { templateId, mode },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 90000
        }
      );

      clearInterval(progressInterval);

      set({
        isScanning: false,
        scanProgress: 100,
        scanStatus: '✅ Detection Complete!',
        detectedFields: data.fields || [],
        scanResult: data,
        error: null
      });

      return data;
    } catch (error) {
      clearInterval(progressInterval);
      const errorMsg = error.response?.data?.message || error.message;

      set({
        isScanning: false,
        scanProgress: 0,
        scanStatus: '❌ Detection Failed',
        error: errorMsg,
        detectedFields: []
      });

      throw errorMsg;
    }
  },

  // 🔥 Apply AI fields to template
  applyFields: async (token, templateId, fields, merge = false) => {
    try {
      const { data } = await axios.post(
        `${API}/apply`,
        { templateId, fields, merge },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Apply failed';
    }
  },

  // Remove single detected field
  removeDetectedField: (fieldId) => {
    set((state) => ({
      detectedFields: state.detectedFields.filter(f => f.id !== fieldId)
    }));
  },

  // Update single detected field
  updateDetectedField: (fieldId, updates) => {
    set((state) => ({
      detectedFields: state.detectedFields.map(f =>
        f.id === fieldId ? { ...f, ...updates } : f
      )
    }));
  },

  // Reset
  resetScan: () => {
    set({
      isScanning: false,
      scanProgress: 0,
      scanStatus: '',
      detectedFields: [],
      scanResult: null,
      error: null
    });
  }
}));
