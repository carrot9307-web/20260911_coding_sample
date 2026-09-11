import React from 'react';
import {
  Calendar,
  Paperclip,
  GitPullRequest,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Task, PriorityLevel } from '../types';
import { useApp } from '../context/AppContext';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onDragEnd }) => {
  const {
    users,
    rfis,
    attachments,
    setSelectedTaskId,
    setIsTaskModalOpen,
    setSelectedRfiId,
    setIsRfiModalOpen,
    columns,
    moveTask,
    canMoveTasks,
  } = useApp();

  const assignee = users.find((u) => u.id === task.assignee_id);
  const taskAttachments = attachments.filter(
    (a) => a.target_type === 'TASK' && a.target_id === task.id
  );
  const linkedRfiList = rfis.filter((r) => task.linked_rfi_ids.includes(r.id));

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-display uppercase tracking-widest px-2 py-0.5 rounded-none bg-[#2A1414] text-[#E07A5F] border border-[#E07A5F]">
            <span className="w-1.5 h-1.5 bg-[#E07A5F] rotate-45" />
            PRIORITY I • 緊急
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center text-[9px] font-display uppercase tracking-widest px-2 py-0.5 rounded-none bg-[#241F10] text-[#D4AF37] border border-[#D4AF37]">
            PRIORITY II • 常態
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center text-[9px] font-display uppercase tracking-widest px-2 py-0.5 rounded-none bg-[#101924] text-[#78A1BB] border border-[#78A1BB]">
            PRIORITY III • 備查
          </span>
        );
    }
  };

  const isDueSoon = () => {
    if (!task.due_date) return false;
    const due = new Date(task.due_date).getTime();
    const now = Date.now();
    const diffDays = (due - now) / (1000 * 3600 * 24);
    return diffDays < 3 && diffDays >= 0;
  };

  const isOverdue = () => {
    if (!task.due_date) return false;
    const due = new Date(task.due_date).getTime();
    return due < Date.now();
  };

  return (
    <div
      id={`task-card-${task.id}`}
      draggable={canMoveTasks}
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onClick={() => {
        setSelectedTaskId(task.id);
        setIsTaskModalOpen(true);
      }}
      className={`group relative bg-[#141414] rounded-none p-4 border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:glow-gold transition-all duration-200 cursor-pointer transform hover:-translate-y-1 ${
        canMoveTasks ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      }`}
    >
      {/* Art Deco Corner Brackets */}
      <span className="corner-bracket-tl opacity-60 group-hover:opacity-100 transition-opacity" />
      <span className="corner-bracket-br opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Top Header: Priority & Quick column mover */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {getPriorityBadge(task.priority)}
          {task.tags?.map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-1.5 py-0.2 rounded-none bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 uppercase tracking-widest font-sans font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Quick move dropdown for accessibility / mobile */}
        {canMoveTasks && columns.length > 1 && (
          <div
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <select
              value={task.column_id}
              onChange={(e) => moveTask(task.id, e.target.value)}
              className="text-[9px] font-display uppercase tracking-widest py-0.5 px-2 bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#D4AF37] rounded-none border border-[#D4AF37]/50 cursor-pointer focus:outline-hidden"
              title="快速推進看板欄位"
            >
              {columns.map((col) => (
                <option key={col.id} value={col.id} className="bg-[#141414] text-[#F2F0E4]">
                  移至: {col.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Title */}
      <h4 className="text-xs font-serif font-bold text-[#F2F0E4] leading-snug line-clamp-2 group-hover:text-[#D4AF37] transition tracking-wide">
        {task.title}
      </h4>

      {/* Description Snippet */}
      {task.description && (
        <p className="mt-1.5 text-[11px] text-[#888888] line-clamp-2 leading-relaxed font-sans">
          {task.description}
        </p>
      )}

      {/* Linked RFIs Chips */}
      {linkedRfiList.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
          {linkedRfiList.map((rfi) => (
            <button
              key={rfi.id}
              type="button"
              onClick={() => {
                setSelectedRfiId(rfi.id);
                setIsRfiModalOpen(true);
              }}
              className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-none bg-[#1E3D59]/60 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0A] border border-[#D4AF37]/60 transition cursor-pointer"
              title={`點擊查看關聯 RFI: ${rfi.title}`}
            >
              <GitPullRequest className="w-2.5 h-2.5" />
              <span>{rfi.rfi_code}</span>
            </button>
          ))}
        </div>
      )}

      {/* Footer Info: Assignee, Due Date, Attachments */}
      <div className="mt-3.5 pt-2.5 border-t border-[#D4AF37]/20 flex items-center justify-between text-[11px] text-[#888888]">
        {/* Assignee Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rotate-45 border border-[#D4AF37] overflow-hidden flex items-center justify-center shrink-0">
            <img
              src={
                assignee?.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
              }
              alt={assignee?.name || '負責人'}
              className="-rotate-45 w-7 h-7 object-cover max-w-none"
              title={`負責人: ${assignee?.name || '未指派'}`}
            />
          </div>
          <span className="text-[11px] text-[#F2F0E4]/90 truncate max-w-[80px] font-sans">
            {assignee?.name.split(' ')[0] || '未指派'}
          </span>
        </div>

        {/* Due Date & Attachments badge */}
        <div className="flex items-center gap-2">
          {taskAttachments.length > 0 && (
            <span
              className="flex items-center gap-1 text-[10px] text-[#888888] hover:text-[#D4AF37] border border-[#D4AF37]/30 px-1.5 py-0.2"
              title={`${taskAttachments.length} 個圖說文獻附件`}
            >
              <Paperclip className="w-3 h-3 text-[#D4AF37]" />
              <span>{taskAttachments.length}</span>
            </span>
          )}

          {task.due_date && (
            <span
              className={`flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-none border ${
                isOverdue()
                  ? 'bg-[#2A1414] text-[#E07A5F] border-[#E07A5F]'
                  : isDueSoon()
                  ? 'bg-[#241F10] text-[#D4AF37] border-[#D4AF37]'
                  : 'text-[#F2F0E4]/70 bg-[#0A0A0A] border-[#D4AF37]/30'
              }`}
              title={`履約期限: ${task.due_date}`}
            >
              <Calendar className="w-2.5 h-2.5 text-[#D4AF37]" />
              <span>{task.due_date.slice(5)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
