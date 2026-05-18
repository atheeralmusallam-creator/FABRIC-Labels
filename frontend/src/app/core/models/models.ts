export type UserRole = 'Admin' | 'Manager' | 'Reviewer' | 'Annotator' | 'Customer';
export type ProjectStatus = 'Draft' | 'Active' | 'Completed' | 'Archived';
export type DataModality = 'Text' | 'Audio' | 'Image' | 'Video';
export type ReviewStatus = 'Pending' | 'InProgress' | 'Completed' | 'Escalated';
export type ProcessingMode = 'AIAndHuman' | 'HumanOnly';
export type ExportFormat = 'CSV' | 'JSON' | 'Excel';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; name: string; role: string };
}

export interface CustomerProject {
  id: string;
  customerId: string;
  name: string;
  description?: string;
  modality: DataModality;
  processingMode: ProcessingMode;
  status: ProjectStatus;
  confidenceThreshold: number;
  createdAt: string;
  updatedAt: string;
  filesCount?: number;
  resultsCount?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  organizationId?: string;
  status: ProjectStatus;
  modality: DataModality;
  confidenceThreshold: number;
  createdAt: string;
  taskCount?: number;
}

export interface HumanReview {
  id: string;
  customerProjectId: string;
  assignedToId?: string;
  itemContent: string;
  aiResult?: string;
  aiConfidence?: number;
  status: ReviewStatus;
  createdAt: string;
  completedAt?: string;
}

export interface FinalResult {
  id: string;
  customerProjectId: string;
  itemContent: string;
  finalLabel: string;
  source: string;
  confidenceScore?: number;
  reviewerId?: string;
  finalizedAt: string;
}

export interface AdminStats {
  totalProjects: number;
  totalCustomers: number;
  pendingReviews: number;
  completedToday: number;
  totalAnnotators: number;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  modelIdentifier: string;
  isActive: boolean;
}
