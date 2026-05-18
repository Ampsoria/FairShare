import type { Timestamp } from 'firebase/firestore';

export type EffortScore = 1 | 2 | 3 | 4 | 5;
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type Recurrence = 'none' | 'weekly' | 'monthly';
export type MemberRole = 'owner' | 'member';

export interface UserDoc {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  locale: string;
  workspaceIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WorkspaceMember {
  userId: string;
  displayName: string;
  photoURL: string | null;
  color: string;
  role: MemberRole;
  joinedAt: Timestamp;
}

export interface WorkspaceSettings {
  currency: string;
  weekStartsOn: 0 | 1;
  fairnessThreshold: number;
}

export interface WorkspaceStats {
  totalTasks: number;
  totalEffort: number;
  lastAssignmentAt: Timestamp | null;
}

export interface WorkspaceDoc {
  name: string;
  ownerId: string;
  memberIds: string[];
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
  stats: WorkspaceStats;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TaskDoc {
  name: string;
  description: string | null;
  effortScore: EffortScore;
  assignedTo: string | null;
  assignedToName: string | null;
  assignedToColor: string | null;
  status: TaskStatus;
  dueDate: Timestamp | null;
  recurring: Recurrence;
  recurringParentId: string | null;
  completedAt: Timestamp | null;
  completedBy: string | null;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AssignmentSnapshot {
  taskId: string;
  taskName: string;
  effortScore: EffortScore;
  assignedTo: string;
}

export interface AssignmentRunDoc {
  runId: string;
  triggeredBy: string;
  triggeredAt: Timestamp;
  algorithm: string;
  memberScores: Record<string, number>;
  assignments: AssignmentSnapshot[];
  fairnessDelta: number;
  wasBalanced: boolean;
  confirmed: boolean;
}

export interface InviteDoc {
  code: string;
  workspaceId: string;
  workspaceName: string;
  createdBy: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  maxUses: number | null;
  usedCount: number;
  usedBy: string[];
}

export const COLLECTIONS = {
  USERS: 'users',
  WORKSPACES: 'workspaces',
  TASKS: 'tasks',
  ASSIGNMENT_RUNS: 'assignmentRuns',
  INVITES: 'invites',
} as const;
