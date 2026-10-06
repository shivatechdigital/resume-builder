import { create } from 'zustand';
import axios from 'axios';

const API = '/api/templates';

export const useTemplateStore = create((set, get) => ({
  templates: [],
  currentTemplate: null,
  loading: false,

  fetchTemplates: async (token) => {
    set({ loading: true });
    try {
      const { data } = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ templates: data.templates, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  uploadTemplate: async (token, formData) => {
    set({ loading: true });
    try {
      const { data } = await axios.post(API + '/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      set((state) => ({
        templates: [data.template, ...state.templates],
        loading: false
      }));
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  deleteTemplate: async (token, id) => {
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({
        templates: state.templates.filter((t) => t._id !== id)
      }));
    } catch (error) {
      throw error;
    }
  }
}));