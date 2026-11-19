export type MetacognitiveQuadrant = 
  | 'OVERCONFIDENT'        // 유형 2: 자신감 높음 + 오답 (과신 - 가장 위험한 상태!)
  | 'CALIBRATED_ACCURATE'  // 유형 1: 자신감 높음 + 정답 (정확한 지식 - 짧게 확인 후 통과)
  | 'UNDERCONFIDENT'       // 유형 3: 자신감 낮음 + 정답 (과소평가/운 - 개념 확신 보완)
  | 'RECOGNIZED_IGNORANCE';// 유형 4: 자신감 낮음 + 오답 (인지된 무지 - 기초 개념 교정)

export interface QuestionItem {
  id: string;
  concept: string; // 평가 핵심 개념
  question: string;
  options: string[]; // 4지선다 보기
  correctAnswer: number; // 0, 1, 2, 3
  explanation: string;
  commonMisconception: string; // 오류 원인 및 오개념 분석
}

export interface ProblemPair {
  id: string;
  concept: string;
  primaryQuestion: QuestionItem; // 1차 기본 문제
  retestQuestion: QuestionItem;  // 같은 개념의 새로운 변형 문제 (재검증용)
}

export interface PreTrainingAnswer {
  questionId: string;
  userChoice: number;
  confidence: number; // 0~100
  isCorrect: boolean;
  quadrant: MetacognitiveQuadrant;
  answeredAt: string;
}

export interface PostTrainingAnswer {
  questionId: string;
  userChoice: number;
  confidence: number; // 0~100
  isCorrect: boolean;
  answeredAt: string;
}

export interface CoachingTurn {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export interface ProblemTrainingRecord {
  pairId: string;
  concept: string;
  primaryQuestion: QuestionItem;
  retestQuestion: QuestionItem;
  preAnswer: PreTrainingAnswer;
  coachingHistory: CoachingTurn[];
  postAnswer?: PostTrainingAnswer;
}

export interface SplitMetrics {
  totalCount: number;
  correctCount: number;
  accuracyRate: number; // 0~100 %
  averageConfidence: number; // 0~100 %
  brierScore: number; // 0.0 ~ 1.0 (0에 가까울수록 완벽)
  calibrationBias: number; // 자신감 - 정답률 (+: 과신, -: 불안)
}

export interface FinalDiagnosticReport {
  sessionId: string;
  materialTitle: string;
  createdAt: string;
  records: ProblemTrainingRecord[];
  
  // 훈련 이전(Pre) 순수 지표 (AI 도움 받기 전)
  preMetrics: SplitMetrics;
  
  // 훈련 이후(Post) 재검증 지표 (AI 코칭 후)
  postMetrics: SplitMetrics;
  
  // 4가지 유형 카운트 (사전 기준)
  quadrantCounts: {
    CALIBRATED_ACCURATE: number; // 유형 1
    OVERCONFIDENT: number;       // 유형 2
    UNDERCONFIDENT: number;      // 유형 3
    RECOGNIZED_IGNORANCE: number;// 유형 4
  };
  
  // 취약 개념 목록 (사전 오답 또는 사후에도 여전히 틀린 개념)
  vulnerableConcepts: string[];
  
  // 종합 판정 및 피드백
  verdictSummary: string;
}
