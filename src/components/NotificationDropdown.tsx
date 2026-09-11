import React from 'react';
import { Bell, CheckCheck, FileText, CheckCircle2, MessageSquare, AlertCircle, Mail, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppNotification } from '../types';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const {
    notifications,
    currentUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setSelectedTaskId,
    setIsTaskModalOpen,
    setSelectedRfiId,
    setIsRfiModalOpen,
    emailNotificationsEnabled,
    setEmailNotificationsEnabled,
  } = useApp();

  const userNotifs = notifications.filter((n) => n.user_id === currentUser.id);

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.target_type === 'TASK') {
      setSelectedTaskId(notif.target_id);
      setIsTaskModalOpen(true);
    } else if (notif.target_type === 'RFI') {
      setSelectedRfiId(notif.target_id);
      setIsRfiModalOpen(true);
    }
    onClose();
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'TASK_ASSIGNED':
      case 'TASK_STATUS_CHANGED':
        return <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />;
      case 'RFI_ASSIGNED':
      case 'RFI_ANSWERED':
        return <FileText className="w-4 h-4 text-[#7FB069] shrink-0" />;
      case 'MENTIONED':
        return <MessageSquare className="w-4 h-4 text-[#E07A5F] shrink-0" />;
      default:
        return <AlertCircle className="w-4 h-4 text-[#888888] shrink-0" />;
    }
  };

  const formatTime = (iso: string) => {
    try {
      const date = new Date(iso);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
      if (diffMinutes < 1) return '剛剛';
      if (diffMinutes < 60) return `${diffMinutes} 分鐘前`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} 小時前`;
      return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div
      id="notification-dropdown-panel"
      className="absolute right-0 mt-2 w-84 sm:w-96 bg-[#0A0A0A] rounded-none shadow-2xl border-2 border-[#D4AF37]/50 glow-gold z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Stepped Corner Brackets */}
      <span className="corner-bracket-tl" />
      <span className="corner-bracket-tr" />
      <span className="corner-bracket-bl" />
      <span className="corner-bracket-br" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#141414] border-b border-[#D4AF37]/30">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-xs font-display font-bold uppercase tracking-widest text-[#F2F0E4]">
            通知中心 (NOTIFICATIONS)
          </h3>
          {userNotifs.filter((n) => !n.read).length > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-[#E07A5F] bg-[#2A1414] border border-[#E07A5F]/40 rounded-none">
              {userNotifs.filter((n) => !n.read).length} UNREAD
            </span>
          )}
        </div>
        {userNotifs.some((n) => !n.read) && (
          <button
            id="btn-mark-all-read"
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1 text-[10px] font-display uppercase tracking-wider px-2.5 py-1 rounded-none bg-[#241F10] hover:bg-[#D4AF37] hover:text-[#0A0A0A] text-[#D4AF37] border border-[#D4AF37]/40 font-semibold cursor-pointer transition"
          >
            <CheckCheck className="w-3 h-3" />
            全部已讀
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#D4AF37]/20 art-deco-bg">
        {userNotifs.length === 0 ? (
          <div className="py-8 text-center text-[#888888] text-xs font-display uppercase tracking-wider">
            <Bell className="w-7 h-7 mx-auto mb-2 text-[#D4AF37]/40" />
            目前沒有任何通知
          </div>
        ) : (
          userNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3.5 flex gap-3 cursor-pointer transition hover:bg-[#241F10]/50 ${
                !notif.read ? 'bg-[#241F10]/30' : ''
              }`}
            >
              <div className="mt-0.5">{getIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-xs truncate font-serif ${
                      !notif.read ? 'text-[#D4AF37] font-bold' : 'text-[#F2F0E4]/90'
                    }`}
                  >
                    {notif.title}
                  </span>
                  <span className="text-[10px] text-[#888888] font-mono whitespace-nowrap">
                    {formatTime(notif.created_at)}
                  </span>
                </div>
                <p className="text-xs text-[#888888] line-clamp-2 leading-relaxed font-sans">
                  {notif.message}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[9px] font-display uppercase tracking-wider px-2 py-0.5 rounded-none bg-[#141414] border border-[#D4AF37]/30 text-[#D4AF37]">
                    {notif.target_type === 'TASK' ? 'TASK • 任務' : 'RFI • 請示單'}
                  </span>
                  <span className="text-[10px] text-[#D4AF37] font-display uppercase tracking-wider flex items-center gap-0.5">
                    查看詳情 <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-none rotate-45 bg-[#D4AF37] self-center shrink-0 glow-gold" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer: Email setting toggle */}
      <div className="p-3 bg-[#141414] border-t border-[#D4AF37]/30 flex items-center justify-between text-xs text-[#888888]">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-[11px] text-[#F2F0E4]">重要指派發送 Email 通知</span>
        </label>
        <button
          type="button"
          onClick={() => setEmailNotificationsEnabled(!emailNotificationsEnabled)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-none border border-[#D4AF37]/50 transition-colors duration-200 ease-in-out focus:outline-hidden ${
            emailNotificationsEnabled ? 'bg-[#D4AF37]' : 'bg-[#1a1a1a]'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-3.5 w-3.5 my-auto transform rounded-none bg-[#0A0A0A] border border-[#D4AF37] shadow-xs ring-0 transition duration-200 ease-in-out ${
              emailNotificationsEnabled ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
