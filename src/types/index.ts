/** Shared TypeScript interfaces matching backend entities */

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'DEV' | 'FINANCE';
  company_name?: string;
  company_size?: string;
  industry?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  customer_id: string;
  customer?: User;
  project_name: string;
  project_code: string;
  description?: string;
  status: ProjectStatus;
  collection_progress: Record<string, any>;
  requirement_doc_url?: string;
  requirement_json?: Record<string, any>;
  estimated_budget?: number;
  actual_budget?: number;
  estimated_deadline?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  created_at: string;
  updated_at: string;
}

export type ProjectStatus =
  | 'COLLECTING' | 'COLLECTED' | 'REVIEWING'
  | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

export interface Conversation {
  id: string;
  project_id: string;
  title?: string;
  conversation_type: 'AI_COLLECT' | 'SUPPORT' | 'CLARIFY';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  total_messages: number;
  total_tokens: number;
  last_message_at?: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'USER' | 'AI' | 'SYSTEM';
  sender_id?: string;
  content: string;
  message_type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM_NOTICE';
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface TaskItem {
  id: string;
  project_id: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  task_type?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignee_id?: string;
  assignee?: User;
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  tags?: string[];
  children?: TaskItem[];
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  type: string;
  reference_type?: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface FinanceRecord {
  id: string;
  project_id: string;
  type: 'QUOTE' | 'INVOICE' | 'PAYMENT';
  amount: number;
  currency: string;
  status: 'PENDING' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  description?: string;
  due_date?: string;
  paid_at?: string;
  file_url?: string;
  created_at: string;
}

/** Generic API response shape */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
