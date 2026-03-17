import { create } from 'zustand';
import apiClient from '@/lib/api-client';
import type { Project, ApiResponse } from '@/types';

interface CreateProjectDto {
  project_name: string;
  description?: string;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (dto: CreateProjectDto) => Promise<Project>;
  setCurrentProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.get<ApiResponse<Project[]>>('/projects');
      set({ projects: data.data ?? [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchProject: async (id: string) => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
      set({ currentProject: data.data ?? null, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createProject: async (dto: CreateProjectDto) => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.post<ApiResponse<Project>>('/projects', dto);
      const project = data.data!;
      set((s) => ({ projects: [project, ...s.projects], isLoading: false }));
      return project;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),
}));
