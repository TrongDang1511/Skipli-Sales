/**
 * ==============================================================================
 * DỰ ÁN: SKIPLI SALES INTERNAL CRM
 * FILE: frontend/src/pages/AdminDashboardPage.tsx
 * PHÂN LOẠI: PAGE COMPONENT (ADMIN DASHBOARD - DỮ LIỆU THẬT 100%)
 * VAI TRÒ: Tổng Quan Doanh Thu, Phễu 7 Trạng Thái, Kết Quả Cuộc Gọi, Hiệu Suất Sales & Action Queue
 * ==============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from 'recharts';
import {
  DollarSign,
  Flame,
  AlertTriangle,
  PhoneCall,
  RefreshCw,
  ArrowRight,
  Loader2,
  UserX,
  Clock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { getLocalDateString } from '@/lib/utils';
import { leadApi, extractApiErrorMessage } from '../services/lead.api';
import { AdminDashboardResponse, DashboardPeriod } from '../types/lead.types';
import { useToast } from '../contexts/ToastContext';

const PERIOD_OPTIONS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: 'today', label: 'Hôm nay' },
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: 'all', label: 'Tất cả' },
];

const FUNNEL_COLORS: Record<string, string> = {
  NEW: '#0284c7',
  CALLING: '#0ea5e9',
  LOW_INTERESTED: '#f59e0b',
  HIGH_INTERESTED: '#6366f1',
  HOT_LEAD: '#e11d48',
  WON: '#10b981',
  LOST: '#94a3b8',
};

const OUTCOME_COLORS: Record<string, string> = {
  ANSWERED: '#10b981',
  CALLBACK: '#0ea5e9',
  NO_ANSWER: '#f59e0b',
  VOICEMAIL: '#6366f1',
  BUSY: '#f97316',
};

const funnelChartConfig: ChartConfig = {
  count: { label: 'Số Lead', color: '#0284c7' },
};

const outcomeChartConfig: ChartConfig = {
  ANSWERED: { label: 'Nghe máy', color: '#10b981' },
  CALLBACK: { label: 'Hẹn gọi lại', color: '#0ea5e9' },
  NO_ANSWER: { label: 'Không bắt máy', color: '#f59e0b' },
  VOICEMAIL: { label: 'Hộp thư thoại', color: '#6366f1' },
  BUSY: { label: 'Máy bận', color: '#f97316' },
};

const salesChartConfig: ChartConfig = {
  calls: { label: 'Cuộc gọi', color: '#0284c7' },
  wonCount: { label: 'Deal Won', color: '#10b981' },
};

const lostChartConfig: ChartConfig = {
  count: { label: 'Lead Lost', color: '#f43f5e' },
};

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const today = getLocalDateString();

  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await leadApi.getAdminDashboard(period, today);
      setData(res);
    } catch (err: any) {
      toast.error(extractApiErrorMessage(err, 'Không tải được dữ liệu Dashboard!'));
    } finally {
      setIsLoading(false);
    }
  }, [period, today]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const funnelData =
    data?.funnel.map((item, idx) => ({
      ...item,
      displayLabel:
        idx === 0 ? `${item.count}` : `${item.count} (${item.conversionFromPrev}%)`,
      fill: FUNNEL_COLORS[item.status] || '#0284c7',
    })) || [];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FAF8F5]">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200/80 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-0.5">
            <span>Bàn Làm Việc</span>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Dashboard Quản Trị</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tổng Quan Kinh Doanh
          </h1>
        </div>

        {/* Bộ lọc kỳ & Làm mới */}
        <div className="flex items-center gap-2 flex-wrap">
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

      {/* MAIN CONTENT */}
      <main className="p-6 sm:p-8 space-y-6">
        {isLoading && !data ? (
          <div className="py-24 text-center text-slate-400 text-xs">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-sky-600 mb-2" />
            <p className="font-semibold text-slate-600">Đang tải dữ liệu...</p>
          </div>
        ) : data ? (
          <>
            {/* HÀNG 1: 4 THẺ KPI NGẮN GỌN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-3xl border-slate-200/80 shadow-xs bg-white">
                <CardContent className="p-5 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      DOANH THU WON
                    </span>
                    <div className="text-2xl font-black text-emerald-600 font-mono">
                      ${data.kpis.wonRevenue.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      <strong className="text-slate-800">{data.kpis.wonCount}</strong> deal chốt
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200/80 shadow-xs bg-white">
                <CardContent className="p-5 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      LEAD ĐANG MỞ
                    </span>
                    <div className="text-2xl font-black text-slate-900">
                      {data.kpis.pipelineTotal.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 flex-wrap">
                      <span>{data.kpis.newCount} New</span>
                      <span>•</span>
                      <span>{data.kpis.followUpCount} Follow-Up</span>
                      <span>•</span>
                      <span className="text-rose-600 font-bold">{data.kpis.hotLeadCount} Hot</span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200/80 shadow-xs bg-white">
                <CardContent className="p-5 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      CHƯA GIAO & QUÁ HẠN
                    </span>
                    <div className="text-2xl font-black text-amber-600">
                      {data.kpis.unassignedCount}{' '}
                      <span className="text-sm font-bold text-slate-400">/</span>{' '}
                      <span className="text-rose-600">{data.kpis.overdueCount}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {data.kpis.unassignedCount} chưa giao •{' '}
                      <span className="text-rose-600 font-semibold">{data.kpis.overdueCount} quá hạn</span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200/80 shadow-xs bg-white">
                <CardContent className="p-5 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      TỔNG CUỘC GỌI
                    </span>
                    <div className="text-2xl font-black text-sky-600">
                      {data.kpis.totalCalls.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Nghe máy: <strong className="text-emerald-700">{data.kpis.answeredRate}%</strong> ({data.kpis.answeredCount})
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* HÀNG 2: PHỄU 7 TRẠNG THÁI (7 CỘT) & KẾT QUẢ CUỘC GỌI (5 CỘT) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <Card className="lg:col-span-7 rounded-3xl border-slate-200/80 shadow-xs bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black text-slate-900">
                    Phễu 7 Trạng Thái
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={funnelChartConfig} className="h-[270px] w-full">
                    <BarChart
                      data={funnelData}
                      layout="vertical"
                      margin={{ top: 4, right: 64, left: 10, bottom: 4 }}
                    >
                      <CartesianGrid horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="label"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={96}
                        tick={{ fontSize: 11, fontWeight: 600, fill: '#334155' }}
                      />
                      <ChartTooltip
                        cursor={{ fill: 'rgba(14, 165, 233, 0.08)' }}
                        content={
                          <ChartTooltipContent className="bg-white border-slate-200 shadow-lg rounded-xl text-slate-800" />
                        }
                      />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={22}>
                        {funnelData.map((entry) => (
                          <Cell key={entry.status} fill={entry.fill} />
                        ))}
                        <LabelList
                          dataKey="displayLabel"
                          position="right"
                          style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }}
                        />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-5 rounded-3xl border-slate-200/80 shadow-xs bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black text-slate-900">
                    Kết Quả Cuộc Gọi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.kpis.totalCalls === 0 ? (
                    <div className="h-[270px] flex items-center justify-center text-xs text-slate-400 italic">
                      Chưa có cuộc gọi nào.
                    </div>
                  ) : (
                    <div className="relative">
                      <ChartContainer config={outcomeChartConfig} className="h-[270px] w-full">
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent
                                nameKey="key"
                                className="bg-white border-slate-200 shadow-lg rounded-xl text-slate-800"
                              />
                            }
                          />
                          <Pie
                            data={data.callOutcomes}
                            dataKey="count"
                            nameKey="key"
                            innerRadius={60}
                            outerRadius={88}
                            paddingAngle={3}
                          >
                            {data.callOutcomes.map((entry) => (
                              <Cell
                                key={entry.key}
                                fill={OUTCOME_COLORS[entry.key] || '#94a3b8'}
                              />
                            ))}
                          </Pie>
                          <ChartLegend
                            content={
                              <ChartLegendContent
                                nameKey="key"
                                className="flex-wrap gap-x-3 gap-y-1 text-[11px]"
                              />
                            }
                          />
                        </PieChart>
                      </ChartContainer>
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-9">
                        <span className="text-2xl font-black text-slate-900">
                          {data.kpis.totalCalls}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600">
                          {data.kpis.answeredRate}% Nghe máy
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* HÀNG 3: HIỆU SUẤT SALES (7 CỘT) & LÝ DO LOST (5 CỘT) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <Card className="lg:col-span-7 rounded-3xl border-slate-200/80 shadow-xs bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black text-slate-900">
                    Hiệu Suất Sales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.salesPerformance.length === 0 ? (
                    <div className="h-[230px] flex items-center justify-center text-xs text-slate-400 italic">
                      Chưa có Sales hoạt động.
                    </div>
                  ) : (
                    <>
                      <ChartContainer config={salesChartConfig} className="h-[210px] w-full">
                        <BarChart
                          data={data.salesPerformance}
                          margin={{ top: 10, right: 12, left: 0, bottom: 4 }}
                        >
                          <CartesianGrid vertical={false} stroke="#f1f5f9" />
                          <XAxis
                            dataKey="displayLabel"
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
                            cursor={{ fill: 'rgba(14, 165, 233, 0.08)' }}
                            content={
                              <ChartTooltipContent className="bg-white border-slate-200 shadow-lg rounded-xl text-slate-800" />
                            }
                          />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Bar
                            dataKey="calls"
                            fill="var(--color-calls)"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={42}
                          />
                          <Bar
                            dataKey="wonCount"
                            fill="var(--color-wonCount)"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={42}
                          />
                        </BarChart>
                      </ChartContainer>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                        {data.salesPerformance.map((s) => (
                          <div
                            key={s.salesId}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                          >
                            <span className="font-bold text-slate-800">{s.displayLabel}</span>
                            <span className="font-mono font-bold text-emerald-700">
                              ${s.wonRevenue.toLocaleString()}
                            </span>
                            {s.overdueCount > 0 && (
                              <Badge
                                variant="outline"
                                className="bg-rose-50 text-rose-600 border-rose-200 text-[10px] px-1.5 py-0"
                              >
                                {s.overdueCount} quá hạn
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-5 rounded-3xl border-slate-200/80 shadow-xs bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black text-slate-900">
                    Lý Do Mất Khách (Lost)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.lostReasons.length === 0 ? (
                    <div className="h-[250px] flex items-center justify-center text-xs text-slate-400 italic">
                      Chưa có đơn Lost nào.
                    </div>
                  ) : (
                    <ChartContainer config={lostChartConfig} className="h-[250px] w-full">
                      <BarChart
                        data={data.lostReasons}
                        layout="vertical"
                        margin={{ top: 4, right: 28, left: 4, bottom: 4 }}
                      >
                        <CartesianGrid horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide allowDecimals={false} />
                        <YAxis
                          dataKey="reason"
                          type="category"
                          tickLine={false}
                          axisLine={false}
                          width={165}
                          tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }}
                        />
                        <ChartTooltip
                          cursor={{ fill: 'rgba(244, 63, 94, 0.08)' }}
                          content={
                            <ChartTooltipContent className="bg-white border-slate-200 shadow-lg rounded-xl text-slate-800" />
                          }
                        />
                        <Bar dataKey="count" fill="#f43f5e" radius={[0, 8, 8, 0]} barSize={22}>
                          <LabelList
                            dataKey="count"
                            position="right"
                            style={{ fontSize: 11, fontWeight: 700, fill: '#e11d48' }}
                          />
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* HÀNG 4: ACTION QUEUE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="rounded-3xl border-slate-200/80 shadow-xs bg-white">
                <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <UserX className="w-4 h-4 text-amber-600" />
                    <span>Chưa Phân Công</span>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      {data.kpis.unassignedCount}
                    </Badge>
                  </CardTitle>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => navigate('/leads?assignedTo=UNASSIGNED')}
                    className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold gap-1 shrink-0"
                  >
                    <span>Phân bổ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {data.actionQueue.unassignedQueue.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 italic">
                      Đã phân công hết Lead.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {data.actionQueue.unassignedQueue.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => navigate('/leads?assignedTo=UNASSIGNED')}
                          className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl cursor-pointer transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {item.leadCustomId}
                              </span>
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {item.restaurantName}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Bang {item.state} • {item.hotline}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200/80 shadow-xs bg-white">
                <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-600" />
                    <span>Lead Hot Bị Bỏ Quên</span>
                    <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200">
                      {data.actionQueue.neglectedHotLeads.length}
                    </Badge>
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/leads?status=HOT_LEAD')}
                    className="rounded-xl border-slate-200 text-xs font-bold gap-1 shrink-0"
                  >
                    <span>Xem bảng</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {data.actionQueue.neglectedHotLeads.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 italic">
                      Không có Lead Hot nào bị bỏ quên.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {data.actionQueue.neglectedHotLeads.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => navigate(`/leads?status=${encodeURIComponent(item.status)}`)}
                          className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl cursor-pointer transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {item.leadCustomId}
                              </span>
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {item.restaurantName}
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  item.status === 'HOT_LEAD'
                                    ? 'bg-rose-50 text-rose-600 border-rose-200 text-[10px] px-1.5 py-0'
                                    : 'bg-indigo-50 text-indigo-600 border-indigo-200 text-[10px] px-1.5 py-0'
                                }
                              >
                                {item.status === 'HOT_LEAD' ? 'Hot' : 'High Interest'}
                              </Badge>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              Phụ trách: <strong>{item.assignedName}</strong>
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-rose-600 font-semibold shrink-0">
                            {item.nextCallDate ? `Hẹn: ${item.nextCallDate}` : 'Chưa đặt lịch'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};
