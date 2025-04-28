import { create } from 'zustand';
import { mountStoreDevtool } from 'simple-zustand-devtools';

const useAuthStore = create((set, get) => ({
  allUserData: null,  // User object to store user information
  loading: false,

  user: () => {
    const user_id = get().allUserData?.user_id || null;
    const user_name = get().allUserData?.user_name || null;
    return { user_id, user_name };
  },

  setUser: (user) =>
    set(() => ({
      allUserData: user,
    })),

  setLoading: (loading) =>
    set({ loading }),

  isLoggedIn: () => get().allUserData !== null,
}));

if (import.meta.env.DEV) {
  mountStoreDevtool(useAuthStore, { name: 'useAuthStore' });
}

export { useAuthStore };
