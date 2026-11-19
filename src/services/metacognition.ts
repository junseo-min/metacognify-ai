import { 
  MetacognitiveQuadrant, 
  ProblemTrainingRecord, 
  SplitMetrics, 
  FinalDiagnosticReport 
} from '../types';

/**
 * 4가지 학습 결과 유형 구분 (Fleming & Lau, 2014)
 * - 기준선: 자신감 70% 이상 (높음), 70% 미만 (낮음)
 */
export function determineQuadrant(confidence: number, isCorrect: boolean): MetacognitiveQuadrant {
  const isHighConfidence = confidence >= 70;
  if (isHighConfidence && isCorrect) {
    return 'CALIBRATED_ACCURATE'; // 유형 1: 자신감 높음 + 정답 (정확한 지식)
  }
  if (isHighConfidence && !isCorrect) {
    return 'OVERCONFIDENT'; // 유형 2: 자신감 높음 + 오답 (과신 - 가장 위험!)
  }
  if (!isHighConfidence && isCorrect) {
    return 'UNDERCONFIDENT'; // 유형 3: 자신감 낮음 + 정답 (과소평가 / 운)
  }
  return 'RECOGNIZED_IGNORANCE'; // 유형 4: 자신감 낮음 + 오답 (인지된 무지)
}

/**
 * Brier Score 계산
 * BS = (1/N) * sum((Confidence/100 - Outcome)^2)
 * 0.00: 완벽한 메타인지 캘리브레이션, 1.00: 완전한 착각
 */
export function calculateBrierScore(items: { confidence: number; isCorrect: boolean }[]): number {
  if (items.length === 0) return 0;
  const sum = items.reduce((acc, curr) => {
    const c = curr.confidence / 100.0;
    const o = curr.isCorrect ? 1.0 : 0.0;
    return acc + Math.pow(c - o, 2);
  }, 0);
  return parseFloat((sum / items.length).toFixed(3));
}

/**
 * 사전(Pre)과 사후(Post) 메타인지 지표 분리 계산
 */
export function calculateSplitMetrics(items: { confidence: number; isCorrect: boolean }[]): SplitMetrics {
  const totalCount = items.length;
  if (totalCount === 0) {
    return {
      totalCount: 0,
      correctCount: 0,
      accuracyRate: 0,
      averageConfidence: 0,
      brierScore: 0,
      calibrationBias: 0,
    };
  }

  const correctCount = items.filter(i => i.isCorrect).length;
  const accuracyRate = Math.round((correctCount / totalCount) * 100);
  const totalConfidence = items.reduce((acc, i) => acc + i.confidence, 0);
  const averageConfidence = Math.round(totalConfidence / totalCount);
  const brierScore = calculateBrierScore(items);
  const calibrationBias = averageConfidence - accuracyRate;

  return {
    totalCount,
    correctCount,
    accuracyRate,
    averageConfidence,
    brierScore,
    calibrationBias,
  };
}

/**
 * 최종 종합 리포트 생성 (사전 실력 vs AI 코칭 후 실력 분리 보존)
 */
export function generateFinalReport(
  sessionId: string,
  materialTitle: string,
  records: ProblemTrainingRecord[]
): FinalDiagnosticReport {
  // 1. 훈련 이전 (순수 학생 답변) 데이터 추출
  const preItems = records.map(r => ({
    confidence: r.preAnswer.confidence,
    isCorrect: r.preAnswer.isCorrect,
  }));
  const preMetrics = calculateSplitMetrics(preItems);

  // 2. 훈련 이후 (AI 코칭 & 개념 교정 후 재검증 문제) 데이터 추출
  const postItems = records
    .filter(r => Boolean(r.postAnswer))
    .map(r => ({
      confidence: r.postAnswer!.confidence,
      isCorrect: r.postAnswer!.isCorrect,
    }));
  const postMetrics = calculateSplitMetrics(postItems);

  // 3. 4가지 유형 카운트 (사전 훈련 기준)
  const quadrantCounts = {
    CALIBRATED_ACCURATE: 0,
    OVERCONFIDENT: 0,
    UNDERCONFIDENT: 0,
    RECOGNIZED_IGNORANCE: 0,
  };
  records.forEach(r => {
    quadrantCounts[r.preAnswer.quadrant]++;
  });

  // 4. 취약 개념 목록 (사전에 과신 오답이었거나, 사후에도 여전히 오답인 개념)
  const vulnerableConceptsSet = new Set<string>();
  records.forEach(r => {
    if (r.preAnswer.quadrant === 'OVERCONFIDENT' || (r.postAnswer && !r.postAnswer.isCorrect)) {
      vulnerableConceptsSet.add(r.concept);
    }
  });

  // 5. 총평 문구
  let verdictSummary = '';
  if (quadrantCounts.OVERCONFIDENT > 0) {
    verdictSummary = `사전 진단에서 안다고 착각한 '과신 오답'이 ${quadrantCounts.OVERCONFIDENT}개 감지되었습니다. AI 맞춤 역질문과 재검증을 통해 Brier Score가 ${preMetrics.brierScore}에서 ${postMetrics.brierScore}로 개선되었습니다.`;
  } else if (preMetrics.accuracyRate >= 80) {
    verdictSummary = `모든 문항에서 앎과 모름을 정확히 꿰뚫어 보는 매우 우수한 메타인지 캘리브레이션 상태입니다.`;
  } else {
    verdictSummary = `모르는 개념을 솔직히 인지하고 학습하여 재검증 정답률이 ${postMetrics.accuracyRate}%로 상승했습니다.`;
  }

  return {
    sessionId,
    materialTitle,
    createdAt: new Date().toISOString(),
    records,
    preMetrics,
    postMetrics,
    quadrantCounts,
    vulnerableConcepts: Array.from(vulnerableConceptsSet),
    verdictSummary,
  };
}
