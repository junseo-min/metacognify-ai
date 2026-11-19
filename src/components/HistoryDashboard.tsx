import React from 'react';
import { FinalDiagnosticReport } from '../types';
import { BarChart3, Calendar, Trash2, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';

interface HistoryDashboardProps {
  reports: FinalDiagnosticReport[];
  onSelectReport: (report: FinalDiagnosticReport) => void;
  onDeleteReport: (sessionId: string) => void;
  onNewStudy: () => void;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({
  reports,
  onSelectReport,
  onDeleteReport,
  onNewStudy,
}) => {
  if (reports.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">저장된 메타인지 훈련 기록이 없습니다</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          4단계 메타인지 훈련(문제풀이 → 유형분류 → AI코칭/개념교정 → 재검증)을 완료하면 사전/사후 분리 리포트가 이곳에 누적 보관됩니다.
        </p>
        <button
          onClick={onNewStudy}
          className="px-6 py-2.5 rounded-xl gradient-primary text-white font-bold text-xs shadow-md shadow-indigo-200 hover:opacity-95"
        >
          첫 메타인지 훈련 시작하기
        </button>
      </div>
    );
  }

  // 전체 평균 개선 지표
  const avgPreAcc = Math.round(reports.reduce((acc, r) => acc + r.preMetrics.accuracyRate, 0) / reports.length);
  const avgPostAcc = Math.round(reports.reduce((acc, r) => acc + r.postMetrics.accuracyRate, 0) / reports.length);
  const totalConceptsTrained = reports.reduce((acc, r) => acc + r.records.length, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          누적 메타인지 성장 대시보드
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight mb-4">
          훈련 이전(순수 실력) vs AI 교정 후(재검증) 누적 성과
        </h2>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-indigo-700/50">
          <div>
            <span className="text-[11px] text-indigo-200 block">완료한 세션</span>
            <span className="text-2xl sm:text-3xl font-black font-mono">{reports.length}회</span>
            <span className="text-[10px] text-indigo-300 block">({totalConceptsTrained}개 개념 정복)</span>
          </div>
          <div>
            <span className="text-[11px] text-indigo-200 block">사전 평균 정답률</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-300">{avgPreAcc}%</span>
            <span className="text-[10px] text-indigo-300 block">AI 도움 전</span>
          </div>
          <div>
            <span className="text-[11px] text-indigo-200 block">재검증 평균 정답률</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">{avgPostAcc}%</span>
            <span className="text-[10px] text-emerald-400 font-bold block">▲ {avgPostAcc - avgPreAcc}% 향상</span>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">누적 훈련 리포트 목록</h3>
          <span className="text-xs text-slate-400">최신순</span>
        </div>

        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.sessionId}
              className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-sm">{report.materialTitle}</h4>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-mono">
                    사전: {report.preMetrics.accuracyRate}%
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold font-mono">
                    재검증: {report.postMetrics.accuracyRate}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
                    Brier: {report.preMetrics.brierScore} → {report.postMetrics.brierScore}
                  </span>
                  {report.quadrantCounts.OVERCONFIDENT > 0 && (
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[11px]">
                      과신 오답 {report.quadrantCounts.OVERCONFIDENT}개 교정
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSelectReport(report)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                >
                  리포트 상세
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDeleteReport(report.sessionId)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
