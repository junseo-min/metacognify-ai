import React from 'react';
import { FinalDiagnosticReport, MetacognitiveQuadrant } from '../types';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight, 
  Brain, 
  Sparkles,
  Award
} from 'lucide-react';

interface ComprehensiveReportProps {
  report: FinalDiagnosticReport;
  onNewStudy: () => void;
}

export const ComprehensiveReport: React.FC<ComprehensiveReportProps> = ({
  report,
  onNewStudy,
}) => {
  const { preMetrics, postMetrics, quadrantCounts, vulnerableConcepts, records } = report;

  // 개선도 계산
  const accuracyDiff = postMetrics.accuracyRate - preMetrics.accuracyRate;
  const brierDiff = (preMetrics.brierScore - postMetrics.brierScore).toFixed(3); // 양수면 개선

  const getQuadrantBadge = (quadrant: MetacognitiveQuadrant) => {
    switch (quadrant) {
      case 'CALIBRATED_ACCURATE':
        return { title: '유형 1: 정확한 지식', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'OVERCONFIDENT':
        return { title: '유형 2: 과신 (착각 오답)', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'UNDERCONFIDENT':
        return { title: '유형 3: 과소평가/운', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'RECOGNIZED_IGNORANCE':
        return { title: '유형 4: 인지된 무지', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Total Verdict */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl gradient-primary text-white flex items-center justify-center shadow-md shadow-indigo-200">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
              메타인지 진단 & 코칭 최종 성과 리포트
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {report.materialTitle}
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
          {report.verdictSummary}
        </p>
      </div>

      {/* CORE FEATURE: Pre vs Post Split Metrics (AI 도움 전과 후의 완전 분리 계산) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              훈련 이전(사전) vs AI 코칭 후(사후) 분리 분석
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              * AI의 힌트 도움을 받기 전의 순수 이해도와, 맞춤 코칭 후 재검증 결과를 명확히 분리하여 왜곡을 방지했습니다.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold font-mono">
            총 {records.length}개 핵심 개념
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Card 1: 훈련 이전 (Pre-Training) */}
          <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 px-2.5 py-1 rounded-lg bg-white border border-slate-200">
                1. 훈련 이전 순수 실력 (Pre)
              </span>
              <span className="text-xs text-slate-400">AI 도움 받기 전</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block mb-0.5">정답률</span>
                <span className="text-xl font-black text-slate-800 font-mono">
                  {preMetrics.accuracyRate}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  ({preMetrics.correctCount}/{preMetrics.totalCount})
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block mb-0.5">평균 자신감</span>
                <span className="text-xl font-black text-indigo-600 font-mono">
                  {preMetrics.averageConfidence}%
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block mb-0.5">Brier Score</span>
                <span className="text-xl font-black text-slate-800 font-mono">
                  {preMetrics.brierScore}
                </span>
                <span className="text-[9px] text-slate-400 block">0에 근접할수록 우수</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-white/80 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
              <strong>판단 편향(Bias):</strong> {preMetrics.calibrationBias > 0 ? `+${preMetrics.calibrationBias}% (과신 경향)` : `${preMetrics.calibrationBias}% (신중형)`}
            </div>
          </div>

          {/* Card 2: 훈련 이후 (Post-Training Retest) */}
          <div className="p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300">
                2. AI 코칭 및 개념교정 후 (Post)
              </span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                변형 문제 재검증
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-slate-400 block mb-0.5">정답률</span>
                <span className="text-xl font-black text-emerald-600 font-mono">
                  {postMetrics.accuracyRate}%
                </span>
                <span className="text-[10px] font-bold text-emerald-700 block">
                  {accuracyDiff >= 0 ? `+${accuracyDiff}% 향상` : `${accuracyDiff}%`}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-slate-400 block mb-0.5">평균 자신감</span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  {postMetrics.averageConfidence}%
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-slate-400 block mb-0.5">Brier Score</span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  {postMetrics.brierScore}
                </span>
                <span className="text-[9px] font-bold text-emerald-600 block">
                  {Number(brierDiff) >= 0 ? `▲ ${brierDiff} 정밀도 개선` : `변동 없음`}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-emerald-900 bg-white/90 p-2.5 rounded-xl border border-emerald-100 leading-relaxed font-medium">
              💡 <strong>교정 성과:</strong> AI 역질문을 통해 왜곡된 오개념을 인지하고 동일 개념 변형 문제에서 올바른 인출에 성공했습니다.
            </div>
          </div>
        </div>
      </div>

      {/* 4-Quadrant Metacognitive Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-4">
        <h3 className="text-base sm:text-lg font-black text-slate-900">
          4가지 학습 결과 구분 (사전 진단 기준)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-[11px] font-bold text-emerald-800 block mb-1">유형 1: 정확한 지식</span>
            <span className="text-2xl font-black text-emerald-700 font-mono">{quadrantCounts.CALIBRATED_ACCURATE}</span>
            <span className="text-[10px] text-emerald-600 block mt-1">자신감 높음 + 정답</span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
            <span className="text-[11px] font-bold text-rose-800 block mb-1">유형 2: 과신 (오답)</span>
            <span className="text-2xl font-black text-rose-700 font-mono">{quadrantCounts.OVERCONFIDENT}</span>
            <span className="text-[10px] text-rose-600 block mt-1">자신감 높음 + 오답</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <span className="text-[11px] font-bold text-amber-800 block mb-1">유형 3: 과소평가/운</span>
            <span className="text-2xl font-black text-amber-700 font-mono">{quadrantCounts.UNDERCONFIDENT}</span>
            <span className="text-[10px] text-amber-600 block mt-1">자신감 낮음 + 정답</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-800 block mb-1">유형 4: 인지된 무지</span>
            <span className="text-2xl font-black text-slate-700 font-mono">{quadrantCounts.RECOGNIZED_IGNORANCE}</span>
            <span className="text-[10px] text-slate-500 block mt-1">자신감 낮음 + 오답</span>
          </div>
        </div>
      </div>

      {/* Vulnerable Concepts Box */}
      {vulnerableConcepts.length > 0 && (
        <div className="bg-rose-50/70 rounded-3xl p-6 sm:p-7 border border-rose-200 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h4 className="font-extrabold text-sm sm:text-base text-rose-950">
              시험 전 반드시 재점검해야 할 취약 개념
            </h4>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            사전에 높은 자신감으로 오답을 내었거나 재검증 과정에서 오개념이 드러난 핵심 포인트입니다:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {vulnerableConcepts.map((c, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-white text-rose-800 text-xs font-bold border border-rose-200 shadow-sm"
              >
                📌 {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Problem-by-Problem Detailed Audit */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-4">
        <h3 className="text-base sm:text-lg font-black text-slate-900">
          개념별 사전 진단 vs 사후 재검증 상세 비교
        </h3>

        <div className="space-y-4">
          {records.map((r, idx) => {
            const badge = getQuadrantBadge(r.preAnswer.quadrant);
            return (
              <div
                key={r.pairId}
                className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-700">#{idx + 1}</span>
                    <span className="font-extrabold text-slate-900 text-sm">{r.concept}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.title}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    사전 자신감 {r.preAnswer.confidence}% → 재검증 자신감 {r.postAnswer?.confidence || 0}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  {/* Primary Result */}
                  <div className={`p-3 rounded-xl border ${
                    r.preAnswer.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                  }`}>
                    <span className="font-bold text-slate-700 block mb-1">
                      [1차 문제 결과]: {r.preAnswer.isCorrect ? '🟢 정답' : '🔴 오답'}
                    </span>
                    <p className="text-slate-600 line-clamp-2">
                      내 답: {r.primaryQuestion.options[r.preAnswer.userChoice]}
                    </p>
                  </div>

                  {/* Retest Result */}
                  <div className={`p-3 rounded-xl border ${
                    r.postAnswer?.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="font-bold text-emerald-800 block mb-1">
                      [재검증 변형 문제]: {r.postAnswer?.isCorrect ? '🟢 정답 (교정 완료)' : '⚪ 미정'}
                    </span>
                    <p className="text-slate-600 line-clamp-2">
                      내 답: {r.postAnswer ? r.retestQuestion.options[r.postAnswer.userChoice] : '-'}
                    </p>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                  <span className="font-bold text-slate-800">해설: </span>
                  {r.primaryQuestion.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer New Study Action */}
      <div className="flex justify-center pb-8">
        <button
          onClick={onNewStudy}
          className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
        >
          <span>새로운 학습자료로 시작하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
