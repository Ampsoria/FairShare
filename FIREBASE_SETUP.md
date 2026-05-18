# FairShare — คู่มือติดตั้ง Firebase

โปรเจกต์นี้มี data layer ของ Firestore ครบสมบูรณ์อยู่ที่ [src/firebase/](src/firebase/) แอป React ตอนนี้ยังใช้ Zustand store แบบ in-memory อยู่ คู่มือนี้จะอธิบายวิธีเชื่อมต่อ Firestore เพื่อใช้งานจริง

## 1. สร้างโปรเจกต์ Firebase

1. ไปที่ https://console.firebase.google.com
2. คลิก **Add project** → ตั้งชื่อว่า `fairshare` (หรือชื่ออื่นก็ได้)
3. ปิด Google Analytics (ถ้าไม่ใช้)
4. เมื่อสร้างเสร็จ คลิกไอคอน **Web** (`</>`) เพื่อลงทะเบียน Web App
5. คัดลอกค่าใน `firebaseConfig` ไว้

## 2. ตั้งค่า Environment Variables

```bash
cp .env.example .env
```

จากนั้นใส่ค่าที่คัดลอกมาจากขั้นตอนที่ 1 ลงในไฟล์ `.env`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=fairshare-xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fairshare-xxxx
VITE_FIREBASE_STORAGE_BUCKET=fairshare-xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abc123
```

## 3. เปิดใช้งาน Firestore และ Authentication

ใน Firebase Console:

- **Build → Firestore Database → Create database** (เลือก production mode, ภูมิภาคใกล้ไทย: `asia-southeast1`)
- **Build → Authentication → Get Started → Email/Password** (เปิดใช้งาน)
- ไม่บังคับ: เปิดใช้งาน **Google** sign-in เพื่อล็อกอินด้วยคลิกเดียว

## 4. Deploy Security Rules และ Indexes

ติดตั้ง Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # เลือกโปรเจกต์ของคุณ ใช้ค่าเริ่มต้นสำหรับ rules/indexes
firebase deploy --only firestore:rules,firestore:indexes
```

ไฟล์ rules ที่ [firestore.rules](firestore.rules) มีกฎดังนี้:
- ผู้ใช้อ่าน/เขียนได้เฉพาะ doc `users/{uid}` ของตัวเอง
- เฉพาะสมาชิกของกลุ่มเท่านั้นที่อ่าน/เขียน tasks ในกลุ่มนั้นได้
- เฉพาะเจ้าของกลุ่มเท่านั้นที่ลบกลุ่มได้
- Invites: ผู้ใช้ที่ล็อกอินอ่านได้ แต่แก้ไขได้เฉพาะตอนใช้รหัสเชิญเท่านั้น

## 5. เปิดใช้งาน TTL สำหรับ Invites (ไม่บังคับ)

ใน Firestore Console → **Indexes → TTL → Add policy**
- Collection: `invites`
- Field: `expiresAt`

Firestore จะลบรหัสเชิญที่หมดอายุให้อัตโนมัติ

## 6. เชื่อม Data Layer เข้ากับแอป

ฟังก์ชัน CRUD ทั้งหมดอยู่ที่ [src/firebase/](src/firebase/):

| ไฟล์ | สิ่งที่ export |
|---|---|
| [config.ts](src/firebase/config.ts) | `initFirebase()`, `getDb()`, `getFirebaseAuth()` |
| [schema.ts](src/firebase/schema.ts) | TypeScript types ทั้งหมดที่ตรงกับ Firestore schema |
| [users.ts](src/firebase/users.ts) | `createOrUpdateUser`, `subscribeToUser`, `addWorkspaceToUser`, ... |
| [workspaces.ts](src/firebase/workspaces.ts) | `createWorkspace`, `addMemberToWorkspace`, `subscribeToWorkspace`, ... |
| [tasks.ts](src/firebase/tasks.ts) | `createTask`, `assignTask`, `updateTaskStatus`, `subscribeToTasks`, ... |
| [assignmentRuns.ts](src/firebase/assignmentRuns.ts) | `computeFairShare` (อัลกอริทึม), `saveAssignmentRun`, `confirmAssignmentRun` |
| [invites.ts](src/firebase/invites.ts) | `createInvite`, `validateInvite`, `redeemInvite` |

### ตัวอย่าง: เปลี่ยนจาก Zustand store ไปใช้ Firestore

ใน [src/pages/WorkspaceSetup.tsx](src/pages/WorkspaceSetup.tsx) เปลี่ยนจาก:

```ts
const { addMember } = useStore();
addMember(name);
```

ไปเป็น:

```ts
import { addMemberToWorkspace } from '../firebase';

await addMemberToWorkspace(workspaceId, {
  userId,           // จาก Firebase Auth
  displayName: name,
});
```

สำหรับ real-time updates ใน [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx):

```ts
import { subscribeToTasks, subscribeToWorkspace } from '../firebase';

useEffect(() => {
  const unsubTasks = subscribeToTasks(workspaceId, setTasks);
  const unsubWs = subscribeToWorkspace(workspaceId, setWorkspace);
  return () => { unsubTasks(); unsubWs(); };
}, [workspaceId]);
```

อัลกอริทึม greedy fair-share อยู่ใน [assignmentRuns.ts](src/firebase/assignmentRuns.ts) ในชื่อ `computeFairShare()` — เรียกใช้ฝั่ง client แล้วบันทึกผ่าน `saveAssignmentRun()`

## 7. ทดสอบ

```bash
npm run dev
```

เปิดแอป สร้างกลุ่มใหม่ แล้วเช็คใน Firestore Console — จะเห็น document ปรากฏใน `workspaces/`, `users/`, และ `workspaces/{id}/tasks/`

## โครงสร้าง Schema

ดูรายละเอียดทั้งหมดในเอกสารออกแบบเดิม สรุปย่อ:

```
users/{uid}                       — ระดับบนสุด หนึ่ง doc ต่อหนึ่ง user
workspaces/{wsId}                 — ระดับบนสุด มี members denormalized อยู่ข้างใน
  └── tasks/{taskId}              — subcollection
  └── assignmentRuns/{runId}      — subcollection สำหรับ audit trail
invites/{code}                    — ระดับบนสุด TTL ผ่านฟิลด์ expiresAt
```

## ข้อมูลเพิ่มเติม

### ทำไมต้องใช้ denormalization?

Firestore คิดเงินตามจำนวน document reads ดังนั้นการเก็บข้อมูลซ้ำในหลายที่ (เช่น `members[]` ใน workspace + `assignedToName` ใน task) ช่วยลด reads ลงมาก เวลาผู้ใช้แก้ profile ต้อง sync ผ่าน Cloud Function (ดูตัวอย่างใน [src/firebase/users.ts](src/firebase/users.ts))

### ปัญหาที่อาจเจอ

| ปัญหา | วิธีแก้ |
|---|---|
| `Missing or insufficient permissions` | ยังไม่ได้ deploy `firestore.rules` — รัน `firebase deploy --only firestore:rules` |
| `The query requires an index` | ลิงก์ใน error จะพาไปสร้าง index อัตโนมัติ หรือใช้ `firestore.indexes.json` |
| `Firebase config missing` | ตรวจสอบไฟล์ `.env` ว่ามีค่า `VITE_FIREBASE_*` ครบ และ restart `npm run dev` |
| ข้อมูลไม่ sync แบบ real-time | ใช้ `subscribeToTasks()` แทน `getTasks()` |
