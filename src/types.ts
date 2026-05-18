export interface User {
  id: string;
  name: string;
  color: string;
}

export interface Member {
  id: string;
  name: string;
  color: string;
  isCurrentUser?: boolean;
}

export interface Task {
  id: string;
  name: string;
  effortScore: 1 | 2 | 3 | 4 | 5;
  dueDate?: string;
  recurring: 'none' | 'weekly' | 'monthly';
  assignedTo?: string;
  done: boolean;
}

export type WorkspaceStatus = 'active' | 'completed';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string; // user.id of the workspace owner
  members: Member[];
  tasks: Task[];
  status: WorkspaceStatus;
  createdAt: number;
  completedAt?: number;
}

export type AppStep = 'onboarding' | 'list' | 'setup' | 'tasks' | 'review' | 'dashboard';
