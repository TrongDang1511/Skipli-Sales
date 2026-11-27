/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/pages/SalesWorkspacePage.tsx
 * PHÂN LOẠI: PAGE COMPONENT (SALES DASHBOARD - DỮ LIỆU THẬT 100%)
 * VAI TRÒ: Nhịp Gọi Hằng Ngày, Phân Bổ Lead Cá Nhân & Hàng Đợi Gọi Ưu Tiên
 * ==============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  PhoneCall,
  AlertTriangle,
  DollarSign,
  CalendarCheck,
  RefreshCw,
  Loader2,
  UserCheck,
  ArrowRight,
  Pencil,
  Phone,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { getLocalDateString } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { leadApi, extractApiErrorMessage } from '../services/lead.api';
import {
  DashboardPeriod,
  Lead,
  LEAD_STATUS_CONFIG,
  SalesDashboardResponse,
} from '../types/lead.types';
import { LeadPowerWorkspace } from '../components/lead/LeadPowerWorkspace';

const PERIOD_OPTIONS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: 'today', label: 'Hôm nay' },
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: 'all', label: 'Tất cả' },
];

const STATUS_BAR_COLORS: Record<string, string> = {
  NEW: '#0284c7',
  CALLING: '#0ea5e9',
  LOW_INTERESTED: '#f59e0b',
  HIGH_INTERESTED: '#6366f1',
  HOT_LEAD: '#e11d48',
};

const rhythmChartConfig: ChartConfig = {
  calls: { label: 'Cuộc gọi', color: '#0284c7' },
  hotOrWon: { label: 'Lên Hot / Won', color: '#10b981' },
};

const statusChartConfig: ChartConfig = {
  count: { label: 'Số Lead', color: '#0284c7' },
};

export const SalesWorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const today = getLocalDateString();

  const [period, setPeriod] = useState<DashboardPeriod>('7d');
  const [data, setData] = useState<SalesDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await leadApi.getSalesDashboard(period, today);
      setData(res);
    } catch (err: any) {
      toast.error(extractApiErrorMessage(err, 'Không tải được dữ liệu Dashboard cá nhân!'));
    } finally {
      setIsLoading(false);
    }
  }, [period, today]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const callProgressPercent = data
    ? Math.min(100, Math.round((data.kpis.todayCallsCount / data.kpis.dailyCallTarget) * 100))
    : 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FAF8F5]">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200/80 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-0.5">
            <span>Bàn Làm Việc</span>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Dashboard Cá Nhân</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Nhịp Gọi & Mục Tiêu Hôm Nay
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-800 font-mono font-bold">
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Prefix: {user?.salesPrefix || 'SR'}</span>
          </div>

          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  period === opt.value
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadDashboard}
            disabled={isLoading}
            className="rounded-xl border-slate-200 bg-white text-xs font-bold gap-1.5 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </header>

      {/* MAIN */}
      <main className="p-6 sm:p-8 space-y-6">
        {isLoading && !data ? (
          <div className="py-24 text-center text-slate-400 text-xs">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-sky-600 mb-2" />
            <p className="font-semibold text-slate-600">Đang tải dữ liệu...</p>
          </div>
        ) : data ? (
          <>
            {/* HÀNG 1: 4 THẺ KPI CÁ NHÂN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-3xl border-slate-200/80 shadow-xs bg-white">
                <CardContent className="p-5 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      CẦN GỌI HÔM NAY
                    </span>
                    <div className="text-2xl font-black text-slate-900">
                      {data.kpis.dueTodayCount}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {data.kpis.followUpTodayCount} lịch hẹn • {data.kpis.newAssignedCount} New
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card
                onClick={() => navigate('/workspace/leads?sheet=FOLLOW_UP&schedule=OVERDUE')}
                className="rounded-3xl border-slate-200/80 hover:border-rose-300 shadow-xs bg-white cursor-pointer transition-colors"
              >
                <CardContent className="p-5 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      QUÁ HẠN LỊCH HẸN
                    </span>
                    <div className="text-2xl font-black text-rose-600">
                      {data.kpis.overdueCount}
                    </div>
                    <div className="text-[11px] text-rose-600 font-semibold">
                      Bấm để xử lý ngay
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200/80 shadow-xs bg-white">
                <CardContent className="p-5 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      CUỘC GỌI HÔM NAY
                    </span>
                    <div className="text-2xl font-black text-sky-600">
                      {data.kpis.todayCallsCount}{' '}
                      <span className="text-sm font-bold text-slate-400">
                        / {data.kpis.dailyCallTarget}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Đạt {callProgressPercent}% chỉ tiêu ngày
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200/80 shadow-xs bg-white">
                <CardContent className="p-5 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      DEAL WON & DOANH THU
                    </span>
                    <div className="text-2xl font-black text-emerald-600 font-mono">
                      ${data.kpis.wonRevenue.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      <strong className="text-slate-800">{data.kpis.wonCount}</strong> hợp đồng đã chốt
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* HÀNG 2: NHỊP GỌI & CHỐT ĐƠN (7 CỘT) + PHÂN BỔ LEAD ĐANG GIỮ (5 CỘT) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <Card className="lg:col-span-7 rounded-3xl border-slate-200/80 shadow-xs bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black text-slate-900">
                    Nhịp Gọi & Lên Hot / Won Theo Ngày
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={rhythmChartConfig} className="h-[260px] w-full">
                    <ComposedChart
                      data={data.dailyActivity}
                      margin={{ top: 10, right: 12, left: 0, bottom: 4 }}
                    >
                      <CartesianGrid vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fontWeight: 600, fill: '#334155' }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent className="bg-white border-slate-200 shadow-lg rounded-xl text-slate-800" />
                        }
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar
                        dataKey="calls"
                        fill="#0284c7"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={32}
                      />
                      <Line
                        type="monotone"
                        dataKey="hotOrWon"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#10b981' }}
                      />
                    </ComposedChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-5 rounded-3xl border-slate-200/80 shadow-xs bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black text-slate-900">
                    Lead Đang Giữ & Chỉ Tiêu Ngày
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ChartContainer config={statusChartConfig} className="h-[190px] w-full">
                    <BarChart
                      data={data.statusBreakdown}
                      layout="vertical"
                      margin={{ top: 4, right: 28, left: 4, bottom: 4 }}
                    >
                      <CartesianGrid horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide allowDecimals={false} />
                      <YAxis
                        dataKey="label"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={92}
                        tick={{ fontSize: 11, fontWeight: 600, fill: '#334155' }}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent className="bg-white border-slate-200 shadow-lg rounded-xl text-slate-800" />
                        }
                      />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20}>
                        {data.statusBreakdown.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={STATUS_BAR_COLORS[entry.status] || '#0284c7'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>

                  {/* Thanh tiến độ chỉ tiêu cuộc gọi trong ngày */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Chỉ tiêu gọi hôm nay</span>
                      <span className="font-mono font-bold text-sky-700">
                        {data.kpis.todayCallsCount} / {data.kpis.dailyCallTarget} cuộc ({callProgressPercent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sky-600 transition-all"
                        style={{ width: `${callProgressPercent}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* HÀNG 3: HÀNG ĐỢI GỌI ĐIỆN ƯU TIÊN TRONG NGÀY */}
            <Card className="rounded-3xl border-slate-200/80 shadow-xs bg-white">
              <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-sky-600" />
                  <span>Hàng Đợi Gọi Ưu Tiên Hôm Nay</span>
                  <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                    {data.callQueue.length}
                  </Badge>
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/workspace/leads')}
                  className="rounded-xl border-slate-200 text-xs font-bold gap-1 shrink-0"
                >
                  <span>Mở toàn bộ Leads</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </CardHeader>
              <CardContent>
                {data.callQueue.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400 italic">
                    Tuyệt vời! Bạn đã xử lý hết lịch gọi ưu tiên hôm nay.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data.callQueue.map((lead) => {
                      const statusConf = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.NEW;
                      const isOverdue = Boolean(
                        lead.nextCallDate && lead.nextCallDate.slice(0, 10) < today
                      );

                      return (
                        <div
                          key={lead.id}
                          className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition-colors"
                        >
                          <div className="min-w-0 space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                                {lead.leadCustomId}
                              </span>
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {lead.restaurantName}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-bold bg-white ${statusConf.borderClass} ${statusConf.textClass}`}
                              >
                                {statusConf.label}
                              </Badge>
                              {isOverdue && (
                                <Badge
                                  variant="outline"
                                  className="bg-rose-50 text-rose-600 border-rose-200 text-[10px]"
                                >
                                  Quá hạn ({lead.nextCallDate})
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                              <span className="font-mono font-semibold text-slate-700">
                                {lead.hotline}
                              </span>
                              <span className="truncate max-w-md italic">
                                {lead.latestNote || 'Chưa có ghi chú'}
                              </span>
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setSelectedLead(lead)}
                            className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold gap-1.5 shrink-0"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Gọi & Note</span>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>

      {/* Drawer Power Calling ngay tại Dashboard */}
      <Sheet
        open={Boolean(selectedLead)}
        onOpenChange={(open) => {
          if (!open) setSelectedLead(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-[460px] p-0 border-l border-slate-200 overflow-hidden [&>button]:hidden"
        >
          <SheetTitle className="sr-only">Power Calling Workspace</SheetTitle>
          {selectedLead && (
            <LeadPowerWorkspace
              variant="drawer"
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
              onLeadSynced={(updatedLead) => {
                setSelectedLead(updatedLead);
                loadDashboard();
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
