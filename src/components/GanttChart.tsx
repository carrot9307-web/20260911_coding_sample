import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Kanban,
  Calendar as CalendarIcon,
  Plus,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Columns,
  Search,
  ArrowRight,
  SplitSquareVertical,
  Layers,
  Sparkles,
  User as UserIcon,
  Eye,
  Settings2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, WorkPackageType, PriorityLevel } from '../types';

export const GanttChart: React.FC = () => {
  const {
    tasks,
    updateTask,
    createTask,
    setSelectedTaskId,
    setIsTaskModalOpen,
    users,
    columns,
    activeView,
    setActiveView,
    canCreateTask,
  } = useApp();

  // View & display configuration
  const [zoomLevel, setZoomLevel] = useState<'DAY' | 'WEEK' | 'MONTH'>('DAY');
  const [viewMode, setViewMode] = useState<'SPLIT' | 'GANTT_ONLY' | 'TABLE_ONLY'>('SPLIT');
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  // Dragging / Resizing state for timeline bars
  const [dragState, setDragState] = useState<{
    taskId: string;
    action: 'MOVE' | 'RESIZE_START' | 'RESIZE_END';
    initialX: number;
    initialStartDate: string;
    initialDueDate: string;
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Sync scrolling between left table and right Gantt rows
  const handleGanttScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Cell width based on zoom level
  const dayWidth = useMemo(() => {
    switch (zoomLevel) {
      case 'DAY':
        return 36;
      case 'WEEK':
        return 18;
      case 'MONTH':
        return 8;
    }
  }, [zoomLevel]);

  // Determine timeline boundary dates
  const { startDate, endDate, totalDays, datesList } = useMemo(() => {
    // Collect all dates
    let minTime = new Date('2026-08-20').getTime();
    let maxTime = new Date('2026-10-15').getTime();

    tasks.forEach((t) => {
      const s = t.start_date ? new Date(t.start_date).getTime() : NaN;
      const d = t.due_date ? new Date(t.due_date).getTime() : NaN;
      if (!isNaN(s) && s < minTime) minTime = s;
      if (!isNaN(d) && d > maxTime) maxTime = d;
    });

    // Pad buffer
    const start = new Date(minTime);
    start.setDate(start.getDate() - 4);
    const end = new Date(maxTime);
    end.setDate(end.getDate() + 10);

    const dates: Date[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    return {
      startDate: start,
      endDate: end,
      totalDays: dates.length,
      datesList: dates,
    };
  }, [tasks]);

  // Group dates by Month for Month Header
  const monthsList = useMemo(() => {
    const months: { year: number; month: number; label: string; daysCount: number }[] = [];
    datesList.forEach((d) => {
      const y = d.getFullYear();
      const m = d.getMonth();
      const last = months[months.length - 1];
      if (!last || last.year !== y || last.month !== m) {
        months.push({
          year: y,
          month: m,
          label: `${y} 年 ${m + 1} 月`,
          daysCount: 1,
        });
      } else {
        last.daysCount++;
      }
    });
    return months;
  }, [datesList]);

  // Today marker (2026-09-10 or real today)
  const todayDate = useMemo(() => new Date('2026-09-10'), []);
  const todayOffsetDays = Math.round(
    (todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Jump to Today
  const handleScrollToToday = () => {
    if (scrollContainerRef.current) {
      const targetX = Math.max(0, (todayOffsetDays - 4) * dayWidth);
      scrollContainerRef.current.scrollTo({ left: targetX, behavior: 'smooth' });
    }
  };

  // Scroll to today initially
  useEffect(() => {
    const timer = setTimeout(() => {
      handleScrollToToday();
    }, 150);
    return () => clearTimeout(timer);
  }, [dayWidth]);

  // Format and hierarchical ordering of tasks (Phases followed by their children)
  const hierarchicalTasks = useMemo(() => {
    let list = [...tasks];

    // Filters
    if (filterType !== 'ALL') {
      list = list.filter((t) => (t.type || 'TASK') === filterType);
    }
    if (filterPriority !== 'ALL') {
      list = list.filter((t) => t.priority === filterPriority);
    }
    if (filterAssignee !== 'ALL') {
      list = list.filter((t) => t.assignee_id === filterAssignee);
    }
    if (filterStatus !== 'ALL') {
      list = list.filter((t) => t.column_id === filterStatus);
    }

    // Organize into top-level items and children
    const roots = list.filter((t) => !t.parent_id);
    const childrenMap: Record<string, Task[]> = {};
    list.forEach((t) => {
      if (t.parent_id) {
        if (!childrenMap[t.parent_id]) childrenMap[t.parent_id] = [];
        childrenMap[t.parent_id].push(t);
      }
    });

    const ordered: { task: Task; isChild: boolean; hasChildren: boolean }[] = [];
    roots.forEach((root) => {
      const children = childrenMap[root.id] || [];
      ordered.push({ task: root, isChild: false, hasChildren: children.length > 0 });
      if (!collapsedPhases[root.id]) {
        children.forEach((c) => {
          ordered.push({ task: c, isChild: true, hasChildren: false });
        });
      }
    });

    // Append any orphan children whose parents aren't in roots
    list.forEach((t) => {
      if (t.parent_id && !roots.some((r) => r.id === t.parent_id)) {
        if (!ordered.some((o) => o.task.id === t.id)) {
          ordered.push({ task: t, isChild: true, hasChildren: false });
        }
      }
    });

    return ordered;
  }, [tasks, filterType, filterPriority, filterAssignee, filterStatus, collapsedPhases]);

  // Quick helper to get X position for a date
  const getXForDate = (dateStr?: string): number => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    const diff = (d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, diff * dayWidth);
  };

  // Quick helper to convert X position back to Date string (YYYY-MM-DD)
  const getDateForX = (x: number): string => {
    const days = Math.round(x / dayWidth);
    const d = new Date(startDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Mouse handlers for dragging/resizing Gantt bars
  const handleMouseDown = (
    e: React.MouseEvent,
    taskId: string,
    action: 'MOVE' | 'RESIZE_START' | 'RESIZE_END',
    initialStartDate: string,
    initialDueDate: string
  ) => {
    e.stopPropagation();
    setDragState({
      taskId,
      action,
      initialX: e.clientX,
      initialStartDate,
      initialDueDate,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState) return;
      const dx = e.clientX - dragState.initialX;
      const daysDelta = Math.round(dx / dayWidth);
      if (daysDelta === 0) return;

      const t = tasks.find((item) => item.id === dragState.taskId);
      if (!t) return;

      const start = new Date(dragState.initialStartDate || t.created_at?.slice(0, 10) || '2026-09-01');
      const due = new Date(dragState.initialDueDate || t.due_date || '2026-09-15');

      if (dragState.action === 'MOVE') {
        start.setDate(start.getDate() + daysDelta);
        due.setDate(due.getDate() + daysDelta);
      } else if (dragState.action === 'RESIZE_START') {
        start.setDate(start.getDate() + daysDelta);
        if (start.getTime() > due.getTime()) start.setTime(due.getTime());
      } else if (dragState.action === 'RESIZE_END') {
        due.setDate(due.getDate() + daysDelta);
        if (due.getTime() < start.getTime()) due.setTime(start.getTime());
      }

      const updated: Task = {
        ...t,
        start_date: start.toISOString().split('T')[0],
        due_date: due.toISOString().split('T')[0],
      };
      updateTask(updated);
    };

    const handleMouseUp = () => {
      if (dragState) {
        setDragState(null);
      }
    };

    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, dayWidth, tasks, updateTask]);

  // Open task detail
  const handleOpenTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskModalOpen(true);
  };

  // Toggle phase collapse
  const toggleCollapse = (phaseId: string) => {
    setCollapsedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  // Helper styles for Work Package types
  const getTypeBadge = (type?: WorkPackageType) => {
    switch (type) {
      case 'MILESTONE':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded-none text-[9px] font-display font-bold uppercase tracking-widest text-[#D4AF37] bg-[#241F10] border border-[#D4AF37]">
            MILESTONE
          </span>
        );
      case 'PHASE':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded-none text-[9px] font-display font-bold uppercase tracking-widest text-[#F2F0E4] bg-[#1E3D59] border border-[#D4AF37]/50">
            PHASE
          </span>
        );
      case 'BUG':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded-none text-[9px] font-display font-bold uppercase tracking-widest text-[#E07A5F] bg-[#2A1414] border border-[#E07A5F]">
            DEFECT
          </span>
        );
      case 'FEATURE':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded-none text-[9px] font-display font-bold uppercase tracking-widest text-[#78A1BB] bg-[#101924] border border-[#78A1BB]">
            FEATURE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded-none text-[9px] font-display font-bold uppercase tracking-widest text-[#F2F0E4]/80 bg-[#141414] border border-[#D4AF37]/40">
            TASK
          </span>
        );
    }
  };

  // Status mapping
  const getStatusInfo = (colId: string) => {
    const col = columns.find((c) => c.id === colId);
    if (!col) return { name: '未知', color: 'bg-[#888888]' };
    if (colId === 'col-done') return { name: '已完成 (Done)', color: 'bg-[#D4AF37]' };
    if (colId === 'col-review') return { name: '待審核 (Review)', color: 'bg-[#E07A5F]' };
    if (colId === 'col-progress') return { name: '進行中 (In progress)', color: 'bg-[#78A1BB]' };
    return { name: '待處理 (Scheduled)', color: 'bg-[#888888]' };
  };

  // Priority mapping
  const getPriorityInfo = (p: PriorityLevel) => {
    switch (p) {
      case 'HIGH':
        return { label: 'High', color: 'text-[#E07A5F]', dot: 'bg-[#E07A5F]' };
      case 'MEDIUM':
        return { label: 'Normal', color: 'text-[#D4AF37]', dot: 'bg-[#D4AF37]' };
      case 'LOW':
        return { label: 'Low', color: 'text-[#78A1BB]', dot: 'bg-[#78A1BB]' };
    }
  };

  return (
    <div id="openproject-gantt-screen" className="flex flex-col h-full w-full bg-[#0A0A0A] text-[#F2F0E4] select-none overflow-hidden art-deco-bg">
      {/* 1. OpenProject Sub-header & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-[#D4AF37]/30 bg-[#141414] gap-2 shrink-0">
        {/* Left Controls: Title, View selector, and Kanban/Gantt Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-serif font-bold uppercase tracking-[0.15em] text-[#D4AF37]">
              所有工作包進程 (WORK PACKAGES)
            </h2>
            <span className="px-2 py-0.2 rounded-none bg-[#0A0A0A] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-mono">
              {tasks.length}
            </span>
          </div>

          <div className="h-4 w-px bg-[#D4AF37]/30 hidden sm:block" />

          {/* VIEW SWITCHER: Kanban vs Gantt */}
          <div className="flex items-center bg-[#0A0A0A] p-0.5 rounded-none border border-[#D4AF37]/40 text-xs font-display">
            <button
              id="btn-switch-to-kanban"
              onClick={() => setActiveView('KANBAN')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-none uppercase tracking-wider transition cursor-pointer ${
                activeView === 'KANBAN'
                  ? 'bg-[#1E3D59] text-[#D4AF37] border border-[#D4AF37] glow-gold font-bold'
                  : 'text-[#888888] hover:text-[#F2F0E4]'
              }`}
              title="切換至看板模式"
            >
              <Kanban className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>看板 (Boards)</span>
            </button>
            <button
              id="btn-switch-to-gantt"
              onClick={() => setActiveView('GANTT')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-none uppercase tracking-wider transition cursor-pointer ${
                activeView === 'GANTT'
                  ? 'bg-[#1E3D59] text-[#D4AF37] border border-[#D4AF37] glow-gold font-bold'
                  : 'text-[#888888] hover:text-[#F2F0E4]'
              }`}
              title="切換至甘特圖模式"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>甘特圖 (Gantt)</span>
            </button>
          </div>
        </div>

        {/* Right Controls: OpenProject Actions */}
        <div className="flex items-center gap-2">
          {/* Gatsby Gold "+ Create" Button */}
          {canCreateTask && (
            <button
              onClick={() => {
                const newTask = createTask({
                  title: '新增工作包任務',
                  type: 'TASK',
                  start_date: '2026-09-12',
                  due_date: '2026-09-26',
                  priority: 'MEDIUM',
                  progress: 10,
                });
                setSelectedTaskId(newTask.id);
                setIsTaskModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-transparent hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0A0A0A] border-2 border-[#D4AF37] text-xs font-display uppercase tracking-widest transition cursor-pointer hover:glow-gold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ 建立工作包</span>
            </button>
          )}

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none border text-xs font-display uppercase tracking-wider transition cursor-pointer ${
              filterType !== 'ALL' || filterPriority !== 'ALL' || filterAssignee !== 'ALL' || filterStatus !== 'ALL'
                ? 'bg-[#1E3D59] border-[#D4AF37] text-[#D4AF37] glow-gold'
                : 'bg-[#141414] border-[#D4AF37]/40 text-[#F2F0E4]/80 hover:border-[#D4AF37]'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>條件篩選</span>
            {(filterType !== 'ALL' || filterPriority !== 'ALL' || filterAssignee !== 'ALL' || filterStatus !== 'ALL') && (
              <span className="w-4 h-4 rounded-none bg-[#D4AF37] text-[#0A0A0A] text-[10px] flex items-center justify-center font-bold">
                ✓
              </span>
            )}
          </button>

          {/* Today Button */}
          <button
            onClick={handleScrollToToday}
            className="px-3 py-1.5 rounded-none bg-[#141414] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#D4AF37] text-xs font-display uppercase tracking-widest transition cursor-pointer"
            title="回到今天 (2026-09-10)"
          >
            本日
          </button>

          {/* Zoom In / Out */}
          <div className="flex items-center bg-[#0A0A0A] border border-[#D4AF37]/40 rounded-none p-0.5 text-xs">
            <button
              onClick={() => {
                if (zoomLevel === 'MONTH') setZoomLevel('WEEK');
                else if (zoomLevel === 'WEEK') setZoomLevel('DAY');
              }}
              disabled={zoomLevel === 'DAY'}
              className="w-6 h-6 rounded-none flex items-center justify-center text-[#D4AF37] hover:bg-[#1E3D59]/40 disabled:opacity-30 transition cursor-pointer"
              title="放大排程 (Zoom in)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-display text-[10px] uppercase text-[#D4AF37] border-x border-[#D4AF37]/30">
              {zoomLevel === 'DAY' ? '日階' : zoomLevel === 'WEEK' ? '週階' : '月階'}
            </span>
            <button
              onClick={() => {
                if (zoomLevel === 'DAY') setZoomLevel('WEEK');
                else if (zoomLevel === 'WEEK') setZoomLevel('MONTH');
              }}
              disabled={zoomLevel === 'MONTH'}
              className="w-6 h-6 rounded-none flex items-center justify-center text-[#D4AF37] hover:bg-[#1E3D59]/40 disabled:opacity-30 transition cursor-pointer"
              title="縮小排程 (Zoom out)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Split Mode Toggle */}
          <div className="flex items-center bg-[#0A0A0A] border border-[#D4AF37]/40 rounded-none p-0.5 text-xs">
            <button
              onClick={() => setViewMode('SPLIT')}
              className={`w-7 h-7 rounded-none flex items-center justify-center transition cursor-pointer ${
                viewMode === 'SPLIT' ? 'bg-[#1E3D59] text-[#D4AF37] border border-[#D4AF37]' : 'text-[#888888] hover:text-[#D4AF37]'
              }`}
              title="雙分割檢視"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('TABLE_ONLY')}
              className={`w-7 h-7 rounded-none flex items-center justify-center transition cursor-pointer ${
                viewMode === 'TABLE_ONLY' ? 'bg-[#1E3D59] text-[#D4AF37] border border-[#D4AF37]' : 'text-[#888888] hover:text-[#D4AF37]'
              }`}
              title="僅清單表格"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('GANTT_ONLY')}
              className={`w-7 h-7 rounded-none flex items-center justify-center transition cursor-pointer ${
                viewMode === 'GANTT_ONLY' ? 'bg-[#1E3D59] text-[#D4AF37] border border-[#D4AF37]' : 'text-[#888888] hover:text-[#D4AF37]'
              }`}
              title="僅甘特時間軸"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Drawer / Bar (Collapsible) */}
      {isFilterOpen && (
        <div className="px-4 py-2.5 bg-[#0E0E0E] border-b border-[#D4AF37]/25 flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-100 shrink-0 font-sans">
          <div className="flex items-center gap-1.5">
            <span className="font-display uppercase tracking-wider text-[#D4AF37] text-[10px]">類型:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#141414] border border-[#D4AF37]/40 rounded-none px-3 py-1 text-[#F2F0E4] text-xs focus:outline-hidden"
            >
              <option value="ALL">全部類型 (All)</option>
              <option value="MILESTONE">里程碑 (MILESTONE)</option>
              <option value="PHASE">專案階段 (PHASE)</option>
              <option value="TASK">任務 (TASK)</option>
              <option value="FEATURE">功能需求 (FEATURE)</option>
              <option value="BUG">缺陷 (BUG)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-display uppercase tracking-wider text-[#D4AF37] text-[10px]">狀態:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#141414] border border-[#D4AF37]/40 rounded-none px-3 py-1 text-[#F2F0E4] text-xs focus:outline-hidden"
            >
              <option value="ALL">全部狀態</option>
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-display uppercase tracking-wider text-[#D4AF37] text-[10px]">指派人員:</span>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="bg-[#141414] border border-[#D4AF37]/40 rounded-none px-3 py-1 text-[#F2F0E4] text-xs focus:outline-hidden"
            >
              <option value="ALL">全部成員</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-display uppercase tracking-wider text-[#D4AF37] text-[10px]">優先等級:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-[#141414] border border-[#D4AF37]/40 rounded-none px-3 py-1 text-[#F2F0E4] text-xs focus:outline-hidden"
            >
              <option value="ALL">全部優先級</option>
              <option value="HIGH">高 (High)</option>
              <option value="MEDIUM">中 (Normal)</option>
              <option value="LOW">低 (Low)</option>
            </select>
          </div>

          {(filterType !== 'ALL' || filterPriority !== 'ALL' || filterAssignee !== 'ALL' || filterStatus !== 'ALL') && (
            <button
              onClick={() => {
                setFilterType('ALL');
                setFilterPriority('ALL');
                setFilterAssignee('ALL');
                setFilterStatus('ALL');
              }}
              className="px-3 py-1 rounded-none border border-[#E07A5F] text-[#E07A5F] hover:bg-[#2A1414] font-display uppercase tracking-wider text-xs ml-auto transition cursor-pointer"
            >
              重設篩選
            </button>
          )}
        </div>
      )}

      {/* 2. Main Dual-Pane Split Area (Work Packages Table on Left, Gantt on Right) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: OpenProject Work Packages Table */}
        {viewMode !== 'GANTT_ONLY' && (
          <div
            className={`flex flex-col border-r border-[#D4AF37]/30 bg-[#141414] shrink-0 overflow-hidden ${
              viewMode === 'TABLE_ONLY' ? 'w-full' : 'w-[480px] lg:w-[560px] xl:w-[620px]'
            }`}
          >
            {/* Table Header Row */}
            <div className="h-11 flex items-center border-b border-[#D4AF37]/30 bg-[#0D0D0D] text-[10px] font-display font-bold text-[#D4AF37] tracking-[0.15em] uppercase shrink-0 select-none">
              <div className="w-24 px-3">TYPE</div>
              <div className="w-12 px-2">ID ↑</div>
              <div className="flex-1 px-3">SUBJECT</div>
              <div className="w-28 px-2 hidden sm:block">STATUS</div>
              <div className="w-32 px-2 hidden md:block">ASSIGNEE</div>
              <div className="w-20 px-2 text-right pr-4 hidden lg:block">PRIORITY</div>
            </div>

            {/* Table Body Rows */}
            <div
              ref={tableContainerRef}
              onScroll={handleTableScroll}
              className="flex-1 overflow-y-auto divide-y divide-[#D4AF37]/15"
            >
              {hierarchicalTasks.map(({ task, isChild, hasChildren }) => {
                const assignee = users.find((u) => u.id === task.assignee_id);
                const status = getStatusInfo(task.column_id);
                const priority = getPriorityInfo(task.priority);
                const isHovered = hoveredTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    onMouseEnter={() => setHoveredTaskId(task.id)}
                    onMouseLeave={() => setHoveredTaskId(null)}
                    onClick={() => handleOpenTask(task.id)}
                    className={`h-11 flex items-center text-xs transition cursor-pointer ${
                      isHovered ? 'bg-[#1E3D59]/40 text-[#F2F0E4]' : 'hover:bg-[#1A1A1A] text-[#F2F0E4]/90'
                    }`}
                  >
                    {/* TYPE */}
                    <div className="w-24 px-3 shrink-0">
                      {getTypeBadge(task.type)}
                    </div>

                    {/* ID */}
                    <div className="w-12 px-2 font-mono text-[11px] font-semibold text-[#D4AF37] shrink-0">
                      #{task.id.replace('task-', '').replace('phase-', '')}
                    </div>

                    {/* SUBJECT (with indentation and arrow for phases) */}
                    <div className="flex-1 px-3 flex items-center min-w-0 pr-2">
                      <div className={`flex items-center min-w-0 ${isChild ? 'pl-5' : ''}`}>
                        {hasChildren && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCollapse(task.id);
                            }}
                            className="mr-1.5 p-1 rounded-none hover:bg-[#0A0A0A] text-[#D4AF37] flex items-center justify-center transition"
                          >
                            {collapsedPhases[task.id] ? (
                              <ChevronRight className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        <span
                          className={`truncate ${
                            task.type === 'PHASE'
                              ? 'font-serif font-bold text-[#D4AF37] uppercase tracking-wide'
                              : task.type === 'MILESTONE'
                              ? 'font-serif font-semibold text-[#F2F0E4] italic'
                              : 'font-sans font-normal text-[#F2F0E4]/90'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    </div>

                    {/* STATUS */}
                    <div className="w-28 px-2 hidden sm:flex items-center gap-1.5 shrink-0">
                      <span className={`w-2 h-2 rotate-45 border border-[#D4AF37]/50 ${status.color}`} />
                      <span className="truncate text-[11px] text-[#888888] font-medium">
                        {status.name.split(' ')[0]}
                      </span>
                    </div>

                    {/* ASSIGNEE */}
                    <div className="w-32 px-2 hidden md:flex items-center gap-2 shrink-0">
                      {assignee ? (
                        <>
                          <div className="w-5 h-5 rotate-45 border border-[#D4AF37] overflow-hidden shrink-0 flex items-center justify-center">
                            <img
                              src={assignee.avatar_url}
                              alt={assignee.name}
                              className="-rotate-45 w-7 h-7 object-cover max-w-none"
                            />
                          </div>
                          <span className="truncate text-[11px] text-[#F2F0E4]/80 ml-1">
                            {assignee.name.split(' ')[0]}
                          </span>
                        </>
                      ) : (
                        <span className="text-[11px] text-[#888888]">未指派</span>
                      )}
                    </div>

                    {/* PRIORITY */}
                    <div className="w-20 px-2 text-right pr-4 hidden lg:flex items-center justify-end gap-1.5 shrink-0">
                      <span className={`w-1.5 h-1.5 rotate-45 ${priority.dot}`} />
                      <span className={`text-[10px] font-display uppercase tracking-widest ${priority.color}`}>
                        {priority.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Pane: OpenProject Interactive Gantt Timeline Canvas */}
        {viewMode !== 'TABLE_ONLY' && (
          <div
            ref={scrollContainerRef}
            onScroll={handleGanttScroll}
            className="flex-1 overflow-x-auto overflow-y-auto bg-[#0A0A0A] relative"
          >
            <div
              style={{ width: `${totalDays * dayWidth}px` }}
              className="relative min-h-full flex flex-col"
            >
              {/* Header Rows: Month Bar & Days Bar */}
              <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#D4AF37]/30 select-none shadow-xl">
                {/* Month Row */}
                <div className="h-6 flex border-b border-[#D4AF37]/20 bg-[#0E0E0E] text-[10px] font-display font-bold uppercase tracking-widest text-[#D4AF37]">
                  {monthsList.map((m, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${m.daysCount * dayWidth}px` }}
                      className="h-full px-2 flex items-center border-r border-[#D4AF37]/20 truncate"
                    >
                      {m.label}
                    </div>
                  ))}
                </div>

                {/* Days Row */}
                <div className="h-6 flex bg-[#0A0A0A] text-[9px] font-mono text-[#888888]">
                  {datesList.map((d, idx) => {
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    const isToday =
                      d.getFullYear() === todayDate.getFullYear() &&
                      d.getMonth() === todayDate.getMonth() &&
                      d.getDate() === todayDate.getDate();

                    return (
                      <div
                        key={idx}
                        style={{ width: `${dayWidth}px` }}
                        className={`h-full flex flex-col items-center justify-center border-r border-[#D4AF37]/15 text-center ${
                          isToday
                            ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold border-b border-[#D4AF37]'
                            : isWeekend
                            ? 'bg-[#080808] text-[#555555]'
                            : 'text-[#888888]'
                        }`}
                      >
                        <span>{d.getDate()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gold Dotted Today Marker Line */}
              {todayOffsetDays >= 0 && todayOffsetDays <= totalDays && (
                <div
                  style={{
                    left: `${(todayOffsetDays + 0.5) * dayWidth}px`,
                  }}
                  className="absolute top-12 bottom-0 w-px border-l-2 border-dashed border-[#D4AF37] z-10 pointer-events-none"
                >
                  <div className="sticky top-12 -translate-x-1/2 px-1.5 py-0.2 rounded-none bg-[#D4AF37] text-[#0A0A0A] text-[9px] font-display font-bold uppercase tracking-widest shadow-md">
                    TODAY
                  </div>
                </div>
              )}

              {/* Background Grid Columns */}
              <div className="absolute inset-0 top-12 pointer-events-none flex">
                {datesList.map((d, idx) => {
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <div
                      key={idx}
                      style={{ width: `${dayWidth}px` }}
                      className={`h-full border-r border-[#D4AF37]/10 ${
                        isWeekend ? 'bg-[#000000]/40' : ''
                      }`}
                    />
                  );
                })}
              </div>

              {/* SVG Dependencies connecting lines (Art Deco Gold) */}
              <svg className="absolute inset-0 top-12 w-full h-full pointer-events-none z-10">
                <defs>
                  <marker
                    id="arrowhead-deco"
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L0,6 L6,3 z" fill="#D4AF37" />
                  </marker>
                </defs>
                {hierarchicalTasks.map(({ task }, rowIndex) => {
                  if (!task.dependencies || task.dependencies.length === 0) return null;
                  return task.dependencies.map((depId) => {
                    const predIndex = hierarchicalTasks.findIndex((h) => h.task.id === depId);
                    if (predIndex === -1) return null;
                    const predTask = hierarchicalTasks[predIndex].task;

                    const predEndX = getXForDate(predTask.due_date) + (predTask.type === 'MILESTONE' ? 0 : 4);
                    const predY = predIndex * 44 + 22;

                    const succStartX = getXForDate(task.start_date || task.due_date);
                    const succY = rowIndex * 44 + 22;

                    const midX = (predEndX + succStartX) / 2;
                    const pathD = `M ${predEndX} ${predY} C ${midX} ${predY}, ${midX} ${succY}, ${succStartX} ${succY}`;

                    return (
                      <path
                        key={`${depId}-${task.id}`}
                        d={pathD}
                        fill="none"
                        stroke="#D4AF37"
                        strokeWidth="1.5"
                        markerEnd="url(#arrowhead-deco)"
                        strokeDasharray="4 3"
                        className="opacity-80"
                      />
                    );
                  });
                })}
              </svg>

              {/* Gantt Timeline Item Rows */}
              <div className="relative z-10 flex-1 divide-y divide-[#D4AF37]/15">
                {hierarchicalTasks.map(({ task }, rowIndex) => {
                  const isHovered = hoveredTaskId === task.id;
                  const startX = getXForDate(task.start_date || task.created_at?.slice(0, 10) || '2026-09-01');
                  const endX = getXForDate(task.due_date || '2026-09-15') + dayWidth;
                  const barWidth = Math.max(dayWidth, endX - startX);
                  const progress = task.progress !== undefined ? task.progress : (task.column_id === 'col-done' ? 100 : 30);

                  return (
                    <div
                      key={task.id}
                      onMouseEnter={() => setHoveredTaskId(task.id)}
                      onMouseLeave={() => setHoveredTaskId(null)}
                      className={`h-11 relative flex items-center transition ${
                        isHovered ? 'bg-[#1E3D59]/25' : ''
                      }`}
                    >
                      {/* 1. MILESTONE (Art Deco Gold Diamond) */}
                      {task.type === 'MILESTONE' && (
                        <div
                          style={{ left: `${startX + dayWidth / 2}px` }}
                          onClick={() => handleOpenTask(task.id)}
                          className="absolute -translate-x-1/2 flex items-center gap-2 cursor-pointer group z-20"
                        >
                          <div className="w-4 h-4 bg-[#D4AF37] rotate-45 border-2 border-[#0A0A0A] glow-gold group-hover:scale-125 transition-transform" />
                          <span className="text-[10px] font-display uppercase tracking-widest text-[#D4AF37] whitespace-nowrap drop-shadow-md select-none font-bold">
                            {task.title}
                          </span>
                        </div>
                      )}

                      {/* 2. PHASE (Gatsby Architectural Bracket Bar) */}
                      {task.type === 'PHASE' && (
                        <div
                          style={{ left: `${startX}px`, width: `${barWidth}px` }}
                          onClick={() => handleOpenTask(task.id)}
                          className="absolute h-5 flex items-center cursor-pointer group z-20"
                        >
                          {/* Left Bracket End */}
                          <div className="w-1.5 h-full bg-[#D4AF37]" />
                          {/* Center Thick Bar */}
                          <div className="flex-1 h-2 bg-[#1E3D59] border-y border-[#D4AF37]/50 relative">
                            {/* Progress inside phase */}
                            <div
                              style={{ width: `${progress}%` }}
                              className="h-full bg-[#D4AF37]"
                            />
                          </div>
                          {/* Right Bracket End */}
                          <div className="w-1.5 h-full bg-[#D4AF37]" />

                          {/* Phase Label next to bar */}
                          <span className="absolute left-full ml-2 text-[10px] font-display uppercase tracking-widest font-bold text-[#D4AF37] whitespace-nowrap select-none">
                            {task.title} ({progress}%)
                          </span>
                        </div>
                      )}

                      {/* 3. TASK / FEATURE / BUG (Art Deco Metallic Bars) */}
                      {task.type !== 'MILESTONE' && task.type !== 'PHASE' && (
                        <div
                          style={{ left: `${startX}px`, width: `${barWidth}px` }}
                          onClick={() => handleOpenTask(task.id)}
                          className={`absolute h-7 rounded-none cursor-pointer group z-20 shadow-md flex items-center overflow-visible transition border ${
                            task.type === 'BUG'
                              ? 'bg-[#2A1414] border-[#E07A5F] text-[#F2F0E4]'
                              : 'bg-[#1E3D59] border-[#D4AF37]/80 hover:border-[#D4AF37] text-[#F2F0E4] hover:glow-gold'
                          }`}
                        >
                          {/* Resize Left Handle */}
                          <div
                            onMouseDown={(e) =>
                              handleMouseDown(
                                e,
                                task.id,
                                'RESIZE_START',
                                task.start_date || '2026-09-01',
                                task.due_date || '2026-09-15'
                              )
                            }
                            className="w-2 h-full absolute left-0 top-0 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-[#D4AF37]/40 hover:bg-[#D4AF37]"
                            title="調整開始日期"
                          />

                          {/* Inner Progress Shading */}
                          <div
                            style={{ width: `${progress}%` }}
                            className={`h-full absolute left-0 top-0 ${
                              task.type === 'BUG' ? 'bg-[#E07A5F]/30' : 'bg-[#D4AF37]/25'
                            }`}
                          />

                          {/* Center Move Handle / Drag Area */}
                          <div
                            onMouseDown={(e) =>
                              handleMouseDown(
                                e,
                                task.id,
                                'MOVE',
                                task.start_date || '2026-09-01',
                                task.due_date || '2026-09-15'
                              )
                            }
                            className="flex-1 px-2 relative z-10 truncate text-[11px] font-sans font-medium select-none cursor-move flex items-center justify-between"
                          >
                            <span className="truncate">{task.title}</span>
                            {barWidth > 70 && (
                              <span className="text-[10px] text-[#D4AF37] ml-1 shrink-0 font-mono">
                                {progress}%
                              </span>
                            )}
                          </div>

                          {/* Resize Right Handle */}
                          <div
                            onMouseDown={(e) =>
                              handleMouseDown(
                                e,
                                task.id,
                                'RESIZE_END',
                                task.start_date || '2026-09-01',
                                task.due_date || '2026-09-15'
                              )
                            }
                            className="w-2 h-full absolute right-0 top-0 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-[#D4AF37]/40 hover:bg-[#D4AF37]"
                            title="調整截止日期"
                          />

                          {/* Label to the right if bar is short */}
                          <div className="absolute left-full ml-2 flex items-center gap-1.5 whitespace-nowrap text-[11px] text-[#F2F0E4]/80 font-sans select-none pointer-events-none">
                            <span>{task.title}</span>
                            <span className="text-[10px] text-[#888888] font-mono">
                              ({task.start_date?.slice(5)} ~ {task.due_date?.slice(5)})
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Status & Legend Footer */}
      <div className="h-9 px-4 border-t border-[#D4AF37]/30 bg-[#0D0D0D] flex items-center justify-between text-[11px] text-[#888888] shrink-0 select-none font-sans">
        <div className="flex items-center gap-4">
          <span className="font-display uppercase tracking-widest text-[#D4AF37] text-[10px]">圖例規格 (LEGEND):</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#D4AF37] rotate-45 inline-block" />
            <span className="text-[#F2F0E4]">里程碑 (Milestone)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-2 bg-[#D4AF37] inline-block" />
            <span className="text-[#F2F0E4]">專案階段 (Phase)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-2 bg-[#1E3D59] border border-[#D4AF37]/80 inline-block" />
            <span className="text-[#F2F0E4]">任務 / 功能 (Task)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-2 bg-[#2A1414] border border-[#E07A5F] inline-block" />
            <span className="text-[#F2F0E4]">異常缺陷 (Defect)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 border-t-2 border-dashed border-[#D4AF37] inline-block" />
            <span className="text-[#D4AF37]">今日基準線 (Today)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#888888] text-[10px] uppercase tracking-wider font-display">
          <span>提示：直接拖曳時程條平移日期，或拉動兩側金屬端點調整工期</span>
        </div>
      </div>
    </div>
  );
};
