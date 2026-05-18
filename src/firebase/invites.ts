import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  increment,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getDb } from './config';
import { COLLECTIONS, type InviteDoc } from './schema';

function inviteRef(code: string) {
  return doc(collection(getDb(), COLLECTIONS.INVITES), code);
}

function generateInviteCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export interface CreateInviteInput {
  workspaceId: string;
  workspaceName: string;
  createdBy: string;
  expiresInDays?: number;
  maxUses?: number | null;
}

export async function createInvite(input: CreateInviteInput): Promise<string> {
  const code = generateInviteCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (input.expiresInDays ?? 7));

  await setDoc(inviteRef(code), {
    code,
    workspaceId: input.workspaceId,
    workspaceName: input.workspaceName,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
    maxUses: input.maxUses ?? null,
    usedCount: 0,
    usedBy: [],
  });

  return code;
}

export async function getInvite(code: string): Promise<InviteDoc | null> {
  const snap = await getDoc(inviteRef(code));
  return snap.exists() ? (snap.data() as InviteDoc) : null;
}

export interface InviteValidation {
  valid: boolean;
  reason?: 'not_found' | 'expired' | 'max_uses_reached' | 'already_joined';
  invite?: InviteDoc;
}

export async function validateInvite(
  code: string,
  userId: string
): Promise<InviteValidation> {
  const invite = await getInvite(code);
  if (!invite) return { valid: false, reason: 'not_found' };

  if (invite.expiresAt.toMillis() < Date.now()) {
    return { valid: false, reason: 'expired', invite };
  }

  if (invite.maxUses !== null && invite.usedCount >= invite.maxUses) {
    return { valid: false, reason: 'max_uses_reached', invite };
  }

  if (invite.usedBy.includes(userId)) {
    return { valid: false, reason: 'already_joined', invite };
  }

  return { valid: true, invite };
}

export async function redeemInvite(code: string, userId: string): Promise<void> {
  await updateDoc(inviteRef(code), {
    usedCount: increment(1),
    usedBy: arrayUnion(userId),
  });
}

export async function revokeInvite(code: string): Promise<void> {
  await deleteDoc(inviteRef(code));
}
