import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileArchive,
  Trash2,
  Download,
  Eye,
  Paperclip,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Attachment } from '../types';

interface AttachmentManagerProps {
  targetType: 'TASK' | 'RFI';
  targetId: string;
  readOnly?: boolean;
}

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  targetType,
  targetId,
  readOnly = false,
}) => {
  const { attachments, uploadAttachment, deleteAttachment, openLightbox, users } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetAttachments = attachments.filter(
    (a) => a.target_type === targetType && a.target_id === targetId
  );

  // Listen for clipboard paste events (Ctrl+V / Cmd+V)
  useEffect(() => {
    if (readOnly) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            setIsUploading(true);
            setUploadError(null);
            try {
              // Give nice filename
              const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
              const customFile = new File([file], `screenshot-${dateStr}.png`, { type: file.type });
              await uploadAttachment(customFile, targetType, targetId);
              setPasteSuccess(true);
              setTimeout(() => setPasteSuccess(false), 2500);
            } catch (err: unknown) {
              setUploadError(err instanceof Error ? err.message : '貼上圖片失敗');
            } finally {
              setIsUploading(false);
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [readOnly, targetType, targetId, uploadAttachment]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadAttachment(files[i], targetType, targetId);
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : '檔案上傳失敗');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!readOnly) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (readOnly) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileSelect(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mime: string, name: string) => {
    if (mime.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-indigo-500" />;
    if (mime.includes('pdf')) return <FileText className="w-5 h-5 text-rose-500" />;
    if (mime.includes('zip') || mime.includes('archive') || name.endsWith('.zip')) {
      return <FileArchive className="w-5 h-5 text-amber-500" />;
    }
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div id="attachment-manager-section" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-[#D4AF37]" />
          <h4 className="text-xs font-display uppercase tracking-widest text-[#D4AF37]">
            檔案與截圖附件 ({targetAttachments.length})
          </h4>
        </div>
        {pasteSuccess && (
          <span className="inline-flex items-center gap-1 text-xs text-[#D4AF37] bg-[#241F10] border border-[#D4AF37]/40 px-2.5 py-0.5 rounded-none font-display uppercase tracking-wider animate-fade-in font-medium">
            <Check className="w-3.5 h-3.5" /> 剪貼簿截圖已貼上上傳！
          </span>
        )}
      </div>

      {uploadError && (
        <div className="p-2.5 rounded-none bg-[#2A1414] border border-[#E07A5F] text-[#E07A5F] text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Drag & Drop Upload Dropzone */}
      {!readOnly && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-none p-4 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[#D4AF37] bg-[#241F10] scale-[0.99]'
              : 'border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#1A1A1A] bg-[#141414]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            accept="image/*,.pdf,.doc,.docx,.zip,.txt"
          />
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-10 h-10 rounded-none bg-[#241F10] border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-[#F2F0E4]">
              {isUploading ? (
                <span className="text-[#D4AF37] font-display uppercase tracking-wider animate-pulse">正在處理並上傳檔案...</span>
              ) : (
                <>
                  <span className="text-[#D4AF37] hover:underline font-semibold">點擊選取</span> 或拖曳檔案至此處，或在視窗內直接{' '}
                  <kbd className="px-2 py-0.5 text-[10px] bg-[#0A0A0A] text-[#D4AF37] rounded-none border border-[#D4AF37]/50 font-mono">
                    Ctrl + V
                  </kbd>{' '}
                  貼上截圖
                </>
              )}
            </p>
            <p className="text-[11px] text-[#888888] font-sans">
              支援 PNG, JPG, GIF, PDF, DOCX, ZIP（單檔最大 25MB）
            </p>
          </div>
        </div>
      )}

      {/* Attachments List / Grid */}
      {targetAttachments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {targetAttachments.map((att) => {
            const isImg = att.file_type.startsWith('image/');
            const uploader = users.find((u) => u.id === att.uploaded_by);

            return (
              <div
                key={att.id}
                className="group relative flex items-center gap-3 p-2.5 bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-none hover:border-[#D4AF37] transition"
              >
                {/* Thumbnail / Icon */}
                {isImg && att.file_url ? (
                  <div
                    onClick={() => openLightbox(att.file_url, att.file_name)}
                    className="relative w-12 h-12 rounded-none overflow-hidden bg-[#141414] shrink-0 cursor-pointer border border-[#D4AF37]/40 group/img"
                  >
                    <img
                      src={att.thumbnail_url || att.file_url}
                      alt={att.file_name}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition">
                      <Eye className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-none bg-[#141414] flex items-center justify-center shrink-0 border border-[#D4AF37]/40 text-[#D4AF37]">
                    {getFileIcon(att.file_type, att.file_name)}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-medium text-[#F2F0E4] truncate"
                    title={att.file_name}
                  >
                    {att.file_name}
                  </p>
                  <p className="text-[11px] text-[#888888] mt-0.5 font-mono">
                    {formatFileSize(att.file_size)} • {uploader?.name || '成員'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  {isImg && (
                    <button
                      type="button"
                      onClick={() => openLightbox(att.file_url, att.file_name)}
                      className="w-7 h-7 rounded-none flex items-center justify-center text-[#888888] hover:text-[#D4AF37] hover:bg-[#241F10] transition cursor-pointer"
                      title="放大檢視"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <a
                    href={att.file_url}
                    download={att.file_name}
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-none flex items-center justify-center text-[#888888] hover:text-[#D4AF37] hover:bg-[#241F10] transition cursor-pointer"
                    title="下載檔案"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => deleteAttachment(att.id)}
                      className="w-7 h-7 rounded-none flex items-center justify-center text-[#888888] hover:text-[#E07A5F] hover:bg-[#2A1414] transition cursor-pointer"
                      title="刪除附件"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-3 text-xs text-[#888888] bg-[#141414] rounded-none border border-[#D4AF37]/20">
          尚未上傳任何附件檔案
        </div>
      )}
    </div>
  );
};
