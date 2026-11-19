import React, { useState, useEffect } from 'react';
import { 
  ProblemPair, 
  ProblemTrainingRecord, 
  PreTrainingAnswer, 
  PostTrainingAnswer, 
  CoachingTurn, 
  MetacognitiveQuadrant 
} from '../types';
import { determineQuadrant } from '../services/metacognition';
import { getCoachingResponse } from '../services/openrouter';
import { 
  Award, 
  Gauge, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  TrendingUp, 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  RotateCcw,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface InteractiveTrainingSessionProps {
  problemPairs: ProblemPair[];
  apiKey: string;
  onFinishAll: (records: ProblemTrainingRecord[]) => void;
  onCancel: () => void;
}

// 1개 개념 훈련 내의 4단계
type StageInPair = 
  | 'PRIMARY_QUIZ'      // 1. 문제 출제 + 정답 및 자신감 입력
  | 'COACHING_AND_FIX'  // 2. 4가지 유형 분류 + 맞춤 AI 코칭(1~2회) + 3. 개념 교정(해설/오류원인)
  | 'RETEST_QUIZ';      // 4. 같은 개념의 새로운 문제 1개 재검증

export const InteractiveTrainingSession: React.FC<InteractiveTrainingSessionProps> = ({
  problemPairs,
  apiKey,
  onFinishAll,
  onCancel,
}) => {
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [subStage, setSubStage] = useState<StageInPair>('PRIMARY_QUIZ');

  // 누적 훈련 기록 (사전 답변 + 사후 재검증 답변 완전 분리 보관)
  const [completedRecords, setCompletedRecords] = useState<ProblemTrainingRecord[]>([]);

  // 현재 1차 문제 풀이 상태
  const [primaryChoice, setPrimaryChoice] = useState<number | null>(null);
  const [primaryConfidence, setPrimaryConfidence] = useState<number>(75);

  // 현재 개념의 사전 답변
  const [currentPreAnswer, setCurrentPreAnswer] = useState<PreTrainingAnswer | null>(null);

  // AI 코칭 대화 상태
  const [coachingHistory, setCoachingHistory] = useState<CoachingTurn[]>([]);
  const [userReplyInput, setUserReplyInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [turnsCount, setTurnsCount] = useState(0);

  // 재검증 문제 풀이 상태
  const [retestChoice, setRetestChoice] = useState<number | null>(null);
  const [retestConfidence, setRetestConfidence] = useState<number>(85);

  const currentPair = problemPairs[currentPairIndex];

  // 1. 1차 문제 제출 -> 유형 분류 및 AI 코칭 시작
  const handlePrimarySubmit = async () => {
    if (primaryChoice === null) return;

    const isCorrect = primaryChoice === currentPair.primaryQuestion.correctAnswer;
    const quadrant = determineQuadrant(primaryConfidence, isCorrect);

    const preAns: PreTrainingAnswer = {
      questionId: currentPair.primaryQuestion.id,
      userChoice: primaryChoice,
      confidence: primaryConfidence,
      isCorrect,
      quadrant,
      answeredAt: new Date().toISOString(),
    };
    setCurrentPreAnswer(preAns);
    setSubStage('COACHING_AND_FIX');

    // AI 첫 코칭 질문 생성
    setIsAiThinking(true);
    const initialAiMsg = await getCoachingResponse(
      currentPair.primaryQuestion,
      quadrant,
      primaryConfidence,
      primaryChoice,
      [],
      undefined,
      apiKey
    );

    setCoachingHistory([
      {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: initialAiMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setIsAiThinking(false);
    setTurnsCount(1);
  };

  // AI 코칭에 사용자 답장 전송 (최대 1~2회로 피로도 억제)
  const handleSendCoachingReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userReplyInput.trim() || isAiThinking || !currentPreAnswer) return;

    const userTurn: CoachingTurn = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userReplyInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...coachingHistory, userTurn];
    setCoachingHistory(nextHistory);
    setUserReplyInput('');
    setIsAiThinking(true);

    const aiReply = await getCoachingResponse(
      currentPair.primaryQuestion,
      currentPreAnswer.quadrant,
      currentPreAnswer.confidence,
      currentPreAnswer.userChoice,
      nextHistory,
      userTurn.text,
      apiKey
    );

    setCoachingHistory(prev => [
      ...prev,
      {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setIsAiThinking(false);
    setTurnsCount(prev => prev + 1);
  };

  // 재검증 문제로 이동
  const handleProceedToRetest = () => {
    setSubStage('RETEST_QUIZ');
    setRetestChoice(null);
    setRetestConfidence(85);
  };

  // 정답+자신감 높음(CALIBRATED_ACCURATE)인 경우: 재검증 생략 후 즉시 통과
  const handleSkipRetestForAccurate = () => {
    if (!currentPreAnswer) return;

    const postAns: PostTrainingAnswer = {
      questionId: currentPair.retestQuestion.id,
      userChoice: currentPair.retestQuestion.correctAnswer,
      confidence: currentPreAnswer.confidence,
      isCorrect: true,
      answeredAt: new Date().toISOString(),
    };

    const fullRecord: ProblemTrainingRecord = {
      pairId: currentPair.id,
      concept: currentPair.concept,
      primaryQuestion: currentPair.primaryQuestion,
      retestQuestion: currentPair.retestQuestion,
      preAnswer: currentPreAnswer,
      coachingHistory,
      postAnswer: postAns,
    };

    const nextRecords = [...completedRecords, fullRecord];
    setCompletedRecords(nextRecords);

    confetti({
      particleCount: 40,
      spread: 40,
      origin: { y: 0.6 }
    });

    if (currentPairIndex + 1 < problemPairs.length) {
      setCurrentPairIndex(prev => prev + 1);
      setSubStage('PRIMARY_QUIZ');
      setPrimaryChoice(null);
      setPrimaryConfidence(75);
      setCurrentPreAnswer(null);
      setCoachingHistory([]);
      setTurnsCount(0);
    } else {
      onFinishAll(nextRecords);
    }
  };

  // 4. 재검증 문제 제출 -> 결과 분리 저장 후 다음 개념 or 최종 리포트
  const handleRetestSubmit = () => {
    if (retestChoice === null || !currentPreAnswer) return;

    const isCorrect = retestChoice === currentPair.retestQuestion.correctAnswer;
    const postAns: PostTrainingAnswer = {
      questionId: currentPair.retestQuestion.id,
      userChoice: retestChoice,
      confidence: retestConfidence,
      isCorrect,
      answeredAt: new Date().toISOString(),
    };

    const fullRecord: ProblemTrainingRecord = {
      pairId: currentPair.id,
      concept: currentPair.concept,
      primaryQuestion: currentPair.primaryQuestion,
      retestQuestion: currentPair.retestQuestion,
      preAnswer: currentPreAnswer,
      coachingHistory,
      postAnswer: postAns,
    };

    const nextRecords = [...completedRecords, fullRecord];
    setCompletedRecords(nextRecords);

    // 정답 맞혔을 시 가벼운 축하 이펙트
    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 }
      });
    }

    // 다음 개념이 남아있는지 확인
    if (currentPairIndex + 1 < problemPairs.length) {
      setCurrentPairIndex(prev => prev + 1);
      setSubStage('PRIMARY_QUIZ');
      setPrimaryChoice(null);
      setPrimaryConfidence(75);
      setCurrentPreAnswer(null);
      setCoachingHistory([]);
      setTurnsCount(0);
    } else {
      // 모든 개념 훈련 완료 -> 최종 리포트 화면 전달
      onFinishAll(nextRecords);
    }
  };

  // 4가지 유형 뱃지 정보 헬퍼
  const getQuadrantInfo = (quadrant: MetacognitiveQuadrant) => {
    switch (quadrant) {
      case 'CALIBRATED_ACCURATE':
        return {
          title: '유형 1: 정확한 지식 (자신감 높음 + 정답)',
          badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          desc: '자신이 알고 있다는 사실을 정확히 파악했습니다. 불필요한 긴 질문 없이 짧게 확인 후 바로 다음 단계로 진행합니다.',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        };
      case 'OVERCONFIDENT':
        return {
          title: '유형 2: 과신 (자신감 높음 + 오답) — 집중 교정 대상!',
          badgeColor: 'bg-rose-50 text-rose-800 border-rose-300',
          desc: '⚠️ 안다고 착각한 가장 위험한 상태입니다. 시험 직전 실수를 막기 위해 AI 역질문으로 오개념의 맹점을 집중 교정합니다.',
          icon: <AlertTriangle className="w-5 h-5 text-rose-600" />
        };
      case 'UNDERCONFIDENT':
        return {
          title: '유형 3: 과소평가/운 (자신감 낮음 + 정답)',
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
          desc: '정답은 맞혔으나 확신이 부족했습니다. 왜 맞혔는지 논리적 연결고리를 다집니다.',
          icon: <TrendingUp className="w-5 h-5 text-amber-600" />
        };
      case 'RECOGNIZED_IGNORANCE':
        return {
          title: '유형 4: 인지된 무지 (자신감 낮음 + 오답)',
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
          desc: '자신이 모른다는 것을 솔직히 알고 있는 상태입니다. 기초 개념 정의부터 차근차근 교정합니다.',
          icon: <HelpCircle className="w-5 h-5 text-slate-600" />
        };
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header: Concept & Step Progress */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
              훈련 개념 {currentPairIndex + 1} / {problemPairs.length}
            </span>
            <span className="text-slate-800 font-bold text-sm">
              {currentPair.concept}
            </span>
          </div>
          <span className="text-slate-400">
            {subStage === 'PRIMARY_QUIZ' && '1단계: 문제 풀이 & 자신감 입력'}
            {subStage === 'COACHING_AND_FIX' && '2~3단계: 4유형 분류, AI 코칭, 개념 교정'}
            {subStage === 'RETEST_QUIZ' && '4단계: 동일 개념 변형 문제 재검증'}
          </span>
        </div>

        {/* 4-Step Visual Indicator */}
        <div className="grid grid-cols-4 gap-2">
          <div className={`h-2 rounded-full transition-all ${
            subStage === 'PRIMARY_QUIZ' ? 'bg-indigo-600' : 'bg-emerald-500'
          }`} />
          <div className={`h-2 rounded-full transition-all ${
            subStage === 'PRIMARY_QUIZ' ? 'bg-slate-200' : subStage === 'COACHING_AND_FIX' ? 'bg-indigo-600' : 'bg-emerald-500'
          }`} />
          <div className={`h-2 rounded-full transition-all ${
            subStage === 'PRIMARY_QUIZ' || (subStage === 'COACHING_AND_FIX' && turnsCount === 0) ? 'bg-slate-200' : subStage === 'COACHING_AND_FIX' ? 'bg-indigo-600' : 'bg-emerald-500'
          }`} />
          <div className={`h-2 rounded-full transition-all ${
            subStage === 'RETEST_QUIZ' ? 'bg-indigo-600 animate-pulse' : 'bg-slate-200'
          }`} />
        </div>
      </div>

      {/* =========================================================================
          STEP 1: 1차 문제 출제 + 정답 선택 + 자신감(0~100%) 입력
         ========================================================================= */}
      {subStage === 'PRIMARY_QUIZ' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
              [사전 진단 문제] 4지선다 인출 퀴즈
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug whitespace-pre-line">
              {currentPair.primaryQuestion.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentPair.primaryQuestion.options.map((opt, idx) => {
              const isSelected = primaryChoice === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setPrimaryChoice(idx)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 text-xs sm:text-sm ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-semibold shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Confidence Input (Core Metacognitive Step) */}
          <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 p-5 rounded-2xl border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  메타인지 입력: 이 문제를 맞혔을 확신도(자신감)는 몇 %인가요?
                </span>
              </div>
              <span className="text-xl font-black text-indigo-600 font-mono">
                {primaryConfidence}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={primaryConfidence}
              onChange={(e) => setPrimaryConfidence(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
              <span>0% (완전 찍음)</span>
              <span>50% (반반)</span>
              <span>70% (자신감 기준선)</span>
              <span>100% (완벽 확신)</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onCancel}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              학습 중단
            </button>

            <button
              disabled={primaryChoice === null}
              onClick={handlePrimarySubmit}
              className="px-6 py-3 rounded-xl gradient-primary text-white font-bold text-sm shadow-md shadow-indigo-200 hover:opacity-95 active:scale-95 disabled:opacity-40 flex items-center gap-2 transition-all"
            >
              <span>답안 제출 및 AI 코칭 받기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2 & 3: 4가지 유형 분류 + 맞춤 AI 코칭(1~2회) + 개념 교정 카드
         ========================================================================= */}
      {subStage === 'COACHING_AND_FIX' && currentPreAnswer && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quadrant Classification Result Banner */}
          {(() => {
            const qInfo = getQuadrantInfo(currentPreAnswer.quadrant);
            return (
              <div className={`p-5 rounded-3xl border-2 ${qInfo.badgeColor} shadow-sm space-y-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {qInfo.icon}
                    <h4 className="font-extrabold text-sm sm:text-base">{qInfo.title}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/70">
                    내 자신감: {currentPreAnswer.confidence}%
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{qInfo.desc}</p>
              </div>
            );
          })()}

          {/* AI Coaching Conversation Box (Socratic Coaching 1~2 Turns) */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">유형별 맞춤 AI 코칭</h4>
                  <p className="text-[11px] text-slate-400">
                    {currentPreAnswer.quadrant === 'CALIBRATED_ACCURATE'
                      ? '피로도 방지: 불필요한 역질문 없이 즉시 통과 가능'
                      : '오개념을 깨닫도록 돕는 1~2회 집중 역질문'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                대화 턴: {turnsCount}/2
              </span>
            </div>

            {/* Messages */}
            <div className="space-y-3 max-h-60 overflow-y-auto p-1">
              {coachingHistory.map((turn) => {
                const isAi = turn.sender === 'ai';
                return (
                  <div
                    key={turn.id}
                    className={`flex gap-2.5 max-w-[90%] ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                      isAi ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-800 text-white'
                    }`}>
                      {isAi ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isAi ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none'
                    }`}>
                      {turn.text}
                    </div>
                  </div>
                );
              })}

              {isAiThinking && (
                <div className="flex gap-2 items-center text-xs text-slate-400 italic">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  AI 코치가 학습자의 오개념을 분석하고 있습니다...
                </div>
              )}
            </div>

            {/* User Reply Input (Only if not accurate or still within 2 turns) */}
            {currentPreAnswer.quadrant !== 'CALIBRATED_ACCURATE' && turnsCount < 2 && (
              <form onSubmit={handleSendCoachingReply} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={userReplyInput}
                  onChange={(e) => setUserReplyInput(e.target.value)}
                  placeholder="당시 문제를 풀며 떠올렸던 생각이나 이유를 자유롭게 적어보세요..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-xs sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={!userReplyInput.trim() || isAiThinking}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Concept Fix Card (올바른 해설과 오류 원인 제공) */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
              <BookOpen className="w-4 h-4" />
              개념 교정: 올바른 해설 및 오류 원인 분석
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-500 block mb-1">내가 선택한 보기:</span>
                <span className="font-medium text-slate-800">
                  {currentPair.primaryQuestion.options[currentPreAnswer.userChoice]}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-700 block mb-1">실제 정답:</span>
                <span className="font-bold text-emerald-950">
                  {currentPair.primaryQuestion.options[currentPair.primaryQuestion.correctAnswer]}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
              <div>
                <strong className="text-indigo-900 block font-bold mb-0.5">💡 올바른 개념 원리:</strong>
                {currentPair.primaryQuestion.explanation}
              </div>
              <div className="pt-2 border-t border-indigo-200/50 text-rose-800 font-medium text-xs">
                ⚠️ <strong>흔한 오류 원인:</strong> {currentPair.primaryQuestion.commonMisconception}
              </div>
            </div>

            {/* Next Action: Proceed to Retest or Skip if Accurate */}
            <div className="pt-3 flex justify-end">
              {currentPreAnswer.quadrant === 'CALIBRATED_ACCURATE' ? (
                <button
                  onClick={handleSkipRetestForAccurate}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
                >
                  <span>✅ 완벽 숙달 확인 (재검증 생략 후 다음으로)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleProceedToRetest}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl gradient-primary text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 hover:opacity-95 flex items-center justify-center gap-2"
                >
                  <span>같은 개념의 새로운 문제 재검증 풀기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: 같은 개념의 새로운 변형 문제 1개 재검증 (Retest)
         ========================================================================= */}
      {subStage === 'RETEST_QUIZ' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-200 shadow-lg space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                [4단계 재검증] AI 코칭 후 동일 개념 변형 문제
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mt-1">
                {currentPair.retestQuestion.question}
              </h3>
            </div>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold shrink-0">
              <RotateCcw className="w-5 h-5" />
            </span>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentPair.retestQuestion.options.map((opt, idx) => {
              const isSelected = retestChoice === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setRetestChoice(idx)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 text-xs sm:text-sm ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-semibold shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Post-Training Confidence Slider */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-600" />
                개념 교정 후, 지금 당신의 자신감은 몇 %인가요?
              </span>
              <span className="text-xl font-black text-emerald-600 font-mono">
                {retestConfidence}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={retestConfidence}
              onChange={(e) => setRetestConfidence(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="text-[11px] text-slate-400">
              * 훈련 전 답변과 분리되어 별도로 저장되며, 교정 후 개선도를 측정합니다.
            </div>
          </div>

          {/* Submit Retest */}
          <div className="flex justify-end pt-2">
            <button
              disabled={retestChoice === null}
              onClick={handleRetestSubmit}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              <span>{currentPairIndex + 1 < problemPairs.length ? '재검증 완료 후 다음 개념으로' : '모든 훈련 완료! 최종 종합 리포트 보기'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
