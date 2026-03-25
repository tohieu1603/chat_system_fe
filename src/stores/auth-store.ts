import { create } from 'zustand';
import apiClient from '@/lib/api-client';
import type { User, ApiResponse } from '@/types';

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  company_name?: string;
  company_size?: string;
  industry?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setAccessToken: (token: string) => void;
}

const TOKEN_KEY = 'access_token';

function persistToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  const secure = window.location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=900; samesite=lax${secure}`;
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Rehydrate on init
  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      // Defer fetchMe to avoid sync state issue during store init
      setTimeout(() => get().fetchMe(), 0);
    }
  }

  return {
    user: null,
    accessToken: typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
    isLoading: false,
    isAuthenticated: false,

    setAccessToken: (token: string) => {
      persistToken(token);
      set({ accessToken: token });
    },

    login: async (email: string, password: string) => {
      set({ isLoading: true });
      try {
        const { data } = await apiClient.post<ApiResponse<{ user: User; access_token: string }>>(
          '/auth/login',
          { email, password } as LoginDto,
        );
        const { user, access_token } = data.data!;
        persistToken(access_token);
        set({ user, accessToken: access_token, isAuthenticated: true, isLoading: false });
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    register: async (dto: RegisterDto) => {
      set({ isLoading: true });
      try {
        const { data } = await apiClient.post<ApiResponse<{ user: User; access_token: string }>>(
          '/auth/register',
          dto,
        );
        const { user, access_token } = data.data!;
        persistToken(access_token);
        set({ user, accessToken: access_token, isAuthenticated: true, isLoading: false });
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        await apiClient.post('/auth/logout');
      } catch {
        // ignore logout errors
      } finally {
        clearToken();
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        window.location.href = '/login';
      }
    },

    fetchMe: async () => {
      set({ isLoading: true });
      try {
        const { data } = await apiClient.get<ApiResponse<User>>('/users/me');
        set({ user: data.data!, isAuthenticated: true, isLoading: false });
      } catch {
        clearToken();
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      }
    },
  };
});
