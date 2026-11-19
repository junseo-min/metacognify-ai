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
      const systemPrompt = `당신은 실전 객관식 4지선다 시험 출제 전문가입니다.
사용자가 입력한 지문의 구체적인 사실, 수식, 용어, 데이터를 철저히 기반으로 시험 문제를 출제하세요.

[출제 절대 규칙 - 위반 금지]:
1. 뜬구름 잡는 추상적인 문장(예: "지문의 원리는 시험에서 인출 단서로서...", "현대 인지과학에서 반증된...")은 절대 출제하지 마세요!
2. 지문이 수식이나 계산(예: 1+1=2, 2+2=4 등)인 경우:
   - 반드시 질문은 구체적인 계산을 묻는 질문이어야 합니다 (예: "다음 중 올바른 것은?", "1+1의 결과는?").
   - 선지는 반드시 구체적인 수식이나 숫자여야 합니다 (예: A: "1+1=3", B: "1+1=2", C: "2+2=5", D: "2+2=6").
3. 지문이 개념 설명이나 서술문인 경우:
   - 지문의 핵심 단어나 수치를 살짝 비튼 '그럴듯한 오답 선지 3개'와 '확실한 정답 선지 1개'로 4지선다를 구성하세요.
4. 재검증 문제(retestQuestion)는 동일한 원리를 적용한 새로운 유사 변형 문제여야 합니다.
5. 백틱(\`\`\`) 없이 순수 JSON 배열만 반환하세요.

JSON 출력 포맷:
[
  {
    "id": "pair-1",
    "concept": "핵심 개념명 (예: 기본 덧셈 연산, 세포 분열 등)",
    "primaryQuestion": {
      "id": "p1-q1",
      "concept": "핵심 개념명",
      "question": "구체적인 문제 질문",
      "options": ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
      "correctAnswer": 0, // 0~3 중 정답 index
      "explanation": "해설",
      "commonMisconception": "오답을 고르게 되는 착각 요인"
    },
    "retestQuestion": {
      "id": "p1-q2",
      "concept": "핵심 개념명",
      "question": "동일 개념의 변형 재검증 문제 질문",
      "options": ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
      "correctAnswer": 1,
      "explanation": "해설",
      "commonMisconception": "오류 요인"
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
            { role: 'user', content: `[사용자가 입력한 지문 내용]:\n${trimmed}` }
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
      console.warn('OpenRouter API 호출 실패, 지능형 템플릿 생성기로 처리합니다:', err);
    }
  }

  // 2. Fallback: 입력 텍스트를 실제 파싱하여 진짜 시험 선지(예: 1+1=3 오답 선지 등)를 동적 생성
  return parseUserMaterialIntoRealisticQuestions(trimmed, count);
}

/**
 * 사용자가 입력한 지문을 파싱하여 구체적이고 현실적인 4지선다 문제를 생성
 */
function parseUserMaterialIntoRealisticQuestions(text: string, count: number): ProblemPair[] {
  const lines = text
    .split(/\n+/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  // 1. 수식/계산식 패턴 감지 (예: 1+1=2, 2+2=4 등)
  const mathEquations: { num1: number; op: string; num2: number; ans: number; raw: string }[] = [];
  const mathLineRegex = /(\d+)\s*([\+\-\*\/])\s*(\d+)\s*(?:=\s*(\d+))?/;

  lines.forEach(line => {
    const m = line.match(mathLineRegex);
    if (m) {
      const num1 = parseInt(m[1], 10);
      const op = m[2];
      const num2 = parseInt(m[3], 10);
      let calculated = 0;
      if (op === '+') calculated = num1 + num2;
      if (op === '-') calculated = num1 - num2;
      if (op === '*') calculated = num1 * num2;
      if (op === '/') calculated = num2 !== 0 ? Math.floor(num1 / num2) : 0;

      mathEquations.push({
        num1,
        op,
        num2,
        ans: m[4] ? parseInt(m[4], 10) : calculated,
        raw: line
      });
    }
  });

  // 수식이 감지된 경우: 사용자가 요청한 "1+1=3 이런식의 오답을 포함한 4지선다"를 생성!
  if (mathEquations.length > 0) {
    const eq1 = mathEquations[0];
    const realAns1 = eq1.op === '+' ? eq1.num1 + eq1.num2 : eq1.ans;
    const correctStatement1 = `${eq1.num1} ${eq1.op} ${eq1.num2} = ${realAns1}`;

    // 매력적인 오답 수식들 생성 (예: 1+1=3, 1+1=1, 2+2=5 등)
    const wrongStatements1 = [
      `${eq1.num1} ${eq1.op} ${eq1.num2} = ${realAns1 + 1}`, // 오답 1 (예: 1+1=3)
      `${eq1.num1} ${eq1.op} ${eq1.num2} = ${Math.max(0, realAns1 - 1)}`, // 오답 2
      `${eq1.num1 + 1} ${eq1.op} ${eq1.num2} = ${realAns1 + 3}`  // 오답 3
    ];

    // 두 번째 수식이 있으면 활용
    if (mathEquations.length > 1) {
      const eq2 = mathEquations[1];
      const realAns2 = eq2.op === '+' ? eq2.num1 + eq2.num2 : eq2.ans;
      wrongStatements1[1] = `${eq2.num1} ${eq2.op} ${eq2.num2} = ${realAns2 + 1}`; // 예: 2+2=5
    }

    // 1차 문제 선지: 1개의 정답과 3개의 오답 수식
    const options1 = [
      wrongStatements1[0],     // A: 오답 (예: 1+1=3)
      correctStatement1,       // B: 정답 (예: 1+1=2)
      wrongStatements1[1],     // C: 오답
      wrongStatements1[2]      // D: 오답
    ];

    // 변형 재검증 문제
    const testNum1 = eq1.num1 + 1;
    const testNum2 = eq1.num2 + 2;
    let testReal = testNum1 + testNum2;
    if (eq1.op === '-') testReal = testNum1 - testNum2;
    if (eq1.op === '*') testReal = testNum1 * testNum2;

    const options2 = [
      `${testNum1} ${eq1.op} ${testNum2} = ${testReal + 1}`,
      `${testNum1} ${eq1.op} ${testNum2} = ${testReal - 1}`,
      `${testNum1} ${eq1.op} ${testNum2} = ${testReal}`, // 정답
      `${testNum1} ${eq1.op} ${testNum2} = ${testReal + 2}`
    ];

    return [
      {
        id: 'math-pair-gen-1',
        concept: `기본 연산 (${eq1.op === '+' ? '덧셈' : '계산'})`,
        primaryQuestion: {
          id: 'math-gen-q1',
          concept: `기본 연산 (${eq1.op === '+' ? '덧셈' : '계산'})`,
          question: `다음 중 올바른 계산 식은 무엇인가?`,
          options: options1,
          correctAnswer: 1, // B가 정답
          explanation: `${eq1.num1} ${eq1.op} ${eq1.num2}의 올바른 계산 결과는 ${realAns1}입니다.`,
          commonMisconception: `자릿수를 잘못 더하거나 부호를 혼동하여 ${wrongStatements1[0]}과 같은 오답을 고르는 실수가 있습니다.`
        },
        retestQuestion: {
          id: 'math-gen-q2',
          concept: `기본 연산 (${eq1.op === '+' ? '덧셈' : '계산'})`,
          question: `[재검증 변형 문제]\n동일한 연산 원리를 적용할 때, 다음 중 올바른 계산 식은?`,
          options: options2,
          correctAnswer: 2, // C가 정답
          explanation: `${testNum1} ${eq1.op} ${testNum2} = ${testReal} 입니다.`,
          commonMisconception: '계산 과정에서 1의 자리를 잘못 계산하면 오답으로 이어집니다.'
        }
      }
    ];
  }

  // 2. 일반 서술형 지문인 경우: 지문 문장에서 단어와 명제를 추출하여 실질적인 참/거짓 및 빈칸 선지 생성
  const pairs: ProblemPair[] = [];
  const validLines = lines.filter(l => l.length >= 4);
  const targetLines = validLines.length > 0 ? validLines : [text];

  for (let i = 0; i < Math.min(count, targetLines.length); i++) {
    const rawLine = targetLines[i];
    const concept = rawLine.length > 25 ? `${rawLine.slice(0, 20)}...` : rawLine;

    // 지문 속 구체적인 내용을 반영한 선지 생성
    const optionA = rawLine; // 정답 진술
    const optionB = `${rawLine} (이와 정반대로 결과가 나타난다)`; // 반대 오답
    const optionC = `${rawLine.slice(0, Math.floor(rawLine.length / 2))}에 관한 내용은 사실과 다르다`; // 부분 왜곡 오답
    const optionD = `위 내용은 어떤 조건에서도 성립하지 않는다`; // 전면 부정 오답

    pairs.push({
      id: `text-pair-${i}`,
      concept: `핵심 개념 #${i + 1}`,
      primaryQuestion: {
        id: `text-q1-${i}`,
        concept: `핵심 내용 확인`,
        question: `다음 중 제시된 지문의 사실 내용과 가장 정확히 일치하는 것은?`,
        options: [
          optionA, // 정답
          optionB,
          optionC,
          optionD
        ],
        correctAnswer: 0,
        explanation: `지문에 명시된 "${rawLine}"의 내용이 직접적인 정답 근거입니다.`,
        commonMisconception: '지문의 조건을 성급하게 반대로 유추하거나 확대해석하는 오개념이 발생합니다.'
      },
      retestQuestion: {
        id: `text-q2-${i}`,
        concept: `핵심 내용 확인`,
        question: `[재검증] 위 내용과 관련하여 가장 주의해야 할 잘못된 서술은?`,
        options: [
          `${rawLine}의 원리는 특정 조건에서만 예외 없이 적용된다.`,
          `${rawLine} (이 진술은 완전히 허구이다)`, // 정답 (잘못된 서술을 찾는 문제)
          `지문의 기본 명제를 신중히 확인해야 한다.`,
          `핵심 단어의 인과관계를 기억해야 한다.`
        ],
        correctAnswer: 1,
        explanation: '원문의 사실을 부정하는 서술은 명백한 오답입니다.',
        commonMisconception: '맞는 서술과 틀린 서술을 헷갈리는 경우가 흔합니다.'
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
  // 유형 1: 자신감 높음 + 정답 (피로도 방지: 즉시 통과)
  if (quadrant === 'CALIBRATED_ACCURATE') {
    return `🎉 완벽합니다! ${confidence}%의 높은 자신감으로 정확하게 맞히셨습니다. 이미 확실하게 알고 계시므로 재검증(다시 풀기) 없이 바로 다음으로 통과합니다!`;
  }

  // 특수 케이스: 정답을 맞혔는데 자신감을 0%로 설정한 경우 (따뜻한 위로와 응원)
  if (quadrant === 'UNDERCONFIDENT' && confidence === 0) {
    return `🌟 정답을 맞히셨는데 자신감을 0%로 적으셨군요! 비록 '완전히 찍었다'고 느끼셨더라도, 무의식 속에 이미 개념에 대한 올바른 직관과 기억의 단서가 살아있었기 때문입니다. 너무 불안해하지 마세요. 당신은 스스로 생각하는 것보다 훨씬 더 뛰어난 잠재력을 가지고 있습니다! 힘내세요, 충분히 잘하고 계십니다! 🌱`;
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
    if (confidence === 0) {
      return `🌟 정답을 맞히셨는데 자신감을 0%로 적으셨군요! 비록 '완전히 찍었다'고 느끼셨더라도, 무의식 속에 이미 개념에 대한 올바른 직관과 기억의 단서가 살아있었기 때문입니다. 너무 불안해하지 마세요. 당신은 스스로 생각하는 것보다 훨씬 더 뛰어난 잠재력을 가지고 있습니다! 힘내세요, 충분히 잘하고 계십니다! 🌱`;
    }
    return `정답을 맞히셨는데 자신감이 ${confidence}%로 낮으셨네요! 어떤 선택지가 당신을 가장 헷갈리게 만들었나요? 스스로의 직관을 조금 더 신뢰하셔도 좋습니다.`;
  }

  return `모른다는 사실을 솔직하게 인지하고 ${confidence}%로 표기하신 것은 훌륭한 메타인지의 시작입니다! 이 개념에서 가장 헷갈렸던 부분이 어디였나요?`;
}
