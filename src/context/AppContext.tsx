import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Project,
  KanbanColumn,
  Task,
  RFI,
  Attachment,
  Comment,
  AppNotification,
  ApiLogEntry,
  RFIStatus,
  PriorityLevel,
  RFICategory,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_COLUMNS,
  INITIAL_TASKS,
  INITIAL_RFIS,
  INITIAL_ATTACHMENTS,
  INITIAL_COMMENTS,
  INITIAL_NOTIFICATIONS,
} from '../mockData';

interface AppContextType {
  // Current user & RBAC
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  canCreateTask: boolean;
  canEditProject: boolean;
  canConfigureColumns: boolean;
  canCreateRfi: boolean;
  canAnswerRfi: boolean;
  canMoveTasks: boolean;

  // Projects
  projects: Project[];
  currentProject: Project;
  setCurrentProject: (proj: Project) => void;
  createProject: (data: Omit<Project, 'id' | 'created_at'>) => Project;
  updateProject: (proj: Project) => void;

  // Kanban Columns
  columns: KanbanColumn[];
  addColumn: (name: string, color?: string) => void;
  updateColumn: (id: string, name: string, color?: string) => void;
  deleteColumn: (id: string) => void;
  reorderColumns: (newColumns: KanbanColumn[]) => void;

  // Tasks
  tasks: Task[];
  filteredTasks: Task[];
  createTask: (data: Partial<Task>) => Task;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, targetColId: string, newPosition?: number) => void;

  // RFIs
  rfis: RFI[];
  filteredRfis: RFI[];
  createRfi: (data: Partial<RFI>) => RFI;
  updateRfi: (rfi: RFI) => void;
  updateRfiStatus: (rfiId: string, status: RFIStatus, answer?: string) => void;
  generateTaskFromRfi: (rfiId: string) => Task;

  // Attachments
  attachments: Attachment[];
  uploadAttachment: (
    file: File | { name: string; size: number; type: string; dataUrl: string },
    targetType: 'TASK' | 'RFI',
    targetId: string
  ) => Promise<Attachment>;
  deleteAttachment: (id: string) => void;

  // Comments
  comments: Comment[];
  addComment: (targetType: 'TASK' | 'RFI', targetId: string, content: string) => Comment;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  emailNotificationsEnabled: boolean;
  setEmailNotificationsEnabled: (val: boolean) => void;
  showEmailToast: string | null;
  dismissEmailToast: () => void;

  // API logs (Section 6)
  apiLogs: ApiLogEntry[];
  clearApiLogs: () => void;

  // Modal / UI states
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  selectedRfiId: string | null;
  setSelectedRfiId: (id: string | null) => void;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  isRfiModalOpen: boolean;
  setIsRfiModalOpen: (open: boolean) => void;
  isProjectSettingsOpen: boolean;
  setIsProjectSettingsOpen: (open: boolean) => void;
  isApiConsoleOpen: boolean;
  setIsApiConsoleOpen: (open: boolean) => void;
  isNewProjectModalOpen: boolean;
  setIsNewProjectModalOpen: (open: boolean) => void;

  // Lightbox
  lightboxUrl: string | null;
  lightboxTitle: string | null;
  openLightbox: (url: string, title?: string) => void;
  closeLightbox: () => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeView: 'KANBAN' | 'GANTT' | 'RFI' | 'METRICS';
  setActiveView: (view: 'KANBAN' | 'GANTT' | 'RFI' | 'METRICS') => void;

  // Reset to default
  resetDataToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'pm_rfi_app_';

function getStoredItem<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStoredItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch {
    // ignore
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>(() =>
    getStoredItem('current_user_id', 'user-pm')
  );

  const currentUser = users.find((u) => u.id === currentUserId) || users[1];

  const setCurrentUser = (user: User) => {
    setCurrentUserId(user.id);
    setStoredItem('current_user_id', user.id);
  };

  const [projects, setProjects] = useState<Project[]>(() =>
    getStoredItem('projects', INITIAL_PROJECTS)
  );
  const [currentProjectId, setCurrentProjectId] = useState<string>(() =>
    getStoredItem('current_project_id', 'proj-001')
  );

  const currentProject =
    projects.find((p) => p.id === currentProjectId) || projects[0] || INITIAL_PROJECTS[0];

  const setCurrentProject = (p: Project) => {
    setCurrentProjectId(p.id);
    setStoredItem('current_project_id', p.id);
  };

  const [columns, setColumns] = useState<KanbanColumn[]>(() =>
    getStoredItem('columns', INITIAL_COLUMNS)
  );

  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = getStoredItem<Task[]>('tasks', INITIAL_TASKS);
    // If stored doesn't have the rich openproject mock items, ensure they exist
    const hasPhases = stored.some((t) => t.type === 'PHASE' || t.type === 'MILESTONE');
    const baseTasks = hasPhases ? stored : INITIAL_TASKS;
    return baseTasks.map((t) => ({
      ...t,
      type: t.type || 'TASK',
      start_date: t.start_date || t.created_at?.slice(0, 10) || '2026-09-01',
      progress: t.progress !== undefined ? t.progress : (t.column_id === 'col-done' ? 100 : 30),
    }));
  });

  const [rfis, setRfis] = useState<RFI[]>(() =>
    getStoredItem('rfis', INITIAL_RFIS)
  );

  const [attachments, setAttachments] = useState<Attachment[]>(() =>
    getStoredItem('attachments', INITIAL_ATTACHMENTS)
  );

  const [comments, setComments] = useState<Comment[]>(() =>
    getStoredItem('comments', INITIAL_COMMENTS)
  );

  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    getStoredItem('notifications', INITIAL_NOTIFICATIONS)
  );

  const [emailNotificationsEnabled, setEmailNotificationsEnabledState] = useState<boolean>(() =>
    getStoredItem('email_notifications_enabled', true)
  );

  const setEmailNotificationsEnabled = (val: boolean) => {
    setEmailNotificationsEnabledState(val);
    setStoredItem('email_notifications_enabled', val);
  };

  const [showEmailToast, setShowEmailToast] = useState<string | null>(null);
  const dismissEmailToast = () => setShowEmailToast(null);

  const [apiLogs, setApiLogs] = useState<ApiLogEntry[]>([]);

  // UI / Modal states
  const [activeView, setActiveView] = useState<'KANBAN' | 'GANTT' | 'RFI' | 'METRICS'>('KANBAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedRfiId, setSelectedRfiId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isRfiModalOpen, setIsRfiModalOpen] = useState(false);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [isApiConsoleOpen, setIsApiConsoleOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string | null>(null);

  const openLightbox = (url: string, title?: string) => {
    setLightboxUrl(url);
    setLightboxTitle(title || null);
  };

  const closeLightbox = () => {
    setLightboxUrl(null);
    setLightboxTitle(null);
  };

  // Sync to localStorage
  useEffect(() => {
    setStoredItem('projects', projects);
  }, [projects]);

  useEffect(() => {
    setStoredItem('columns', columns);
  }, [columns]);

  useEffect(() => {
    setStoredItem('tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    setStoredItem('rfis', rfis);
  }, [rfis]);

  useEffect(() => {
    setStoredItem('attachments', attachments);
  }, [attachments]);

  useEffect(() => {
    setStoredItem('comments', comments);
  }, [comments]);

  useEffect(() => {
    setStoredItem('notifications', notifications);
  }, [notifications]);

  // Log API call utility
  const logApi = (
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    status: number,
    durationMs: number,
    requestPayload?: unknown,
    responsePayload?: unknown
  ) => {
    const entry: ApiLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      status,
      duration_ms: durationMs,
      request_payload: requestPayload,
      response_payload: responsePayload,
    };
    setApiLogs((prev) => [entry, ...prev.slice(0, 49)]); // keep last 50
  };

  const clearApiLogs = () => setApiLogs([]);

  // RBAC permissions based on specification Section 3
  const role = currentUser.role;
  const canCreateTask = role === 'ADMIN' || role === 'PM' || role === 'MEMBER';
  const canEditProject = role === 'ADMIN' || role === 'PM';
  const canConfigureColumns = role === 'ADMIN' || role === 'PM';
  const canCreateRfi = true; // all roles including CLIENT can create RFI
  const canAnswerRfi = role === 'ADMIN' || role === 'PM' || role === 'MEMBER';
  const canMoveTasks = role === 'ADMIN' || role === 'PM' || role === 'MEMBER';

  // Projects CRUD
  const createProject = (data: Omit<Project, 'id' | 'created_at'>): Project => {
    const newProj: Project = {
      ...data,
      id: 'proj-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    const updated = [...projects, newProj];
    setProjects(updated);
    setCurrentProject(newProj);

    // Add default 4 columns for this project
    const defaultCols: KanbanColumn[] = [
      { id: 'col-todo-' + newProj.id, project_id: newProj.id, name: '待處理 (To-Do)', position_order: 1, color: '#64748b' },
      { id: 'col-prog-' + newProj.id, project_id: newProj.id, name: '進行中 (In Progress)', position_order: 2, color: '#3b82f6' },
      { id: 'col-rev-' + newProj.id, project_id: newProj.id, name: '待審核 (Review)', position_order: 3, color: '#f59e0b' },
      { id: 'col-done-' + newProj.id, project_id: newProj.id, name: '已完成 (Done)', position_order: 4, color: '#10b981' },
    ];
    setColumns((prev) => [...prev, ...defaultCols]);

    logApi('POST', '/api/v1/projects', 201, 85, data, newProj);
    return newProj;
  };

  const updateProject = (proj: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === proj.id ? proj : p)));
    logApi('PUT', `/api/v1/projects/${proj.id}`, 200, 42, proj, { success: true });
  };

  // Kanban Columns CRUD
  const projectColumns = columns
    .filter((c) => c.project_id === currentProject.id)
    .sort((a, b) => a.position_order - b.position_order);

  const addColumn = (name: string, color = '#64748b') => {
    const maxOrder = projectColumns.reduce((max, c) => Math.max(max, c.position_order), 0);
    const newCol: KanbanColumn = {
      id: 'col-' + Date.now(),
      project_id: currentProject.id,
      name,
      position_order: maxOrder + 1,
      color,
    };
    setColumns((prev) => [...prev, newCol]);
    logApi('POST', `/api/v1/projects/${currentProject.id}/columns`, 201, 60, { name, color }, newCol);
  };

  const updateColumn = (id: string, name: string, color?: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, color: color || c.color } : c))
    );
  };

  const deleteColumn = (id: string) => {
    // Don't allow deleting if tasks exist in it
    const hasTasks = tasks.some((t) => t.column_id === id);
    if (hasTasks) {
      alert('該欄位尚有任務卡片，請先將卡片移至其他欄位再刪除！');
      return;
    }
    setColumns((prev) => prev.filter((c) => c.id !== id));
  };

  const reorderColumns = (newCols: KanbanColumn[]) => {
    setColumns((prev) => {
      const otherCols = prev.filter((c) => c.project_id !== currentProject.id);
      return [...otherCols, ...newCols];
    });
  };

  // Tasks CRUD
  const projectTasks = tasks.filter((t) => t.project_id === currentProject.id);

  const createTask = (data: Partial<Task>): Task => {
    const firstCol = projectColumns[0]?.id || 'col-todo';
    const newTask: Task = {
      id: 'task-' + Date.now(),
      project_id: currentProject.id,
      column_id: data.column_id || firstCol,
      title: data.title || '未命名任務',
      description: data.description || '',
      priority: data.priority || 'MEDIUM',
      due_date: data.due_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      assignee_id: data.assignee_id || currentUser.id,
      collaborator_ids: data.collaborator_ids || [],
      position_order: (projectTasks.filter((t) => t.column_id === (data.column_id || firstCol)).length || 0) + 1,
      linked_rfi_ids: data.linked_rfi_ids || [],
      tags: data.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);

    // Notification to assignee if not creator
    if (newTask.assignee_id && newTask.assignee_id !== currentUser.id) {
      triggerNotification({
        user_id: newTask.assignee_id,
        sender_id: currentUser.id,
        title: '新任務指派',
        message: `${currentUser.name} 將新任務「${newTask.title}」指派給您。`,
        type: 'TASK_ASSIGNED',
        target_type: 'TASK',
        target_id: newTask.id,
      });
    }

    logApi('POST', `/api/v1/projects/${currentProject.id}/tasks`, 201, 75, newTask, newTask);
    return newTask;
  };

  const updateTask = (updated: Task) => {
    const old = tasks.find((t) => t.id === updated.id);
    const withTimestamp = { ...updated, updated_at: new Date().toISOString() };
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? withTimestamp : t)));

    // If assignee changed, notify
    if (old && old.assignee_id !== updated.assignee_id && updated.assignee_id !== currentUser.id) {
      triggerNotification({
        user_id: updated.assignee_id,
        sender_id: currentUser.id,
        title: '任務負責人變更',
        message: `${currentUser.name} 將任務「${updated.title}」重新指派給您。`,
        type: 'TASK_ASSIGNED',
        target_type: 'TASK',
        target_id: updated.id,
      });
    }

    logApi('PUT', `/api/v1/tasks/${updated.id}`, 200, 52, updated, withTimestamp);
  };

  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    logApi('DELETE', `/api/v1/tasks/${taskId}`, 200, 48, { id: taskId }, { success: true });
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
      setIsTaskModalOpen(false);
    }
  };

  // Drag and drop task move (matching Section 6: PATCH /api/v1/tasks/:id/move)
  const moveTask = (taskId: string, targetColId: string, newPosition?: number) => {
    const startTime = performance.now();
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;

      const oldColId = task.column_id;
      const isColChanged = oldColId !== targetColId;

      const targetCol = columns.find((c) => c.id === targetColId);
      const updatedTask = {
        ...task,
        column_id: targetColId,
        position_order: newPosition !== undefined ? newPosition : task.position_order,
        updated_at: new Date().toISOString(),
      };

      if (isColChanged && task.assignee_id && task.assignee_id !== currentUser.id) {
        triggerNotification({
          user_id: task.assignee_id,
          sender_id: currentUser.id,
          title: '任務狀態更新',
          message: `${currentUser.name} 將任務「${task.title}」移動至「${targetCol?.name || targetColId}」。`,
          type: 'TASK_STATUS_CHANGED',
          target_type: 'TASK',
          target_id: task.id,
        });
      }

      return prev.map((t) => (t.id === taskId ? updatedTask : t));
    });

    const latency = Math.round(performance.now() - startTime) + 12; // Realistic fast response <50ms
    logApi('PATCH', `/api/v1/tasks/${taskId}/move`, 200, latency, { column_id: targetColId, order: newPosition }, { success: true });
  };

  // RFIs CRUD
  const projectRfis = rfis.filter((r) => r.project_id === currentProject.id);

  const createRfi = (data: Partial<RFI>): RFI => {
    // Generate next code: e.g. RFI-2026-005
    const currentYear = new Date().getFullYear();
    const count = rfis.length + 1;
    const padded = String(count).padStart(3, '0');
    const rfi_code = `RFI-${currentYear}-${padded}`;

    const newRfi: RFI = {
      id: 'rfi-' + Date.now(),
      rfi_code: data.rfi_code || rfi_code,
      project_id: currentProject.id,
      task_id: data.task_id || undefined,
      title: data.title || '未命名 RFI',
      question: data.question || '',
      answer: data.answer || '',
      status: data.status || 'OPEN',
      category: data.category || 'TECHNICAL',
      priority: data.priority || 'MEDIUM',
      creator_id: currentUser.id,
      assignee_id: data.assignee_id || 'user-pm',
      collaborator_ids: data.collaborator_ids || [],
      due_date: data.due_date,
      created_at: new Date().toISOString(),
    };

    setRfis((prev) => [newRfi, ...prev]);

    // If linked to a task, ensure the task has this RFI in its linked_rfi_ids
    if (newRfi.task_id) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === newRfi.task_id && !t.linked_rfi_ids.includes(newRfi.id)
            ? { ...t, linked_rfi_ids: [...t.linked_rfi_ids, newRfi.id] }
            : t
        )
      );
    }

    // Notify Assignee
    if (newRfi.assignee_id && newRfi.assignee_id !== currentUser.id) {
      triggerNotification({
        user_id: newRfi.assignee_id,
        sender_id: currentUser.id,
        title: '新 RFI 請示待解答',
        message: `${currentUser.name} 提出了 ${newRfi.rfi_code}「${newRfi.title}」並指派給您。`,
        type: 'RFI_ASSIGNED',
        target_type: 'RFI',
        target_id: newRfi.id,
      });
    }

    logApi('POST', '/api/v1/rfis', 201, 88, newRfi, newRfi);
    return newRfi;
  };

  const updateRfi = (updated: RFI) => {
    setRfis((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    logApi('PUT', `/api/v1/rfis/${updated.id}`, 200, 64, updated, updated);
  };

  const updateRfiStatus = (rfiId: string, status: RFIStatus, answer?: string) => {
    const rfi = rfis.find((r) => r.id === rfiId);
    if (!rfi) return;

    const isAnswered = status === 'ANSWERED' || (answer && answer.trim().length > 0);
    const updated: RFI = {
      ...rfi,
      status,
      answer: answer !== undefined ? answer : rfi.answer,
      answered_at: isAnswered ? new Date().toISOString() : rfi.answered_at,
      closed_at: status === 'CLOSED' ? new Date().toISOString() : rfi.closed_at,
    };

    setRfis((prev) => prev.map((r) => (r.id === rfiId ? updated : r)));

    // Notify Creator
    if (rfi.creator_id && rfi.creator_id !== currentUser.id) {
      triggerNotification({
        user_id: rfi.creator_id,
        sender_id: currentUser.id,
        title: `RFI 狀態變更為 [${status}]`,
        message: `${currentUser.name} 已更新 ${rfi.rfi_code} 的狀態。${
          answer ? `答覆內容：「${answer.slice(0, 30)}...」` : ''
        }`,
        type: isAnswered ? 'RFI_ANSWERED' : 'RFI_ASSIGNED',
        target_type: 'RFI',
        target_id: rfi.id,
      });
    }

    logApi('PUT', `/api/v1/rfis/${rfiId}/status`, 200, 56, { status, answer }, updated);
  };

  // Bidirectional link: Generate Kanban Task from RFI
  const generateTaskFromRfi = (rfiId: string): Task => {
    const rfi = rfis.find((r) => r.id === rfiId);
    if (!rfi) throw new Error('RFI not found');

    const firstCol = projectColumns[0]?.id || 'col-todo';
    const newTask: Task = {
      id: 'task-' + Date.now(),
      project_id: currentProject.id,
      column_id: firstCol,
      title: `[執行] 依據 ${rfi.rfi_code}: ${rfi.title}`,
      description: `此任務由 RFI ${rfi.rfi_code} 決議後自動生成。\n\n【RFI 提問】\n${rfi.question}\n\n【官方答覆】\n${
        rfi.answer || '（待審核確認）'
      }`,
      priority: rfi.priority,
      due_date: rfi.due_date || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      assignee_id: rfi.assignee_id || currentUser.id,
      collaborator_ids: [rfi.creator_id],
      position_order: (projectTasks.filter((t) => t.column_id === firstCol).length || 0) + 1,
      linked_rfi_ids: [rfi.id],
      tags: ['RFI執行', rfi.category],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);

    // Update RFI's task_id
    setRfis((prev) => prev.map((r) => (r.id === rfiId ? { ...r, task_id: newTask.id } : r)));

    triggerNotification({
      user_id: newTask.assignee_id,
      sender_id: currentUser.id,
      title: '已由 RFI 生成對應任務',
      message: `${currentUser.name} 由 ${rfi.rfi_code} 生成了執行任務「${newTask.title}」。`,
      type: 'TASK_ASSIGNED',
      target_type: 'TASK',
      target_id: newTask.id,
    });

    logApi('POST', `/api/v1/projects/${currentProject.id}/tasks`, 201, 70, { generated_from_rfi: rfiId }, newTask);
    return newTask;
  };

  // Attachments Upload (Section 4.3 & 6)
  const uploadAttachment = async (
    fileInput: File | { name: string; size: number; type: string; dataUrl: string },
    targetType: 'TASK' | 'RFI',
    targetId: string
  ): Promise<Attachment> => {
    // MIME check & 25MB check
    const MAX_SIZE = 25 * 1024 * 1024; // 25MB
    let fileName = '';
    let fileSize = 0;
    let fileType = '';
    let fileUrl = '';
    let thumbUrl: string | undefined = undefined;

    if (fileInput instanceof File) {
      if (fileInput.size > MAX_SIZE) {
        throw new Error('檔案大小超過 25MB 上限，請壓縮後重試！');
      }
      fileName = fileInput.name;
      fileSize = fileInput.size;
      fileType = fileInput.type || 'application/octet-stream';

      // Read as DataURL for immediate browser viewing
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(fileInput);
      });
      fileUrl = dataUrl;
      if (fileType.startsWith('image/')) {
        thumbUrl = dataUrl;
      }
    } else {
      if (fileInput.size > MAX_SIZE) {
        throw new Error('檔案大小超過 25MB 上限！');
      }
      fileName = fileInput.name;
      fileSize = fileInput.size;
      fileType = fileInput.type;
      fileUrl = fileInput.dataUrl;
      if (fileType.startsWith('image/')) {
        thumbUrl = fileInput.dataUrl;
      }
    }

    const newAttachment: Attachment = {
      id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      target_type: targetType,
      target_id: targetId,
      file_name: fileName,
      file_url: fileUrl,
      file_size: fileSize,
      file_type: fileType,
      thumbnail_url: thumbUrl,
      uploaded_by: currentUser.id,
      created_at: new Date().toISOString(),
    };

    setAttachments((prev) => [newAttachment, ...prev]);

    logApi('POST', '/api/v1/attachments/upload', 201, 110, { fileName, fileSize, fileType, targetType, targetId }, {
      file_id: newAttachment.id,
      url: newAttachment.file_url.slice(0, 40) + '...',
      thumbnail_url: newAttachment.thumbnail_url ? 'generated' : null,
    });

    return newAttachment;
  };

  const deleteAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    logApi('DELETE', `/api/v1/attachments/${id}`, 200, 40, { id }, { success: true });
  };

  // Comments & @ Mentions
  const addComment = (targetType: 'TASK' | 'RFI', targetId: string, content: string): Comment => {
    // Scan for @mentions
    const mentionedUserIds: string[] = [];
    users.forEach((u) => {
      if (content.includes(`@${u.name}`) || content.includes(`@${u.name.split(' ')[0]}`)) {
        mentionedUserIds.push(u.id);
      }
    });

    const newComment: Comment = {
      id: 'comm-' + Date.now(),
      target_type: targetType,
      target_id: targetId,
      user_id: currentUser.id,
      content,
      mentioned_user_ids: mentionedUserIds,
      created_at: new Date().toISOString(),
    };

    setComments((prev) => [...prev, newComment]);

    // Send notifications to mentioned users
    mentionedUserIds.forEach((uid) => {
      if (uid !== currentUser.id) {
        triggerNotification({
          user_id: uid,
          sender_id: currentUser.id,
          title: '在留言中提及了你 (@ Mention)',
          message: `${currentUser.name}：${content.slice(0, 50)}...`,
          type: 'MENTIONED',
          target_type: targetType,
          target_id: targetId,
        });
      }
    });

    logApi('POST', `/api/v1/${targetType.toLowerCase()}s/${targetId}/comments`, 201, 62, newComment, newComment);
    return newComment;
  };

  // Notifications
  const triggerNotification = (item: Omit<AppNotification, 'id' | 'read' | 'created_at'>) => {
    const newNotif: AppNotification = {
      ...item,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // If Email notifications enabled, simulate email dispatch toast
    if (emailNotificationsEnabled) {
      const recipient = users.find((u) => u.id === item.user_id);
      const recipientEmail = recipient?.email || 'user@company.com';
      setShowEmailToast(`已模擬發送電子郵件至 ${recipientEmail}：[${item.title}]`);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter(
    (n) => n.user_id === currentUser.id && !n.read
  ).length;

  // Search & Filtering
  const filteredTasks = projectTasks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesTitle = t.title.toLowerCase().includes(q);
    const matchesDesc = t.description.toLowerCase().includes(q);
    const matchesTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
    const assignee = users.find((u) => u.id === t.assignee_id);
    const matchesAssignee = assignee?.name.toLowerCase().includes(q);
    return matchesTitle || matchesDesc || matchesTag || matchesAssignee;
  });

  const filteredRfis = projectRfis.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesCode = r.rfi_code.toLowerCase().includes(q);
    const matchesTitle = r.title.toLowerCase().includes(q);
    const matchesQuestion = r.question.toLowerCase().includes(q);
    const matchesCategory = r.category.toLowerCase().includes(q);
    return matchesCode || matchesTitle || matchesQuestion || matchesCategory;
  });

  // Reset to default
  const resetDataToDefault = () => {
    if (confirm('確定要重置為預設示範資料嗎？所有變更將清除。')) {
      localStorage.clear();
      setProjects(INITIAL_PROJECTS);
      setCurrentProjectId('proj-001');
      setColumns(INITIAL_COLUMNS);
      setTasks(INITIAL_TASKS);
      setRfis(INITIAL_RFIS);
      setAttachments(INITIAL_ATTACHMENTS);
      setComments(INITIAL_COMMENTS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setCurrentUserId('user-pm');
      alert('資料已重置為預設範例！');
    }
  };

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        setCurrentUser,
        canCreateTask,
        canEditProject,
        canConfigureColumns,
        canCreateRfi,
        canAnswerRfi,
        canMoveTasks,

        projects,
        currentProject,
        setCurrentProject,
        createProject,
        updateProject,

        columns: projectColumns,
        addColumn,
        updateColumn,
        deleteColumn,
        reorderColumns,

        tasks: projectTasks,
        filteredTasks,
        createTask,
        updateTask,
        deleteTask,
        moveTask,

        rfis: projectRfis,
        filteredRfis,
        createRfi,
        updateRfi,
        updateRfiStatus,
        generateTaskFromRfi,

        attachments,
        uploadAttachment,
        deleteAttachment,

        comments,
        addComment,

        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        emailNotificationsEnabled,
        setEmailNotificationsEnabled,
        showEmailToast,
        dismissEmailToast,

        apiLogs,
        clearApiLogs,

        selectedTaskId,
        setSelectedTaskId,
        selectedRfiId,
        setSelectedRfiId,
        isTaskModalOpen,
        setIsTaskModalOpen,
        isRfiModalOpen,
        setIsRfiModalOpen,
        isProjectSettingsOpen,
        setIsProjectSettingsOpen,
        isApiConsoleOpen,
        setIsApiConsoleOpen,
        isNewProjectModalOpen,
        setIsNewProjectModalOpen,

        lightboxUrl,
        lightboxTitle,
        openLightbox,
        closeLightbox,

        searchQuery,
        setSearchQuery,
        activeView,
        setActiveView,

        resetDataToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
