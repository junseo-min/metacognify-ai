import { Question, UserAnswer, MetacognitiveQuadrant, MetacognitiveAnalysis } from '../types';

/**
 * Fleming & Lau (2014) 및 인지심리학 메타인지 측정 연구 기반 분석 모듈
 */

export function determineQuadrant(confidence: number, isCorrect: boolean): MetacognitiveQuadrant {
  const isHighConfidence = confidence >= 70;
  if (isHighConfidence && !isCorrect) {
    return 'OVERCONFIDENT'; // 안다고 착각한 함정 (가장 위험)
  }
  if (isHighConfidence && isCorrect) {
    return 'CALIBRATED_ACCURATE'; // 정확히 알고 맞힘
  }
  if (!isHighConfidence && isCorrect) {
    return 'UNDERCONFIDENT'; // 운이나 찍어서 맞혔거나 확신 부족
  }
  return 'RECOGNIZED_IGNORANCE'; // 모른다는 것을 알고 틀림 (학습 준비됨)
}

/**
 * Brier Score 계산
 * BS = (1/N) * sum((Confidence - Outcome)^2)
 * Confidence: 0.0 ~ 1.0, Outcome: 1 (정답) or 0 (오답)
 * 0.0에 가까울수록 완벽한 메타인지 판단, 1.0에 가까울수록 심각한 오판
 */
export function calculateBrierScore(answers: UserAnswer[]): number {
  if (answers.length === 0) return 0;

  const total = answers.reduce((sum, ans) => {
    const c = ans.confidence / 100.0;
    const o = ans.isCorrect ? 1.0 : 0.0;
    return sum + Math.pow(c - o, 2);
  }, 0);

  return parseFloat((total / answers.length).toFixed(3));
}

export function analyzeMetacognition(questions: Question[], answers: UserAnswer[]): MetacognitiveAnalysis {
  const totalQuestions = questions.length;
  const correctCount = answers.filter(a => a.isCorrect).length;
  const accuracyRate = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const totalConfidence = answers.reduce((acc, a) => acc + a.confidence, 0);
  const averageConfidence = totalQuestions > 0 ? Math.round(totalConfidence / totalQuestions) : 0;

  const calibrationBias = averageConfidence - accuracyRate;
  const brierScore = calculateBrierScore(answers);

  const quadrantCounts = {
    OVERCONFIDENT: 0,
    CALIBRATED_ACCURATE: 0,
    UNDERCONFIDENT: 0,
    RECOGNIZED_IGNORANCE: 0,
  };

  answers.forEach(a => {
    quadrantCounts[a.quadrant]++;
  });

  // 위험군 (자신 있게 틀린 문제들)
  const questionMap = new Map<string, Question>();
  questions.forEach(q => questionMap.set(q.id, q));

  const highRiskQuestions = answers
    .filter(a => a.quadrant === 'OVERCONFIDENT')
    .map(a => ({
      question: questionMap.get(a.questionId)!,
      userAnswer: a,
    }))
    .filter(item => Boolean(item.question));

  // 종합 판정 문구 생성
  let verdictTitle = '';
  let verdictDescription = '';

  if (quadrantCounts.OVERCONFIDENT >= 2 || calibrationBias >= 20) {
    verdictTitle = '⚠️ 위험: "이해의 착각(Illusion of Explanatory Depth)" 상태';
    verdictDescription = 
      `평균 자신감(${averageConfidence}%)이 실제 정답률(${accuracyRate}%)보다 크게 높습니다. ` +
      `강의자료나 필기 내용에 눈이 익숙해져서 스스로 다 안다고 믿었지만, 실제 인출 과정에서 심각한 오개념이 드러났습니다. ` +
      `특히 "자신 있게 틀린 문제"를 최우선으로 복습해야 시험 당일 실수를 방지할 수 있습니다.`;
  } else if (calibrationBias <= -20) {
    verdictTitle = '🔍 불확실형: "실력보다 자신감이 부족한 상태"';
    verdictDescription = 
      `실제 정답률(${accuracyRate}%)에 비해 자신감(${averageConfidence}%)이 낮게 형성되어 있습니다. ` +
      `개념을 잘 이해하고 있음에도 확신이 없어 시험에서 망설이거나 쉬운 문제에서 시간을 낭비할 수 있습니다. 성공 경험을 통해 자기 효능감을 높여보세요.`;
  } else if (brierScore <= 0.15) {
    verdictTitle = '🎯 최상위: "완벽하게 조율된 메타인지(Well-Calibrated)"';
    verdictDescription = 
      `자신이 무엇을 알고 무엇을 모르는지 매우 정확하게 꿰뚫어 보고 있습니다. ` +
      `Brier Score(${brierScore})가 매우 우수하며, 비효율적인 반복 학습 없이 취약한 포인트만 골라서 공부할 수 있는 최상의 학습 전략을 갖추고 있습니다.`;
  } else {
    verdictTitle = '⚖️ 일반형: "선택적 복습이 필요한 상태"';
    verdictDescription = 
      `전반적인 정답률(${accuracyRate}%)과 자신감(${averageConfidence}%)이 유사한 수준입니다. ` +
      `하지만 틀린 문제 중 자신감이 높았던 개념을 핀셋 복습하면 점수를 빠르게 끌어올릴 수 있습니다.`;
  }

  return {
    totalQuestions,
    correctCount,
    accuracyRate,
    averageConfidence,
    calibrationBias,
    brierScore,
    quadrantCounts,
    highRiskQuestions,
    verdictTitle,
    verdictDescription,
  };
}
