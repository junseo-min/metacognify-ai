export interface SampleMaterial {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  defaultQuestions?: any[];
}

export const SAMPLE_MATERIALS: SampleMaterial[] = [
  {
    id: 'cognitive-psych',
    category: '심리학 / 인지과학',
    title: '메타인지와 인출 연습 (Metacognition & Retrieval Practice)',
    description: '이해의 착각(Illusion of Knowing), 메타인지 캘리브레이션, Brier Score, 분산 학습의 원리',
    content: `[강의자료 요약]
1. 메타인지(Metacognition)의 정의:
자신의 인지 과정을 한 차원 높은 곳에서 바라보고, 점검(Monitoring)하며 조절(Control)하는 능력이다. 플라톤의 "너 자신을 알라"나 소크라테스의 "내가 모른다는 것을 안다"가 메타인지의 고전적 예시다.

2. 이해의 착각 (Illusion of Knowing / Fluency Illusion):
학습자가 교재나 필기노트를 반복해서 읽으면, 문장과 개념이 시각적으로 '익숙(Familiar)'해진다. 뇌는 이 익숙함을 '완전히 이해하고 내 것으로 만들었다'고 착각한다. 그러나 실제 백지 상태에서 설명하거나 문제를 풀면 인출(Retrieval)에 실패한다.

3. 인출 연습(Retrieval Practice)과 시험 효과(Testing Effect):
Roediger & Karpicke (2006)의 연구에 따르면, 단순히 자료를 반복 재학습(Restudy)한 집단보다 빈번한 퀴즈를 통해 기억에서 강제로 끄집어내는 인출 연습을 한 집단이 1주일 후 장기 기억 파지율에서 2배 이상의 성과를 보였다.

4. 메타인지 캘리브레이션 (Calibration):
자신이 평가한 주관적 자신감(Confidence)과 객관적 정답률(Accuracy) 사이의 일치도를 의미한다.
- 과신(Overconfidence): 실제로는 틀렸지만 맞혔다고 강하게 확신하는 상태. 시험에서 가장 치명적인 위험 요소이다.
- Brier Score: 자신감 확률(0~1)과 실제 결과(0 or 1)의 차이 제곱의 평균값으로, 0에 가까울수록 자신의 앎과 모름을 정확히 꿰뚫어 보고 있음을 뜻한다.`,
    defaultQuestions: [
      {
        id: 'cp-1',
        type: 'multiple_choice',
        concept: '이해의 착각 (Fluency Illusion)',
        question: '학습자가 교재를 여러 번 반복해서 읽을 때 발생하는 "이해의 착각"의 주된 인지적 원인은 무엇인가?',
        options: [
          '내용에 대한 시각적 익숙함(Familiarity)을 실제 개념에 대한 숙달(Mastery)로 혼동하기 때문',
          '장기기억 용량이 초과되어 새로운 지식이 작업기억에서 탈락하기 때문',
          '분산 학습 효과로 인해 뇌 피로도가 급격히 상승하기 때문',
          'Brier Score가 0에 수렴하여 메타인지 모니터링이 중단되기 때문'
        ],
        correctAnswer: 0,
        explanation: '반복 읽기는 뇌에 처리 유창성(Fluency)과 익숙함을 유발하여, 자신이 완전히 이해했다고 착각하게 만듭니다. 실제 기억 인출과는 완전히 다른 과정입니다.',
        commonMisconception: '많은 학생들이 "많이 읽어서 눈에 익으면 다 아는 것"으로 착각하여 시험을 망칩니다.'
      },
      {
        id: 'cp-2',
        type: 'multiple_choice',
        concept: '인출 연습 (Retrieval Practice)',
        question: 'Roediger & Karpicke(2006) 연구에서 밝혀진 인출 연습(Retrieval Practice)의 핵심 효과는 무엇인가?',
        options: [
          '시험 직후의 단기 기억 향상에는 효과가 없으나 암기 속도를 5배 높인다.',
          '자료를 단순히 반복 재학습하는 것보다 시험/퀴즈를 통해 기억을 끄집어낼 때 장기 파지율이 월등히 높다.',
          '학습자의 주관적 불안감을 낮추고 Brier Score를 1.0으로 고정시킨다.',
          '메타인지 조절 능력을 배제하고 무조건적인 반사적 암기를 유도한다.'
        ],
        correctAnswer: 1,
        explanation: '시험을 보는 행위 자체는 단순 평가가 아니라, 뇌 신경망을 강화하여 장기 기억 보존을 극대화하는 강력한 학습 전략(Testing Effect)입니다.',
        commonMisconception: '시험은 배운 뒤에 점수를 매기는 용도로만 생각하지만, 실제로는 인출 연습 자체가 가장 강력한 공부입니다.'
      },
      {
        id: 'cp-3',
        type: 'multiple_choice',
        concept: '메타인지 4분면 (과신 위험군)',
        question: '메타인지 진단에서 "높은 자신감(예: 90%)을 가졌으나 실제로 틀린 문제"는 어떤 사분면에 속하며 왜 위험한가?',
        options: [
          '인지된 무지(Recognized Ignorance) 영역이며, 학습 동기를 유발한다.',
          '과신(Overconfidence) 영역이며, 자신이 모른다는 사실조차 몰라 복습 대상에서 누락되기 때문이다.',
          '과소평가(Underconfidence) 영역이며, 시험 불안증의 유일한 원인이 된다.',
          '캘리브레이션 정합(Calibrated Accurate) 영역이며, 다음 시험에서 자연스럽게 맞히게 된다.'
        ],
        correctAnswer: 1,
        explanation: '자신 있게 틀린 문제는 학습자가 "이미 완벽히 알고 있다"고 굳게 믿기 때문에 복습 계획에서 제외되며, 실제 시험장에서 똑같이 틀려 점수를 잃게 되는 가장 위험한 함정입니다.',
        commonMisconception: '틀린 문제 중 자신 없던 문제만 공부하고, 자신 있게 찍은 오답은 "실수"라며 넘겨버리는 치명적 습관이 발생합니다.'
      },
      {
        id: 'cp-4',
        type: 'multiple_choice',
        concept: 'Brier Score의 의미',
        question: '메타인지 정확도를 측정하는 Brier Score에 대한 설명으로 가장 적절한 것은?',
        options: [
          '점수가 1.0에 가까울수록 자신의 정답 여부를 완벽히 예측한 것이다.',
          '예측 자신감(0~1)과 실제 정답(0 or 1)의 차이 제곱 평균으로, 0에 가까울수록 메타인지가 정확하다.',
          '오답의 개수만을 절대적으로 합산한 점수이다.',
          '객관식 문제에서는 계산할 수 없고 주관식 서술형에서만 적용 가능하다.'
        ],
        correctAnswer: 1,
        explanation: 'Brier Score는 기상예측이나 인지심리학에서 확률 예측의 정확도를 측정하는 지표로, 0에 가까울수록(오차가 0에 가까울수록) 완벽한 메타인지 판단을 의미합니다.',
        commonMisconception: '점수가 높을수록 좋은 줄 착각하지만, 오차 척도이므로 0이 가장 우수합니다.'
      }
    ]
  },
  {
    id: 'os-virtual-memory',
    category: '컴퓨터공학 / 전공',
    title: '운영체제: 가상 메모리와 페이징 (Virtual Memory & Paging)',
    description: '페이지 폴트, TLB 캐시, 페이지 교체 알고리즘(LRU, FIFO), 스래싱(Thrashing)',
    content: `[컴퓨터시스템 강의 노트]
1. 가상 메모리(Virtual Memory):
프로세스 전체를 메모리에 올리지 않고도 실행을 허용하는 기법. 물리 메모리보다 훨씬 큰 프로그램을 실행할 수 있게 하며 멀티프로그래밍 정도를 높인다.

2. 요구 페이징(Demand Paging)과 페이지 폴트(Page Fault):
페이지가 실제로 필요할 때(접근 시) 물리 메모리에 적재하는 기법. 페이지 테이블의 유효-무효 비트(Valid-Invalid Bit)가 무효(Invalid)인 경우 인터럽트(Page Fault)가 발생하여 OS가 디스크(스왑 영역)에서 해당 페이지를 메모리로 읽어온다.

3. TLB (Translation Lookaside Buffer):
가상 주소를 물리 주소로 변환하는 시간을 줄이기 위한 고속 하드웨어 캐시. TLB 히트 시 메모리 접근 1회 절약.

4. 페이지 교체 알고리즘:
- FIFO: 가장 먼저 들어온 페이지 교체 (Belady의 모순 발생 가능).
- LRU (Least Recently Used): 가장 오랫동안 사용되지 않은 페이지 교체.
- LFU (Least Frequently Used): 참조 횟수가 가장 적은 페이지 교체.

5. 스래싱(Thrashing):
프로세스들이 원활하게 수행되기 위해 필요한 최소한의 페이지 프레임 수를 할당받지 못하여, 페이지 폴트가 빈번하게 발생해 CPU 이용률이 급격히 떨어지는 현상.`,
    defaultQuestions: [
      {
        id: 'os-1',
        type: 'multiple_choice',
        concept: '스래싱 (Thrashing)',
        question: '운영체제에서 스래싱(Thrashing) 현상이 발생하는 근본적인 원인은 무엇인가?',
        options: [
          '물리 메모리 용량이 너무 커서 CPU가 탐색에 시간을 소모하기 때문',
          '프로세스들이 충분한 페이지 프레임을 할당받지 못해 페이지 부재(Page Fault)와 교체가 과도하게 반복되기 때문',
          'TLB의 캐시 적중률이 100%에 도달하여 메모리 병목이 발생하기 때문',
          '디스크 I/O 속도가 CPU 클럭보다 빨라져 동기화가 깨지기 때문'
        ],
        correctAnswer: 1,
        explanation: '각 프로세스에 할당된 프레임 수가 워킹셋보다 작으면 페이지 부재가 빈발하여 CPU는 거의 페이징 입출력 대기에만 묶이게 되며, CPU 이용률이 곤두박질칩니다.',
        commonMisconception: 'CPU 사용률이 100%로 과부하가 걸려 느려진다고 오해하지만, 실제로는 페이징 I/O 대기 때문에 CPU 이용률이 바닥을 칩니다.'
      },
      {
        id: 'os-2',
        type: 'multiple_choice',
        concept: '페이지 교체 알고리즘 (LRU)',
        question: 'LRU (Least Recently Used) 페이지 교체 알고리즘이 대체 대상으로 선택하는 페이지는?',
        options: [
          '메모리에 가장 먼저 적재된 페이지',
          '가장 오랫동안 참조되지 않은 페이지',
          '참조 횟수(Frequency)의 누적 합계가 가장 적은 페이지',
          '앞으로 가장 오랫동안 사용되지 않을 것이라고 미래가 예측된 페이지'
        ],
        correctAnswer: 1,
        explanation: 'LRU는 최근 과거의 참조 패턴을 바탕으로 "가장 오랫동안 사용되지 않은" 페이지를 교체합니다. (참조 횟수 기준은 LFU, 미래 예측은 Optimal)',
        commonMisconception: 'LRU와 LFU(빈도수)를 혼동하여 참조 횟수가 적은 것을 고르는 실수를 자주 합니다.'
      }
    ]
  }
];
