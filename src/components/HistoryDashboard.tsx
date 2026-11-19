import React from 'react';
import { LearningSession } from '../types';
import { BarChart3, Calendar, Award, Trash2, ArrowRight, Brain, TrendingUp } from 'lucide-react';

interface HistoryDashboardProps {
  sessions: LearningSession[];
  onSelectSession: (session: LearningSession) => void;
  onDeleteSession: (id: string) => void;
  onNewStudy: () => void;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({
  sessions,
  onSelectSession,
  onDeleteSession,
  onNewStudy,
}) => {
  if (sessions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">아직 저장된 학습 기록이 없습니다</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          강의자료를 입력하고 인출 퀴즈를 완료하면, Brier Score와 메타인지 캘리브레이션 성장 추이가 이곳에 누적 기록됩니다.
        </p>
        <button
          onClick={onNewStudy}
          className="px-6 py-2.5 rounded-xl gradient-primary text-white font-bold text-xs shadow-md shadow-indigo-200 hover:opacity-95"
        >
          첫 메타인지 진단 시작하기
        </button>
      </div>
    );
  }

  // 평균 Brier Score 및 평균 정답률 계산
  const avgBrier = (
    sessions.reduce((acc, s) => acc + s.analysis.brierScore, 0) / sessions.length
  ).toFixed(3);
  const avgAccuracy = Math.round(
    sessions.reduce((acc, s) => acc + s.analysis.accuracyRate, 0) / sessions.length
  );
  const totalQuestionsSolved = sessions.reduce((acc, s) => acc + s.questions.length, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Stat Overview */}
      <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          메타인지 성장 트래커
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight mb-4">
          누적 학습 및 인지 모니터링 분석
        </h2>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-indigo-700/50">
          <div>
            <span className="text-[11px] text-indigo-200 block">완료한 세션</span>
            <span className="text-2xl sm:text-3xl font-black font-mono">{sessions.length}회</span>
          </div>
          <div>
            <span className="text-[11px] text-indigo-200 block">평균 정답률</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">{avgAccuracy}%</span>
          </div>
          <div>
            <span className="text-[11px] text-indigo-200 block">평균 Brier Score</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300">{avgBrier}</span>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">학습 세션 히스토리</h3>
          <span className="text-xs text-slate-400">총 {totalQuestionsSolved}문항 풀이</span>
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{session.title}</h4>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold font-mono">
                    정답률: {session.analysis.accuracyRate}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    자신감: {session.analysis.averageConfidence}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono">
                    Brier: {session.analysis.brierScore}
                  </span>
                  {session.analysis.quadrantCounts.OVERCONFIDENT > 0 && (
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold">
                      과신 오답 {session.analysis.quadrantCounts.OVERCONFIDENT}개
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSelectSession(session)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition-all"
                >
                  리포트 보기
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDeleteSession(session.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="세션 삭제"
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
