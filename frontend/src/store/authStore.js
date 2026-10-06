import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API = '/api/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      register: async (name, email, password) => {
        set({ loading: true });
        try {
          const { data } = await axios.post(`${API}/register`, { name, email, password });
          set({ user: data.user, token: data.token, loading: false });
          return data;
        } catch (error) {
          set({ loading: false });
          throw error.response?.data?.message || 'Registration failed';
        }
      },

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await axios.post(`${API}/login`, { email, password });
          set({ user: data.user, token: data.token, loading: false });
          return data;
        } catch (error) {
          set({ loading: false });
          throw error.response?.data?.message || 'Login failed';
        }
      },

      logout: () => {
        set({ user: null, token: null });
      }
    }),
    { name: 'auth-storage' }
  )
);