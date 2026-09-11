import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Layers,
  Table,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Tag,
  ArrowRight,
  GitPullRequest,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RFI, RFIStatus, RFICategory, PriorityLevel } from '../types';

export const RfiTracker: React.FC = () => {
  const {
    rfis,
    filteredRfis,
    users,
    tasks,
    setSelectedRfiId,
    setIsRfiModalOpen,
    canCreateRfi,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'ALL' | RFIStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | RFICategory>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'BOARD'>('TABLE');

  const displayRfis = filteredRfis.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
    if (assigneeFilter !== 'ALL' && r.assignee_id !== assigneeFilter) return false;
    return true;
  });

  const getStatusBadge = (status: RFIStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-display uppercase tracking-widest px-2 py-0.5 rounded-none bg-[#141414] text-[#888888] border border-[#D4AF37]/30">
            <Clock className="w-3 h-3 text-[#888888]" /> 草稿 (Draft)
          </span>
        );
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-display uppercase tracking-widest px-2 py-0.5 rounded-none bg-[#2A1414] text-[#E07A5F] border border-[#E07A5F]">
            <AlertCircle className="w-3 h-3 text-[#E07A5F]" /> 已提出 (Open)
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-display uppercase tracking-widest px-2 py-0.5 rounded-none bg-[#241F10] text-[#D4AF37] border border-[#D4AF37]">
            <Clock className="w-3 h-3 text-[#D4AF37]" /> 審查中 (Review)
          </span>
        );
      case 'ANSWERED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-display uppercase tracking-widest px-2 py-0.5 rounded-none bg-[#102418] text-[#81C784] border border-[#81C784]">
            <CheckCircle2 className="w-3 h-3 text-[#81C784]" /> 已答覆 (Answered)
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-display uppercase tracking-widest px-2 py-0.5 rounded-none bg-[#0A0A0A] text-[#888888] border border-[#D4AF37]/20">
            <CheckCircle2 className="w-3 h-3 text-[#888888]" /> 已結案 (Closed)
          </span>
        );
      case 'REOPENED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-display uppercase tracking-widest px-2 py-0.5 rounded-none bg-[#2A1414] text-[#E07A5F] border border-[#E07A5F]">
            <AlertCircle className="w-3 h-3 text-[#E07A5F]" /> 需補充 (Reopened)
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: RFICategory) => {
    switch (cat) {
      case 'TECHNICAL':
        return <span className="text-[9px] font-display uppercase tracking-widest px-1.5 py-0.2 rounded-none bg-[#101924] text-[#78A1BB] border border-[#78A1BB]">技術</span>;
      case 'SCOPE':
        return <span className="text-[9px] font-display uppercase tracking-widest px-1.5 py-0.2 rounded-none bg-[#1E3D59] text-[#D4AF37] border border-[#D4AF37]/50">範疇</span>;
      case 'BUDGET':
        return <span className="text-[9px] font-display uppercase tracking-widest px-1.5 py-0.2 rounded-none bg-[#241F10] text-[#D4AF37] border border-[#D4AF37]">預算</span>;
      case 'DESIGN':
        return <span className="text-[9px] font-display uppercase tracking-widest px-1.5 py-0.2 rounded-none bg-[#1F1424] text-[#D1A3FF] border border-[#D1A3FF]/60">設計</span>;
      case 'SCHEDULE':
        return <span className="text-[9px] font-display uppercase tracking-widest px-1.5 py-0.2 rounded-none bg-[#241B10] text-[#E0A96D] border border-[#E0A96D]">時程</span>;
    }
  };

  const getPriorityBadge = (p: PriorityLevel) => {
    if (p === 'HIGH') return <span className="text-[10px] font-display uppercase tracking-wider text-[#E07A5F] font-bold">◆ 高度緊急</span>;
    if (p === 'MEDIUM') return <span className="text-[10px] font-display uppercase tracking-wider text-[#D4AF37]">◆ 常態研討</span>;
    return <span className="text-[10px] font-display uppercase tracking-wider text-[#888888]">◇ 備查註記</span>;
  };

  // Status metrics counts
  const counts = {
    total: rfis.length,
    open: rfis.filter((r) => r.status === 'OPEN').length,
    underReview: rfis.filter((r) => r.status === 'UNDER_REVIEW').length,
    answered: rfis.filter((r) => r.status === 'ANSWERED').length,
    closed: rfis.filter((r) => r.status === 'CLOSED').length,
  };

  const handleOpenRfi = (rfiId: string) => {
    setSelectedRfiId(rfiId);
    setIsRfiModalOpen(true);
  };

  const handleCreateNewRfi = () => {
    setSelectedRfiId('NEW');
    setIsRfiModalOpen(true);
  };

  return (
    <div id="rfi-tracker-module" className="flex-1 flex flex-col min-h-0 bg-[#0A0A0A] text-[#F2F0E4] art-deco-bg">
      {/* Top Metric Cards */}
      <div className="px-6 py-4 bg-[#141414] border-b border-[#D4AF37]/30">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div
            onClick={() => setStatusFilter('ALL')}
            className={`p-3 rounded-none border transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#1E3D59] text-[#D4AF37] border-[#D4AF37] glow-gold'
                : 'bg-[#0A0A0A] hover:bg-[#1E3D59]/20 border-[#D4AF37]/30 text-[#F2F0E4]'
            }`}
          >
            <div className="text-[10px] font-display uppercase tracking-widest text-[#D4AF37]">全部 RFI 總計</div>
            <div className="text-xl font-serif font-bold mt-0.5">{counts.total}</div>
          </div>

          <div
            onClick={() => setStatusFilter('OPEN')}
            className={`p-3 rounded-none border transition cursor-pointer ${
              statusFilter === 'OPEN'
                ? 'bg-[#2A1414] text-[#E07A5F] border-[#E07A5F] glow-gold'
                : 'bg-[#0A0A0A] hover:bg-[#2A1414]/20 border-[#D4AF37]/30 text-[#E07A5F]'
            }`}
          >
            <div className="text-[10px] font-display uppercase tracking-widest text-[#E07A5F]">已提出 (OPEN)</div>
            <div className="text-xl font-serif font-bold mt-0.5">{counts.open}</div>
          </div>

          <div
            onClick={() => setStatusFilter('UNDER_REVIEW')}
            className={`p-3 rounded-none border transition cursor-pointer ${
              statusFilter === 'UNDER_REVIEW'
                ? 'bg-[#241F10] text-[#D4AF37] border-[#D4AF37] glow-gold'
                : 'bg-[#0A0A0A] hover:bg-[#241F10]/20 border-[#D4AF37]/30 text-[#D4AF37]'
            }`}
          >
            <div className="text-[10px] font-display uppercase tracking-widest text-[#D4AF37]">研議審查 (REVIEW)</div>
            <div className="text-xl font-serif font-bold mt-0.5">{counts.underReview}</div>
          </div>

          <div
            onClick={() => setStatusFilter('ANSWERED')}
            className={`p-3 rounded-none border transition cursor-pointer ${
              statusFilter === 'ANSWERED'
                ? 'bg-[#102418] text-[#81C784] border-[#81C784] glow-gold'
                : 'bg-[#0A0A0A] hover:bg-[#102418]/20 border-[#D4AF37]/30 text-[#81C784]'
            }`}
          >
            <div className="text-[10px] font-display uppercase tracking-widest text-[#81C784]">正式答覆 (ANSWERED)</div>
            <div className="text-xl font-serif font-bold mt-0.5">{counts.answered}</div>
          </div>

          <div
            onClick={() => setStatusFilter('CLOSED')}
            className={`p-3 rounded-none border transition cursor-pointer ${
              statusFilter === 'CLOSED'
                ? 'bg-[#1A1A1A] text-[#D4AF37] border-[#D4AF37]'
                : 'bg-[#0A0A0A] hover:bg-[#141414] border-[#D4AF37]/30 text-[#888888]'
            }`}
          >
            <div className="text-[10px] font-display uppercase tracking-widest text-[#888888]">確認結案 (CLOSED)</div>
            <div className="text-xl font-serif font-bold mt-0.5">{counts.closed}</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, View Toggle, Create Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-[#141414] border-b border-[#D4AF37]/30 font-sans">
        <div className="flex items-center gap-2.5 flex-wrap text-xs">
          <span className="text-[#D4AF37] font-display uppercase tracking-wider text-[11px] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#D4AF37]" /> 條件過濾：
          </span>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-[#0A0A0A] rounded-none text-[#F2F0E4] border border-[#D4AF37]/40 hover:border-[#D4AF37] cursor-pointer focus:outline-hidden"
          >
            <option value="ALL" className="bg-[#141414] text-[#F2F0E4]">全部類別</option>
            <option value="TECHNICAL" className="bg-[#141414] text-[#F2F0E4]">技術 (Technical)</option>
            <option value="SCOPE" className="bg-[#141414] text-[#F2F0E4]">範疇 (Scope)</option>
            <option value="BUDGET" className="bg-[#141414] text-[#F2F0E4]">預算 (Budget)</option>
            <option value="DESIGN" className="bg-[#141414] text-[#F2F0E4]">設計 (Design)</option>
            <option value="SCHEDULE" className="bg-[#141414] text-[#F2F0E4]">時程 (Schedule)</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#0A0A0A] rounded-none text-[#F2F0E4] border border-[#D4AF37]/40 hover:border-[#D4AF37] cursor-pointer focus:outline-hidden"
          >
            <option value="ALL" className="bg-[#141414] text-[#F2F0E4]">全部解答人</option>
            {users.map((u) => (
              <option key={u.id} value={u.id} className="bg-[#141414] text-[#F2F0E4]">
                {u.name}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="inline-flex rounded-none bg-[#0A0A0A] border border-[#D4AF37]/40 p-0.5 text-xs ml-2 font-display">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1 rounded-none uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-[#1E3D59] text-[#D4AF37] border border-[#D4AF37] glow-gold font-bold'
                  : 'text-[#888888] hover:text-[#F2F0E4]'
              }`}
            >
              <Table className="w-3.5 h-3.5" /> 表格清單
            </button>
            <button
              onClick={() => setViewMode('BOARD')}
              className={`px-3 py-1 rounded-none uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'BOARD'
                  ? 'bg-[#1E3D59] text-[#D4AF37] border border-[#D4AF37] glow-gold font-bold'
                  : 'text-[#888888] hover:text-[#F2F0E4]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> 狀態分組卡片
            </button>
          </div>
        </div>

        {/* Action: New RFI Button */}
        {canCreateRfi && (
          <button
            id="btn-create-rfi-header"
            onClick={handleCreateNewRfi}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-none bg-transparent hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0A0A0A] border-2 border-[#D4AF37] text-xs font-display uppercase tracking-widest transition cursor-pointer hover:glow-gold"
          >
            <Plus className="w-4 h-4" />
            <span>提出新 RFI (請示單)</span>
          </button>
        )}
      </div>

      {/* Main Content View */}
      <div className="flex-1 overflow-auto p-6">
        {displayRfis.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center bg-[#141414] border border-[#D4AF37]/30 rounded-none p-8 text-center">
            <div className="w-12 h-12 rotate-45 border-2 border-[#D4AF37]/50 flex items-center justify-center mb-3">
              <HelpCircle className="-rotate-45 w-6 h-6 text-[#D4AF37]" />
            </div>
            <h3 className="text-sm font-serif font-bold text-[#F2F0E4] uppercase tracking-wider">查無相符的 RFI 單據</h3>
            <p className="text-xs text-[#888888] mt-1 max-w-sm">
              可嘗試調整篩選條件，或點擊右上角「提出新 RFI」發起新的技術澄清或範疇確認。
            </p>
          </div>
        ) : viewMode === 'TABLE' ? (
          /* Table View */
          <div className="bg-[#141414] rounded-none border border-[#D4AF37]/30 shadow-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0D0D0D] border-b border-[#D4AF37]/30 text-[#D4AF37] font-display uppercase tracking-widest text-[10px]">
                  <th className="py-3 px-4">RFI 編號</th>
                  <th className="py-3 px-4">主旨與提問摘要</th>
                  <th className="py-3 px-4">類別</th>
                  <th className="py-3 px-4">優先級</th>
                  <th className="py-3 px-4">狀態</th>
                  <th className="py-3 px-4">提問人</th>
                  <th className="py-3 px-4">指派解答人</th>
                  <th className="py-3 px-4">關聯看板任務</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/15">
                {displayRfis.map((rfi) => {
                  const creator = users.find((u) => u.id === rfi.creator_id);
                  const assignee = users.find((u) => u.id === rfi.assignee_id);
                  const linkedTask = tasks.find((t) => t.id === rfi.task_id);

                  return (
                    <tr
                      key={rfi.id}
                      onClick={() => handleOpenRfi(rfi.id)}
                      className="hover:bg-[#1E3D59]/25 cursor-pointer transition"
                    >
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#D4AF37] whitespace-nowrap">
                        {rfi.rfi_code}
                      </td>

                      {/* Title & Question */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-serif font-bold text-[#F2F0E4] line-clamp-1">
                          {rfi.title}
                        </div>
                        <div className="text-[#888888] line-clamp-1 mt-0.5 text-[11px]">
                          {rfi.question}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getCategoryBadge(rfi.category)}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getPriorityBadge(rfi.priority)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(rfi.status)}
                      </td>

                      {/* Creator */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rotate-45 border border-[#D4AF37] overflow-hidden shrink-0 flex items-center justify-center">
                            <img
                              src={creator?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                              alt={creator?.name || '提問人'}
                              className="-rotate-45 w-7 h-7 object-cover max-w-none"
                            />
                          </div>
                          <span className="text-[#F2F0E4]/90 ml-1">{creator?.name.split(' ')[0] || '未指定'}</span>
                        </div>
                      </td>

                      {/* Assignee */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rotate-45 border border-[#D4AF37] overflow-hidden shrink-0 flex items-center justify-center">
                            <img
                              src={assignee?.avatar_url || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80'}
                              alt={assignee?.name || '解答人'}
                              className="-rotate-45 w-7 h-7 object-cover max-w-none"
                            />
                          </div>
                          <span className="text-[#F2F0E4]/90 ml-1">{assignee?.name.split(' ')[0] || '未指派'}</span>
                        </div>
                      </td>

                      {/* Linked Task */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {linkedTask ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#D4AF37] bg-[#0A0A0A] border border-[#D4AF37]/40 px-2 py-0.5 truncate max-w-[140px]" title={linkedTask.title}>
                            <CheckSquare className="w-3 h-3 shrink-0" />
                            <span className="truncate">{linkedTask.title}</span>
                          </span>
                        ) : (
                          <span className="text-[#555555] text-[11px]">無</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRfi(rfi.id);
                          }}
                          className="px-3 py-1 rounded-none bg-[#0A0A0A] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0A0A0A] border border-[#D4AF37]/50 font-display uppercase tracking-wider text-[10px] transition cursor-pointer"
                        >
                          查看單據
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Board Mode (Grouped by status) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['OPEN', 'UNDER_REVIEW', 'ANSWERED', 'CLOSED'] as RFIStatus[]).map((statusGroup) => {
              const groupRfis = displayRfis.filter((r) => r.status === statusGroup);

              return (
                <div key={statusGroup} className="bg-[#141414] rounded-none p-4 border border-[#D4AF37]/30">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D4AF37]/20">
                    <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#D4AF37]">
                      {statusGroup === 'OPEN'
                        ? '已提出 (Open)'
                        : statusGroup === 'UNDER_REVIEW'
                        ? '處理中 (Review)'
                        : statusGroup === 'ANSWERED'
                        ? '已答覆 (Answered)'
                        : '已結案 (Closed)'}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.2 rounded-none bg-[#0A0A0A] border border-[#D4AF37]/30 text-[#D4AF37]">
                      {groupRfis.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {groupRfis.map((rfi) => {
                      const assignee = users.find((u) => u.id === rfi.assignee_id);
                      return (
                        <div
                          key={rfi.id}
                          onClick={() => handleOpenRfi(rfi.id)}
                          className="bg-[#0A0A0A] rounded-none p-3.5 border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:glow-gold cursor-pointer transition space-y-2 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-[#D4AF37]">
                              {rfi.rfi_code}
                            </span>
                            {getPriorityBadge(rfi.priority)}
                          </div>
                          <h4 className="text-xs font-serif font-semibold text-[#F2F0E4] line-clamp-2">
                            {rfi.title}
                          </h4>
                          <div className="flex items-center justify-between pt-2 border-t border-[#D4AF37]/15 text-[10px] text-[#888888]">
                            {getCategoryBadge(rfi.category)}
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rotate-45 border border-[#D4AF37] overflow-hidden shrink-0 flex items-center justify-center">
                                <img
                                  src={assignee?.avatar_url || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80'}
                                  alt={assignee?.name || ''}
                                  className="-rotate-45 w-6 h-6 object-cover max-w-none"
                                />
                              </div>
                              <span className="truncate max-w-[70px] text-[#F2F0E4]/80 ml-1">{assignee?.name.split(' ')[0]}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
