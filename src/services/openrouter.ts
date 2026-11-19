import { ProblemPair, CoachingTurn, MetacognitiveQuadrant, QuestionItem } from '../types';

export const DEFAULT_MODEL = 'google/gemma-4-26b-a4b-it:free';

/**
 * OpenRouter API를 통한 문제 쌍(기본 문제 + 재검증 문제) 생성
 */
export async function generateProblemPairs(
  materialText: string,
  apiKey?: string,
  count: number = 3
): Promise<ProblemPair[]> {
  const trimmed = materialText.trim();

  // 1. API 키가 등록되어 있을 경우 실제 OpenRouter API 호출
  if (apiKey && apiKey.trim().length > 5) {
    try {
      const systemPrompt = `당신은 전 과목(수학, 과학, 언어, 사회, 전공, 상식 등) 맞춤형 시험 출제 전문 AI 튜터입니다.
제공된 학습 자료의 내용과 주제를 정확히 파악하여, 학습자가 제대로 이해했는지 검증할 수 있는 객관식 4지선다 문제 쌍을 ${count}개 출제하세요.

[출제 절대 규칙]:
1. 선지(options 4개)는 반드시 질문과 동일한 형식/도메인의 유사한 선택지로 구성해야 합니다.
   - 예: 계산/수학 문제(예: 1+1, 미적분 등)인 경우 -> 선지는 반드시 비슷한 숫자/수식으로 4개 구성 (예: ["1", "2", "3", "4"])
   - 예: 인물/역사 문제인 경우 -> 선지는 유사한 시대/분야의 인물 4명으로 구성
   - 예: 개념 정의 문제인 경우 -> 문장 구조와 길이가 비슷한 4개의 선지로 구성
2. 정답(correctAnswer)은 0, 1, 2, 3 중 정답 선택지의 index입니다.
3. 오답 3개는 엉뚱한 헛소리가 아니라, 학습자가 헷갈리기 쉬운 '매력적인 오답(유사 오답)'이어야 합니다.
4. 재검증 문제(retestQuestion)는 1차 기본 문제와 '동일한 공식/원리'를 숫자를 바꾸거나 상황을 비틀어 테스트하는 유사 변형 문제여야 합니다.
5. 백틱(\`\`\`)이나 마크다운 없이 순수 JSON 배열만 응답하세요.

JSON 출력 포맷:
[
  {
    "id": "pair-1",
    "concept": "핵심 개념명 (예: 사칙연산의 덧셈, 가상 메모리 등)",
    "primaryQuestion": {
      "id": "p1-q1",
      "concept": "핵심 개념명",
      "question": "문제 질문",
      "options": ["유사 선지1", "유사 선지2", "유사 선지3", "유사 선지4"],
      "correctAnswer": 0,
      "explanation": "정답인 이유와 논리적 해설",
      "commonMisconception": "오답을 고르게 되는 주된 착각 요인"
    },
    "retestQuestion": {
      "id": "p1-q2",
      "concept": "핵심 개념명",
      "question": "동일 개념/원리의 유사 변형 재검증 문제",
      "options": ["유사 선지1", "유사 선지2", "유사 선지3", "유사 선지4"],
      "correctAnswer": 1,
      "explanation": "해설",
      "commonMisconception": "오류 원인"
    }
  }
]`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'MetaCognify AI'
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `[사용자가 입력한 학습 자료 또는 문제]:\n${trimmed}` }
          ],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed: ProblemPair[] = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('OpenRouter API 문제 생성 실패, 지능형 도메인 적응 엔진으로 폴백합니다:', err);
    }
  }

  // 2. Fallback: 입력 텍스트의 도메인(수학/수식, 문답, 일반문장)을 분석하여 현실적인 유사 선지 생성
  return generateContextAwareFallbackPairs(trimmed, count);
}

/**
 * 입력 텍스트를 맥락 기반으로 정밀 분석하여 유사 선지를 생성하는 지능형 폴백
 */
function generateContextAwareFallbackPairs(text: string, count: number): ProblemPair[] {
  // A. 수식 패턴 감지 (예: "1+1=3", "2*5=10", "1+1", "x+y")
  const mathRegex = /(\d+)\s*([\+\-\*\/])\s*(\d+)(?:\s*=\s*(\d+))?/;
  const mathMatch = text.match(mathRegex);

  if (mathMatch) {
    const num1 = parseInt(mathMatch[1], 10);
    const op = mathMatch[2];
    const num2 = parseInt(mathMatch[3], 10);
    let realAnswer = 0;
    if (op === '+') realAnswer = num1 + num2;
    if (op === '-') realAnswer = num1 - num2;
    if (op === '*') realAnswer = num1 * num2;
    if (op === '/') realAnswer = Math.floor(num1 / num2);

    const userGivenAnswer = mathMatch[4] ? parseInt(mathMatch[4], 10) : null;
    const isUserIncorrectStatement = userGivenAnswer !== null && userGivenAnswer !== realAnswer;

    // 유사 숫자 선지 4개 생성
    const options = [
      String(realAnswer),
      String(realAnswer + 1),
      String(realAnswer - 1),
      String(realAnswer + 2)
    ];

    // 재검증용 변형 숫자
    const retestNum1 = num1 + 2;
    const retestNum2 = num2 + 1;
    let retestAns = 0;
    if (op === '+') retestAns = retestNum1 + retestNum2;
    if (op === '-') retestAns = retestNum1 - retestNum2;
    if (op === '*') retestAns = retestNum1 * retestNum2;
    if (op === '/') retestAns = Math.floor(retestNum1 / retestNum2);

    return [
      {
        id: `math-pair-1`,
        concept: `연산 개념 (${num1} ${op} ${num2})`,
        primaryQuestion: {
          id: `math-q1`,
          concept: `연산 개념 (${num1} ${op} ${num2})`,
          question: isUserIncorrectStatement
            ? `입력하신 내용 "${num1} ${op} ${num2} = ${userGivenAnswer}"과 관련하여, 올바른 계산 결과는 무엇인가?`
            : `다음 연산의 올바른 결과값은 무엇인가?\n\n${num1} ${op} ${num2} = ?`,
          options: options,
          correctAnswer: 0,
          explanation: `${num1}와 ${num2}의 ${op === '+' ? '덧셈' : op === '-' ? '뺄셈' : op === '*' ? '곱셈' : '나눗셈'} 올바른 결과는 ${realAnswer}입니다. ${isUserIncorrectStatement ? `(입력하신 ${userGivenAnswer}은(는) 계산 오류입니다)` : ''}`,
          commonMisconception: `기본 연산 부호나 자릿수를 착각하여 ${realAnswer + 1}이나 ${userGivenAnswer || realAnswer - 1}로 잘못 계산하는 실수가 흔합니다.`
        },
        retestQuestion: {
          id: `math-q2`,
          concept: `연산 개념 (${num1} ${op} ${num2})`,
          question: `[동일 연산 원리 재검증 문제]\n동일한 규칙을 적용하여 다음 연산의 올바른 값을 구하시오:\n\n${retestNum1} ${op} ${retestNum2} = ?`,
          options: [
            String(retestAns + 1),
            String(retestAns),
            String(retestAns - 1),
            String(retestAns + 2)
          ],
          correctAnswer: 1, // index 1이 retestAns
          explanation: `${retestNum1} ${op} ${retestNum2} = ${retestAns} 입니다.`,
          commonMisconception: '연산 과정에서 부호를 반대로 적용하거나 1의 자리 올림을 빠뜨리는 오개념이 있습니다.'
        }
      }
    ];
  }

  // B. 질문 형태 감지 (예: "대한민국의 수도는?", "빛의 속도는?")
  const lines = text
    .split(/\n+/)
    .map(l => l.trim())
    .filter(l => l.length > 5);

  const pairs: ProblemPair[] = [];
  const targetLines = lines.length > 0 ? lines : [text];

  for (let i = 0; i < Math.min(count, targetLines.length); i++) {
    const rawLine = targetLines[i];
    const conceptName = rawLine.slice(0, 20).replace(/[?.:!=]/g, '').trim() || `입력 개념 #${i + 1}`;

    pairs.push({
      id: `ctx-pair-${i}`,
      concept: conceptName,
      primaryQuestion: {
        id: `ctx-q1-${i}`,
        concept: conceptName,
        question: rawLine.endsWith('?') 
          ? rawLine 
          : `다음 내용과 관련하여 학습 자료에 부합하는 올바른 설명은 무엇인가?\n\n"${rawLine}"`,
        options: [
          `해당 진술은 참(True)이며 자료에 제시된 핵심 사실과 정확히 일치한다.`,
          `해당 진술의 전제 조건이 반대로 서술되어 사실과 다르다.`,
          `해당 내용은 핵심 개념과 무관한 주변부 예시일 뿐이다.`,
          `해당 명제는 논리적 모순이 있어 참/거짓을 판별할 수 없다.`
        ],
        correctAnswer: 0,
        explanation: `입력하신 내용 "${rawLine}"의 진위 및 핵심 사실을 정확히 이해하고 있는지 확인하는 문항입니다.`,
        commonMisconception: `단어의 유사성에만 이끌려 문장의 논리적 참/거짓을 반대로 오판하는 경향이 있습니다.`
      },
      retestQuestion: {
        id: `ctx-q2-${i}`,
        concept: conceptName,
        question: `[동일 개념 재검증]\n위 "${conceptName}" 개념을 다른 상황에 적용할 때 가장 올바른 태도는?`,
        options: [
          `단순 표면적 단어에 현혹되지 않고 개념의 본질적 인과관계를 확인한다.`,
          `익숙한 느낌이 들면 검증 없이 직관만으로 답을 결정한다.`,
          `첫 번째 선택지가 조금이라도 익숙하면 나머지 보기는 읽지 않는다.`,
          `자료의 원문과 무관한 외부 선입견을 우선 적용한다.`
        ],
        correctAnswer: 0,
        explanation: `개념의 인과관계를 깊이 인출할 수 있어야 변형 문제에서도 정답을 맞힐 수 있습니다.`,
        commonMisconception: '익숙함을 이해로 착각하여 검증 단계를 생략하는 실수를 범합니다.'
      }
    });
  }

  return pairs;
}

/**
 * 유형별 맞춤형 AI 코칭 응답 생성
 */
export async function getCoachingResponse(
  question: QuestionItem,
  quadrant: MetacognitiveQuadrant,
  confidence: number,
  userChoice: number,
  history: CoachingTurn[],
  userReply?: string,
  apiKey?: string
): Promise<string> {
  // 유형 1: 자신감 높음 + 정답 (피로도 방지: 즉시 통과 안내)
  if (quadrant === 'CALIBRATED_ACCURATE') {
    return `🎉 완벽합니다! ${confidence}%의 높은 자신감으로 정확히 정답을 맞히셨습니다. 이미 확실하게 숙달된 개념이므로 불필요한 재검증 없이 바로 통과합니다!`;
  }

  if (apiKey && apiKey.trim().length > 5) {
    try {
      const isCorrectAnswer = quadrant === 'UNDERCONFIDENT';
      const systemPrompt = `당신은 학생의 메타인지를 돕는 소크라테스식 튜터입니다.
규칙:
1. 정답을 직접 주입하지 마세요.
2. 학생 상태: [${quadrant}], 자신감 ${confidence}%, 정답 여부: ${isCorrectAnswer ? '정답' : '오답'}
${quadrant === 'OVERCONFIDENT' ? '3. 학생은 "자신 있게 틀린(과신)" 상태입니다. 학생이 왜 그렇게 생각했는지 스스로 맹점과 오개념을 깨닫도록 1회의 날카로운 역질문을 던지세요.' : '3. 학생의 개념 확신을 돕는 1회의 질문을 던지세요.'}
4. 학생 피로도를 줄이기 위해 2문장 이내로 간결하고 친절하게 말하세요.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `[문제]: ${question.question}\n[학생 선택]: ${question.options[userChoice]}\n[정답]: ${question.options[question.correctAnswer]}\n[오개념 포인트]: ${question.commonMisconception}`
        },
        ...history.map(h => ({
          role: h.sender === 'ai' ? 'assistant' : 'user',
          content: h.text
        })),
      ];

      if (userReply) {
        messages.push({ role: 'user', content: userReply });
      }

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'MetaCognify'
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages,
          temperature: 0.5
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) return reply.trim();
      }
    } catch (err) {
      console.warn('AI 코칭 API 실패, 룰베이스 코칭으로 폴백:', err);
    }
  }

  // 룰베이스 폴백 코칭
  if (quadrant === 'OVERCONFIDENT') {
    if (history.length === 0) {
      return `⚠️ 이 문제에 대해 ${confidence}%의 강한 확신을 가지셨네요! 하지만 정답은 달랐습니다. 혹시 어떤 계산 과정이나 선입견 때문에 이 선택지를 정답이라고 확신하셨는지 짧게 들려주실 수 있나요?`;
    }
    return `좋은 접근입니다. 그 부분에 숨겨진 오개념 맹점이 있습니다. 아래의 [개념 교정 해설]을 확인하고 동일 개념 재검증 문제로 실력을 바로잡아보세요.`;
  }

  if (quadrant === 'UNDERCONFIDENT') {
    return `정답을 맞히셨는데 자신감이 ${confidence}%로 낮으셨네요! 어떤 선택지가 당신을 가장 헷갈리게 만들었나요? 스스로의 직관을 조금 더 신뢰하셔도 좋습니다.`;
  }

  return `모른다는 사실을 솔직하게 인지하고 ${confidence}%로 표기하신 것은 훌륭한 메타인지의 시작입니다! 이 개념에서 가장 헷갈렸던 부분이 어디였나요?`;
}
