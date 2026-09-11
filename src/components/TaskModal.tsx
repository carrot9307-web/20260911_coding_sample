import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Users,
  AlertCircle,
  Tag,
  GitPullRequest,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  Save,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, PriorityLevel, WorkPackageType } from '../types';
import { AttachmentManager } from './AttachmentManager';
import { CommentSection } from './CommentSection';

export const TaskModal: React.FC = () => {
  const {
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    isTaskModalOpen,
    setIsTaskModalOpen,
    updateTask,
    deleteTask,
    columns,
    users,
    rfis,
    setSelectedRfiId,
    setIsRfiModalOpen,
    canEditProject,
    canCreateTask,
  } = useApp();

  const task = tasks.find((t) => t.id === selectedTaskId);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [taskType, setTaskType] = useState<WorkPackageType>('TASK');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [progress, setProgress] = useState<number>(0);
  const [assigneeId, setAssigneeId] = useState('');
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);
  const [tagsText, setTagsText] = useState('');
  const [isLinkingRfi, setIsLinkingRfi] = useState(false);
  const [rfiToLink, setRfiToLink] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setColumnId(task.column_id);
      setPriority(task.priority);
      setTaskType(task.type || 'TASK');
      setStartDate(task.start_date || task.created_at?.slice(0, 10) || '2026-09-01');
      setDueDate(task.due_date || '');
      setProgress(task.progress !== undefined ? task.progress : (task.column_id === 'col-done' ? 100 : 0));
      setAssigneeId(task.assignee_id);
      setCollaboratorIds(task.collaborator_ids || []);
      setTagsText(task.tags?.join(', ') || '');
    }
  }, [task]);

  if (!isTaskModalOpen || !task) return null;

  const handleSave = () => {
    const parsedTags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updated: Task = {
      ...task,
      title: title.trim() || '未命名任務',
      description,
      column_id: columnId,
      priority,
      type: taskType,
      start_date: startDate,
      due_date: dueDate,
      progress: Math.min(100, Math.max(0, Number(progress) || 0)),
      assignee_id: assigneeId,
      collaborator_ids: collaboratorIds,
      tags: parsedTags,
    };

    updateTask(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleClose = () => {
    handleSave();
    setIsTaskModalOpen(false);
    setSelectedTaskId(null);
  };

  const handleDelete = () => {
    if (confirm(`確定要刪除任務「${task.title}」嗎？此操作無法還原。`)) {
      deleteTask(task.id);
      setIsTaskModalOpen(false);
      setSelectedTaskId(null);
    }
  };

  const handleLinkRfi = (rfiId: string) => {
    if (!rfiId || task.linked_rfi_ids.includes(rfiId)) return;
    const updated: Task = {
      ...task,
      linked_rfi_ids: [...task.linked_rfi_ids, rfiId],
    };
    updateTask(updated);
    setIsLinkingRfi(false);
    setRfiToLink('');
  };

  const handleUnlinkRfi = (rfiId: string) => {
    const updated: Task = {
      ...task,
      linked_rfi_ids: task.linked_rfi_ids.filter((id) => id !== rfiId),
    };
    updateTask(updated);
  };

  const handleCreateNewRfiForTask = () => {
    // Open RFI modal and link to this task
    setIsTaskModalOpen(false);
    setSelectedRfiId('NEW_FOR_TASK_' + task.id);
    setIsRfiModalOpen(true);
  };

  const linkedRfis = rfis.filter((r) => task.linked_rfi_ids.includes(r.id));
  const availableRfisToLink = rfis.filter((r) => !task.linked_rfi_ids.includes(r.id));

  return (
    <div
      id="task-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        id="task-modal-dialog"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0A0A0A] rounded-none shadow-2xl border-2 border-[#D4AF37]/50 glow-gold overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Stepped Corner Brackets */}
        <span className="corner-bracket-tl" />
        <span className="corner-bracket-tr" />
        <span className="corner-bracket-bl" />
        <span className="corner-bracket-br" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/30 bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-display uppercase tracking-widest px-3 py-1 rounded-none bg-[#241F10] text-[#D4AF37] border border-[#D4AF37]/60">
              TASK • 工作包
            </span>
            <select
              value={columnId}
              onChange={(e) => setColumnId(e.target.value)}
              className="text-xs font-display tracking-wide px-3 py-1 rounded-none bg-[#0A0A0A] border border-[#D4AF37]/40 text-[#D4AF37] cursor-pointer focus:border-[#D4AF37] focus:outline-hidden"
            >
              {columns.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#141414] text-[#F2F0E4]">
                  進度：{c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-[#D4AF37] font-display uppercase tracking-wider flex items-center gap-1 bg-[#241F10] px-3 py-1 rounded-none border border-[#D4AF37]/40">
                <Check className="w-3.5 h-3.5" /> 已自動儲存變更
              </span>
            )}
            <button
              id="btn-save-task"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-none bg-[#D4AF37] hover:bg-[#F2E8C4] text-[#0A0A0A] text-xs font-display uppercase tracking-widest font-bold shadow-xs transition cursor-pointer border border-[#D4AF37]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>儲存變更</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-8 h-8 rounded-none flex items-center justify-center text-[#888888] hover:text-[#E07A5F] hover:bg-[#2A1414] border border-transparent hover:border-[#E07A5F]/40 transition cursor-pointer"
              title="刪除任務"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              id="btn-close-task-modal"
              onClick={handleClose}
              className="w-8 h-8 rounded-none flex items-center justify-center text-[#888888] hover:text-[#D4AF37] hover:bg-[#241F10] border border-transparent hover:border-[#D4AF37]/40 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 art-deco-bg">
          {/* Main Grid: Left content, Right metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Title, Description, Linked RFIs, Attachments, Comments */}
            <div className="lg:col-span-2 space-y-6">
              {/* Task Title Input */}
              <div>
                <label className="block text-[10px] font-display uppercase tracking-widest text-[#D4AF37] mb-1.5">
                  任務標題 (Task Title)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="輸入任務標題..."
                  className="w-full text-base font-serif font-bold text-[#F2F0E4] bg-[#141414] px-4 py-2.5 rounded-none border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-hidden transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-display uppercase tracking-widest text-[#D4AF37] mb-1.5">
                  詳細描述 (Specification & Acceptance Criteria)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="詳細任務驗收條件、工程實作規格或討論摘要..."
                  rows={5}
                  className="w-full text-xs text-[#F2F0E4] bg-[#141414] leading-relaxed px-4 py-3 rounded-none border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-hidden transition resize-y"
                />
              </div>

              {/* Linked RFIs Section */}
              <div className="p-4 bg-[#141414] rounded-none border border-[#D4AF37]/40 space-y-3 relative">
                <span className="corner-bracket-tl" />
                <span className="corner-bracket-br" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4 text-[#D4AF37]" />
                    <h4 className="text-xs font-display uppercase tracking-widest text-[#D4AF37]">
                      關聯 RFI 請示單據 ({linkedRfis.length})
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsLinkingRfi(!isLinkingRfi)}
                      className="px-3 py-1 rounded-none text-[11px] font-display uppercase tracking-wider bg-[#241F10] text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-[#D4AF37]/20 flex items-center gap-1 cursor-pointer transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> 關聯現有 RFI
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNewRfiForTask}
                      className="text-[11px] font-display uppercase tracking-wider px-3 py-1 rounded-none bg-[#D4AF37] text-[#0A0A0A] font-bold hover:bg-[#F2E8C4] flex items-center gap-1 cursor-pointer transition"
                    >
                      <Plus className="w-3 h-3" /> 新建關聯 RFI
                    </button>
                  </div>
                </div>

                {isLinkingRfi && (
                  <div className="p-3 bg-[#0A0A0A] rounded-none border border-[#D4AF37]/50 flex items-center gap-2 text-xs">
                    <select
                      value={rfiToLink}
                      onChange={(e) => setRfiToLink(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-none border border-[#D4AF37]/40 bg-[#141414] text-[#F2F0E4] focus:outline-hidden"
                    >
                      <option value="" className="bg-[#141414] text-[#888888]">-- 選擇要關聯的 RFI --</option>
                      {availableRfisToLink.map((r) => (
                        <option key={r.id} value={r.id} className="bg-[#141414] text-[#F2F0E4]">
                          {r.rfi_code}: {r.title} ({r.status})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleLinkRfi(rfiToLink)}
                      disabled={!rfiToLink}
                      className="px-3.5 py-1.5 rounded-none bg-[#D4AF37] text-[#0A0A0A] font-display uppercase tracking-wider font-bold hover:bg-[#F2E8C4] disabled:opacity-40 transition cursor-pointer"
                    >
                      確認關聯
                    </button>
                    <button
                      onClick={() => setIsLinkingRfi(false)}
                      className="w-7 h-7 rounded-none flex items-center justify-center text-[#888888] hover:text-[#F2F0E4] hover:bg-[#241F10] transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {linkedRfis.length > 0 ? (
                  <div className="space-y-2">
                    {linkedRfis.map((rfi) => (
                      <div
                        key={rfi.id}
                        className="flex items-center justify-between p-2.5 bg-[#0A0A0A] rounded-none border border-[#D4AF37]/30 hover:border-[#D4AF37] transition text-xs"
                      >
                        <div
                          className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                          onClick={() => {
                            setSelectedRfiId(rfi.id);
                            setIsRfiModalOpen(true);
                          }}
                        >
                          <span className="font-mono font-bold text-[#D4AF37] shrink-0">
                            {rfi.rfi_code}
                          </span>
                          <span className="text-[#F2F0E4] font-medium truncate">
                            {rfi.title}
                          </span>
                          <span className="text-[9px] font-display uppercase tracking-widest px-2 py-0.5 rounded-none bg-[#241F10] text-[#D4AF37] border border-[#D4AF37]/40 shrink-0">
                            {rfi.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRfiId(rfi.id);
                              setIsRfiModalOpen(true);
                            }}
                            className="w-6 h-6 rounded-none flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/20 transition cursor-pointer"
                            title="查看 RFI"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUnlinkRfi(rfi.id)}
                            className="w-6 h-6 rounded-none flex items-center justify-center text-[#888888] hover:text-[#E07A5F] hover:bg-[#2A1414] transition cursor-pointer"
                            title="解除關聯"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#888888] italic font-sans">
                    此任務尚未關聯任何 RFI 提問，可點擊上方按鈕立即建立或關聯。
                  </p>
                )}
              </div>

              {/* Attachments Section */}
              <AttachmentManager targetType="TASK" targetId={task.id} />

              {/* Comments Section */}
              <CommentSection targetType="TASK" targetId={task.id} />
            </div>

            {/* Right Sidebar Column: Metadata Properties */}
            <div className="space-y-5 bg-[#141414] p-4 rounded-none border border-[#D4AF37]/40 text-xs text-[#F2F0E4] relative">
              <span className="corner-bracket-tr" />
              <span className="corner-bracket-bl" />
              <h4 className="font-display font-bold text-[#D4AF37] uppercase tracking-widest text-[11px] pb-2 border-b border-[#D4AF37]/30">
                屬性與指派資訊 (PROPERTIES)
              </h4>

              {/* Work Package Type (OpenProject Style) */}
              <div>
                <label className="block text-[#888888] font-display text-[10px] uppercase tracking-wider mb-1">
                  工作包類型 (TYPE)
                </label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as WorkPackageType)}
                  className="w-full px-2.5 py-2 rounded-none bg-[#0A0A0A] border border-[#D4AF37]/40 text-[#F2F0E4] font-medium focus:border-[#D4AF37] focus:outline-hidden"
                >
                  <option value="MILESTONE" className="bg-[#141414]">◆ 里程碑 (MILESTONE)</option>
                  <option value="PHASE" className="bg-[#141414]">📁 專案階段 (PHASE)</option>
                  <option value="TASK" className="bg-[#141414]">📋 任務 (TASK)</option>
                  <option value="FEATURE" className="bg-[#141414]">✨ 功能需求 (FEATURE)</option>
                  <option value="BUG" className="bg-[#141414]">🐞 缺陷異常 (BUG)</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[#888888] font-display text-[10px] uppercase tracking-wider mb-1">
                  優先等級 (PRIORITY)
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full px-2.5 py-2 rounded-none bg-[#0A0A0A] border border-[#D4AF37]/40 text-[#F2F0E4] font-medium focus:border-[#D4AF37] focus:outline-hidden"
                >
                  <option value="HIGH" className="bg-[#141414] text-[#E07A5F]">PRIORITY I • 高優先級 (High)</option>
                  <option value="MEDIUM" className="bg-[#141414] text-[#D4AF37]">PRIORITY II • 中等優先 (Medium)</option>
                  <option value="LOW" className="bg-[#141414] text-[#78A1BB]">PRIORITY III • 低優先級 (Low)</option>
                </select>
              </div>

              {/* Start & Due Dates for Gantt */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#888888] font-display text-[10px] uppercase tracking-wider mb-1">開始日期</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-none bg-[#0A0A0A] border border-[#D4AF37]/40 text-[#F2F0E4] text-xs focus:border-[#D4AF37] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#888888] font-display text-[10px] uppercase tracking-wider mb-1">截止日期</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-none bg-[#0A0A0A] border border-[#D4AF37]/40 text-[#F2F0E4] text-xs focus:border-[#D4AF37] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Progress Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#888888] font-display text-[10px] uppercase tracking-wider">完成進度 (%)</label>
                  <span className="font-mono font-bold text-[#D4AF37]">{progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-[#888888] font-display text-[10px] uppercase tracking-wider mb-1">
                  主要負責人 (ASSIGNEE)
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-none bg-[#0A0A0A] border border-[#D4AF37]/40 text-[#F2F0E4] focus:border-[#D4AF37] focus:outline-hidden"
                >
                  <option value="" className="bg-[#141414]">未指派</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id} className="bg-[#141414]">
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Collaborators */}
              <div>
                <label className="block text-[#888888] font-display text-[10px] uppercase tracking-wider mb-1">
                  協作者名單 (COLLABORATORS)
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-[#0A0A0A] rounded-none border border-[#D4AF37]/30">
                  {users.map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-[#241F10] p-1 rounded-none transition"
                    >
                      <input
                        type="checkbox"
                        checked={collaboratorIds.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCollaboratorIds([...collaboratorIds, u.id]);
                          } else {
                            setCollaboratorIds(collaboratorIds.filter((id) => id !== u.id));
                          }
                        }}
                        className="rounded-none border-[#D4AF37]/60 text-[#D4AF37] focus:ring-0 accent-[#D4AF37]"
                      />
                      <span className="text-[#F2F0E4] truncate text-xs">{u.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[#888888] font-display text-[10px] uppercase tracking-wider mb-1">
                  標籤 TAGS (逗號分隔)
                </label>
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="前端, EDI, 資安, 合規"
                  className="w-full px-2.5 py-1.5 rounded-none bg-[#0A0A0A] border border-[#D4AF37]/40 text-[#F2F0E4] focus:border-[#D4AF37] focus:outline-hidden"
                />
              </div>

              {/* Timestamps info */}
              <div className="pt-3 border-t border-[#D4AF37]/20 text-[10px] text-[#888888] font-mono space-y-1">
                <div>建立時間：{new Date(task.created_at).toLocaleString('zh-TW')}</div>
                <div>更新時間：{new Date(task.updated_at).toLocaleString('zh-TW')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
