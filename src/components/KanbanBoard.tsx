import React, { useState } from 'react';
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Edit2,
  Filter,
  Check,
  X,
  Layers,
  Sparkles,
  Kanban,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskCard } from './TaskCard';
import { PriorityLevel } from '../types';

export const KanbanBoard: React.FC = () => {
  const {
    columns,
    filteredTasks,
    addColumn,
    updateColumn,
    deleteColumn,
    moveTask,
    canCreateTask,
    canConfigureColumns,
    canMoveTasks,
    setSelectedTaskId,
    setIsTaskModalOpen,
    createTask,
    users,
    activeView,
    setActiveView,
  } = useApp();

  // Local drag tracking
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // Column edit modal/inline state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editingColName, setEditingColName] = useState('');
  const [openColumnMenuId, setOpenColumnMenuId] = useState<string | null>(null);

  // Quick filters inside Kanban
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | PriorityLevel>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');

  React.useEffect(() => {
    const handleOutsideClick = () => setOpenColumnMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Filter tasks further if needed
  const displayTasks = filteredTasks.filter((t) => {
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'ALL' && t.assignee_id !== assigneeFilter) return false;
    return true;
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  };

  const handleDragOverCol = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== colId) {
      setDragOverColumnId(colId);
    }
  };

  const handleDragLeaveCol = (e: React.DragEvent, colId: string) => {
    // Only clear if leaving the container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColumnId === colId) {
      setDragOverColumnId(null);
    }
  };

  const handleDropOnCol = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTask(taskId, targetColId);
    }
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  };

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    addColumn(newColName.trim());
    setNewColName('');
    setIsAddingColumn(false);
  };

  const handleSaveEditColumn = (colId: string) => {
    if (editingColName.trim()) {
      updateColumn(colId, editingColName.trim());
    }
    setEditingColId(null);
  };

  const handleQuickAddTask = (colId: string) => {
    const newTask = createTask({
      column_id: colId,
      title: '新任務',
      description: '',
      priority: 'MEDIUM',
    });
    setSelectedTaskId(newTask.id);
    setIsTaskModalOpen(true);
  };

  return (
    <div id="kanban-board-module" className="flex-1 flex flex-col min-h-0 bg-[#0A0A0A] art-deco-bg">
      {/* Sub-toolbar: Filters & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-[#141414] border-b border-[#D4AF37]/30">
        <div className="flex items-center gap-3 flex-wrap text-xs font-sans">
          {/* VIEW SWITCHER: Kanban vs Gantt */}
          <div className="flex items-center bg-[#0A0A0A] p-0.5 rounded-none border border-[#D4AF37]/40 text-xs font-display">
            <button
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

          <div className="h-4 w-px bg-[#D4AF37]/30 hidden sm:block" />

          <span className="text-[#D4AF37] font-display uppercase tracking-widest flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3 text-[#D4AF37]" /> 篩選過濾：
          </span>

          {/* Priority filter pills */}
          <div className="inline-flex rounded-none bg-[#0A0A0A] p-0.5 text-[10px] font-display uppercase tracking-wider border border-[#D4AF37]/40">
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-none transition cursor-pointer ${
                  priorityFilter === p
                    ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold glow-gold'
                    : 'text-[#888888] hover:text-[#F2F0E4]'
                }`}
              >
                {p === 'ALL' ? '全部等級' : p === 'HIGH' ? 'I • 緊急' : p === 'MEDIUM' ? 'II • 常態' : 'III • 備查'}
              </button>
            ))}
          </div>

          {/* Assignee filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-1 text-xs bg-[#0A0A0A] rounded-none text-[#F2F0E4] border border-[#D4AF37]/40 hover:border-[#D4AF37] cursor-pointer focus:outline-hidden font-sans"
          >
            <option value="ALL" className="bg-[#141414] text-[#F2F0E4]">全部指派人員</option>
            {users.map((u) => (
              <option key={u.id} value={u.id} className="bg-[#141414] text-[#F2F0E4]">
                {u.name} ({u.role})
              </option>
            ))}
          </select>

          {(priorityFilter !== 'ALL' || assigneeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setPriorityFilter('ALL');
                setAssigneeFilter('ALL');
              }}
              className="text-xs text-[#E07A5F] hover:bg-[#E07A5F]/10 px-2.5 py-1 rounded-none border border-[#E07A5F]/40 transition flex items-center gap-1 cursor-pointer font-display uppercase tracking-wider"
            >
              <X className="w-3 h-3" /> 重設條件
            </button>
          )}
        </div>

        {/* Right tools: Add Column */}
        {canConfigureColumns && (
          <div className="flex items-center gap-2">
            {!isAddingColumn ? (
              <button
                id="btn-add-kanban-column"
                onClick={() => setIsAddingColumn(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-transparent hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0A0A0A] border border-[#D4AF37] text-xs font-display uppercase tracking-widest transition cursor-pointer hover:glow-gold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增看板階段</span>
              </button>
            ) : (
              <form onSubmit={handleCreateColumn} className="flex items-center gap-1.5">
                <input
                  type="text"
                  autoFocus
                  placeholder="輸入階段名稱..."
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-none border-2 border-[#D4AF37] focus:outline-hidden w-40 bg-[#0A0A0A] text-[#F2F0E4]"
                />
                <button
                  type="submit"
                  className="w-7 h-7 rounded-none bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#F2E8C4] flex items-center justify-center font-bold transition cursor-pointer"
                  title="確認"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(false)}
                  className="w-7 h-7 rounded-none bg-[#141414] text-[#888888] hover:text-[#F2F0E4] border border-[#D4AF37]/40 flex items-center justify-center transition cursor-pointer"
                  title="取消"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Kanban Columns Horizontal Scroll Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex items-start gap-5 h-full min-h-[520px]">
          {columns.map((col, cIdx) => {
            const colTasks = displayTasks
              .filter((t) => t.column_id === col.id)
              .sort((a, b) => a.position_order - b.position_order);

            const isOver = dragOverColumnId === col.id;

            return (
              <div
                key={col.id}
                id={`kanban-col-${col.id}`}
                onDragOver={(e) => handleDragOverCol(e, col.id)}
                onDragLeave={(e) => handleDragLeaveCol(e, col.id)}
                onDrop={(e) => handleDropOnCol(e, col.id)}
                className={`w-80 shrink-0 flex flex-col max-h-full rounded-none bg-[#141414]/90 border transition-all duration-200 ${
                  isOver
                    ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 bg-[#1E3D59]/30 glow-gold'
                    : 'border-[#D4AF37]/25 shadow-xl'
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 pb-2.5 flex items-center justify-between gap-2 border-b border-[#D4AF37]/20 bg-[#0E0E0E]">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Rotated Diamond Stage Tag */}
                    <div
                      className="w-2.5 h-2.5 rotate-45 border border-[#D4AF37] shrink-0"
                      style={{ backgroundColor: col.color || '#D4AF37' }}
                    />
                    {editingColId === col.id ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="text"
                          value={editingColName}
                          onChange={(e) => setEditingColName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEditColumn(col.id);
                            if (e.key === 'Escape') setEditingColId(null);
                          }}
                          autoFocus
                          className="w-full px-2.5 py-0.5 text-xs rounded-none border border-[#D4AF37] bg-[#0A0A0A] text-[#F2F0E4]"
                        />
                        <button
                          onClick={() => handleSaveEditColumn(col.id)}
                          className="w-6 h-6 rounded-none bg-[#D4AF37] text-[#0A0A0A] flex items-center justify-center transition cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <h3
                        className="text-xs font-serif font-bold uppercase tracking-wider text-[#F2F0E4] truncate"
                        title={col.name}
                      >
                        {col.name}
                      </h3>
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-none bg-[#0A0A0A] border border-[#D4AF37]/30 text-[#D4AF37] shrink-0">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {canCreateTask && (
                      <button
                        onClick={() => handleQuickAddTask(col.id)}
                        className="w-6 h-6 rounded-none text-[#888888] hover:text-[#D4AF37] hover:bg-[#1E3D59]/40 border border-transparent hover:border-[#D4AF37]/40 flex items-center justify-center transition cursor-pointer"
                        title="在此欄位新增卡片"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canConfigureColumns && editingColId !== col.id && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenColumnMenuId(openColumnMenuId === col.id ? null : col.id);
                          }}
                          className="w-6 h-6 rounded-none text-[#888888] hover:text-[#D4AF37] hover:bg-[#1E3D59]/40 border border-transparent hover:border-[#D4AF37]/40 flex items-center justify-center transition cursor-pointer"
                          title="欄位設定"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                        {openColumnMenuId === col.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-8 w-36 bg-[#141414] rounded-none shadow-2xl border-2 border-[#D4AF37] py-1.5 z-30 text-xs animate-in fade-in duration-100 glow-gold font-sans"
                          >
                            <button
                              onClick={() => {
                                setEditingColId(col.id);
                                setEditingColName(col.name);
                                setOpenColumnMenuId(null);
                              }}
                              className="w-full text-left px-3.5 py-1.5 text-[#F2F0E4] hover:bg-[#1E3D59]/40 flex items-center gap-2 cursor-pointer transition"
                            >
                              <Edit2 className="w-3 h-3 text-[#D4AF37]" /> 重新命名
                            </button>
                            {columns.length > 1 && (
                              <button
                                onClick={() => {
                                  deleteColumn(col.id);
                                  setOpenColumnMenuId(null);
                                }}
                                className="w-full text-left px-3.5 py-1.5 text-[#E07A5F] hover:bg-[#2A1414] flex items-center gap-2 cursor-pointer transition"
                              >
                                <Trash2 className="w-3 h-3" /> 刪除欄位
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Task Cards Droppable Body */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-3 min-h-[140px]">
                  {colTasks.length === 0 ? (
                    <div
                      onClick={() => canCreateTask && handleQuickAddTask(col.id)}
                      className={`h-28 flex flex-col items-center justify-center border-2 border-dashed border-[#D4AF37]/20 rounded-none text-[#888888] transition p-3 select-none ${
                        canCreateTask ? 'hover:border-[#D4AF37]/60 hover:text-[#D4AF37] cursor-pointer hover:bg-[#1E3D59]/10' : ''
                      }`}
                      title={canCreateTask ? '點擊新增卡片' : undefined}
                    >
                      <div className="w-4 h-4 rotate-45 border border-[#D4AF37]/40 mb-1" />
                      <span className="text-[10px] font-display uppercase tracking-widest select-none">無任務排程</span>
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    ))
                  )}

                  {/* Visual Drop Area Highlight if dragging */}
                  {isOver && (
                    <div className="h-16 rounded-none border-2 border-dashed border-[#D4AF37] bg-[#1E3D59]/30 flex items-center justify-center text-xs text-[#D4AF37] font-display uppercase tracking-widest animate-pulse">
                      置放卡片於此階段
                    </div>
                  )}
                </div>

                {/* Column Footer: Quick add task button */}
                {canCreateTask && (
                  <div className="p-2.5 pt-0">
                    <button
                      onClick={() => handleQuickAddTask(col.id)}
                      className="w-full py-1.5 px-3 rounded-none text-xs font-display uppercase tracking-widest text-[#D4AF37] bg-[#0A0A0A] hover:bg-[#D4AF37] hover:text-[#0A0A0A] border border-[#D4AF37]/40 hover:border-[#D4AF37] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新增卡片</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Column Placeholder Card on far right */}
          {canConfigureColumns && (
            <div
              onClick={() => setIsAddingColumn(true)}
              className="w-72 shrink-0 h-36 border-2 border-dashed border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#1E3D59]/10 rounded-none flex flex-col items-center justify-center gap-2.5 cursor-pointer transition text-[#888888] hover:text-[#D4AF37] group"
            >
              <div className="w-9 h-9 rotate-45 border-2 border-[#D4AF37]/50 group-hover:border-[#D4AF37] bg-[#141414] text-[#D4AF37] flex items-center justify-center transition">
                <div className="-rotate-45">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
              <span className="text-xs font-display uppercase tracking-widest">建立新流程階段</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
