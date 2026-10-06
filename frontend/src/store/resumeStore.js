import { create } from 'zustand';

export const useResumeStore = create((set, get) => ({
  // User ka resume data (form se aayega)
  resumeData: {},

  // Field-level styling overrides
  fieldStyles: {},

  // Global settings
  globalFont: 'Arial',
  globalColor: '#000000',
  globalFontSize: 14,

  // Preview settings
  previewZoom: 100,
  showBorders: false,   // Debug ke liye field borders

  // 🔥 Set single field data (real-time)
  setFieldData: (fieldLabel, value) => {
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        [fieldLabel]: value
      }
    }));
  },

  // 🔥 Set all data at once
  setAllData: (data) => {
    set({ resumeData: data });
  },

  // 🔥 Field-level style update
  setFieldStyle: (fieldId, style) => {
    set((state) => ({
      fieldStyles: {
        ...state.fieldStyles,
        [fieldId]: {
          ...state.fieldStyles[fieldId],
          ...style
        }
      }
    }));
  },

  // Global settings
  setGlobalFont: (font) => set({ globalFont: font }),
  setGlobalColor: (color) => set({ globalColor: color }),
  setGlobalFontSize: (size) => set({ globalFontSize: size }),
  setPreviewZoom: (zoom) => set({ previewZoom: zoom }),
  toggleBorders: () => set((state) => ({ showBorders: !state.showBorders })),

  // Reset
  resetResume: () => {
    set({
      resumeData: {},
      fieldStyles: {},
      globalFont: 'Arial',
      globalColor: '#000000',
      globalFontSize: 14
    });
  }
}));
