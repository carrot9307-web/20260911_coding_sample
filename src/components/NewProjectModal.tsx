import React, { useState } from 'react';
import { X, FolderPlus, Calendar, Users, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NewProjectModal: React.FC = () => {
  const {
    isNewProjectModalOpen,
    setIsNewProjectModalOpen,
    createProject,
    users,
    currentUser,
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
  );
  const [memberIds, setMemberIds] = useState<string[]>([
    currentUser.id,
    'user-pm',
    'user-frontend',
  ]);

  if (!isNewProjectModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('請輸入專案名稱！');
      return;
    }

    createProject({
      title: title.trim(),
      description: description.trim(),
      start_date: startDate,
      end_date: endDate,
      member_ids: memberIds,
    });

    setIsNewProjectModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const toggleMember = (userId: string) => {
    if (memberIds.includes(userId)) {
      setMemberIds(memberIds.filter((id) => id !== userId));
    } else {
      setMemberIds([...memberIds, userId]);
    }
  };

  return (
    <div
      id="new-project-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={() => setIsNewProjectModalOpen(false)}
    >
      <div
        id="new-project-dialog"
        className="relative w-full max-w-xl bg-[#0A0A0A] rounded-none shadow-2xl border-2 border-[#D4AF37]/50 glow-gold overflow-hidden my-auto"
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
            <FolderPlus className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-sm font-display font-bold uppercase tracking-widest text-[#F2F0E4]">
              建立全新管理專案 (CREATE PROJECT)
            </h3>
          </div>
          <button
            onClick={() => setIsNewProjectModalOpen(false)}
            className="p-1.5 text-[#888888] hover:text-[#D4AF37] hover:bg-[#241F10] rounded-none transition cursor-pointer border border-transparent hover:border-[#D4AF37]/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs art-deco-bg">
          <div>
            <label className="block font-display text-[10px] uppercase tracking-widest text-[#D4AF37] mb-1.5">
              專案名稱 (PROJECT TITLE) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：全球電子商務高併發微服務改版"
              className="w-full text-xs px-3.5 py-2.5 rounded-none border border-[#D4AF37]/40 bg-[#141414] text-[#F2F0E4] focus:outline-hidden focus:border-[#D4AF37] transition"
            />
          </div>

          <div>
            <label className="block font-display text-[10px] uppercase tracking-widest text-[#D4AF37] mb-1.5">
              專案簡介與驗收目標 (DESCRIPTION)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="簡要描述專案範疇、關鍵交付項目與團隊協作目標..."
              className="w-full text-xs px-3.5 py-2.5 rounded-none border border-[#D4AF37]/40 bg-[#141414] text-[#F2F0E4] focus:outline-hidden focus:border-[#D4AF37] leading-relaxed transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-display text-[10px] uppercase tracking-widest text-[#D4AF37] mb-1.5">
                起始日期
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-none border border-[#D4AF37]/40 bg-[#141414] text-[#F2F0E4] text-xs focus:border-[#D4AF37] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-display text-[10px] uppercase tracking-widest text-[#D4AF37] mb-1.5">
                預計結束日期
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-none border border-[#D4AF37]/40 bg-[#141414] text-[#F2F0E4] text-xs focus:border-[#D4AF37] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-display text-[10px] uppercase tracking-widest text-[#D4AF37] mb-1.5">
              選擇專案初始成員 (MEMBERS)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-[#0A0A0A] rounded-none border border-[#D4AF37]/30">
              {users.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center gap-2 p-1.5 bg-[#141414] rounded-none border border-[#D4AF37]/20 cursor-pointer hover:bg-[#241F10] transition"
                >
                  <input
                    type="checkbox"
                    checked={memberIds.includes(u.id)}
                    onChange={() => toggleMember(u.id)}
                    className="rounded-none border-[#D4AF37]/60 text-[#D4AF37] accent-[#D4AF37]"
                  />
                  <span className="truncate text-[#F2F0E4] text-xs">{u.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#D4AF37]/30 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(false)}
              className="px-4 py-1.5 rounded-none border border-[#D4AF37]/40 text-[#888888] font-display uppercase tracking-wider text-xs hover:text-[#D4AF37] hover:bg-[#241F10] transition cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-none bg-[#D4AF37] hover:bg-[#F2E8C4] text-[#0A0A0A] font-display uppercase tracking-widest text-xs font-bold transition cursor-pointer border border-[#D4AF37]"
            >
              建立專案
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
