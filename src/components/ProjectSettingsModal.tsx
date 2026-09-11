import React, { useState } from 'react';
import {
  X,
  Settings,
  Plus,
  Trash2,
  Users,
  Calendar,
  Layers,
  Shield,
  Save,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KanbanColumn, Project } from '../types';

export const ProjectSettingsModal: React.FC = () => {
  const {
    currentProject,
    updateProject,
    columns,
    addColumn,
    updateColumn,
    deleteColumn,
    users,
    isProjectSettingsOpen,
    setIsProjectSettingsOpen,
    canEditProject,
    canConfigureColumns,
  } = useApp();

  const [title, setTitle] = useState(currentProject.title);
  const [description, setDescription] = useState(currentProject.description);
  const [startDate, setStartDate] = useState(currentProject.start_date);
  const [endDate, setEndDate] = useState(currentProject.end_date);
  const [memberIds, setMemberIds] = useState<string[]>(currentProject.member_ids);
  const [savedToast, setSavedToast] = useState(false);

  // Column add state
  const [newColName, setNewColName] = useState('');
  const [newColColor, setNewColColor] = useState('#3b82f6');

  if (!isProjectSettingsOpen) return null;

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject({
      ...currentProject,
      title: title.trim(),
      description: description.trim(),
      start_date: startDate,
      end_date: endDate,
      member_ids: memberIds,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    addColumn(newColName.trim(), newColColor);
    setNewColName('');
  };

  const toggleMember = (userId: string) => {
    if (memberIds.includes(userId)) {
      if (memberIds.length <= 1) {
        alert('專案至少需要有一位成員！');
        return;
      }
      setMemberIds(memberIds.filter((id) => id !== userId));
    } else {
      setMemberIds([...memberIds, userId]);
    }
  };

  return (
    <div
      id="project-settings-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={() => setIsProjectSettingsOpen(false)}
    >
      <div
        id="project-settings-dialog"
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0A0A0A] rounded-none shadow-2xl border-2 border-[#D4AF37]/50 glow-gold overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Stepped Corner Brackets */}
        <span className="corner-bracket-tl" />
        <span className="corner-bracket-tr" />
        <span className="corner-bracket-bl" />
        <span className="corner-bracket-br" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141414] border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-sm font-display font-bold uppercase tracking-widest text-[#F2F0E4]">
              專案設置與看板欄位管理 (PROJECT CONFIGURATION)
            </h3>
          </div>
          <button
            onClick={() => setIsProjectSettingsOpen(false)}
            className="p-1.5 text-[#888888] hover:text-[#D4AF37] hover:bg-[#241F10] rounded-none transition cursor-pointer border border-transparent hover:border-[#D4AF37]/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 art-deco-bg">
          {savedToast && (
            <div className="p-3 bg-[#241F10] border border-[#D4AF37] text-[#D4AF37] text-xs rounded-none flex items-center gap-2">
              <Check className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-display uppercase tracking-wider">專案設置已成功儲存！</span>
            </div>
          )}

          {/* Project Details Form */}
          <form onSubmit={handleSaveProject} className="space-y-4">
            <h4 className="text-[11px] font-display font-bold text-[#D4AF37] uppercase tracking-widest pb-1 border-b border-[#D4AF37]/20">
              基本資訊 (PROJECT METADATA)
            </h4>

            <div>
              <label className="block text-[10px] font-display uppercase tracking-widest text-[#D4AF37] mb-1">
                專案名稱 (TITLE)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canEditProject}
                className="w-full text-xs px-3.5 py-2.5 rounded-none border border-[#D4AF37]/40 bg-[#141414] text-[#F2F0E4] focus:outline-hidden focus:border-[#D4AF37] disabled:opacity-50 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-display uppercase tracking-widest text-[#D4AF37] mb-1">
                專案目標與說明 (DESCRIPTION)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canEditProject}
                rows={3}
                className="w-full text-xs px-3.5 py-2.5 rounded-none border border-[#D4AF37]/40 bg-[#141414] text-[#F2F0E4] focus:outline-hidden focus:border-[#D4AF37] leading-relaxed disabled:opacity-50 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-display uppercase tracking-widest text-[#D4AF37] mb-1">
                  起始日期
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={!canEditProject}
                  className="w-full text-xs px-3 py-2 rounded-none border border-[#D4AF37]/40 bg-[#141414] text-[#F2F0E4] focus:border-[#D4AF37] focus:outline-hidden disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-display uppercase tracking-widest text-[#D4AF37] mb-1">
                  預計結束日期
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={!canEditProject}
                  className="w-full text-xs px-3 py-2 rounded-none border border-[#D4AF37]/40 bg-[#141414] text-[#F2F0E4] focus:border-[#D4AF37] focus:outline-hidden disabled:opacity-50"
                />
              </div>
            </div>

            {/* Member List */}
            <div>
              <label className="block text-[10px] font-display uppercase tracking-widest text-[#D4AF37] mb-2">
                參與團隊成員名單 (MEMBER ACCESS)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2 bg-[#0A0A0A] rounded-none border border-[#D4AF37]/30 text-xs">
                {users.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2.5 p-2 bg-[#141414] rounded-none border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={memberIds.includes(u.id)}
                      onChange={() => toggleMember(u.id)}
                      disabled={!canEditProject}
                      className="rounded-none border-[#D4AF37]/60 text-[#D4AF37] accent-[#D4AF37] focus:ring-0"
                    />
                    <img
                      src={u.avatar_url}
                      alt={u.name}
                      className="w-6 h-6 rounded-none object-cover border border-[#D4AF37]/40"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-[#F2F0E4] font-serif truncate">{u.name}</div>
                      <div className="text-[10px] text-[#888888] font-mono">{u.role} • {u.department}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {canEditProject && (
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-none bg-[#D4AF37] hover:bg-[#F2E8C4] text-[#0A0A0A] text-xs font-display uppercase tracking-widest font-bold transition cursor-pointer border border-[#D4AF37]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>儲存專案設定</span>
              </button>
            )}
          </form>

          {/* Kanban Columns Management (Section 4.1) */}
          <div className="pt-6 border-t border-[#D4AF37]/30 space-y-4">
            <h4 className="text-[11px] font-display font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#D4AF37]" /> 看板工作流程欄位 (KANBAN WORKFLOW COLUMNS)
            </h4>

            <div className="space-y-2">
              {columns.map((col, idx) => (
                <div
                  key={col.id}
                  className="flex items-center justify-between p-3 bg-[#141414] rounded-none border border-[#D4AF37]/30 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#D4AF37] font-bold w-4">
                      {idx + 1}
                    </span>
                    <input
                      type="color"
                      value={col.color || '#D4AF37'}
                      onChange={(e) => updateColumn(col.id, col.name, e.target.value)}
                      disabled={!canConfigureColumns}
                      className="w-6 h-6 rounded-none border border-[#D4AF37]/40 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => updateColumn(col.id, e.target.value)}
                      disabled={!canConfigureColumns}
                      className="px-2.5 py-1 rounded-none bg-[#0A0A0A] border border-[#D4AF37]/40 font-display uppercase tracking-wider text-[#F2F0E4] w-48 focus:border-[#D4AF37] focus:outline-hidden"
                    />
                  </div>

                  {canConfigureColumns && columns.length > 1 && (
                    <button
                      onClick={() => deleteColumn(col.id)}
                      className="p-1.5 text-[#888888] hover:text-[#E07A5F] hover:bg-[#2A1414] rounded-none transition cursor-pointer border border-transparent hover:border-[#E07A5F]/40"
                      title="刪除欄位"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Column Inline */}
            {canConfigureColumns && (
              <form onSubmit={handleAddColumn} className="flex items-center gap-2 pt-2 text-xs">
                <input
                  type="color"
                  value={newColColor}
                  onChange={(e) => setNewColColor(e.target.value)}
                  className="w-8 h-8 rounded-none border border-[#D4AF37]/40 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  placeholder="新欄位名稱 (例如：QA 驗證中)..."
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-none border border-[#D4AF37]/40 bg-[#141414] text-[#F2F0E4] focus:outline-hidden focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  disabled={!newColName.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-none bg-[#241F10] border border-[#D4AF37]/60 hover:bg-[#D4AF37] hover:text-[#0A0A0A] text-[#D4AF37] font-display uppercase tracking-wider font-bold transition cursor-pointer disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                  <span>新增欄位</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
