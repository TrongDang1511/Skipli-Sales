import { useState, useEffect } from 'react';
import { checkBackendHealth } from './services/api';
import { Activity, Database, Server, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBackendHealth().then((data) => {
      setHealth(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white shadow-lg shadow-sky-600/30">
            S
          </div>
          <div>
            <span className="font-extrabold text-white tracking-tight">SKIPLI SALES INTERNAL</span>
            <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-sky-950 text-sky-400 border border-sky-800 rounded">
              GIAI ĐOẠN 0: KẾT NỐI HẠ TẦNG
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Backend: <strong className="text-white">Port 5000</strong></span>
          <span>•</span>
          <span>Frontend: <strong className="text-white">Port 5173</strong></span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-white">🎉 Khởi Tạo Hạ Tầng Thành Công!</h1>
            <p className="text-xs text-slate-400">
              Kiểm tra trạng thái kết nối giữa Frontend (React Vite) $\rightarrow$ Backend (Express API) $\rightarrow$ Database (Google Cloud Firestore).
            </p>
          </div>

          {/* Cards Trạng Thái */}
          <div className="grid grid-cols-2 gap-3">
            {/* Backend Card */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-sky-400" />
                  Express Backend
                </span>
                {health?.status === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="text-lg font-bold text-white">
                {loading ? 'Đang kết nối...' : health?.status === 'ok' ? 'Online (200 OK)' : 'Chưa bật server'}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">http://localhost:5000/api/health</div>
            </div>

            {/* Firestore Card */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-amber-400" />
                  Google Firestore
                </span>
                {health?.firestore?.status === 'connected' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Activity className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="text-lg font-bold text-white">
                {loading ? 'Đang kiểm tra...' : health?.firestore?.status === 'connected' ? 'Đã Kết Nối' : 'Chờ Backend'}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {health?.firestore?.collectionsCount !== undefined ? `${health.firestore.collectionsCount} collections` : 'serviceAccountKey.json'}
              </div>
            </div>
          </div>

          <div className="p-3 bg-sky-950/40 border border-sky-800/60 rounded-xl text-xs text-sky-200">
            💡 <strong>Tiếp theo:</strong> Hạ tầng nền tảng đã vững vàng. Bạn có thể sẵn sàng bước vào <strong>Giai đoạn 1: Quản trị Tài khoản & Onboarding qua Email</strong>!
          </div>
        </div>
      </main>
    </div>
  );
}
