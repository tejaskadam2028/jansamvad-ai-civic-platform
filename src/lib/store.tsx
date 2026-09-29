import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import type {
  AppState,
  User,
  Complaint,
  Notification,
  RewardEntry,
  Campaign,
  Priority,
  Role,
} from './types';
import { getInitialState } from './mockData';
import { analyzeComplaint } from './ai';
import { signUp as authSignUp, signIn as authSignIn, saveSession, loadSession, clearSession, accountToUser, type Account } from './auth';

const STORAGE_KEY = 'jansamvad_state_v1';

interface StoreContextValue extends AppState {
  login: (user: User) => void;
  logout: () => void;
  signUp: (name: string, email: string, password: string, role: Role) => { ok: true; account: Account } | { ok: false; error: string };
  signIn: (email: string, password: string) => { ok: true; user: User } | { ok: false; error: string };
  addComplaint: (c: Omit<Complaint, 'id' | 'status' | 'timeline' | 'createdAt' | 'rewardPoints'>) => Complaint;
  updateComplaint: (id: string, patch: Partial<Complaint>) => void;
  addTimelineEvent: (id: string, status: string, actor: string, note?: string) => void;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (role: Role, userId: string) => void;
  addReward: (r: Omit<RewardEntry, 'id' | 'timestamp'>) => void;
  addCampaign: (c: Omit<Campaign, 'id' | 'createdAt' | 'reach' | 'clicks' | 'newUsers' | 'complaintsGenerated' | 'engagementRate'>) => Campaign;
  assignWorkforce: (complaintId: string, workforceId: string) => void;
  verifyComplaint: (id: string) => void;
  rejectComplaint: (id: string) => void;
  resolveComplaint: (id: string, beforePhotoUrl: string, afterPhotoUrl: string, note: string) => void;
  setComplaintPriority: (id: string, priority: Priority) => void;
  updateTaskStatus: (id: string, taskStatus: Complaint['taskStatus']) => void;
  toast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  toasts: { id: string; message: string; type: 'info' | 'success' | 'warning' }[];
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function loadState(): AppState {
  const base = getInitialState();
  const session = loadSession();
  if (session) {
    return { ...base, currentUser: session };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      return { ...parsed, currentUser: null };
    }
  } catch {
    // ignore
  }
  return base;
}

let complaintCounter = 1024;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'info' | 'success' | 'warning' }[]>([]);

  useEffect(() => {
    try {
      const { currentUser, ...persist } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
    } catch {
      // ignore
    }
  }, [state]);

  const toast = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = `t${Date.now()}${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const login = useCallback((user: User) => {
    saveSession(user);
    setState((s) => ({ ...s, currentUser: user }));
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setState((s) => ({ ...s, currentUser: null }));
  }, []);

  const signUp = useCallback((name: string, email: string, password: string, role: Role) => {
    return authSignUp(name, email, password, role);
  }, []);

  const signIn = useCallback((email: string, password: string) => {
    const result = authSignIn(email, password);
    if (result.ok) {
      const user = accountToUser(result.account);
      saveSession(user);
      setState((s) => ({ ...s, currentUser: user }));
      return { ok: true as const, user };
    }
    return { ok: false as const, error: result.error };
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    setState((s) => ({
      ...s,
      notifications: [
        { ...n, id: `n${Date.now()}${Math.random()}`, timestamp: Date.now(), read: false },
        ...s.notifications,
      ],
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback((role: Role, userId: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.role === role && n.userId === userId ? { ...n, read: true } : n
      ),
    }));
  }, []);

  const addReward = useCallback((r: Omit<RewardEntry, 'id' | 'timestamp'>) => {
    setState((s) => ({
      ...s,
      rewards: [{ ...r, id: `r${Date.now()}${Math.random()}`, timestamp: Date.now() }, ...s.rewards],
    }));
  }, []);

  const addTimelineEvent = useCallback((id: string, status: string, actor: string, note?: string) => {
    setState((s) => ({
      ...s,
      complaints: s.complaints.map((c) =>
        c.id === id
          ? { ...c, timeline: [...c.timeline, { status, timestamp: Date.now(), actor, note }] }
          : c
      ),
    }));
  }, []);

  const addComplaint = useCallback(
    (c: Omit<Complaint, 'id' | 'status' | 'timeline' | 'createdAt' | 'rewardPoints'>) => {
      const id = `JS-${complaintCounter++}`;
      const newComplaint: Complaint = {
        ...c,
        id,
        status: 'Submitted',
        taskStatus: undefined,
        rewardPoints: 50,
        createdAt: Date.now(),
        timeline: [{ status: 'Submitted', timestamp: Date.now(), actor: c.citizenName }],
      };
      setState((s) => ({
        ...s,
        complaints: [newComplaint, ...s.complaints],
        rewards: [
          { id: `r${Date.now()}${Math.random()}`, citizenId: c.citizenId, points: 50, reason: 'Complaint submitted', complaintId: id, timestamp: Date.now() },
          ...s.rewards,
        ],
        notifications: [
          { id: `n${Date.now()}${Math.random()}`, role: 'authority' as Role, userId: 'a1', title: 'New Complaint', message: `New complaint ${id} submitted by ${c.citizenName}.`, read: false, timestamp: Date.now(), type: 'info' },
          { id: `n${Date.now()}${Math.random()}1`, role: 'citizen' as Role, userId: c.citizenId, title: 'Complaint Submitted', message: `Your complaint ${id} has been submitted. +50 reward points!`, read: false, timestamp: Date.now(), type: 'success' },
          ...s.notifications,
        ],
      }));
      return newComplaint;
    },
    []
  );

  const updateComplaint = useCallback((id: string, patch: Partial<Complaint>) => {
    setState((s) => ({
      ...s,
      complaints: s.complaints.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const verifyComplaint = useCallback((id: string) => {
    setState((s) => {
      const complaint = s.complaints.find((c) => c.id === id);
      if (!complaint) return s;
      return {
        ...s,
        complaints: s.complaints.map((c) =>
          c.id === id
            ? {
                ...c,
                status: 'Verified',
                timeline: [...c.timeline, { status: 'Verified', timestamp: Date.now(), actor: 'Municipal Commissioner' }],
              }
            : c
        ),
        rewards: [
          { id: `r${Date.now()}${Math.random()}`, citizenId: complaint.citizenId, points: 20, reason: 'Complaint verified', complaintId: id, timestamp: Date.now() },
          ...s.rewards,
        ],
        notifications: [
          { id: `n${Date.now()}${Math.random()}`, role: 'citizen' as Role, userId: complaint.citizenId, title: 'Complaint Verified', message: `Your complaint ${id} has been verified. +20 bonus points!`, read: false, timestamp: Date.now(), type: 'success' },
          ...s.notifications,
        ],
      };
    });
  }, []);

  const rejectComplaint = useCallback((id: string) => {
    setState((s) => {
      const complaint = s.complaints.find((c) => c.id === id);
      if (!complaint) return s;
      return {
        ...s,
        complaints: s.complaints.map((c) =>
          c.id === id
            ? {
                ...c,
                status: 'Rejected',
                timeline: [...c.timeline, { status: 'Rejected', timestamp: Date.now(), actor: 'Municipal Commissioner' }],
              }
            : c
        ),
        notifications: [
          { id: `n${Date.now()}${Math.random()}`, role: 'citizen' as Role, userId: complaint.citizenId, title: 'Complaint Rejected', message: `Your complaint ${id} has been rejected.`, read: false, timestamp: Date.now(), type: 'warning' },
          ...s.notifications,
        ],
      };
    });
  }, []);

  const assignWorkforce = useCallback((complaintId: string, workforceId: string) => {
    setState((s) => {
      const wf = s.workforce.find((w) => w.id === workforceId);
      const complaint = s.complaints.find((c) => c.id === complaintId);
      if (!wf || !complaint) return s;
      return {
        ...s,
        complaints: s.complaints.map((c) =>
          c.id === complaintId
            ? {
                ...c,
                status: 'Assigned',
                taskStatus: 'Assigned',
                assignedWorkforceId: workforceId,
                assignedWorkforceName: wf.name,
                timeline: [...c.timeline, { status: 'Assigned', timestamp: Date.now(), actor: 'Municipal Commissioner', note: `Assigned to ${wf.name}` }],
              }
            : c
        ),
        workforce: s.workforce.map((w) =>
          w.id === workforceId ? { ...w, activeTasks: w.activeTasks + 1, availability: 'Busy' as const } : w
        ),
        notifications: [
          { id: `n${Date.now()}${Math.random()}`, role: 'workforce' as Role, userId: workforceId, title: 'New Task Assigned', message: `You have been assigned complaint ${complaintId}.`, read: false, timestamp: Date.now(), type: 'info' },
          { id: `n${Date.now()}${Math.random()}1`, role: 'citizen' as Role, userId: complaint.citizenId, title: 'Workforce Assigned', message: `Your complaint ${complaintId} has been assigned to ${wf.name}.`, read: false, timestamp: Date.now(), type: 'info' },
          ...s.notifications,
        ],
      };
    });
  }, []);

  const setComplaintPriority = useCallback((id: string, priority: Priority) => {
    setState((s) => ({
      ...s,
      complaints: s.complaints.map((c) =>
        c.id === id
          ? { ...c, priority, timeline: [...c.timeline, { status: `Priority changed to ${priority}`, timestamp: Date.now(), actor: 'Municipal Commissioner' }] }
          : c
      ),
    }));
  }, []);

  const updateTaskStatus = useCallback((id: string, taskStatus: Complaint['taskStatus']) => {
    setState((s) => {
      const complaint = s.complaints.find((c) => c.id === id);
      if (!complaint) return s;
      const statusMap: Record<string, Complaint['status']> = {
        'Accepted': 'Assigned',
        'In Progress': 'In Progress',
        'Work Completed': 'In Progress',
        'Resolved': 'Resolved',
      };
      const newStatus = statusMap[taskStatus || ''] || complaint.status;
      return {
        ...s,
        complaints: s.complaints.map((c) =>
          c.id === id
            ? {
                ...c,
                taskStatus: taskStatus || c.taskStatus,
                status: newStatus,
                timeline: [...c.timeline, { status: taskStatus || 'Updated', timestamp: Date.now(), actor: complaint.assignedWorkforceName || 'Workforce' }],
              }
            : c
        ),
      };
    });
  }, []);

  const resolveComplaint = useCallback((id: string, beforePhotoUrl: string, afterPhotoUrl: string, note: string) => {
    setState((s) => {
      const complaint = s.complaints.find((c) => c.id === id);
      if (!complaint) return s;
      return {
        ...s,
        complaints: s.complaints.map((c) =>
          c.id === id
            ? {
                ...c,
                status: 'Resolved',
                taskStatus: 'Resolved',
                beforePhotoUrl,
                afterPhotoUrl,
                resolutionNote: note,
                rewardPoints: c.rewardPoints + 30,
                timeline: [...c.timeline, { status: 'Resolved', timestamp: Date.now(), actor: c.assignedWorkforceName || 'Workforce', note }],
              }
            : c
        ),
        workforce: s.workforce.map((w) =>
          w.id === complaint.assignedWorkforceId
            ? { ...w, activeTasks: Math.max(0, w.activeTasks - 1), completedTasks: w.completedTasks + 1, availability: 'Available' as const }
            : w
        ),
        rewards: [
          { id: `r${Date.now()}${Math.random()}`, citizenId: complaint.citizenId, points: 30, reason: 'Complaint resolved', complaintId: id, timestamp: Date.now() },
          ...s.rewards,
        ],
        notifications: [
          { id: `n${Date.now()}${Math.random()}`, role: 'citizen' as Role, userId: complaint.citizenId, title: 'Complaint Resolved', message: `Your complaint ${id} has been resolved. +30 bonus points!`, read: false, timestamp: Date.now(), type: 'success' },
          { id: `n${Date.now()}${Math.random()}1`, role: 'authority' as Role, userId: 'a1', title: 'Complaint Resolved', message: `${complaint.assignedWorkforceName || 'Workforce'} resolved complaint ${id}.`, read: false, timestamp: Date.now(), type: 'success' },
          ...s.notifications,
        ],
      };
    });
  }, []);

  const addCampaign = useCallback(
    (c: Omit<Campaign, 'id' | 'createdAt' | 'reach' | 'clicks' | 'newUsers' | 'complaintsGenerated' | 'engagementRate'>) => {
      const newCampaign: Campaign = {
        ...c,
        id: `CMP-${String(Date.now()).slice(-3)}`,
        createdAt: Date.now(),
        reach: 0,
        clicks: 0,
        newUsers: 0,
        complaintsGenerated: 0,
        engagementRate: 0,
      };
      setState((s) => ({ ...s, campaigns: [newCampaign, ...s.campaigns] }));
      return newCampaign;
    },
    []
  );

  const value: StoreContextValue = {
    ...state,
    toasts,
    toast,
    dismissToast,
    login,
    logout,
    signUp,
    signIn,
    addComplaint,
    updateComplaint,
    addTimelineEvent,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    addReward,
    addCampaign,
    assignWorkforce,
    verifyComplaint,
    rejectComplaint,
    resolveComplaint,
    setComplaintPriority,
    updateTaskStatus,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export { analyzeComplaint };
