export type UserRole = 'ADMIN' | 'PM' | 'MEMBER' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  role: UserRole;
  department?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_at: string;
  member_ids: string[];
}

export interface KanbanColumn {
  id: string;
  project_id: string;
  name: string;
  position_order: number;
  color?: string;
}

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type WorkPackageType = 'MILESTONE' | 'PHASE' | 'TASK' | 'FEATURE' | 'BUG';

export interface Task {
  id: string;
  project_id: string;
  column_id: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  due_date: string;
  start_date?: string;
  assignee_id: string;
  collaborator_ids?: string[];
  position_order: number;
  linked_rfi_ids: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
  // OpenProject Gantt & Work Package extensions
  type?: WorkPackageType;
  progress?: number; // 0 - 100 percentage
  parent_id?: string; // ID of parent phase or milestone
  dependencies?: string[]; // IDs of predecessor tasks
}

export type RFIStatus = 'DRAFT' | 'OPEN' | 'UNDER_REVIEW' | 'ANSWERED' | 'CLOSED' | 'REOPENED';
export type RFICategory = 'TECHNICAL' | 'SCOPE' | 'BUDGET' | 'DESIGN' | 'SCHEDULE';

export interface RFI {
  id: string;
  rfi_code: string; // e.g. RFI-2026-001
  project_id: string;
  task_id?: string; // linked task ID (optional)
  title: string;
  question: string;
  answer?: string;
  status: RFIStatus;
  category: RFICategory;
  priority: PriorityLevel;
  creator_id: string;
  assignee_id: string;
  collaborator_ids?: string[];
  due_date?: string;
  created_at: string;
  answered_at?: string;
  closed_at?: string;
}

export interface Attachment {
  id: string;
  target_type: 'TASK' | 'RFI';
  target_id: string;
  file_name: string;
  file_url: string;
  file_size: number; // in bytes
  file_type: string; // mime type
  thumbnail_url?: string;
  uploaded_by: string;
  created_at: string;
}

export interface Comment {
  id: string;
  target_type: 'TASK' | 'RFI';
  target_id: string;
  user_id: string;
  content: string;
  mentioned_user_ids?: string[];
  attachments?: Attachment[];
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string; // recipient
  sender_id: string;
  title: string;
  message: string;
  type: 'TASK_ASSIGNED' | 'TASK_STATUS_CHANGED' | 'RFI_ASSIGNED' | 'RFI_ANSWERED' | 'MENTIONED' | 'DUE_SOON';
  target_type: 'TASK' | 'RFI';
  target_id: string;
  read: boolean;
  created_at: string;
}

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  status: number;
  duration_ms: number;
  request_payload?: unknown;
  response_payload?: unknown;
}
