import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Clock,
  Sparkles,
  User,
  Users,
  Calendar,
  Save,
  Check,
  RotateCcw,
  GitPullRequest,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RFI, RFIStatus, RFICategory, PriorityLevel } from '../types';
import { AttachmentManager } from './AttachmentManager';
import { CommentSection } from './CommentSection';

export const RfiModal: React.FC = () => {
  const {
    rfis,
    selectedRfiId,
    setSelectedRfiId,
    isRfiModalOpen,
    setIsRfiModalOpen,
    createRfi,
    updateRfi,
    updateRfiStatus,
    generateTaskFromRfi,
    tasks,
    users,
    currentUser,
    setSelectedTaskId,
    setIsTaskModalOpen,
    canAnswerRfi,
  } = useApp();

  const isCreatingNew = selectedRfiId === 'NEW' || (selectedRfiId && selectedRfiId.startsWith('NEW_FOR_TASK_'));
  const prefilledTaskId = selectedRfiId?.startsWith('NEW_FOR_TASK_')
    ? selectedRfiId.replace('NEW_FOR_TASK_', '')
    : undefined;

  const existingRfi = rfis.find((r) => r.id === selectedRfiId);

  // Form states
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState<RFICategory>('TECHNICAL');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('user-pm');
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<RFIStatus>('OPEN');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [taskGeneratedToast, setTaskGeneratedToast] = useState(false);

  useEffect(() => {
    if (existingRfi) {
      setTitle(existingRfi.title);
      setQuestion(existingRfi.question);
      setAnswer(existingRfi.answer || '');
      setCategory(existingRfi.category);
      setPriority(existingRfi.priority);
      setAssigneeId(existingRfi.assignee_id);
      setCollaboratorIds(existingRfi.collaborator_ids || []);
      setDueDate(existingRfi.due_date || '');
      setStatus(existingRfi.status);
    } else if (isCreatingNew) {
      setTitle('');
      setQuestion('');
      setAnswer('');
      setCategory('TECHNICAL');
      setPriority('MEDIUM');
      setAssigneeId('user-pm');
      setCollaboratorIds([]);
      setDueDate(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
      setStatus('OPEN');
    }
  }, [existingRfi, isCreatingNew]);

  if (!isRfiModalOpen || (!existingRfi && !isCreatingNew)) return null;

  const handleClose = () => {
    setIsRfiModalOpen(false);
    setSelectedRfiId(null);
  };

  const handleSaveOrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !question.trim()) {
      alert('請填寫 RFI 主旨與詳細提問內容！');
      return;
    }

    if (isCreatingNew) {
      const created = createRfi({
        title: title.trim(),
        question: question.trim(),
        answer: answer.trim(),
        category,
        priority,
        assignee_id: assigneeId,
        collaborator_ids: collaboratorIds,
        due_date: dueDate,
        status,
        task_id: prefilledTaskId,
      });
      setSelectedRfiId(created.id);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } else if (existingRfi) {
      const updated: RFI = {
        ...existingRfi,
        title: title.trim(),
        question: question.trim(),
        answer: answer.trim(),
        category,
        priority,
        assignee_id: assigneeId,
        collaborator_ids: collaboratorIds,
        due_date: dueDate,
        status,
      };
      updateRfi(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  // Status progression action handler
  const handleTransitionStatus = (nextStatus: RFIStatus) => {
    if (!existingRfi) return;
    updateRfiStatus(existingRfi.id, nextStatus, answer);
    setStatus(nextStatus);
  };

  // Bi-directional link: Generate Task from RFI
  const handleGenerateTask = () => {
    if (!existingRfi) return;
    const newTask = generateTaskFromRfi(existingRfi.id);
    setTaskGeneratedToast(true);
    setTimeout(() => setTaskGeneratedToast(false), 3000);
  };

  const linkedTask = existingRfi?.task_id
    ? tasks.find((t) => t.id === existingRfi.task_id)
    : null;

  // Status Flow Pipeline Definition
  const statusSteps: { key: RFIStatus; label: string }[] = [
    { key: 'DRAFT', label: '草稿' },
    { key: 'OPEN', label: '已提出' },
    { key: 'UNDER_REVIEW', label: '處理中' },
    { key: 'ANSWERED', label: '已答覆' },
    { key: 'CLOSED', label: '已結案' },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === status);

  return (
    <div
      id="rfi-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        id="rfi-modal-dialog"
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
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-3 py-1 rounded-none bg-[#241F10] text-[#D4AF37] border border-[#D4AF37]/60">
              {existingRfi?.rfi_code || 'NEW RFI'}
            </span>
            <span className="text-xs font-display uppercase tracking-widest text-[#F2F0E4]">
              {isCreatingNew ? '建立新的 RFI 請示單據' : 'RFI 需求請示與答覆追蹤'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-[#D4AF37] font-display uppercase tracking-wider flex items-center gap-1 bg-[#241F10] px-3 py-1 rounded-none border border-[#D4AF37]/40">
                <Check className="w-3.5 h-3.5" /> 已成功儲存！
              </span>
            )}
            <button
              onClick={handleSaveOrSubmit}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-none bg-[#D4AF37] hover:bg-[#F2E8C4] text-[#0A0A0A] text-xs font-display uppercase tracking-widest font-bold transition cursor-pointer border border-[#D4AF37]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isCreatingNew ? '送出 RFI' : '儲存變更'}</span>
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-none flex items-center justify-center text-[#888888] hover:text-[#D4AF37] hover:bg-[#241F10] border border-transparent hover:border-[#D4AF37]/40 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Lifecycle Flow Visualizer */}
        {!isCreatingNew && (
          <div className="px-6 py-3 bg-[#0A0A0A] border-b border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-4">
            {/* Step Pipeline */}
            <div className="flex items-center gap-1 sm:gap-2 text-xs">
              {statusSteps.map((step, idx) => {
                const isActive = step.key === status;
                const isPassed = currentStepIndex > idx;

                return (
                  <React.Fragment key={step.key}>
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-display uppercase tracking-wider transition ${
                        isActive
                          ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold border border-[#D4AF37]'
                          : isPassed
                          ? 'bg-[#241F10] text-[#D4AF37] border border-[#D4AF37]/40'
                          : 'bg-[#141414] text-[#888888] border border-[#333333]'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                      ) : (
                        <span className="w-3 h-3 flex items-center justify-center text-[10px] font-mono">
                          {idx + 1}
                        </span>
                      )}
                      <span>{step.label}</span>
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <span className="text-[#D4AF37]/50 font-bold">›</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Transition Action Buttons */}
            {canAnswerRfi && (
              <div className="flex items-center gap-2">
                {status === 'DRAFT' && (
                  <button
                    onClick={() => handleTransitionStatus('OPEN')}
                    className="px-3.5 py-1 text-xs font-display uppercase tracking-wider font-bold bg-[#D4AF37] text-[#0A0A0A] rounded-none hover:bg-[#F2E8C4] transition cursor-pointer"
                  >
                    提出此單 (Open)
                  </button>
                )}
                {status === 'OPEN' && (
                  <button
                    onClick={() => handleTransitionStatus('UNDER_REVIEW')}
                    className="px-3.5 py-1 text-xs font-display uppercase tracking-wider font-bold bg-[#D4AF37] text-[#0A0A0A] rounded-none hover:bg-[#F2E8C4] transition cursor-pointer"
                  >
                    開始審核處理 (Under Review)
                  </button>
                )}
                {status === 'UNDER_REVIEW' && (
                  <button
                    onClick={() => handleTransitionStatus('ANSWERED')}
                    className="px-3.5 py-1 text-xs font-display uppercase tracking-wider font-bold bg-[#6e8574] text-[#F2F0E4] rounded-none hover:bg-[#5b7361] border border-[#6e8574] transition cursor-pointer"
                  >
                    完成正式答覆 (Answered)
                  </button>
                )}
                {status === 'ANSWERED' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTransitionStatus('CLOSED')}
                      className="px-3.5 py-1 text-xs font-display uppercase tracking-wider font-bold bg-[#241F10] text-[#D4AF37] border border-[#D4AF37] rounded-none hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition cursor-pointer"
                    >
                      審查通過並結案 (Close)
                    </button>
                    <button
                      onClick={() => handleTransitionStatus('REOPENED')}
                      className="px-3 py-1 text-xs font-display uppercase tracking-wider text-[#E07A5F] hover:bg-[#2A1414] rounded-none border border-[#E07A5F]/60 transition cursor-pointer"
                    >
                      需退回補充 (Reopen)
                    </button>
                  </div>
                )}
                {status === 'REOPENED' && (
                  <button
                    onClick={() => handleTransitionStatus('UNDER_REVIEW')}
                    className="px-3.5 py-1 text-xs font-display uppercase tracking-wider font-bold bg-[#D4AF37] text-[#0A0A0A] rounded-none hover:bg-[#F2E8C4] transition cursor-pointer"
                  >
                    重新審核答覆
                  </button>
                )}
                {status === 'CLOSED' && (
                  <button
                    onClick={() => handleTransitionStatus('REOPENED')}
                    className="px-3 py-1 text-xs font-display uppercase tracking-wider text-[#888888] hover:text-[#D4AF37] hover:bg-[#241F10] rounded-none border border-[#D4AF37]/40 transition cursor-pointer"
                  >
                    重新開啟 (Reopen)
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 art-deco-bg">
          {/* Linked Task Bar / Generate Task Banner */}
          {!isCreatingNew && (
            <div className="p-4 bg-[#141414] rounded-none border border-[#D4AF37]/40 flex flex-wrap items-center justify-between gap-3 relative">
              <span className="corner-bracket-tl" />
              <span className="corner-bracket-br" />
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-none bg-[#241F10] border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center shrink-0">
                  <GitPullRequest className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-display uppercase tracking-widest text-[#D4AF37]">
                    看板任務雙向整合 (Kanban Link)
                  </h4>
                  <p className="text-[11px] text-[#F2F0E4]/80 font-sans">
                    {linkedTask ? (
                      <>
                        已關聯執行任務：
                        <span className="font-semibold text-[#D4AF37] ml-1">
                          {linkedTask.title}
                        </span>
                      </>
                    ) : (
                      '此 RFI 尚未建立看板卡片，可一鍵自動生成對應的開發/執行任務。'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {linkedTask ? (
                  <button
                    onClick={() => {
                      setIsRfiModalOpen(false);
                      setSelectedTaskId(linkedTask.id);
                      setIsTaskModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-[#241F10] border border-[#D4AF37]/60 text-[#D4AF37] text-xs font-display uppercase tracking-wider font-semibold hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition cursor-pointer"
                  >
                    <span>開啟對應看板任務</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleGenerateTask}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-none bg-[#D4AF37] hover:bg-[#F2E8C4] text-[#0A0A0A] text-xs font-display uppercase tracking-wider font-bold transition cursor-pointer border border-[#D4AF37]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>自動生成對應執行任務卡片</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {taskGeneratedToast && (
            <div className="p-3 bg-[#241F10] border border-[#D4AF37] text-[#D4AF37] text-xs rounded-none flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>
                成功！已自動於看板建立對應任務卡片，並建立雙向關聯標籤。
              </span>
            </div>
          )}

          {/* Form Layout: Left question/answer, Right metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-[10px] font-display uppercase tracking-widest text-[#D4AF37] mb-1.5">
                  RFI 主旨 (TITLE) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：海關申報匯出格式需採用 XML 還是標準 REST JSON？"
                  className="w-full text-base font-serif font-bold text-[#F2F0E4] bg-[#141414] px-4 py-2.5 rounded-none border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-hidden transition"
                />
              </div>

              {/* Question / Description */}
              <div>
                <label className="block text-[10px] font-display uppercase tracking-widest text-[#D4AF37] mb-1.5">
                  詳細描述 / 請示提問內容 (QUESTION) *
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="請清楚描述待確認之技術架構、業務範疇邊界、時程或預算請示細節..."
                  rows={5}
                  className="w-full text-xs text-[#F2F0E4] bg-[#141414] leading-relaxed px-4 py-3 rounded-none border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-hidden transition resize-y"
                />
              </div>

              {/* Official Answer Section */}
              <div className="p-4 bg-[#141414] rounded-none border border-[#6e8574]/60 space-y-2 relative">
                <span className="corner-bracket-tl" />
                <span className="corner-bracket-br" />
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-display uppercase tracking-widest text-[#7FB069]">
                    官方正式答覆 (OFFICIAL ANSWER)
                  </label>
                  {existingRfi?.answered_at && (
                    <span className="text-[10px] text-[#7FB069] font-mono">
                      答覆時間：{new Date(existingRfi.answered_at).toLocaleDateString('zh-TW')}
                    </span>
                  )}
                </div>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={
                    canAnswerRfi
                      ? '在此填寫專案經理或客戶之裁決與正式答覆內容...'
                      : '尚無官方答覆（僅管理者、PM 或被指派者可填寫）'
                  }
                  disabled={!canAnswerRfi}
                  rows={4}
                  className="w-full text-xs text-[#F2F0E4] leading-relaxed px-3.5 py-2.5 rounded-none border border-[#6e8574]/40 bg-[#0A0A0A] focus:border-[#7FB069] focus:outline-hidden transition disabled:opacity-50"
                />
              </div>

              {/* Attachments for RFI */}
              {existingRfi && (
                <AttachmentManager targetType="RFI" targetId={existingRfi.id} />
              )}

              {/* Comments for RFI */}
              {existingRfi && (
                <CommentSection targetType="RFI" targetId={existingRfi.id} />
              )}
            </div>

            {/* Right Meta Column */}
            <div className="space-y-4 bg-[#141414] p-4 rounded-none border border-[#D4AF37]/40 text-xs text-[#F2F0E4] relative">
              <span className="corner-bracket-tr" />
              <span className="corner-bracket-bl" />
              <h4 className="font-display font-bold text-[#D4AF37] uppercase tracking-widest text-[11px] pb-2 border-b border-[#D4AF37]/30">
                單據分類與指派 (PROPERTIES)
              </h4>

              {/* Status (if new) */}
              {isCreatingNew && (
                <div>
                  <label className="block text-[#888888] font-display text-[10px] uppercase tracking-wider mb-1">初建立狀態</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RFIStatus)}
                    className="w-full px-2.5 py-2 rounded-none bg-[#0A0A0A] border border-[#D4AF37]/40 text-[#F2F0E4] focus:border-[#D4AF37] focus:outline-hidden"
                  >
                    <option value="OPEN" className="bg-[#141414]">已提出 (Open)</option>
                    <option value="DRAFT" className="bg-[#141414]">存為草稿 (Draft)</option>
                  </select>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-[#888888] font-display text-[10px] uppercase tracking-wider mb-1">提問類別 (CATEGORY) *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RFICategory)}
                  className="w-full px-2.5 py-2 rounded-none bg-[#0A0A0A] border border-[#D4AF37]/40 text-[#F2F0E4] font-medium focus:border-[#D4AF37] focus:outline-hidden"
                >
                  <option value="TECHNICAL" className="bg-[#141414]">技術問題 (Technical)</option>
                  <option value="SCOPE" className="bg-[#141414]">範疇確認 (Scope)</option>
                  <option value="BUDGET" className="bg-[#141414]">預算異動 (Budget)</option>
                  <option value="DESIGN" className="bg-[#141414]">設計與介面 (Design)</option>
                  <option value="SCHEDULE" className="bg-[#141414]">時程安排 (Schedule)</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[#888888] font-display text-[10px] uppercase tracking-wider mb-1">優先程度 (PRIORITY) *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full px-2.5 py-2 rounded-none bg-[#0A0A0A] border border-[#D4AF37]/40 text-[#F2F0E4] font-medium focus:border-[#D4AF37] focus:outline-hidden"
                >
                  <option value="HIGH" className="bg-[#141414] text-[#E07A5F]">PRIORITY I • 高優先度 (High)</option>
                  <option value="MEDIUM" className="bg-[#141414] text-[#D4AF37]">PRIORITY II • 中等優先 (Medium)</option>
                  <option value="LOW" className="bg-[#141414] text-[#78A1BB]">PRIORITY III • 低優先度 (Low)</option>
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-[#888888] font-display text-[10px] uppercase tracking-wider mb-1">被指派解答人 (ASSIGNEE) *</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-none bg-[#0A0A0A] border border-[#D4AF37]/40 text-[#F2F0E4] focus:border-[#D4AF37] focus:outline-hidden"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id} className="bg-[#141414]">
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Creator Info */}
              <div>
                <label className="block text-[#888888] font-display text-[10px] uppercase tracking-wider mb-1">提問人 (CREATOR)</label>
                <div className="p-2 bg-[#0A0A0A] rounded-none border border-[#D4AF37]/30 flex items-center gap-2">
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-none object-cover border border-[#D4AF37]/40"
                  />
                  <span className="text-[#F2F0E4] font-medium font-serif">
                    {existingRfi
                      ? users.find((u) => u.id === existingRfi.creator_id)?.name || '提問人'
                      : currentUser.name}
                  </span>
                </div>
              </div>

              {/* Collaborators */}
              <div>
                <label className="block text-[#888888] font-display text-[10px] uppercase tracking-wider mb-1">
                  協作與關注人員
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 bg-[#0A0A0A] rounded-none border border-[#D4AF37]/30">
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

              {/* Due Date */}
              <div>
                <label className="block text-[#888888] font-display text-[10px] uppercase tracking-wider mb-1">期望解答期限 (DUE DATE)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-none bg-[#0A0A0A] border border-[#D4AF37]/40 text-[#F2F0E4] focus:border-[#D4AF37] focus:outline-hidden"
                />
              </div>

              {existingRfi && (
                <div className="pt-3 border-t border-[#D4AF37]/20 text-[10px] text-[#888888] font-mono space-y-1">
                  <div>提出時間：{new Date(existingRfi.created_at).toLocaleString('zh-TW')}</div>
                  {existingRfi.closed_at && (
                    <div>結案時間：{new Date(existingRfi.closed_at).toLocaleString('zh-TW')}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
