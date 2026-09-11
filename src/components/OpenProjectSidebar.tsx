import React, { useState } from 'react';
import {
  FolderKanban,
  Kanban,
  Calendar,
  FileText,
  BarChart3,
  Users,
  Settings,
  Terminal,
  MapPin,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  MessageSquare,
  Newspaper,
  Compass,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OpenProjectSidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    tasks,
    rfis,
    canEditProject,
    setIsProjectSettingsOpen,
    setIsApiConsoleOpen,
  } = useApp();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const openRfisCount = rfis.filter((r) => r.status === 'OPEN' || r.status === 'UNDER_REVIEW').length;

  return (
    <aside
      id="openproject-sidebar"
      className={`bg-[#141414] text-[#F2F0E4] flex flex-col shrink-0 border-r border-[#D4AF37]/30 select-none transition-all duration-300 z-20 ${
        isCollapsed ? 'w-14' : 'w-60'
      }`}
    >
      {/* Navigation List */}
      <div className="flex-1 py-4 px-2.5 space-y-1.5 overflow-y-auto text-xs font-sans">
        {/* Section Header */}
        {!isCollapsed && (
          <div className="px-2 py-1 text-[9px] font-display uppercase tracking-[0.25em] text-[#D4AF37]/70 border-b border-[#D4AF37]/20 mb-2">
            NAVIGATION / 專案導覽
          </div>
        )}

        {/* Overview */}
        <button
          onClick={() => setActiveView('METRICS')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-none transition cursor-pointer uppercase tracking-wider font-display border ${
            activeView === 'METRICS'
              ? 'bg-[#1E3D59] text-[#D4AF37] border-[#D4AF37] glow-gold font-bold'
              : 'border-transparent hover:bg-[#1C1C1C] text-[#F2F0E4]/70 hover:text-[#D4AF37]'
          }`}
          title="Overview / 專案總覽"
        >
          <Compass className="w-4 h-4 shrink-0 text-[#D4AF37]" />
          {!isCollapsed && <span className="truncate">專案總覽 (Overview)</span>}
        </button>

        {/* Work packages & Gantt (OpenProject Main Feature) */}
        <button
          id="sidebar-nav-gantt"
          onClick={() => setActiveView('GANTT')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none transition cursor-pointer uppercase tracking-wider font-display border ${
            activeView === 'GANTT'
              ? 'bg-[#1E3D59] text-[#D4AF37] border-[#D4AF37] glow-gold font-bold'
              : 'border-transparent hover:bg-[#1C1C1C] text-[#F2F0E4]/70 hover:text-[#D4AF37]'
          }`}
          title="Work packages & Gantt / 工作包與甘特圖"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Calendar className="w-4 h-4 shrink-0 text-[#D4AF37]" />
            {!isCollapsed && <span className="truncate">工作包與甘特圖</span>}
          </div>
          {!isCollapsed && (
            <span className="text-[9px] font-sans px-1.5 py-0.2 border border-[#D4AF37]/50 text-[#D4AF37]">
              GANTT
            </span>
          )}
        </button>

        {/* Boards (Kanban) */}
        <button
          id="sidebar-nav-kanban"
          onClick={() => setActiveView('KANBAN')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none transition cursor-pointer uppercase tracking-wider font-display border ${
            activeView === 'KANBAN'
              ? 'bg-[#1E3D59] text-[#D4AF37] border-[#D4AF37] glow-gold font-bold'
              : 'border-transparent hover:bg-[#1C1C1C] text-[#F2F0E4]/70 hover:text-[#D4AF37]'
          }`}
          title="Boards / 看板管理"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Kanban className="w-4 h-4 shrink-0 text-[#D4AF37]" />
            {!isCollapsed && (
              <span className="truncate flex items-center gap-1.5">
                <span>看板管理</span>
              </span>
            )}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] text-[#D4AF37] font-mono border border-[#D4AF37]/40 px-1.5 py-0.2">
              {tasks.length}
            </span>
          )}
        </button>

        {/* RFI Tracker */}
        <button
          id="sidebar-nav-rfi"
          onClick={() => setActiveView('RFI')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none transition cursor-pointer uppercase tracking-wider font-display border ${
            activeView === 'RFI'
              ? 'bg-[#1E3D59] text-[#D4AF37] border-[#D4AF37] glow-gold font-bold'
              : 'border-transparent hover:bg-[#1C1C1C] text-[#F2F0E4]/70 hover:text-[#D4AF37]'
          }`}
          title="RFI 追蹤管理"
        >
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-4 h-4 shrink-0 text-[#D4AF37]" />
            {!isCollapsed && <span className="truncate">RFI 請示追蹤</span>}
          </div>
          {!isCollapsed && openRfisCount > 0 && (
            <span className="px-1.5 py-0.2 bg-[#D4AF37] text-[#0A0A0A] font-bold text-[9px]">
              {openRfisCount}
            </span>
          )}
        </button>

        {/* Roadmap */}
        <button
          onClick={() => setActiveView('GANTT')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-none hover:bg-[#1C1C1C] text-[#888888] hover:text-[#D4AF37] transition cursor-pointer uppercase tracking-wider font-display border border-transparent hover:border-[#D4AF37]/30"
          title="Roadmap / 里程碑路線"
        >
          <MapPin className="w-4 h-4 shrink-0 text-[#888888]" />
          {!isCollapsed && <span className="truncate">里程碑路線 (Roadmap)</span>}
        </button>

        {/* Metrics & Reports */}
        <button
          onClick={() => setActiveView('METRICS')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-none transition cursor-pointer uppercase tracking-wider font-display border ${
            activeView === 'METRICS'
              ? 'bg-[#1E3D59] text-[#D4AF37] border-[#D4AF37]'
              : 'border-transparent hover:bg-[#1C1C1C] text-[#888888] hover:text-[#D4AF37]'
          }`}
          title="進度與數據報表"
        >
          <BarChart3 className="w-4 h-4 shrink-0 text-[#D4AF37]" />
          {!isCollapsed && <span className="truncate">數據報表與進度</span>}
        </button>

        <div className="my-3 border-t border-[#D4AF37]/20" />

        {/* Project Settings */}
        {canEditProject && (
          <button
            onClick={() => setIsProjectSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-none hover:bg-[#1C1C1C] text-[#888888] hover:text-[#D4AF37] transition cursor-pointer uppercase tracking-wider font-display border border-transparent hover:border-[#D4AF37]/30"
            title="Project settings / 專案設定"
          >
            <Settings className="w-4 h-4 shrink-0 text-[#888888]" />
            {!isCollapsed && <span className="truncate">專案規格設定</span>}
          </button>
        )}

        {/* API Console */}
        <button
          onClick={() => setIsApiConsoleOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-none hover:bg-[#1C1C1C] text-[#888888] hover:text-[#D4AF37] transition cursor-pointer uppercase tracking-wider font-display border border-transparent hover:border-[#D4AF37]/30"
          title="API Console"
        >
          <Terminal className="w-4 h-4 shrink-0 text-[#888888]" />
          {!isCollapsed && <span className="truncate">API 歷程與端點</span>}
        </button>
      </div>

      {/* Collapse / Expand Toggle Footer */}
      <div className="p-2.5 border-t border-[#D4AF37]/20 bg-[#0D0D0D]">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-none text-[#888888] hover:text-[#D4AF37] hover:bg-[#1C1C1C] border border-transparent hover:border-[#D4AF37]/40 transition cursor-pointer font-display uppercase tracking-widest text-xs"
          title={isCollapsed ? '展開側邊欄' : '收合側邊欄'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4 text-[#D4AF37]" />
              <span>收合導覽列</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
