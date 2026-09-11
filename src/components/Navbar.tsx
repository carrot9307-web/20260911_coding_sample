import React, { useState, useRef, useEffect } from 'react';
import {
  Kanban,
  FileText,
  BarChart3,
  Search,
  Plus,
  Bell,
  Settings,
  Terminal,
  Shield,
  RotateCcw,
  ChevronDown,
  FolderKanban,
  UserCheck,
  HelpCircle,
  FolderPlus,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NotificationDropdown } from './NotificationDropdown';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const {
    currentProject,
    setCurrentProject,
    projects,
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    currentUser,
    setCurrentUser,
    users,
    canCreateTask,
    canCreateRfi,
    canEditProject,
    unreadNotificationsCount,
    setIsTaskModalOpen,
    setSelectedTaskId,
    setIsRfiModalOpen,
    setSelectedRfiId,
    setIsProjectSettingsOpen,
    setIsApiConsoleOpen,
    setIsNewProjectModalOpen,
    resetDataToDefault,
    rfis,
    tasks,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const projRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (projRef.current && !projRef.current.contains(e.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-[#2A1414] text-[#E07A5F] border-[#E07A5F]';
      case 'PM':
        return 'bg-[#1E1B2E] text-[#D4AF37] border-[#D4AF37]';
      case 'MEMBER':
        return 'bg-[#122230] text-[#78A1BB] border-[#78A1BB]';
      case 'CLIENT':
        return 'bg-[#14261C] text-[#81B29A] border-[#81B29A]';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return '系統主控 (ADMIN)';
      case 'PM':
        return '總專案總監 (PM / DIRECTOR)';
      case 'MEMBER':
        return '貴賓核心成員 (MEMBER)';
      case 'CLIENT':
        return '特約委託客戶 (CLIENT)';
    }
  };

  const openRfisCount = rfis.filter((r) => r.status === 'OPEN' || r.status === 'UNDER_REVIEW').length;

  return (
    <header id="main-app-header" className="bg-[#0A0A0A] border-b border-[#D4AF37]/30 z-30 shrink-0 select-none">
      {/* Upper Navigation Row */}
      <div className="flex items-center justify-between px-6 py-2.5 gap-4">
        {/* Brand & Project Selector */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-3 shrink-0">
            {/* 45-degree Rotated Diamond Container */}
            <div className="w-8 h-8 rotate-45 border-2 border-[#D4AF37] bg-[#1E3D59] flex items-center justify-center glow-gold shrink-0">
              <div className="-rotate-45">
                <FolderKanban className="w-4 h-4 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold font-display uppercase tracking-[0.18em] text-[#D4AF37] leading-tight flex items-center gap-2">
                <span>專案管理與 RFI 追蹤系統</span>
                <span className="text-[10px] px-1.5 py-0.2 border border-[#D4AF37]/60 text-[#D4AF37] font-sans">
                  GATSY EDITION
                </span>
              </h1>
              <p className="text-[9px] text-[#888888] tracking-[0.2em] uppercase font-sans font-medium">
                ARCHITECTURAL PM &amp; DIPLOMATIC RFI REGISTRY
              </p>
            </div>
          </div>

          <div className="h-5 w-px bg-[#D4AF37]/30 hidden md:block" />

          {/* Project Dropdown */}
          <div className="relative" ref={projRef}>
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-[#141414] hover:bg-[#1c1c1c] text-[#F2F0E4] text-xs font-sans tracking-wider border border-[#D4AF37]/40 hover:border-[#D4AF37] transition cursor-pointer"
            >
              <span className="truncate max-w-[160px] sm:max-w-[220px]">
                {currentProject.title}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-80 bg-[#141414] rounded-none shadow-2xl border-2 border-[#D4AF37] py-2 z-50 text-xs animate-in fade-in duration-150 glow-gold">
                <div className="px-4 py-1.5 text-[10px] font-display uppercase tracking-[0.2em] text-[#D4AF37] border-b border-[#D4AF37]/20 flex items-center justify-between">
                  <span>進行中專案清單</span>
                  <span className="text-[9px] font-mono text-[#888888]">CHAMBER I</span>
                </div>
                {projects.map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setCurrentProject(p);
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`px-4 py-2.5 flex flex-col cursor-pointer transition hover:bg-[#1E3D59]/30 ${
                      p.id === currentProject.id ? 'bg-[#1E3D59]/40 border-l-2 border-[#D4AF37]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#F2F0E4] truncate">{p.title}</span>
                      <span className="text-[9px] font-serif text-[#D4AF37]/70">
                        {['I', 'II', 'III', 'IV', 'V'][idx % 5]}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#888888] line-clamp-1 mt-0.5">{p.description}</span>
                  </div>
                ))}
                <div className="pt-2 mt-1 border-t border-[#D4AF37]/20 px-3">
                  <button
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      setIsNewProjectModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-none bg-transparent hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0A0A0A] border border-[#D4AF37] font-display uppercase tracking-widest text-xs transition cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>籌備新專案...</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Search Box - Underlined Art Deco Style */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-[#D4AF37] absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="檢索任務檔案、RFI 編號、關鍵字標籤..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-transparent border-b-2 border-[#D4AF37]/40 hover:border-[#D4AF37]/70 focus:border-[#D4AF37] focus:outline-hidden transition text-[#F2F0E4] placeholder-[#888888] tracking-wide"
            />
          </div>
        </div>

        {/* Right Tools & Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Architectural Action Buttons */}
          <div className="flex items-center gap-2">
            {canCreateTask && (
              <button
                id="btn-create-task-navbar"
                onClick={() => {
                  setSelectedTaskId(null);
                  setIsTaskModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-transparent hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0A0A0A] border-2 border-[#D4AF37] text-xs font-display uppercase tracking-widest transition cursor-pointer hover:glow-gold"
                title="建立新任務卡片"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">新增任務</span>
              </button>
            )}

            {canCreateRfi && (
              <button
                id="btn-create-rfi-navbar"
                onClick={() => {
                  setSelectedRfiId('NEW');
                  setIsRfiModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-[#1E3D59] hover:bg-[#D4AF37] text-[#F2F0E4] hover:text-[#0A0A0A] border-2 border-[#D4AF37]/80 text-xs font-display uppercase tracking-widest transition cursor-pointer hover:glow-gold"
                title="提出新 RFI 請示單據"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">提出 RFI</span>
              </button>
            )}
          </div>

          <div className="h-5 w-px bg-[#D4AF37]/30" />

          {/* Role / User Switcher */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-none bg-[#141414] hover:bg-[#1c1c1c] border border-[#D4AF37]/40 hover:border-[#D4AF37] transition cursor-pointer"
              title="切換身分與角色權限"
            >
              <div className="w-6 h-6 rotate-45 border border-[#D4AF37] overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="-rotate-45 w-8 h-8 object-cover max-w-none"
                />
              </div>
              <div className="text-left hidden lg:block ml-1">
                <div className="text-[11px] font-bold text-[#F2F0E4] leading-none">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[9px] text-[#D4AF37] mt-0.5 tracking-wider uppercase">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-[#D4AF37]" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-76 bg-[#141414] rounded-none shadow-2xl border-2 border-[#D4AF37] py-2 z-50 text-xs animate-in fade-in duration-150 glow-gold">
                <div className="px-4 py-2 border-b border-[#D4AF37]/20">
                  <div className="text-[10px] font-display uppercase tracking-[0.2em] text-[#D4AF37]">
                    當前模擬角色權限 (RBAC)
                  </div>
                  <div className="mt-1.5 font-bold text-[#F2F0E4] flex items-center justify-between">
                    <span className="text-sm font-display">{currentUser.name}</span>
                    <span className={`px-2 py-0.5 rounded-none border text-[10px] font-sans uppercase tracking-wider ${getRoleBadgeStyle(currentUser.role)}`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#888888] mt-1">
                    {getRoleLabel(currentUser.role)}
                  </p>
                </div>

                <div className="py-1">
                  <div className="px-4 py-1.5 text-[10px] text-[#888888] uppercase tracking-wider">
                    快速切換至其他角色檢驗權限：
                  </div>
                  {users.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setIsUserDropdownOpen(false);
                      }}
                      className={`px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-[#1E3D59]/30 transition ${
                        u.id === currentUser.id ? 'bg-[#1E3D59]/40 border-l-2 border-[#D4AF37]' : ''
                      }`}
                    >
                      <div className="w-6 h-6 rotate-45 border border-[#D4AF37]/60 overflow-hidden flex items-center justify-center shrink-0">
                        <img
                          src={u.avatar_url}
                          alt={u.name}
                          className="-rotate-45 w-8 h-8 object-cover max-w-none"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#F2F0E4] truncate font-medium">{u.name}</div>
                        <div className="text-[10px] text-[#888888] tracking-wider">{u.role} • {u.department}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              id="btn-notifications-bell"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative w-8 h-8 rounded-none text-[#D4AF37] hover:bg-[#1E3D59]/40 border border-[#D4AF37]/40 hover:border-[#D4AF37] flex items-center justify-center transition cursor-pointer"
              title="站內通知中心"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-none bg-[#D4AF37] text-[#0A0A0A] text-[9px] font-bold flex items-center justify-center border border-[#0A0A0A]">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {isNotifOpen && <NotificationDropdown onClose={() => setIsNotifOpen(false)} />}
          </div>

          {/* API Console Trigger */}
          <button
            id="btn-open-api-console"
            onClick={() => setIsApiConsoleOpen(true)}
            className="w-8 h-8 rounded-none text-[#D4AF37] hover:bg-[#1E3D59]/40 border border-[#D4AF37]/40 hover:border-[#D4AF37] flex items-center justify-center transition cursor-pointer"
            title="查看 RESTful API 對接規格與即時歷程"
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* Project Settings */}
          {canEditProject && (
            <button
              id="btn-open-project-settings"
              onClick={() => setIsProjectSettingsOpen(true)}
              className="w-8 h-8 rounded-none text-[#D4AF37] hover:bg-[#1E3D59]/40 border border-[#D4AF37]/40 hover:border-[#D4AF37] flex items-center justify-center transition cursor-pointer"
              title="專案設定與欄位管理"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Reset Demo Data */}
          <button
            onClick={resetDataToDefault}
            className="w-8 h-8 rounded-none text-[#888888] hover:text-[#D4AF37] hover:bg-[#141414] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 flex items-center justify-center transition cursor-pointer"
            title="重置為預設示範資料"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lower View Tabs Navigation Bar - Art Deco Ribbon */}
      <div className="flex items-center justify-between px-6 py-1.5 bg-[#141414] border-t border-[#D4AF37]/20">
        <nav className="flex items-center gap-2 text-xs font-medium">
          {/* Kanban Tab */}
          <button
            id="tab-kanban-view"
            onClick={() => setActiveView('KANBAN')}
            className={`flex items-center gap-2 py-1.5 px-4 rounded-none transition cursor-pointer uppercase tracking-wider font-display border ${
              activeView === 'KANBAN'
                ? 'bg-[#1E3D59] text-[#D4AF37] border-[#D4AF37] glow-gold font-bold'
                : 'text-[#F2F0E4]/70 border-transparent hover:border-[#D4AF37]/40 hover:text-[#F2F0E4]'
            }`}
          >
            <Kanban className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>看板式任務管理</span>
            <span className={`px-2 py-0.2 text-[10px] font-sans font-bold border ${
              activeView === 'KANBAN' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-[#888888]/30 text-[#888888]'
            }`}>
              {tasks.length}
            </span>
          </button>

          {/* Gantt Chart Tab */}
          <button
            id="tab-gantt-view"
            onClick={() => setActiveView('GANTT')}
            className={`flex items-center gap-2 py-1.5 px-4 rounded-none transition cursor-pointer uppercase tracking-wider font-display border ${
              activeView === 'GANTT'
                ? 'bg-[#1E3D59] text-[#D4AF37] border-[#D4AF37] glow-gold font-bold'
                : 'text-[#F2F0E4]/70 border-transparent hover:border-[#D4AF37]/40 hover:text-[#F2F0E4]'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>甘特圖排程檢視</span>
            <span className={`px-2 py-0.2 text-[10px] font-sans font-bold border ${
              activeView === 'GANTT' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-[#888888]/30 text-[#888888]'
            }`}>
              TIMELINE
            </span>
          </button>

          {/* RFI Tracker Tab */}
          <button
            id="tab-rfi-view"
            onClick={() => setActiveView('RFI')}
            className={`flex items-center gap-2 py-1.5 px-4 rounded-none transition cursor-pointer uppercase tracking-wider font-display border ${
              activeView === 'RFI'
                ? 'bg-[#1E3D59] text-[#D4AF37] border-[#D4AF37] glow-gold font-bold'
                : 'text-[#F2F0E4]/70 border-transparent hover:border-[#D4AF37]/40 hover:text-[#F2F0E4]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>RFI 需求請示與追蹤</span>
            {openRfisCount > 0 && (
              <span className={`px-2 py-0.2 text-[10px] font-sans font-bold border ${
                activeView === 'RFI' ? 'border-[#D4AF37] bg-[#D4AF37] text-[#0A0A0A]' : 'border-[#E07A5F] text-[#E07A5F]'
              }`}>
                {openRfisCount} 待答覆
              </span>
            )}
          </button>

          {/* Metrics Tab */}
          <button
            id="tab-metrics-view"
            onClick={() => setActiveView('METRICS')}
            className={`flex items-center gap-2 py-1.5 px-4 rounded-none transition cursor-pointer uppercase tracking-wider font-display border ${
              activeView === 'METRICS'
                ? 'bg-[#1E3D59] text-[#D4AF37] border-[#D4AF37] glow-gold font-bold'
                : 'text-[#F2F0E4]/70 border-transparent hover:border-[#D4AF37]/40 hover:text-[#F2F0E4]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>專案進度與數據分析</span>
          </button>
        </nav>

        {/* Current Role Info Banner */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#888888] py-1 font-sans">
          <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>目前權限：</span>
          <span className={`font-semibold px-2 py-0.2 rounded-none border text-[10px] ${getRoleBadgeStyle(currentUser.role)}`}>
            {currentUser.role}
          </span>
          {currentUser.role === 'CLIENT' && (
            <span className="text-[#888888] text-[10px]">
              (僅能提出 RFI 與檢視看板狀態)
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
