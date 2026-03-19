import { create } from 'zustand';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { BusinessPlan } from '@/types/talent-venture';

interface PlanState {
  plans: BusinessPlan[];
  currentPlan: BusinessPlan | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  error: string | null;
  dirtyFields: Partial<BusinessPlan>;
  fetchMyPlans: () => Promise<void>;
  fetchPlan: (id: string) => Promise<void>;
  createPlan: (title: string) => Promise<BusinessPlan>;
  updateSection: (field: keyof BusinessPlan, value: any) => void;
  saveDirtyFields: () => Promise<void>;
  submitPlan: (id: string) => Promise<void>;
  clearCurrent: () => void;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: [],
  currentPlan: null,
  isLoading: false,
  isSaving: false,
  lastSavedAt: null,
  error: null,
  dirtyFields: {},

  fetchMyPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.get<ApiResponse<BusinessPlan>>('/business-plans/my-plan');
      const plan = data.data;
      set({ plans: plan ? [plan] : [], isLoading: false });
    } catch {
      set({ error: 'Lỗi tải danh sách kế hoạch', isLoading: false });
    }
  },

  fetchPlan: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.get<ApiResponse<BusinessPlan>>(`/business-plans/${id}`);
      set({ currentPlan: data.data ?? null, dirtyFields: {}, isLoading: false });
    } catch {
      set({ error: 'Lỗi tải kế hoạch', isLoading: false });
    }
  },

  createPlan: async (title: string) => {
    set({ isLoading: true, error: null });
    try {
      // Lấy team_id + batch_id từ team hiện tại
      const teamRes = await apiClient.get<ApiResponse<{ id: string; batch_id: string }>>('/teams/my-team');
      const team = teamRes.data.data;
      if (!team) throw new Error('Bạn chưa có đội nhóm. Hãy tạo hoặc tham gia đội trước.');

      const { data } = await apiClient.post<ApiResponse<BusinessPlan>>('/business-plans', {
        title,
        team_id: team.id,
        batch_id: team.batch_id,
      });
      const plan = data.data!;
      set(state => ({ plans: [plan, ...state.plans], isLoading: false }));
      return plan;
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? err?.message ?? 'Lỗi tạo kế hoạch', isLoading: false });
      throw err;
    }
  },

  updateSection: (field: keyof BusinessPlan, value: any) => {
    set(state => ({
      currentPlan: state.currentPlan ? { ...state.currentPlan, [field]: value } : null,
      dirtyFields: { ...state.dirtyFields, [field]: value },
    }));
  },

  saveDirtyFields: async () => {
    const { currentPlan, dirtyFields } = get();
    if (!currentPlan || Object.keys(dirtyFields).length === 0) return;
    set({ isSaving: true });
    try {
      const { data } = await apiClient.patch<ApiResponse<BusinessPlan>>(
        `/business-plans/${currentPlan.id}`,
        dirtyFields,
      );
      set({ currentPlan: data.data ?? currentPlan, dirtyFields: {}, isSaving: false, lastSavedAt: new Date() });
    } catch {
      set({ isSaving: false });
    }
  },

  submitPlan: async (id: string) => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.post<ApiResponse<BusinessPlan>>(`/business-plans/${id}/submit`);
      set(state => ({
        currentPlan: data.data ?? state.currentPlan,
        plans: state.plans.map(p => (p.id === id ? (data.data ?? p) : p)),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  clearCurrent: () => set({ currentPlan: null, dirtyFields: {}, lastSavedAt: null }),
}));
