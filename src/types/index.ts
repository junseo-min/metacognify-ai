export type QuestionType = 'multiple_choice' | 'short_answer';

export interface Question {
  id: string;
  type: QuestionType;
  concept: string; // 평가하려는 핵심 개념
  question: string;
  options?: string[]; // 객관식인 경우 보기 (A, B, C, D)
  correctAnswer: string | number; // 객관식 index or 정답 문자열
  explanation: string;
  commonMisconception?: string; // 학습자가 흔히 범하는 오개념
}

export type MetacognitiveQuadrant = 
  | 'OVERCONFIDENT'        // 과신 (자신감 >= 70% & 오답) -> 가장 위험한 상태!
  | 'CALIBRATED_ACCURATE'  // 정확한 지식 (자신감 >= 70% & 정답)
  | 'UNDERCONFIDENT'       // 과소평가/운 (자신감 < 70% & 정답) -> 점검 필요
  | 'RECOGNIZED_IGNORANCE';// 인지된 무지 (자신감 < 70% & 오답) -> 정상적인 모름

export interface UserAnswer {
  questionId: string;
  userResponse: string | number;
  confidence: number; // 0 to 100
  isCorrect: boolean;
  quadrant: MetacognitiveQuadrant;
  answeredAt: string;
}

export interface MetacognitiveAnalysis {
  totalQuestions: number;
  correctCount: number;
  accuracyRate: number; // 0 to 100 (%)
  averageConfidence: number; // 0 to 100 (%)
  calibrationBias: number; // averageConfidence - accuracyRate (+: 과신 경향, -: 과소평가 경향)
  brierScore: number; // 0.0 ~ 1.0 (0에 가까울수록 완벽한 캘리브레이션)
  quadrantCounts: {
    OVERCONFIDENT: number;
    CALIBRATED_ACCURATE: number;
    UNDERCONFIDENT: number;
    RECOGNIZED_IGNORANCE: number;
  };
  highRiskQuestions: {
    question: Question;
    userAnswer: UserAnswer;
  }[];
  verdictTitle: string;
  verdictDescription: string;
}

export interface SocraticMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export interface LearningSession {
  id: string;
  title: string;
  materialSummary: string;
  createdAt: string;
  questions: Question[];
  answers: UserAnswer[];
  analysis: MetacognitiveAnalysis;
  retested?: boolean;
}
