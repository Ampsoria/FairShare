import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getDb } from './config';
import { addWorkspaceToUser, removeWorkspaceFromUser } from './users';
import { COLLECTIONS, type WorkspaceDoc, type WorkspaceMember } from './schema';

const MEMBER_COLORS = [
  '#6366f1', '#14b8a6', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4',
];

export function pickMemberColor(memberCount: number): string {
  return MEMBER_COLORS[memberCount % MEMBER_COLORS.length];
}

export interface CreateWorkspaceInput {
  name: string;
  ownerId: string;
  ownerDisplayName: string;
  ownerPhotoURL?: string | null;
}

export async function createWorkspace(input: CreateWorkspaceInput): Promise<string> {
  const db = getDb();
  const now = Timestamp.now();

  const ownerMember: WorkspaceMember = {
    userId: input.ownerId,
    displayName: input.ownerDisplayName,
    photoURL: input.ownerPhotoURL ?? null,
    color: pickMemberColor(0),
    role: 'owner',
    joinedAt: now,
  };

  const newWorkspace: Omit<WorkspaceDoc, 'createdAt' | 'updatedAt'> & {
    createdAt: unknown;
    updatedAt: unknown;
  } = {
    name: input.name,
    ownerId: input.ownerId,
    memberIds: [input.ownerId],
    members: [ownerMember],
    settings: {
      currency: 'THB',
      weekStartsOn: 0,
      fairnessThreshold: 2,
    },
    stats: {
      totalTasks: 0,
      totalEffort: 0,
      lastAssignmentAt: null,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.WORKSPACES), newWorkspace);
  await addWorkspaceToUser(input.ownerId, docRef.id);
  return docRef.id;
}

export async function getWorkspace(workspaceId: string): Promise<WorkspaceDoc | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, COLLECTIONS.WORKSPACES, workspaceId));
  return snap.exists() ? (snap.data() as WorkspaceDoc) : null;
}

export function subscribeToWorkspace(
  workspaceId: string,
  onChange: (ws: WorkspaceDoc | null) => void
): () => void {
  const db = getDb();
  return onSnapshot(doc(db, COLLECTIONS.WORKSPACES, workspaceId), (snap) => {
    onChange(snap.exists() ? (snap.data() as WorkspaceDoc) : null);
  });
}

export async function getUserWorkspaces(uid: string): Promise<Array<WorkspaceDoc & { id: string }>> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.WORKSPACES),
    where('memberIds', 'array-contains', uid)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as WorkspaceDoc) }));
}

export async function addMemberToWorkspace(
  workspaceId: string,
  member: { userId: string; displayName: string; photoURL?: string | null }
): Promise<void> {
  const db = getDb();
  const ws = await getWorkspace(workspaceId);
  if (!ws) throw new Error('Workspace not found');
  if (ws.memberIds.includes(member.userId)) return;

  const newMember: WorkspaceMember = {
    userId: member.userId,
    displayName: member.displayName,
    photoURL: member.photoURL ?? null,
    color: pickMemberColor(ws.members.length),
    role: 'member',
    joinedAt: Timestamp.now(),
  };

  await updateDoc(doc(db, COLLECTIONS.WORKSPACES, workspaceId), {
    memberIds: [...ws.memberIds, member.userId],
    members: [...ws.members, newMember],
    updatedAt: serverTimestamp(),
  });

  await addWorkspaceToUser(member.userId, workspaceId);
}

export async function removeMemberFromWorkspace(
  workspaceId: string,
  userId: string
): Promise<void> {
  const db = getDb();
  const ws = await getWorkspace(workspaceId);
  if (!ws) throw new Error('Workspace not found');

  await updateDoc(doc(db, COLLECTIONS.WORKSPACES, workspaceId), {
    memberIds: ws.memberIds.filter((id) => id !== userId),
    members: ws.members.filter((m) => m.userId !== userId),
    updatedAt: serverTimestamp(),
  });

  await removeWorkspaceFromUser(userId, workspaceId);
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  const db = getDb();
  const ws = await getWorkspace(workspaceId);
  if (!ws) return;

  await Promise.all(ws.memberIds.map((uid) => removeWorkspaceFromUser(uid, workspaceId)));
  await deleteDoc(doc(db, COLLECTIONS.WORKSPACES, workspaceId));
}
