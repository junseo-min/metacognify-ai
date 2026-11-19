import React, { useState } from 'react';
import { Question, UserAnswer } from '../types';
import { determineQuadrant } from '../services/metacognition';
import { RotateCcw, X, CheckCircle, AlertCircle, ArrowRight, Gauge } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RetestModalProps {
  questions: Question[];
  onCompleteRetest: (newAnswers: UserAnswer[]) => void;
  onClose: () => void;
}

export const RetestModal: React.FC<RetestModalProps> = ({
  questions,
  onCompleteRetest,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number>(80);
  const [retestAnswers, setRetestAnswers] = useState<UserAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex];

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

    const nextAnswers = [...retestAnswers, newAnswer];
    setRetestAnswers(nextAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setConfidence(80);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      onCompleteRetest(nextAnswers);
    }
  };

  const retestCorrectCount = retestAnswers.filter(a => a.isCorrect).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">취약 개념 집중 재시험 클리닉</h3>
              <p className="text-[11px] text-slate-500">Dunlosky et al. (2013) 분산 인출 연습</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isFinished ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                취약 문항 점검 ({currentIndex + 1} / {questions.length})
              </span>
              <span className="font-mono text-indigo-600">{currentQ.concept}</span>
            </div>

            <h4 className="text-base font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h4>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options?.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 text-xs sm:text-sm ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Re-rated Confidence */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-indigo-600" />
                  해설 검토 후 지금 나의 자신감은?
                </span>
                <span className="text-indigo-600 font-mono text-sm">{confidence}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <button
              disabled={selectedOption === null}
              onClick={handleNext}
              className="w-full py-3 rounded-xl gradient-primary text-white font-bold text-sm shadow-md shadow-indigo-200 hover:opacity-95 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <span>{currentIndex + 1 === questions.length ? '재시험 결과 완료' : '다음 취약 문제'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h4 className="text-xl font-black text-slate-900">
              취약 개념 인출 재시험 완료!
            </h4>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              총 {questions.length}개 취약 문항 중 <strong className="text-emerald-600 font-bold">{retestCorrectCount}문항</strong>을 올바르게 교정하여 인출했습니다.
            </p>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-200 hover:bg-indigo-700"
            >
              진단 리포트로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
