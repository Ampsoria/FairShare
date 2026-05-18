import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { getDb } from './config';
import { COLLECTIONS, type UserDoc } from './schema';

const usersRef = () => COLLECTIONS.USERS;

export async function createOrUpdateUser(user: {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string | null;
  locale?: string;
}): Promise<void> {
  const db = getDb();
  const ref = doc(db, usersRef(), user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await updateDoc(ref, {
      displayName: user.displayName,
      email: user.email.toLowerCase(),
      photoURL: user.photoURL ?? null,
      locale: user.locale ?? 'th-TH',
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email.toLowerCase(),
      photoURL: user.photoURL ?? null,
      locale: user.locale ?? 'th-TH',
      workspaceIds: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function getUser(uid: string): Promise<UserDoc | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, usersRef(), uid));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

export function subscribeToUser(
  uid: string,
  onChange: (user: UserDoc | null) => void
): () => void {
  const db = getDb();
  return onSnapshot(doc(db, usersRef(), uid), (snap) => {
    onChange(snap.exists() ? (snap.data() as UserDoc) : null);
  });
}

export async function addWorkspaceToUser(uid: string, workspaceId: string): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, usersRef(), uid), {
    workspaceIds: arrayUnion(workspaceId),
    updatedAt: serverTimestamp(),
  });
}

export async function removeWorkspaceFromUser(uid: string, workspaceId: string): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, usersRef(), uid), {
    workspaceIds: arrayRemove(workspaceId),
    updatedAt: serverTimestamp(),
  });
}

export function toTimestamp(d: Date): Timestamp {
  return Timestamp.fromDate(d);
}
