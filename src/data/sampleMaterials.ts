import { ProblemPair } from '../types';

export interface SampleMaterial {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  defaultPairs: ProblemPair[];
}

export const SAMPLE_MATERIALS: SampleMaterial[] = [
  {
    id: 'cognitive-psych',
    category: '심리학 / 인지과학',
    title: '메타인지와 인출 연습 (Metacognition & Retrieval Practice)',
    description: '이해의 착각(Illusion of Knowing), 메타인지 캘리브레이션, Brier Score, 분산 학습의 원리',
    content: `[강의자료 요약]
1. 메타인지(Metacognition): 자신의 인지 과정을 점검(Monitoring)하고 조절(Control)하는 고차원적 능력.
2. 이해의 착각 (Fluency Illusion): 교재를 반복해서 읽어 눈에 익숙해진 상태를 진짜 이해한 것으로 혼동하는 인지 왜곡.
3. 인출 연습 (Retrieval Practice): 단순 반복 읽기보다 기억에서 강제로 끄집어내는 시험/퀴즈가 장기 기억을 2배 이상 보존함 (Roediger & Karpicke, 2006).
4. 메타인지 캘리브레이션과 Brier Score: 주관적 자신감과 실제 정답률의 오차를 측정. 자신감은 높으나 실제 오답인 '과신(Overconfidence)'이 시험에서 가장 치명적임.`,
    defaultPairs: [
      {
        id: 'pair-1',
        concept: '이해의 착각 (Fluency Illusion)',
        primaryQuestion: {
          id: 'p1-q1',
          concept: '이해의 착각 (Fluency Illusion)',
          question: '학습자가 교재나 필기노트를 여러 번 반복해서 읽을 때 발생하는 "이해의 착각(Illusion of Knowing)"의 가장 주된 원인은 무엇인가?',
          options: [
            '내용에 대한 시각적 익숙함(Familiarity)을 개념에 대한 완전한 숙달(Mastery)로 혼동하기 때문',
            '작업기억의 용량이 초과되어 장기기억으로 지식이 전이되지 못하기 때문',
            '분산 학습 효과로 인해 뇌의 피로도가 급격히 상승하기 때문',
            'Brier Score가 0에 도달하여 메타인지 모니터링이 자동 중단되기 때문'
          ],
          correctAnswer: 0,
          explanation: '교재를 반복해서 읽으면 뇌의 처리 유창성(Fluency)이 높아져 눈에 익숙해집니다. 뇌는 이 익숙함을 "내가 이미 다 알고 있다"고 오판하여 실제 인출 능력을 과대평가하게 됩니다.',
          commonMisconception: '많은 학생들이 "많이 읽어서 눈에 익으면 시험에서도 당연히 풀 수 있다"고 믿는 치명적 오개념을 갖습니다.'
        },
        retestQuestion: {
          id: 'p1-q2',
          concept: '이해의 착각 (Fluency Illusion)',
          question: '[동일 개념 재검증 문제]\n다음 중 "이해의 착각"에 빠진 학생의 전형적인 행동과 이를 타파하기 위한 가장 효과적인 조치는 무엇인가?',
          options: [
            '형광펜으로 밑줄을 그으며 5번 정독한다. -> 10번 정독으로 횟수를 늘린다.',
            '강의를 2배속으로 빠르게 반복 시청한다. -> 오디오만 반복해서 듣는다.',
            '교재를 덮고 백지에 핵심 개념의 인과관계를 스스로 설명해 본다.',
            '자신감이 100%가 될 때까지 같은 요약 노트를 암기한다.'
          ],
          correctAnswer: 2,
          explanation: '익숙함의 착각을 깨는 유일한 방법은 교재를 덮고(단서 차단) 스스로 머릿속에서 내용을 끄집어내는 백지 복습 또는 인출 시험입니다.',
          commonMisconception: '이해의 착각을 극복하겠다며 또다시 교재를 반복해서 읽는 실수를 반복하는 경우가 많습니다.'
        }
      },
      {
        id: 'pair-2',
        concept: '인출 연습과 시험 효과 (Testing Effect)',
        primaryQuestion: {
          id: 'p2-q1',
          concept: '인출 연습과 시험 효과 (Testing Effect)',
          question: 'Roediger & Karpicke(2006) 연구에서 입증된 "인출 연습(Retrieval Practice)"의 핵심 효과는 무엇인가?',
          options: [
            '자료를 단순히 반복 재학습(Restudy)하는 것보다 퀴즈/시험을 통해 기억을 인출할 때 장기 파지율이 월등히 높다.',
            '시험을 자주 보면 스트레스 호르몬이 분비되어 단기 암기 속도만 일시적으로 향상된다.',
            '학습자의 주관적 불안감을 낮추고 Brier Score를 1.0으로 고정시킨다.',
            '메타인지 조절 과정을 배제하고 무조건적인 반사적 암기를 유도한다.'
          ],
          correctAnswer: 0,
          explanation: '시험은 단순한 평가 도구가 아니라, 기억 신경망을 재구성하고 강화하여 장기 기억 보존을 극대화하는 강력한 학습 과정입니다.',
          commonMisconception: '시험은 "다 공부하고 나서 점수 확인용으로만 보는 것"이라는 편견이 있습니다.'
        },
        retestQuestion: {
          id: 'p2-q2',
          concept: '인출 연습과 시험 효과 (Testing Effect)',
          question: '[동일 개념 재검증 문제]\n시험 일주일 전 학생 A는 요약본을 4회 정독했고, 학생 B는 요약본을 1회 읽은 뒤 3회의 미니 퀴즈를 풀었다. 인지과학 연구에 비추어 볼 때 시험 당일의 예상 결과는?',
          options: [
            '학생 A가 텍스트를 더 많이 보았으므로 장기 기억 유지율이 훨씬 높을 것이다.',
            '학생 B가 인출 연습을 통해 인출 경로를 강화했으므로 실제 시험 문제 적용력이 훨씬 높을 것이다.',
            '두 학생 모두 총 공부 시간이 같다면 성적 차이는 전혀 발생하지 않는다.',
            '학생 A는 Brier Score가 0에 가깝고, 학생 B는 과신 오답이 급증할 것이다.'
          ],
          correctAnswer: 1,
          explanation: '인출 연습은 뇌의 신경 가소성을 자극하여 기억 인출 경로를 튼튼하게 만들어, 실전 시험에서 훨씬 뛰어난 장기 파지율을 보입니다.',
          commonMisconception: '공부 시간이나 읽은 페이지 수가 많으면 더 잘 외워졌을 것이라는 착각을 합니다.'
        }
      },
      {
        id: 'pair-3',
        concept: '메타인지 4분면과 과신의 위험성',
        primaryQuestion: {
          id: 'p3-q1',
          concept: '메타인지 4분면과 과신의 위험성',
          question: '메타인지 4분면 분류에서 "높은 자신감(예: 90%)을 가졌으나 실제로 틀린 문항(유형 2)"이 시험에서 가장 치명적인 이유는?',
          options: [
            '인지된 무지(유형 4) 영역에 속하여 학습 동기를 상실하게 만들기 때문이다.',
            '학습자 스스로 완벽히 알고 있다고 믿어 복습 대상에서 누락시키기 때문이다.',
            '과소평가(유형 3)로 인해 시험 당일 시간 안배에 실패하기 때문이다.',
            '정답률을 강제로 0%로 고정시키는 통계적 왜곡을 초래하기 때문이다.'
          ],
          correctAnswer: 1,
          explanation: '자신 있게 틀린 문제는 학습자가 "이미 다 맞힌 문제"로 분류하여 다시는 들여다보지 않으므로, 실제 시험장에서도 똑같은 오개념으로 틀리게 됩니다.',
          commonMisconception: '틀린 문제 중 헷갈렸던 문제만 공부하고, 자신 있게 찍은 오답은 "단순 실수"라며 복습하지 않는 잘못된 습관이 발생합니다.'
        },
        retestQuestion: {
          id: 'p3-q2',
          concept: '메타인지 4분면과 과신의 위험성',
          question: '[동일 개념 재검증 문제]\n시험 직전 한정된 시간 동안 가장 우선순위로 복습해야 할 문제 유형은 무엇인가?',
          options: [
            '자신감이 높았고 실제로 맞힌 문제 (유형 1: 정확한 지식)',
            '자신감이 높았으나 실제로 틀린 문제 (유형 2: 과신 오답)',
            '자신감이 낮았으나 실제로 맞힌 문제 (유형 3: 불확실한 정답)',
            '자신감이 낮았고 실제로 틀린 문제 (유형 4: 인지된 무지)'
          ],
          correctAnswer: 1,
          explanation: '과신 오답(유형 2)은 왜곡된 오개념이 견고하게 자리잡고 있는 상태이므로, 이를 깨부수는 것이 시험 점수를 올리는 데 가장 시급합니다.',
          commonMisconception: '완전히 모르는 문제(유형 4)부터 처음부터 다시 공부하느라 시간을 낭비하는 경우가 많습니다.'
        }
      },
      {
        id: 'pair-4',
        concept: 'Brier Score와 메타인지 판단 정확도',
        primaryQuestion: {
          id: 'p4-q1',
          concept: 'Brier Score와 메타인지 판단 정확도',
          question: '메타인지 판단 정확도를 정량적으로 측정하는 Brier Score 지표에 대한 올바른 설명은 무엇인가?',
          options: [
            '예측 자신감(0~1)과 실제 결과(0 또는 1)의 차이 제곱 평균으로, 0에 가까울수록 판단이 정확함을 뜻한다.',
            '점수가 1.00에 가까울수록 자신의 실력을 완벽하게 예측한 이상적인 상태이다.',
            '오직 맞힌 문제의 정답률만을 누적 합산하여 백분율로 환산한 점수이다.',
            '객관식 문제에서는 산출할 수 없으며 오직 주관식 서술형에서만 적용 가능하다.'
          ],
          correctAnswer: 0,
          explanation: 'Brier Score는 확률 예측의 정확도를 측정하는 척도로, 오차의 제곱을 다루므로 0.00에 가까울수록 자신의 앎과 모름을 완벽히 꿰뚫어 보고 있음을 의미합니다.',
          commonMisconception: '일반 시험 점수처럼 숫자가 높을수록 좋은 것으로 오해하기 쉽습니다.'
        },
        retestQuestion: {
          id: 'p4-q2',
          concept: 'Brier Score와 메타인지 판단 정확도',
          question: '[동일 개념 재검증 문제]\n학생 A의 Brier Score는 0.08이고, 학생 B의 Brier Score는 0.38이다. 두 학생의 메타인지 캘리브레이션 상태에 대한 올바른 해석은?',
          options: [
            '학생 B가 학생 A보다 자신의 앎과 모름을 훨씬 더 객관적으로 판단하고 있다.',
            '학생 A는 자신의 이해 수준을 정밀하게 모니터링하고 있으나, 학생 B는 심각한 인지적 착각(과신 등) 상태에 있다.',
            'Brier Score만으로는 메타인지 능력을 전혀 비교할 수 없다.',
            '두 학생 모두 동일한 수준의 메타인지 편향을 보이고 있다.'
          ],
          correctAnswer: 1,
          explanation: 'Brier Score가 0.08인 학생 A는 매우 우수한 캘리브레이션 상태이며, 0.38인 학생 B는 자신감과 실제 결과의 괴리가 매우 큰 위험 상태입니다.',
          commonMisconception: '점수가 높은 학생 B가 더 잘하는 학생이라고 착각할 수 있습니다.'
        }
      }
    ]
  }
];
