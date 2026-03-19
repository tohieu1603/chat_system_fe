/** Talent Venture Platform — shared TypeScript interfaces */
import type { User } from '@/types';

export interface Batch {
  id: string;
  name: string;
  description?: string;
  status: 'UPCOMING' | 'OPEN' | 'CLOSED';
  max_teams: number;
  application_start?: string;
  application_end?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  invite_code: string;
  max_members: number;
  batch_id: string;
  created_by: string;
  members: TeamMember[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'LEADER' | 'MEMBER';
  joined_at: string;
  user?: User;
}

export interface BusinessPlan {
  id: string;
  team_id: string;
  batch_id?: string;
  title: string;
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
  executive_summary?: string;
  problem_statement?: string;
  solution?: string;
  target_market?: string;
  customer_persona?: string;
  competitive_analysis?: string;
  organic_marketing?: string;
  paid_advertising?: string;
  operation_workflow?: string;
  payment_system?: string;
  tech_requirements?: string;
  cost_structure?: string;
  revenue_model?: string;
  milestones?: Milestone[];
  attachments?: string[];
  submitted_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Milestone {
  id?: string;
  name: string;
  date: string;
  goal: string;
}

export interface Evaluation {
  id: string;
  plan_id: string;
  workflow_score?: number;
  business_score?: number;
  organic_score?: number;
  ads_score?: number;
  weighted_total?: number;
  strengths?: string;
  weaknesses?: string;
  improvement_notes?: string;
  recommendation?: 'APPROVE' | 'REJECT' | 'REVISE';
}

export interface TalentAssessment {
  id: string;
  user_id: string;
  business_thinking?: number;
  marketing_ability?: number;
  proactiveness?: number;
  teamwork?: number;
  learning_speed?: number;
  resilience?: number;
  comments?: string;
  potential_role?: string;
  training_notes?: string;
}

export interface CandidateProfile {
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  education?: string;
  experience?: string;
  skills?: string;
  motivation?: string;
  cv_url?: string;
}
