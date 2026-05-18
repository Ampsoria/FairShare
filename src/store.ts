import { useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Member, Task, AppStep, Workspace, User } from './types';
import { assignTasksFairly, type Member as AlgoMember, type Task as AlgoTask } from './algorithm/fairShare';

const MEMBER_COLORS = [
  '#6366f1', '#14b8a6', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4',
];

interface AppState {
  step: AppStep;
  users: Record<string, User>;
  activeUserId: string | null;
  workspaces: Record<string, Workspace>;
  activeWorkspaceId: string | null;

  // Navigation
  setStep: (step: AppStep) => void;

  // User profile management
  addUser: (name: string) => string;            // create + activate, returns id
  switchUser: (id: string) => void;             // switch active user
  removeUser: (id: string) => void;             // delete user + their workspaces
  logout: () => void;                            // clear activeUserId, go to picker
  renameUser: (id: string, name: string) => void;

  // Workspace lifecycle (scoped to activeUser)
  createWorkspace: () => string;
  openWorkspace: (id: string) => void;
  deleteWorkspace: (id: string) => void;
  completeWorkspace: (id: string) => void;
  reopenWorkspace: (id: string) => void;

  // Active workspace edits
  setWorkspaceName: (name: string) => void;
  addMember: (name: string) => void;
  removeMember: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'done' | 'assignedTo'>) => void;
  removeTask: (id: string) => void;
  assignTasks: () => void;
  toggleTaskDone: (id: string) => void;
  reassignTask: (taskId: string, memberId: string) => void;
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function nextMemberColor(memberCount: number): string {
  return MEMBER_COLORS[memberCount % MEMBER_COLORS.length];
}

function nextUserColor(userCount: number): string {
  return MEMBER_COLORS[userCount % MEMBER_COLORS.length];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      step: 'onboarding',
      users: {},
      activeUserId: null,
      workspaces: {},
      activeWorkspaceId: null,

      setStep: (step) => set({ step }),

      // ── User profile management ─────────────────────────────────────────
      addUser: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return '';
        const s = get();
        const id = generateId();
        const user: User = {
          id,
          name: trimmed,
          color: nextUserColor(Object.keys(s.users).length),
        };
        set({
          users: { ...s.users, [id]: user },
          activeUserId: id,
          activeWorkspaceId: null,
          step: 'list',
        });
        return id;
      },

      switchUser: (id) => {
        const s = get();
        if (!s.users[id]) return;
        set({
          activeUserId: id,
          activeWorkspaceId: null,
          step: 'list',
        });
      },

      removeUser: (id) =>
        set((s) => {
          const { [id]: _u, ...restUsers } = s.users;
          void _u;
          // Also remove all workspaces owned by this user
          const restWorkspaces = Object.fromEntries(
            Object.entries(s.workspaces).filter(([, w]) => w.ownerId !== id)
          );
          const wasActive = s.activeUserId === id;
          return {
            users: restUsers,
            workspaces: restWorkspaces,
            activeUserId: wasActive ? null : s.activeUserId,
            activeWorkspaceId: wasActive ? null : s.activeWorkspaceId,
            step: wasActive ? 'onboarding' : s.step,
          };
        }),

      logout: () =>
        set({
          activeUserId: null,
          activeWorkspaceId: null,
          step: 'onboarding',
        }),

      renameUser: (id, name) =>
        set((s) => {
          const user = s.users[id];
          if (!user) return s;
          const trimmed = name.trim();
          if (!trimmed) return s;
          const updated = { ...user, name: trimmed };
          // Also update member.name in workspaces where this user is "me"
          const newWorkspaces: Record<string, Workspace> = {};
          for (const [wsId, ws] of Object.entries(s.workspaces)) {
            if (ws.ownerId === id) {
              newWorkspaces[wsId] = {
                ...ws,
                members: ws.members.map((m) =>
                  m.isCurrentUser && m.id === id ? { ...m, name: trimmed } : m
                ),
              };
            } else {
              newWorkspaces[wsId] = ws;
            }
          }
          return {
            users: { ...s.users, [id]: updated },
            workspaces: newWorkspaces,
          };
        }),

      // ── Workspace lifecycle ─────────────────────────────────────────────
      createWorkspace: () => {
        const s = get();
        if (!s.activeUserId) return '';
        const user = s.users[s.activeUserId];
        if (!user) return '';
        const id = generateId();

        const me: Member = {
          id: user.id,
          name: user.name,
          color: nextMemberColor(0),
          isCurrentUser: true,
        };

        const workspace: Workspace = {
          id,
          name: '',
          ownerId: user.id,
          members: [me],
          tasks: [],
          status: 'active',
          createdAt: Date.now(),
        };

        set({
          workspaces: { ...s.workspaces, [id]: workspace },
          activeWorkspaceId: id,
          step: 'setup',
        });
        return id;
      },

      openWorkspace: (id) => {
        const s = get();
        const ws = s.workspaces[id];
        if (!ws || ws.ownerId !== s.activeUserId) return;
        const hasAssigned = ws.tasks.some((t) => t.assignedTo);
        const next: AppStep =
          ws.status === 'completed' || hasAssigned
            ? 'dashboard'
            : ws.tasks.length > 0
              ? 'tasks'
              : ws.members.length >= 2 && ws.name
                ? 'tasks'
                : 'setup';
        set({ activeWorkspaceId: id, step: next });
      },

      deleteWorkspace: (id) =>
        set((s) => {
          const { [id]: _removed, ...rest } = s.workspaces;
          void _removed;
          return {
            workspaces: rest,
            activeWorkspaceId: s.activeWorkspaceId === id ? null : s.activeWorkspaceId,
          };
        }),

      completeWorkspace: (id) =>
        set((s) => {
          const ws = s.workspaces[id];
          if (!ws) return s;
          return {
            workspaces: {
              ...s.workspaces,
              [id]: { ...ws, status: 'completed', completedAt: Date.now() },
            },
          };
        }),

      reopenWorkspace: (id) =>
        set((s) => {
          const ws = s.workspaces[id];
          if (!ws) return s;
          return {
            workspaces: {
              ...s.workspaces,
              [id]: { ...ws, status: 'active', completedAt: undefined },
            },
          };
        }),

      setWorkspaceName: (name) =>
        set((s) => {
          if (!s.activeWorkspaceId) return s;
          const ws = s.workspaces[s.activeWorkspaceId];
          if (!ws) return s;
          return {
            workspaces: { ...s.workspaces, [ws.id]: { ...ws, name } },
          };
        }),

      addMember: (name) =>
        set((s) => {
          if (!s.activeWorkspaceId) return s;
          const ws = s.workspaces[s.activeWorkspaceId];
          if (!ws) return s;
          const member: Member = {
            id: generateId(),
            name,
            color: nextMemberColor(ws.members.length),
          };
          return {
            workspaces: {
              ...s.workspaces,
              [ws.id]: { ...ws, members: [...ws.members, member] },
            },
          };
        }),

      removeMember: (id) =>
        set((s) => {
          if (!s.activeWorkspaceId) return s;
          const ws = s.workspaces[s.activeWorkspaceId];
          if (!ws) return s;
          return {
            workspaces: {
              ...s.workspaces,
              [ws.id]: { ...ws, members: ws.members.filter((m) => m.id !== id) },
            },
          };
        }),

      addTask: (task) =>
        set((s) => {
          if (!s.activeWorkspaceId) return s;
          const ws = s.workspaces[s.activeWorkspaceId];
          if (!ws) return s;
          const newTask: Task = { ...task, id: generateId(), done: false };
          return {
            workspaces: {
              ...s.workspaces,
              [ws.id]: { ...ws, tasks: [...ws.tasks, newTask] },
            },
          };
        }),

      removeTask: (id) =>
        set((s) => {
          if (!s.activeWorkspaceId) return s;
          const ws = s.workspaces[s.activeWorkspaceId];
          if (!ws) return s;
          return {
            workspaces: {
              ...s.workspaces,
              [ws.id]: { ...ws, tasks: ws.tasks.filter((t) => t.id !== id) },
            },
          };
        }),

      assignTasks: () => {
        const s = get();
        if (!s.activeWorkspaceId) return;
        const ws = s.workspaces[s.activeWorkspaceId];
        if (!ws || !ws.members.length || !ws.tasks.length) return;

        const algoMembers: AlgoMember[] = ws.members.map((m) => ({
          id: m.id,
          name: m.name,
          currentTotalScore: 0,
        }));
        const algoTasks: AlgoTask[] = ws.tasks.map((t) => ({
          id: t.id,
          title: t.name,
          effortScore: t.effortScore,
        }));

        const { assignments } = assignTasksFairly(algoMembers, algoTasks);
        const byId = new Map(assignments.map((a) => [a.id, a.assignedTo as string]));

        set((state) => ({
          workspaces: {
            ...state.workspaces,
            [ws.id]: {
              ...ws,
              tasks: ws.tasks.map((t) => ({ ...t, assignedTo: byId.get(t.id) })),
            },
          },
        }));
      },

      toggleTaskDone: (id) =>
        set((s) => {
          if (!s.activeWorkspaceId) return s;
          const ws = s.workspaces[s.activeWorkspaceId];
          if (!ws) return s;
          return {
            workspaces: {
              ...s.workspaces,
              [ws.id]: {
                ...ws,
                tasks: ws.tasks.map((t) =>
                  t.id === id ? { ...t, done: !t.done } : t
                ),
              },
            },
          };
        }),

      reassignTask: (taskId, memberId) =>
        set((s) => {
          if (!s.activeWorkspaceId) return s;
          const ws = s.workspaces[s.activeWorkspaceId];
          if (!ws) return s;
          return {
            workspaces: {
              ...s.workspaces,
              [ws.id]: {
                ...ws,
                tasks: ws.tasks.map((t) =>
                  t.id === taskId ? { ...t, assignedTo: memberId } : t
                ),
              },
            },
          };
        }),
    }),
    {
      name: 'fairshare:state',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        users: state.users,
        activeUserId: state.activeUserId,
        workspaces: state.workspaces,
      }),
      // Migrate v1 (single `user`) → v2 (`users` map). Always return a well-formed v2 shape.
      migrate: (persisted: unknown, version) => {
        const safeDefaults = {
          users: {} as Record<string, User>,
          activeUserId: null as string | null,
          workspaces: {} as Record<string, Workspace>,
        };

        if (!persisted || typeof persisted !== 'object') return safeDefaults;
        const ps = persisted as Record<string, unknown>;

        // v1 had a single `user` field — promote it to the users map
        if (version < 2 && ps.user && typeof ps.user === 'object') {
          const oldUser = ps.user as User;
          const users: Record<string, User> = { [oldUser.id]: oldUser };
          const workspaces = (ps.workspaces ?? {}) as Record<string, Workspace>;
          for (const w of Object.values(workspaces)) {
            if (!w.ownerId) w.ownerId = oldUser.id;
          }
          return { users, activeUserId: oldUser.id, workspaces };
        }

        // v2+ — fill any missing fields with safe defaults so the app can't crash
        return {
          users: (ps.users as Record<string, User>) ?? safeDefaults.users,
          activeUserId: (ps.activeUserId as string | null) ?? null,
          workspaces: (ps.workspaces as Record<string, Workspace>) ?? safeDefaults.workspaces,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Defensive: guarantee fields exist even if migration was skipped
        if (!state.users) state.users = {};
        if (!state.workspaces) state.workspaces = {};
        if (state.activeUserId && state.users[state.activeUserId]) {
          state.step = 'list';
        } else {
          state.activeUserId = null;
          state.step = 'onboarding';
        }
      },
    }
  )
);

// Selectors — defensive against missing fields during hydration
export const useActiveUser = (): User | null =>
  useStore((s) => (s.activeUserId && s.users ? (s.users[s.activeUserId] ?? null) : null));

export const useActiveWorkspace = (): Workspace | null =>
  useStore((s) =>
    s.activeWorkspaceId && s.workspaces ? (s.workspaces[s.activeWorkspaceId] ?? null) : null
  );

// Avoid returning a new array from the zustand selector itself — that causes an
// infinite re-render loop. Select the raw inputs, derive the array via useMemo.
export const useMyWorkspaces = (): Workspace[] => {
  const workspaces = useStore((s) => s.workspaces);
  const activeUserId = useStore((s) => s.activeUserId);
  return useMemo(() => {
    if (!activeUserId || !workspaces) return [];
    return Object.values(workspaces)
      .filter((w) => w.ownerId === activeUserId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [workspaces, activeUserId]);
};
