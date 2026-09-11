import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LightboxModal: React.FC = () => {
  const { lightboxUrl, lightboxTitle, closeLightbox } = useApp();

  if (!lightboxUrl) return null;

  return (
    <div
      id="lightbox-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={closeLightbox}
    >
      <div
        id="lightbox-content-box"
        className="relative max-w-5xl max-h-[90vh] flex flex-col bg-[#0A0A0A] rounded-none overflow-hidden shadow-2xl border-2 border-[#D4AF37]/50 glow-gold"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Stepped Corner Brackets */}
        <span className="corner-bracket-tl" />
        <span className="corner-bracket-tr" />
        <span className="corner-bracket-bl" />
        <span className="corner-bracket-br" />

        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#141414] border-b border-[#D4AF37]/30 text-[#F2F0E4]">
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-display uppercase tracking-widest truncate text-[#D4AF37]">
              {lightboxTitle || '附件圖片預覽 (IMAGE PREVIEW)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={lightboxUrl}
              download={lightboxTitle || 'attachment-image'}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-none flex items-center justify-center text-[#888888] hover:text-[#D4AF37] hover:bg-[#241F10] border border-transparent hover:border-[#D4AF37]/40 transition cursor-pointer"
              title="下載圖片"
            >
              <Download className="w-4 h-4" />
            </a>
            <a
              href={lightboxUrl}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-none flex items-center justify-center text-[#888888] hover:text-[#D4AF37] hover:bg-[#241F10] border border-transparent hover:border-[#D4AF37]/40 transition cursor-pointer"
              title="在新分頁開啟"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              id="btn-close-lightbox"
              onClick={closeLightbox}
              className="w-8 h-8 rounded-none flex items-center justify-center text-[#888888] hover:text-[#D4AF37] hover:bg-[#241F10] border border-transparent hover:border-[#D4AF37]/40 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image viewport */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#0A0A0A] art-deco-bg">
          <img
            src={lightboxUrl}
            alt={lightboxTitle || 'Preview'}
            className="max-w-full max-h-[80vh] object-contain rounded-none select-none border border-[#D4AF37]/30 shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};
