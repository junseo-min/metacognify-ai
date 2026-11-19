import React, { useState } from 'react';
import { Question, UserAnswer } from '../types';
import { determineQuadrant } from '../services/metacognition';
import { HelpCircle, ChevronRight, Gauge, Check, Award } from 'lucide-react';

interface QuizSessionProps {
  questions: Question[];
  onComplete: (answers: UserAnswer[]) => void;
  onCancel: () => void;
}

export const QuizSession: React.FC<QuizSessionProps> = ({
  questions,
  onComplete,
  onCancel,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number>(70);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex) / questions.length) * 100);

  const getConfidenceLevelLabel = (val: number) => {
    if (val >= 90) return { label: '완벽한 확신 (100% 정답이라 믿음)', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    if (val >= 70) return { label: '상당한 확신 (맞혔을 확률 높음)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (val >= 40) return { label: '반신반의 (헷갈리지만 골라봄)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: '완전한 추측 (전혀 모르고 찍음)', color: 'text-slate-600 bg-slate-100 border-slate-200' };
  };

  const currentLevel = getConfidenceLevelLabel(confidence);

  const handleNext = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQ.correctAnswer;
    const quadrant = determineQuadrant(confidence, isCorrect);

    const newAnswer: UserAnswer = {
      questionId: currentQ.id,
      userResponse: selectedOption,
      confidence,
      isCorrect,
      quadrant,
      answeredAt: new Date().toISOString(),
    };

    const nextAnswers = [...answers, newAnswer];
    setAnswers(nextAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setConfidence(70); // 다음 문제 기본값 리셋
    } else {
      // 모든 문제 완료
      onComplete(nextAnswers);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Progress */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2.5">
          <span className="flex items-center gap-1.5 text-indigo-600">
            <Award className="w-4 h-4" />
            인출 연습 세션 (Retrieval Testing)
          </span>
          <span>
            문제 <strong className="text-slate-900 text-sm">{currentIndex + 1}</strong> / {questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3">
            핵심 개념: {currentQ.concept}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug whitespace-pre-line">
            {currentQ.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options?.map((option, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/60'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm font-medium leading-relaxed">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Metacognitive Confidence Rating Section (CORE FEATURE) */}
        <div className="pt-6 border-t border-slate-100">
          <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 p-5 rounded-2xl border border-indigo-100/70 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  메타인지 판단: 이 문제를 맞혔을 확률(자신감)은 몇 %인가요?
                </h3>
              </div>
              <span className="text-xl font-extrabold text-indigo-600 font-mono">
                {confidence}%
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              정답을 알기 전에 자신의 확신도를 스스로 기록하는 훈련은 인지 왜곡(과신/불안)을 교정하는 <strong>메타인지 캘리브레이션</strong>의 핵심 절차입니다.
            </p>

            {/* Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
                <span>0% (완전 찍음)</span>
                <span>25%</span>
                <span>50% (반반)</span>
                <span>75%</span>
                <span>100% (완벽 확신)</span>
              </div>
            </div>

            {/* Level Badge */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">판단 상태:</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${currentLevel.color}`}>
                {currentLevel.label}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-3 py-2 rounded-lg"
          >
            시험 중단하기
          </button>

          <button
            type="button"
            disabled={selectedOption === null}
            onClick={handleNext}
            className="px-6 py-3 rounded-xl gradient-primary text-white font-bold text-sm shadow-md shadow-indigo-200 hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            <span>{currentIndex + 1 === questions.length ? '진단 결과 확인하기' : '다음 문제로'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
