import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Bold,
  Italic,
  List,
  Code,
  Quote,
  AtSign,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User } from '../types';

interface CommentSectionProps {
  targetType: 'TASK' | 'RFI';
  targetId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ targetType, targetId }) => {
  const { comments, addComment, users } = useApp();
  const [content, setContent] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const targetComments = comments.filter(
    (c) => c.target_type === targetType && c.target_id === targetId
  );

  // Filter users for @ mention
  const matchingUsers = mentionQuery !== null
    ? users.filter((u) => u.name.toLowerCase().includes(mentionQuery.toLowerCase()))
    : [];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtIdx = textBeforeCursor.lastIndexOf('@');

    if (lastAtIdx !== -1) {
      const query = textBeforeCursor.slice(lastAtIdx + 1);
      // Only match if query doesn't contain spaces or is short
      if (!query.includes(' ') && query.length <= 15) {
        setMentionQuery(query);
        setMentionPosition({ top: -140, left: Math.min(lastAtIdx * 8, 200) });
        return;
      }
    }
    setMentionQuery(null);
  };

  const handleSelectMention = (user: User) => {
    if (!textareaRef.current) return;
    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = content.slice(0, cursorPos);
    const lastAtIdx = textBeforeCursor.lastIndexOf('@');

    if (lastAtIdx !== -1) {
      const newContent =
        content.slice(0, lastAtIdx) + `@${user.name} ` + content.slice(cursorPos);
      setContent(newContent);
      setMentionQuery(null);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPos = lastAtIdx + user.name.length + 2;
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 50);
    }
  };

  const insertFormatting = (prefix: string, suffix = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const replacement = prefix + (selected || '文字') + suffix;
    const updated = content.slice(0, start) + replacement + content.slice(end);
    setContent(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 2));
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addComment(targetType, targetId, content.trim());
    setContent('');
    setMentionQuery(null);
  };

  // Close mention popup on click outside
  useEffect(() => {
    const handleClickOutside = () => setMentionQuery(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const formatCommentBody = (text: string) => {
    // Highlight @ mentions
    const parts = text.split(/(@[^\s@]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} className="font-display font-bold text-[#D4AF37] bg-[#241F10] border border-[#D4AF37]/40 px-2 py-0.5 rounded-none">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const formatTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleString('zh-TW', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div id="comments-section" className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
        <h4 className="text-xs font-display uppercase tracking-widest text-[#D4AF37]">
          討論留言與歷程 ({targetComments.length})
        </h4>
      </div>

      {/* Existing Comments */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {targetComments.length === 0 ? (
          <div className="text-center py-4 text-xs text-[#888888] bg-[#141414] rounded-none border border-[#D4AF37]/20 font-sans">
            目前尚無留言，歡迎在下方發表討論或提及成員 (@)
          </div>
        ) : (
          targetComments.map((comment) => {
            const author = users.find((u) => u.id === comment.user_id);
            return (
              <div key={comment.id} className="flex items-start gap-3 text-xs">
                <img
                  src={author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                  alt={author?.name || '用戶'}
                  className="w-7 h-7 rounded-none object-cover shrink-0 border border-[#D4AF37]/40 mt-0.5"
                />
                <div className="flex-1 min-w-0 bg-[#0A0A0A] rounded-none p-3 border border-[#D4AF37]/30">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif font-bold text-[#F2F0E4]">
                        {author?.name || '團隊成員'}
                      </span>
                      {author?.role && (
                        <span className="text-[9px] font-display uppercase tracking-widest px-1.5 py-0.2 bg-[#241F10] text-[#D4AF37] border border-[#D4AF37]/40 rounded-none">
                          {author.role}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#888888] font-mono">
                      {formatTime(comment.created_at)}
                    </span>
                  </div>
                  <div className="text-[#F2F0E4] leading-relaxed whitespace-pre-wrap font-sans">
                    {formatCommentBody(comment.content)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Comment Input Box with Formatting Toolbar */}
      <form onSubmit={handleSubmit} className="relative bg-[#141414] border border-[#D4AF37]/40 rounded-none overflow-hidden focus-within:border-[#D4AF37] focus-within:glow-gold transition">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0A0A0A] border-b border-[#D4AF37]/30 text-[#888888] text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              className="w-7 h-7 rounded-none flex items-center justify-center hover:bg-[#241F10] hover:text-[#D4AF37] transition cursor-pointer"
              title="粗體"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              className="w-7 h-7 rounded-none flex items-center justify-center hover:bg-[#241F10] hover:text-[#D4AF37] transition cursor-pointer"
              title="斜體"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n- ')}
              className="w-7 h-7 rounded-none flex items-center justify-center hover:bg-[#241F10] hover:text-[#D4AF37] transition cursor-pointer"
              title="清單"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('`', '`')}
              className="w-7 h-7 rounded-none flex items-center justify-center hover:bg-[#241F10] hover:text-[#D4AF37] transition cursor-pointer"
              title="行內代碼"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n> ')}
              className="w-7 h-7 rounded-none flex items-center justify-center hover:bg-[#241F10] hover:text-[#D4AF37] transition cursor-pointer"
              title="引用"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <span className="h-3 w-px bg-[#D4AF37]/30 mx-1" />
            <button
              type="button"
              onClick={() => {
                setContent((prev) => prev + '@');
                setMentionQuery('');
                textareaRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded-none hover:bg-[#241F10] text-[#D4AF37] font-display uppercase tracking-wider font-semibold flex items-center gap-1 transition cursor-pointer"
              title="標記成員 (@ Mention)"
            >
              <AtSign className="w-3.5 h-3.5" />
              <span className="text-[10px]">標記成員</span>
            </button>
          </div>
          <span className="text-[10px] text-[#888888] font-sans">輸入 @ 快速搜尋成員</span>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          placeholder="撰寫留言... (支援 Markdown 格式，輸入 @ 快速提及專案成員)"
          rows={3}
          className="w-full px-3 py-2 text-xs text-[#F2F0E4] bg-[#141414] placeholder-[#888888] border-0 focus:outline-hidden resize-none leading-relaxed"
        />

        {/* @ Mention autocomplete menu popup */}
        {mentionQuery !== null && matchingUsers.length > 0 && (
          <div
            id="mention-autocomplete-menu"
            className="absolute z-50 bottom-14 left-4 w-60 bg-[#0A0A0A] rounded-none shadow-xl border-2 border-[#D4AF37]/50 overflow-hidden py-1 max-h-48 overflow-y-auto animate-in fade-in duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1.5 text-[10px] font-display font-semibold text-[#D4AF37] uppercase tracking-wider bg-[#141414] border-b border-[#D4AF37]/30">
              選擇要標記的成員
            </div>
            {matchingUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelectMention(user)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-[#241F10] cursor-pointer transition text-xs border-b border-[#D4AF37]/10"
              >
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-5 h-5 rounded-none object-cover border border-[#D4AF37]/40"
                />
                <div className="truncate flex-1">
                  <span className="font-serif font-medium text-[#F2F0E4]">{user.name}</span>
                  <span className="text-[10px] text-[#D4AF37] ml-1 font-display">({user.role})</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#0A0A0A] border-t border-[#D4AF37]/30">
          <span className="text-[11px] text-[#888888] font-sans">
            按送出即可通知相關人員
          </span>
          <button
            type="submit"
            disabled={!content.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-none bg-[#D4AF37] text-[#0A0A0A] text-xs font-display uppercase tracking-widest font-bold hover:bg-[#F2E8C4] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer border border-[#D4AF37]"
          >
            <Send className="w-3.5 h-3.5" />
            送出留言
          </button>
        </div>
      </form>
    </div>
  );
};
