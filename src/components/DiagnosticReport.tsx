import React from 'react';
import { Question, UserAnswer, MetacognitiveAnalysis, MetacognitiveQuadrant } from '../types';
import { 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  Activity, 
  MessageSquare, 
  RotateCcw, 
  Sparkles, 
  ArrowUpRight,
  TrendingUp,
  Brain
} from 'lucide-react';

interface DiagnosticReportProps {
  questions: Question[];
  answers: UserAnswer[];
  analysis: MetacognitiveAnalysis;
  onStartSocraticCoach: (question: Question, answer: UserAnswer) => void;
  onRetest: () => void;
  onNewStudy: () => void;
}

export const DiagnosticReport: React.FC<DiagnosticReportProps> = ({
  questions,
  answers,
  analysis,
  onStartSocraticCoach,
  onRetest,
  onNewStudy,
}) => {
  const getQuadrantBadge = (quadrant: MetacognitiveQuadrant) => {
    switch (quadrant) {
      case 'OVERCONFIDENT':
        return {
          title: '과신 (위험: 안다고 착각)',
          color: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'CALIBRATED_ACCURATE':
        return {
          title: '정확한 지식 (완전 정복)',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'UNDERCONFIDENT':
        return {
          title: '과소평가 / 운 (불확실한 정답)',
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'RECOGNIZED_IGNORANCE':
        return {
          title: '인지된 무지 (모름을 인지)',
          color: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Verdict */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 mb-2.5">
              <Activity className="w-3.5 h-3.5" />
              메타인지 정량 평가 보고서
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {analysis.verdictTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-2xl">
              {analysis.verdictDescription}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 shrink-0">
            {analysis.highRiskQuestions.length > 0 && (
              <button
                onClick={() => onStartSocraticCoach(analysis.highRiskQuestions[0].question, analysis.highRiskQuestions[0].userAnswer)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-200 flex items-center justify-center gap-1.5 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                과신 오답 AI 역질문 코칭
              </button>
            )}

            <button
              onClick={onRetest}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              취약 개념 재시험
            </button>
          </div>
        </div>

        {/* 4 Quantitative Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          {/* Card 1: 정답률 */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              실제 정답률 (Accuracy)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {analysis.accuracyRate}%
              </span>
              <span className="text-xs text-slate-400">
                ({analysis.correctCount}/{analysis.totalQuestions})
              </span>
            </div>
          </div>

          {/* Card 2: 평균 자신감 */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              평균 자신감 (Confidence)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-mono">
                {analysis.averageConfidence}%
              </span>
              <span className="text-xs text-slate-400">주관적 예측</span>
            </div>
          </div>

          {/* Card 3: 캘리브레이션 편향 */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              판단 편향 (Bias)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                analysis.calibrationBias > 10 ? 'text-rose-600' : analysis.calibrationBias < -10 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {analysis.calibrationBias > 0 ? `+${analysis.calibrationBias}%` : `${analysis.calibrationBias}%`}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {analysis.calibrationBias > 10 ? '과신 경향' : analysis.calibrationBias < -10 ? '불안/과소평가' : '이상적 일치'}
              </span>
            </div>
          </div>

          {/* Card 4: Brier Score */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Brier Score
              </span>
              <span className="text-[10px] text-slate-400 font-medium">0에 가까울수록 완벽</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {analysis.brierScore}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                analysis.brierScore <= 0.15 ? 'bg-emerald-100 text-emerald-800' : analysis.brierScore <= 0.25 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {analysis.brierScore <= 0.15 ? '우수' : analysis.brierScore <= 0.25 ? '보통' : '주의'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Quadrant Metacognitive Matrix (CORE SCIENTIFIC VISUALIZATION) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            메타인지 4분면 진단 매트릭스 (Fleming & Lau 연구 기반)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            자신감(높음/낮음)과 실제 결과(정답/오답)의 교차 분석으로 인지 왜곡 지점을 찾아냅니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Quadrant 1: Overconfident (Danger) */}
          <div className="p-5 rounded-2xl border-2 border-rose-200 bg-rose-50/50 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                🔴 과신 (Overconfident) — 가장 위험!
              </span>
              <span className="text-lg font-black text-rose-700 font-mono">
                {analysis.quadrantCounts.OVERCONFIDENT}문항
              </span>
            </div>
            <p className="text-xs text-rose-900/80 leading-relaxed">
              <strong>자신감 높음(≥70%) & 실제 오답:</strong> 내용이 눈에 익어 완전히 안다고 착각한 상태입니다. 시험 직전 치명적 실수로 이어지는 최우선 복습 대상입니다.
            </p>
          </div>

          {/* Quadrant 2: Calibrated Accurate */}
          <div className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                🟢 정확한 지식 (Calibrated Knowledge)
              </span>
              <span className="text-lg font-black text-emerald-800 font-mono">
                {analysis.quadrantCounts.CALIBRATED_ACCURATE}문항
              </span>
            </div>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              <strong>자신감 높음(≥70%) & 실제 정답:</strong> 개념을 명확하게 파악하고 있으며 시험에서도 흔들림 없이 인출할 수 있는 안전한 지식 영역입니다.
            </p>
          </div>

          {/* Quadrant 3: Underconfident / Guessing */}
          <div className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                🟡 과소평가 / 운 (Underconfident)
              </span>
              <span className="text-lg font-black text-amber-800 font-mono">
                {analysis.quadrantCounts.UNDERCONFIDENT}문항
              </span>
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              <strong>자신감 낮음(&lt;70%) & 실제 정답:</strong> 확신 없이 찍어서 맞혔거나, 이해는 했으나 자기 확신이 부족한 상태입니다. 정답 이유를 명확히 다지는 복습이 필요합니다.
            </p>
          </div>

          {/* Quadrant 4: Recognized Ignorance */}
          <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                ⚪ 인지된 무지 (Recognized Ignorance)
              </span>
              <span className="text-lg font-black text-slate-700 font-mono">
                {analysis.quadrantCounts.RECOGNIZED_IGNORANCE}문항
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>자신감 낮음(&lt;70%) & 실제 오답:</strong> 자신이 모른다는 사실을 스스로 정확히 알고 있는 건강한 상태입니다. 기초 개념 학습부터 차근차근 보완하면 됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Question Review List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">문제별 정밀 메타인지 분석</h3>
            <p className="text-xs text-slate-500 mt-0.5">내가 선택한 답과 자신감, 그리고 오개념 해설을 점검하세요.</p>
          </div>
          <span className="text-xs font-medium text-slate-400">총 {questions.length}문항</span>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const ans = answers.find(a => a.questionId === q.id);
            if (!ans) return null;

            const badge = getQuadrantBadge(ans.quadrant);
            const userChoiceText = typeof q.correctAnswer === 'number' && q.options
              ? q.options[Number(ans.userResponse)]
              : String(ans.userResponse);
            const correctChoiceText = typeof q.correctAnswer === 'number' && q.options
              ? q.options[Number(q.correctAnswer)]
              : String(q.correctAnswer);

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border-2 transition-all space-y-3 ${
                  ans.quadrant === 'OVERCONFIDENT'
                    ? 'border-rose-300 bg-rose-50/20 shadow-sm'
                    : ans.isCorrect
                    ? 'border-slate-200 bg-white'
                    : 'border-slate-200 bg-slate-50/40'
                }`}
              >
                {/* Item Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-700">Q{idx + 1}.</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {q.concept}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500">
                      내 자신감: <strong className="font-mono text-indigo-600">{ans.confidence}%</strong>
                    </span>
                    {/* Socratic Coach Trigger Button */}
                    <button
                      onClick={() => onStartSocraticCoach(q, ans)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1 border border-indigo-200/60 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      AI 역질문 코칭 받기
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-sm font-semibold text-slate-900 leading-snug">
                  {q.question}
                </p>

                {/* Answer Summary Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`p-2.5 rounded-xl border ${
                    ans.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <span className="font-bold block mb-0.5">내가 제출한 답:</span>
                    <span>{userChoiceText}</span>
                  </div>

                  <div className="p-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-800">
                    <span className="font-bold block mb-0.5 text-emerald-700">실제 정답:</span>
                    <span>{correctChoiceText}</span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed border border-slate-100">
                  <strong className="text-slate-800 block mb-1">💡 핵심 해설:</strong>
                  {q.explanation}
                  {q.commonMisconception && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 text-rose-700 font-medium">
                      ⚠️ 주의해야 할 오개념: {q.commonMisconception}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="flex justify-center pb-8">
        <button
          onClick={onNewStudy}
          className="px-8 py-3.5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm transition-all"
        >
          새로운 자료로 학습하기
        </button>
      </div>
    </div>
  );
};
