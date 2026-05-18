import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { getDb } from './config';
import {
  COLLECTIONS,
  type TaskDoc,
  type EffortScore,
  type Recurrence,
  type TaskStatus,
} from './schema';

function tasksCol(workspaceId: string) {
  return collection(getDb(), COLLECTIONS.WORKSPACES, workspaceId, COLLECTIONS.TASKS);
}

function workspaceRef(workspaceId: string) {
  return doc(getDb(), COLLECTIONS.WORKSPACES, workspaceId);
}

export interface CreateTaskInput {
  name: string;
  description?: string | null;
  effortScore: EffortScore;
  dueDate?: Date | null;
  recurring?: Recurrence;
  createdBy: string;
}

export async function createTask(workspaceId: string, input: CreateTaskInput): Promise<string> {
  const newTask: Omit<TaskDoc, 'createdAt' | 'updatedAt'> & {
    createdAt: unknown;
    updatedAt: unknown;
  } = {
    name: input.name,
    description: input.description ?? null,
    effortScore: input.effortScore,
    assignedTo: null,
    assignedToName: null,
    assignedToColor: null,
    status: 'todo',
    dueDate: input.dueDate ? Timestamp.fromDate(input.dueDate) : null,
    recurring: input.recurring ?? 'none',
    recurringParentId: null,
    completedAt: null,
    completedBy: null,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(tasksCol(workspaceId), newTask);

  await updateDoc(workspaceRef(workspaceId), {
    'stats.totalTasks': increment(1),
    'stats.totalEffort': increment(input.effortScore),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function assignTask(
  workspaceId: string,
  taskId: string,
  assignee: { userId: string; displayName: string; color: string }
): Promise<void> {
  await updateDoc(doc(tasksCol(workspaceId), taskId), {
    assignedTo: assignee.userId,
    assignedToName: assignee.displayName,
    assignedToColor: assignee.color,
    updatedAt: serverTimestamp(),
  });
}

export async function updateTaskStatus(
  workspaceId: string,
  taskId: string,
  status: TaskStatus,
  completedBy?: string
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };

  if (status === 'done') {
    updates.completedAt = serverTimestamp();
    updates.completedBy = completedBy ?? null;
  } else {
    updates.completedAt = null;
    updates.completedBy = null;
  }

  await updateDoc(doc(tasksCol(workspaceId), taskId), updates);
}

export async function deleteTask(workspaceId: string, taskId: string): Promise<void> {
  const taskSnap = await getDocs(query(tasksCol(workspaceId), where('__name__', '==', taskId)));
  const task = taskSnap.docs[0]?.data() as TaskDoc | undefined;

  await deleteDoc(doc(tasksCol(workspaceId), taskId));

  if (task) {
    await updateDoc(workspaceRef(workspaceId), {
      'stats.totalTasks': increment(-1),
      'stats.totalEffort': increment(-task.effortScore),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function getTasks(workspaceId: string): Promise<Array<TaskDoc & { id: string }>> {
  const snap = await getDocs(query(tasksCol(workspaceId), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as TaskDoc) }));
}

export function subscribeToTasks(
  workspaceId: string,
  onChange: (tasks: Array<TaskDoc & { id: string }>) => void
): () => void {
  const q = query(tasksCol(workspaceId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...(d.data() as TaskDoc) })));
  });
}

export function subscribeToUserTasks(
  workspaceId: string,
  userId: string,
  onChange: (tasks: Array<TaskDoc & { id: string }>) => void
): () => void {
  const q = query(
    tasksCol(workspaceId),
    where('assignedTo', '==', userId),
    orderBy('dueDate', 'asc')
  );
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...(d.data() as TaskDoc) })));
  });
}
