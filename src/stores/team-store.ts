import { create } from 'zustand';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { Team, TeamMember } from '@/types/talent-venture';

interface CreateTeamDto {
  name: string;
  description?: string;
  batch_id?: string;
}

interface TeamState {
  team: Team | null;
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
  fetchMyTeam: () => Promise<void>;
  createTeam: (dto: CreateTeamDto) => Promise<void>;
  joinTeam: (inviteCode: string) => Promise<void>;
  fetchMembers: () => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  clearTeam: () => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  team: null,
  members: [],
  isLoading: false,
  error: null,

  fetchMyTeam: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.get<ApiResponse<Team>>('/teams/my-team');
      set({ team: data.data ?? null, isLoading: false });
      if (data.data) {
        set({ members: data.data.members ?? [] });
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        // No team yet — normal state
        set({ team: null, members: [], isLoading: false });
      } else {
        set({ error: 'Lỗi tải thông tin đội nhóm', isLoading: false });
      }
    }
  },

  createTeam: async (dto: CreateTeamDto) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.post<ApiResponse<Team>>('/teams', dto);
      set({ team: data.data ?? null, members: data.data?.members ?? [], isLoading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? 'Lỗi tạo đội nhóm', isLoading: false });
      throw err;
    }
  },

  joinTeam: async (inviteCode: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.post<ApiResponse<Team>>('/teams/join', { invite_code: inviteCode });
      set({ team: data.data ?? null, members: data.data?.members ?? [], isLoading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? 'Mã mời không hợp lệ', isLoading: false });
      throw err;
    }
  },

  fetchMembers: async () => {
    const { team } = get();
    if (!team) return;
    try {
      const { data } = await apiClient.get<ApiResponse<TeamMember[]>>(`/teams/${team.id}/members`);
      set({ members: data.data ?? [] });
    } catch {
      // silently fail
    }
  },

  removeMember: async (memberId: string) => {
    const { team } = get();
    if (!team) return;
    try {
      await apiClient.delete(`/teams/${team.id}/members/${memberId}`);
      set(state => ({ members: state.members.filter(m => m.id !== memberId) }));
    } catch (err: any) {
      throw err;
    }
  },

  clearTeam: () => set({ team: null, members: [], error: null }),
}));
