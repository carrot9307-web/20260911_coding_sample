import React from 'react';
import {
  BarChart3,
  PieChart,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GitPullRequest,
  Users,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProjectMetrics: React.FC = () => {
  const { currentProject, tasks, rfis, columns, users } = useApp();

  const totalTasks = tasks.length;
  const doneCol = columns.find((c) => c.name.includes('完成') || c.name.includes('Done'));
  const doneTasks = doneCol ? tasks.filter((t) => t.column_id === doneCol.id).length : 0;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const totalRfis = rfis.length;
  const closedRfis = rfis.filter((r) => r.status === 'CLOSED' || r.status === 'ANSWERED').length;
  const rfiResolutionRate = totalRfis > 0 ? Math.round((closedRfis / totalRfis) * 100) : 0;

  // Category distribution
  const categories = [
    { key: 'TECHNICAL', label: '技術 (Technical)', color: '#78A1BB' },
    { key: 'SCOPE', label: '範疇 (Scope)', color: '#D4AF37' },
    { key: 'BUDGET', label: '預算 (Budget)', color: '#C5A059' },
    { key: 'DESIGN', label: '設計 (Design)', color: '#D1A3FF' },
    { key: 'SCHEDULE', label: '時程 (Schedule)', color: '#E0A96D' },
  ];

  return (
    <div id="project-metrics-view" className="flex-1 overflow-y-auto p-6 bg-[#0A0A0A] text-[#F2F0E4] art-deco-bg space-y-6">
      {/* Project Overview Card */}
      <div className="bg-[#141414] rounded-none p-6 border border-[#D4AF37]/40 shadow-2xl relative space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-display uppercase tracking-widest text-[#D4AF37] bg-[#1E3D59] border border-[#D4AF37]/50 px-2.5 py-0.5 rounded-none mb-2">
              <span>ACTIVE OPERATION ◆ 進行中專案</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#F2F0E4] tracking-wide">{currentProject.title}</h2>
            <p className="text-xs text-[#888888] mt-1.5 max-w-2xl leading-relaxed">
              {currentProject.description}
            </p>
          </div>

          <div className="flex items-center gap-5 text-xs text-[#888888] font-mono">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>時程：{currentProject.start_date} ~ {currentProject.end_date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D4AF37]" />
              <span>專案成員：{currentProject.member_ids.length} 席</span>
            </div>
          </div>
        </div>

        {/* Overall Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#D4AF37]/20">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-display uppercase tracking-wider text-[#D4AF37] text-[11px]">看板任務達成進度 (Completion Rate)</span>
              <span className="font-mono font-bold text-[#D4AF37]">{completionRate}% ({doneTasks}/{totalTasks})</span>
            </div>
            <div className="w-full h-2.5 bg-[#0A0A0A] border border-[#D4AF37]/40 rounded-none overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#8E7322] to-[#D4AF37] transition-all duration-500 glow-gold"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-display uppercase tracking-wider text-[#81C784] text-[11px]">RFI 請示處置率 (Resolution Rate)</span>
              <span className="font-mono font-bold text-[#81C784]">{rfiResolutionRate}% ({closedRfis}/{totalRfis})</span>
            </div>
            <div className="w-full h-2.5 bg-[#0A0A0A] border border-[#81C784]/40 rounded-none overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#2E6038] to-[#81C784] transition-all duration-500"
                style={{ width: `${rfiResolutionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Column Distribution & RFI Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kanban Columns Breakdown */}
        <div className="bg-[#141414] rounded-none p-6 border border-[#D4AF37]/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
            <h3 className="text-sm font-serif font-bold text-[#F2F0E4] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#D4AF37]" /> 看板狀態卡片分佈
            </h3>
            <span className="text-xs font-mono text-[#D4AF37]">總計：{totalTasks} 張</span>
          </div>

          <div className="space-y-3 pt-2">
            {columns.map((col) => {
              const count = tasks.filter((t) => t.column_id === col.id).length;
              const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

              return (
                <div key={col.id} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-display uppercase tracking-wider text-[#F2F0E4]/90 text-[11px]">{col.name}</span>
                    <span className="font-mono text-[#888888]">{count} 張 ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-none overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 bg-[#D4AF37]"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: col.color || '#D4AF37',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RFI Category Breakdown */}
        <div className="bg-[#141414] rounded-none p-6 border border-[#D4AF37]/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
            <h3 className="text-sm font-serif font-bold text-[#F2F0E4] uppercase tracking-wider flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-[#D4AF37]" /> RFI 請示類別分佈
            </h3>
            <span className="text-xs font-mono text-[#D4AF37]">總計：{totalRfis} 筆</span>
          </div>

          <div className="space-y-3 pt-2">
            {categories.map((cat) => {
              const count = rfis.filter((r) => r.category === cat.key).length;
              const pct = totalRfis > 0 ? Math.round((count / totalRfis) * 100) : 0;

              return (
                <div key={cat.key} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-display uppercase tracking-wider text-[#F2F0E4]/90 text-[11px]">{cat.label}</span>
                    <span className="font-mono text-[#888888]">{count} 筆 ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-none overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Workload Allocation */}
      <div className="bg-[#141414] rounded-none p-6 border border-[#D4AF37]/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
          <h3 className="text-sm font-serif font-bold text-[#F2F0E4] uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D4AF37]" /> 團隊成員職責與負載分配
          </h3>
          <span className="text-xs font-display uppercase tracking-widest text-[#D4AF37]">DIVISION OF HONORS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {users.map((user) => {
            const assignedTasks = tasks.filter((t) => t.assignee_id === user.id).length;
            const assignedRfis = rfis.filter((r) => r.assignee_id === user.id).length;

            return (
              <div
                key={user.id}
                className="p-3.5 rounded-none border border-[#D4AF37]/30 bg-[#0A0A0A] hover:border-[#D4AF37] hover:glow-gold transition space-y-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rotate-45 border border-[#D4AF37] overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="-rotate-45 w-11 h-11 object-cover max-w-none"
                    />
                  </div>
                  <div className="min-w-0 ml-1">
                    <div className="font-serif font-bold text-[#F2F0E4] truncate">{user.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-[#D4AF37] uppercase tracking-wider truncate font-display">{user.role}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#D4AF37]/20 flex items-center justify-between text-[11px] text-[#888888] font-mono">
                  <span>任務: <strong className="text-[#D4AF37] font-bold">{assignedTasks}</strong></span>
                  <span>RFI: <strong className="text-[#81C784] font-bold">{assignedRfis}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
