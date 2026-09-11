import React, { useState } from 'react';
import {
  Terminal,
  X,
  Play,
  CheckCircle2,
  Clock,
  Code2,
  Trash2,
  Database,
  ArrowDownRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ApiConsoleDrawer: React.FC = () => {
  const {
    isApiConsoleOpen,
    setIsApiConsoleOpen,
    apiLogs,
    clearApiLogs,
    currentProject,
    tasks,
    rfis,
    columns,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'LOGS' | 'DOCS'>('LOGS');
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isApiConsoleOpen) return null;

  const specEndpoints = [
    {
      group: 'Auth API',
      method: 'POST',
      path: '/api/v1/auth/login',
      desc: '使用者登入驗證並取得 JWT Token',
      samplePayload: { email: currentUser.email, password: '••••••••' },
      sampleResponse: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', user: { id: currentUser.id, name: currentUser.name, role: currentUser.role } },
    },
    {
      group: 'Kanban API',
      method: 'GET',
      path: `/api/v1/projects/${currentProject.id}/kanban`,
      desc: '取得專案完整看板欄位與所有卡片資料',
      samplePayload: null,
      sampleResponse: {
        project_id: currentProject.id,
        columns: columns.map((c) => ({ id: c.id, name: c.name, position_order: c.position_order })),
        tasks_count: tasks.length,
      },
    },
    {
      group: 'Kanban API',
      method: 'PATCH',
      path: `/api/v1/tasks/:id/move`,
      desc: '拖曳移動卡片 (更新 column_id 及 order，延遲小於 200ms)',
      samplePayload: { column_id: columns[1]?.id || 'col-progress', position_order: 1 },
      sampleResponse: { success: true, updated_at: new Date().toISOString() },
    },
    {
      group: 'RFI API',
      method: 'GET',
      path: `/api/v1/projects/${currentProject.id}/rfis`,
      desc: '取得 RFI 列表 (支援狀態/指派人/關鍵字篩選)',
      samplePayload: null,
      sampleResponse: {
        total: rfis.length,
        items: rfis.slice(0, 2).map((r) => ({ id: r.id, code: r.rfi_code, title: r.title, status: r.status })),
      },
    },
    {
      group: 'RFI API',
      method: 'POST',
      path: '/api/v1/rfis',
      desc: '建立新 RFI 請示單據',
      samplePayload: { title: '確認新架構', question: '是否支援 Webhook？', category: 'TECHNICAL', priority: 'HIGH' },
      sampleResponse: { id: 'rfi-' + Date.now(), rfi_code: 'RFI-2026-006', status: 'OPEN' },
    },
    {
      group: 'RFI API',
      method: 'PUT',
      path: '/api/v1/rfis/:id/status',
      desc: '更新 RFI 狀態流轉或填寫官方答覆',
      samplePayload: { status: 'ANSWERED', answer: '經決議採行第 2 方案。' },
      sampleResponse: { success: true, answered_at: new Date().toISOString() },
    },
    {
      group: 'Media API',
      method: 'POST',
      path: '/api/v1/attachments/upload',
      desc: '上傳圖片/檔案，MIME 檢驗與生成縮圖 URL (支援拖曳與 Ctrl+V 貼上)',
      samplePayload: { fileName: 'screenshot.png', fileSize: 102400, mime: 'image/png' },
      sampleResponse: { file_url: 'https://...', thumbnail_url: 'https://..._thumb' },
    },
  ];

  const handleTestEndpoint = (ep: (typeof specEndpoints)[0]) => {
    const start = performance.now();
    setTimeout(() => {
      const ms = Math.round(performance.now() - start);
      setTestResult(
        JSON.stringify(
          {
            request: { method: ep.method, path: ep.path, payload: ep.samplePayload },
            response: { status: 200, time_ms: ms, data: ep.sampleResponse },
          },
          null,
          2
        )
      );
    }, 45);
  };

  return (
    <div
      id="api-console-drawer"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-[#0A0A0A] text-[#F2F0E4] shadow-2xl flex flex-col border-l-2 border-[#D4AF37]/50 glow-gold animate-in slide-in-from-right duration-200"
    >
      {/* Stepped Corner Brackets */}
      <span className="corner-bracket-tl" />
      <span className="corner-bracket-bl" />

      {/* Drawer Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#141414] border-b border-[#D4AF37]/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-[#241F10] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/50">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-display font-bold uppercase tracking-widest text-[#F2F0E4] flex items-center gap-2">
              RESTful API 規格與即時呼叫監控
            </h3>
            <p className="text-[10px] text-[#888888] font-sans">
              系統非同步呼叫日誌與端點模擬器 (ACTIVE API LOGS)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex bg-[#0A0A0A] p-0.5 rounded-none border border-[#D4AF37]/30 text-xs">
            <button
              onClick={() => setActiveTab('LOGS')}
              className={`px-3 py-1 rounded-none font-display uppercase tracking-wider text-[11px] transition cursor-pointer ${
                activeTab === 'LOGS'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold'
                  : 'text-[#888888] hover:text-[#D4AF37]'
              }`}
            >
              呼叫歷程 ({apiLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('DOCS')}
              className={`px-3 py-1 rounded-none font-display uppercase tracking-wider text-[11px] transition cursor-pointer ${
                activeTab === 'DOCS'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold'
                  : 'text-[#888888] hover:text-[#D4AF37]'
              }`}
            >
              API 規格表 (7)
            </button>
          </div>

          <button
            onClick={() => setIsApiConsoleOpen(false)}
            className="p-1.5 text-[#888888] hover:text-[#D4AF37] hover:bg-[#241F10] rounded-none transition cursor-pointer border border-transparent hover:border-[#D4AF37]/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 art-deco-bg">
        {activeTab === 'LOGS' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#888888] font-sans">
              <span>在系統進行卡片拖曳、RFI 流轉、附件上傳均會即時觸發 API：</span>
              {apiLogs.length > 0 && (
                <button
                  onClick={clearApiLogs}
                  className="flex items-center gap-1 text-[#888888] hover:text-[#E07A5F] transition font-display uppercase tracking-wider text-[10px]"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 清除紀錄
                </button>
              )}
            </div>

            {apiLogs.length === 0 ? (
              <div className="text-center py-12 text-[#888888] text-xs bg-[#141414] rounded-none border border-[#D4AF37]/30 font-display uppercase tracking-wider">
                <Code2 className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]/40" />
                尚未記錄到 API 呼叫，請在看板拖曳卡片或編輯 RFI 試試！
              </div>
            ) : (
              apiLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-[#141414] rounded-none border border-[#D4AF37]/30 font-mono text-xs space-y-2 hover:border-[#D4AF37]/60 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-none text-[10px] font-bold ${
                          log.method === 'GET'
                            ? 'bg-[#241F10] text-[#D4AF37] border border-[#D4AF37]/40'
                            : log.method === 'POST'
                            ? 'bg-[#1b2b1e] text-[#7FB069] border border-[#7FB069]/40'
                            : log.method === 'PATCH' || log.method === 'PUT'
                            ? 'bg-[#2a2414] text-[#D4AF37] border border-[#D4AF37]/40'
                            : 'bg-[#2A1414] text-[#E07A5F] border border-[#E07A5F]/40'
                        }`}
                      >
                        {log.method}
                      </span>
                      <span className="text-[#F2F0E4] truncate max-w-sm">
                        {log.endpoint}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-[#7FB069] font-bold">{log.status} OK</span>
                      <span className="text-[#D4AF37] flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> {log.duration_ms}ms
                      </span>
                    </div>
                  </div>

                  {log.request_payload !== undefined && (
                    <div className="text-[11px] text-[#888888] bg-[#0A0A0A] p-2 rounded-none border border-[#D4AF37]/20 overflow-x-auto">
                      <span className="text-[#D4AF37] font-bold">PAYLOAD:</span>{' '}
                      {JSON.stringify(log.request_payload)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-[#888888] font-sans leading-relaxed">
              根據規格書規劃之 7 大核心 RESTful API 端點，點擊「模擬測試」可立即預覽發送與即時回應格式：
            </div>

            <div className="space-y-3">
              {specEndpoints.map((ep, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#141414] rounded-none border border-[#D4AF37]/30 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#D4AF37] uppercase font-display tracking-wider">
                        {ep.group}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-none font-mono font-bold text-[10px] ${
                          ep.method === 'GET'
                            ? 'bg-[#241F10] text-[#D4AF37] border border-[#D4AF37]/40'
                            : ep.method === 'POST'
                            ? 'bg-[#1b2b1e] text-[#7FB069] border border-[#7FB069]/40'
                            : 'bg-[#2a2414] text-[#D4AF37] border border-[#D4AF37]/40'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono text-[#F2F0E4]">{ep.path}</span>
                    </div>

                    <button
                      onClick={() => handleTestEndpoint(ep)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-none bg-[#D4AF37] hover:bg-[#F2E8C4] text-[#0A0A0A] font-display uppercase tracking-wider font-bold text-[10px] transition cursor-pointer border border-[#D4AF37]"
                    >
                      <Play className="w-3 h-3 fill-current" /> 模擬呼叫
                    </button>
                  </div>
                  <p className="text-[#888888] text-[11px] font-sans">{ep.desc}</p>
                </div>
              ))}
            </div>

            {testResult && (
              <div className="mt-4 p-3.5 bg-[#141414] rounded-none border border-[#D4AF37] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#D4AF37] font-display uppercase tracking-wider font-bold">
                  <span>即時測試回應結果 (LATENCY &lt; 50MS)</span>
                  <button
                    onClick={() => setTestResult(null)}
                    className="text-[#888888] hover:text-[#F2F0E4] cursor-pointer"
                  >
                    關閉
                  </button>
                </div>
                <pre className="p-3 bg-[#0A0A0A] rounded-none border border-[#D4AF37]/30 font-mono text-[11px] text-[#7FB069] overflow-x-auto leading-relaxed">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
