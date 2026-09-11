import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { KanbanBoard } from './components/KanbanBoard';
import { GanttChart } from './components/GanttChart';
import { RfiTracker } from './components/RfiTracker';
import { ProjectMetrics } from './components/ProjectMetrics';
import { OpenProjectSidebar } from './components/OpenProjectSidebar';
import { TaskModal } from './components/TaskModal';
import { RfiModal } from './components/RfiModal';
import { ProjectSettingsModal } from './components/ProjectSettingsModal';
import { NewProjectModal } from './components/NewProjectModal';
import { ApiConsoleDrawer } from './components/ApiConsoleDrawer';
import { LightboxModal } from './components/LightboxModal';
import { Mail, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeView, showEmailToast, dismissEmailToast } = useApp();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0A0A0A] text-[#F2F0E4] antialiased font-sans art-deco-bg">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container with OpenProject Collapsible Sidebar & Viewport */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* OpenProject Sidebar */}
        <OpenProjectSidebar />

        {/* Main Viewport */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-[#0A0A0A] border-l border-[#D4AF37]/20">
          {activeView === 'KANBAN' && <KanbanBoard />}
          {activeView === 'GANTT' && <GanttChart />}
          {activeView === 'RFI' && <RfiTracker />}
          {activeView === 'METRICS' && <ProjectMetrics />}

          {/* Email Notification Simulation Toast */}
          {showEmailToast && (
            <div
              id="email-notification-toast"
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3.5 px-5 py-3.5 bg-[#141414] text-[#F2F0E4] border-2 border-[#D4AF37] glow-gold text-xs animate-in fade-in slide-in-from-bottom-3 duration-300"
            >
              <div className="w-8 h-8 rotate-45 border border-[#D4AF37] bg-[#1E3D59] flex items-center justify-center shrink-0">
                <div className="-rotate-45">
                  <Mail className="w-4 h-4 text-[#D4AF37]" />
                </div>
              </div>
              <div className="flex-1 pr-2">
                <span className="font-display tracking-widest uppercase font-bold text-[#D4AF37] mr-2">
                  [DISPATCH / 通知]
                </span>
                <span className="text-[#F2F0E4]">{showEmailToast}</span>
              </div>
              <button
                onClick={dismissEmailToast}
                className="p-1 border border-transparent hover:border-[#D4AF37]/50 text-[#888888] hover:text-[#D4AF37] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <TaskModal />
      <RfiModal />
      <ProjectSettingsModal />
      <NewProjectModal />
      <ApiConsoleDrawer />
      <LightboxModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
