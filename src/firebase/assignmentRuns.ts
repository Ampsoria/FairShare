import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getDb } from './config';
import {
  COLLECTIONS,
  type AssignmentRunDoc,
  type AssignmentSnapshot,
  type EffortScore,
} from './schema';
import {
  assignTasksFairly,
  type Member as AlgoMember,
  type Task as AlgoTask,
} from '../algorithm/fairShare';

function runsCol(workspaceId: string) {
  return collection(getDb(), COLLECTIONS.WORKSPACES, workspaceId, COLLECTIONS.ASSIGNMENT_RUNS);
}

function workspaceRef(workspaceId: string) {
  return doc(getDb(), COLLECTIONS.WORKSPACES, workspaceId);
}

export interface RunTaskInput {
  taskId: string;
  taskName: string;
  effortScore: EffortScore;
}

export interface RunMemberInput {
  userId: string;
  color: string;
  displayName: string;
}

export interface AssignmentResult {
  assignments: AssignmentSnapshot[];
  memberScores: Record<string, number>;
  fairnessDelta: number;
  wasBalanced: boolean;
}

export function computeFairShare(
  members: RunMemberInput[],
  tasks: RunTaskInput[],
  fairnessThreshold = 2
): AssignmentResult {
  if (!members.length) {
    return { assignments: [], memberScores: {}, fairnessDelta: 0, wasBalanced: true };
  }

  const algoMembers: AlgoMember[] = members.map((m) => ({
    id: m.userId,
    name: m.displayName,
    currentTotalScore: 0,
  }));
  const algoTasks: AlgoTask[] = tasks.map((t) => ({
    id: t.taskId,
    title: t.taskName,
    effortScore: t.effortScore,
  }));

  const result = assignTasksFairly(algoMembers, algoTasks);

  const memberScores: Record<string, number> = {};
  result.updatedMembers.forEach((m) => {
    memberScores[String(m.id)] = m.currentTotalScore;
  });

  const taskByIdLookup = new Map(tasks.map((t) => [t.taskId, t]));
  const assignments: AssignmentSnapshot[] = result.assignments.map((a) => {
    const original = taskByIdLookup.get(a.id as string);
    return {
      taskId: a.id as string,
      taskName: original?.taskName ?? a.title,
      effortScore: a.effortScore as EffortScore,
      assignedTo: String(a.assignedTo),
    };
  });

  return {
    assignments,
    memberScores,
    fairnessDelta: result.fairnessDelta,
    wasBalanced: result.fairnessDelta <= fairnessThreshold,
  };
}

export async function saveAssignmentRun(
  workspaceId: string,
  result: AssignmentResult,
  triggeredBy: string,
  algorithm = 'greedy-v1'
): Promise<string> {
  const docRef = await addDoc(runsCol(workspaceId), {
    triggeredBy,
    triggeredAt: serverTimestamp(),
    algorithm,
    memberScores: result.memberScores,
    assignments: result.assignments,
    fairnessDelta: result.fairnessDelta,
    wasBalanced: result.wasBalanced,
    confirmed: false,
  });

  await updateDoc(docRef, { runId: docRef.id });
  return docRef.id;
}

export async function confirmAssignmentRun(workspaceId: string, runId: string): Promise<void> {
  await updateDoc(doc(runsCol(workspaceId), runId), { confirmed: true });
  await updateDoc(workspaceRef(workspaceId), {
    'stats.lastAssignmentAt': Timestamp.now(),
    updatedAt: serverTimestamp(),
  });
}

export async function getRecentAssignmentRuns(
  workspaceId: string,
  count = 10
): Promise<Array<AssignmentRunDoc & { id: string }>> {
  const q = query(runsCol(workspaceId), orderBy('triggeredAt', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as AssignmentRunDoc) }));
}
