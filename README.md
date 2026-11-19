# 🧠 MetaCognify (메타코그니파이)
> **AI 기반 메타인지 진단 및 시험 대비 학습 코칭 웹서비스**  
> *"눈으로 읽어서 아는 것"과 "시험에서 스스로 인출할 수 있는 것"의 간극을 메우다.*

---

## 📌 1. 프로젝트 개요 및 배경

많은 학생들이 시험을 준비할 때 교재나 필기노트를 반복해서 읽으며 **"충분히 다 알고 있다"**고 착각합니다(처리 유창성의 함정). 하지만 실제 시험장에서는 기억을 끄집어내지 못하거나 오개념으로 인해 실수를 저지릅니다.

**MetaCognify**는 인지심리학의 **인출 연습(Retrieval Practice)**과 **메타인지 캘리브레이션(Metacognitive Calibration)** 연구를 바탕으로, 학생이 자신의 앎과 모름을 객관적으로 점검하고 가장 위험한 **'과신 오답(Overconfident Error)'**을 집중 교정할 수 있도록 돕는 차세대 학습 코칭 플랫폼입니다.

---

## 🔬 2. 학습과학 연구 근거 (4대 핵심 논문)

1. **Fleming & Lau (2014) — *How to Measure Metacognition***
   - 주관적 확신도(Confidence)와 객관적 정답률의 일치도를 수학적으로 정량화.
   - **Brier Score** 및 **4분면 매트릭스**를 통해 인지 왜곡(과신/과소평가)을 정량 산출.
2. **Roediger & Karpicke (2006) — *Test-Enhanced Learning***
   - 단순 반복 재학습보다 기억에서 강제로 끄집어내는 인출 연습(시험/퀴즈)이 장기 기억 보존에 2배 이상 효과적임을 규명.
3. **Dunlosky et al. (2013) — *Improving Students' Learning With Effective Learning Techniques***
   - 연습 시험(Practice Testing)과 분산 학습(Distributed Practice)이 가장 학습 효용 가치가 높은 전략임을 메타분석으로 검증.
4. **Händel et al. (2020) — *Enhanced Monitoring Accuracy and Test Performance***
   - 자신의 수행 결과를 사전 예측하고 실제 성과와 비교하는 메타인지 훈련이 판단 정확도와 실제 시험 성적을 대폭 향상시킴을 증명.

---

## 🚀 3. 핵심 기능

### ① 학습자료 입력 및 AI 문제 자동 생성 (Retrieval Practice)
- 교재 텍스트 직접 입력, 파일(.txt/.md) 업로드 또는 검증된 추천 샘플(인지심리학, 가상메모리 등) 원클릭 로드.
- **OpenRouter API** (`google/gemma-4-26b-a4b-it:free`)를 통한 맞춤형 시험 문제 자동 출제 (API 키 미등록 시에도 내장 지능형 분석 엔진으로 100% 동작).

### ② 메타인지 자신감 캘리브레이션 (Confidence Rating)
- 문제를 풀고 정답을 제출하기 전, **"이 문제를 맞혔을 확률(자신감 0~100%)"**을 슬라이더로 의무 평가.
- 자신의 앎의 확신도를 능동적으로 점검하게 만드는 메타인지 모니터링 강제.

### ③ 과학적 메타인지 정량 분석 리포트
- **Brier Score ($BS = \frac{1}{N}\sum(C_i - O_i)^2$)**: 0에 가까울수록 완벽한 메타인지 판단.
- **판단 편향 (Bias)**: 평균 자신감 - 실제 정답률 (+: 과신 상태, -: 불안/과소평가 상태).
- **4분면 진단 매트릭스**:
  - 🔴 **과신 (Overconfident - 최우선 위험군)**: 자신감 높음(≥70%) & 실제 오답 ("안다고 착각한 함정")
  - 🟢 **정확한 지식 (Calibrated Knowledge)**: 자신감 높음(≥70%) & 실제 정답 ("완전 정복")
  - 🟡 **과소평가 / 운 (Underconfident)**: 자신감 낮음(<70%) & 실제 정답 ("불확실한 정답")
  - ⚪ **인지된 무지 (Recognized Ignorance)**: 자신감 낮음(<70%) & 실제 오답 ("모름을 인지함")

### ④ 소크라테스식 AI 오답 코칭 (Socratic Tutoring)
- 정답을 일방적으로 알려주지 않고, 특히 **과신 오답**에 대해 AI가 *"당시 어떤 단서 때문에 그렇게 확신하셨나요?"*, *"이 조건이 바뀌면 결과는 어떻게 달라질까요?"* 등의 **역질문**을 던져 스스로 오개념의 벽을 허물도록 유도.

### ⑤ 취약 개념 집중 재시험 클리닉 (Distributed Retrieval)
- 과신 오답 및 틀린 문항만 선별하여 즉시 다시 인출 시험을 진행하고 개선율을 피드백.

### ⑥ 학습 성장 트래커 & 히스토리 대시보드
- 모든 세션이 브라우저 로컬 저장소에 안전하게 기록되어 누적 Brier Score 및 정답률 변화 추이를 시각적으로 확인.

---

## 🛠️ 4. 기술 스택 및 구조

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Icons & Effects**: Lucide React, Canvas Confetti
- **AI Engine**: OpenRouter API (`google/gemma-4-26b-a4b-it:free` 연동 및 Fallback 모듈 탑재)
- **Mathematical Model**: Brier Score, Calibration Bias, 4-Quadrant Metacognitive Classifier

---

## 💻 5. 로컬 실행 방법

```bash
# 개발 서버 구동
npm run dev

# 프로덕션 빌드
npm run build
```
개발 서버 실행 시 브라우저에서 `http://localhost:5173`으로 접속할 수 있습니다.
