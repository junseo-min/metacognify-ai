import { Question, UserAnswer, SocraticMessage } from '../types';

export const DEFAULT_MODEL = 'google/gemma-4-26b-a4b-it:free';

/**
 * OpenRouter API를 통한 문제 생성
 */
export async function generateQuestionsFromMaterial(
  materialText: string,
  apiKey?: string,
  count: number = 4
): Promise<Question[]> {
  // API Key가 등록되어 있을 경우 실제 OpenRouter 호출
  if (apiKey && apiKey.trim().length > 5) {
    try {
      const systemPrompt = `당신은 인지심리학 기반의 메타인지 진단 시험을 출제하는 교수이자 AI 튜터입니다.
제공된 학습자료를 정밀하게 분석하여, 학습자가 "이해했다고 착각하기 쉬운 핵심 개념"을 파악할 수 있는 객관식 문제를 ${count}개 출제하세요.
반드시 아래 JSON 스키마를 준수하여 오직 순수 JSON 배열만 응답하세요. 백틱(\`\`\`)이나 마크다운은 포함하지 마세요.

JSON 스키마:
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "concept": "핵심 개념명 (예: 이해의 착각, 페이지 폴트 등)",
    "question": "시험 문제 질문 텍스트",
    "options": ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
    "correctAnswer": 0, // 정답 선택지 index (0~3)
    "explanation": "왜 이것이 정답인지와 핵심 원리 해설",
    "commonMisconception": "학습자들이 흔히 이 문제를 틀리는 이유나 오개념"
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
            { role: 'user', content: `[학습 자료]:\n${materialText.slice(0, 3000)}` }
          ],
          temperature: 0.5
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      // JSON 추출 (마크다운 코드블록 포함 여부 대응)
      const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed: Question[] = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((q, idx) => ({
          ...q,
          id: q.id || `ai-${Date.now()}-${idx}`
        }));
      }
    } catch (err) {
      console.warn('OpenRouter API 직접 호출 실패, 지능형 템플릿 엔진으로 폴백합니다:', err);
    }
  }

  // Fallback: 텍스트 기반 지능형 문제 생성기
  return generateIntelligentFallbackQuestions(materialText, count);
}

/**
 * 텍스트 내용의 문단과 키워드를 분석하여 시험 문제를 생성하는 지능형 폴백
 */
function generateIntelligentFallbackQuestions(text: string, count: number): Question[] {
  const paragraphs = text
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 25);

  const questions: Question[] = [];
  const sampleConcepts = ['핵심 개념 원리', '인과 관계 분석', '주요 용어 구분', '적용 및 응용'];

  for (let i = 0; i < Math.min(count, Math.max(paragraphs.length, 3)); i++) {
    const targetPara = paragraphs[i % paragraphs.length] || text.slice(0, 100);
    const conceptName = sampleConcepts[i % sampleConcepts.length];

    questions.push({
      id: `fallback-${Date.now()}-${i}`,
      type: 'multiple_choice',
      concept: `${conceptName} #${i + 1}`,
      question: `다음 학습 내용과 관련하여 가장 올바른 설명 또는 핵심 의도는 무엇인가?\n\n"${targetPara.slice(0, 120)}..."`,
      options: [
        `해당 내용은 핵심 메커니즘을 설명하며 실제 시험에서 인출 단서로 가장 중요하게 작용한다.`,
        `해당 내용은 단순 배경 설명일 뿐 실제 시험 및 응용에는 영향을 주지 않는다.`,
        `내용에 나온 조건이 반대로 적용되어도 결과에는 차이가 없다.`,
        `이 개념은 이미 폐기된 이론이며 현대 인지과학에서는 사용되지 않는다.`
      ],
      correctAnswer: 0,
      explanation: `본 질문은 지문의 핵심 진술을 정확히 인지하고 있는지 평가합니다. 학습자가 '단순히 눈에 익은 것'과 '진짜 개념의 인과관계를 꿰뚫고 있는 것'을 구분하기 위함입니다.`,
      commonMisconception: `지문 속 단어 몇 개만 눈에 띄면 문맥의 인과관계를 깊이 따지지 않고 성급하게 선택하는 경향이 있습니다.`
    });
  }

  return questions;
}

/**
 * 소크라테스식 AI 튜터 역질문 코칭
 */
export async function askSocraticTutor(
  question: Question,
  userAnswer: UserAnswer,
  history: SocraticMessage[],
  userMessage: string,
  apiKey?: string
): Promise<string> {
  const isOverconfident = userAnswer.quadrant === 'OVERCONFIDENT';

  if (apiKey && apiKey.trim().length > 5) {
    try {
      const selectedOptionText = typeof question.correctAnswer === 'number' && question.options
        ? `학습자가 고른 선택지: ${question.options[Number(userAnswer.userResponse)]}`
        : `학습자 답변: ${userAnswer.userResponse}`;
      
      const correctOptionText = typeof question.correctAnswer === 'number' && question.options
        ? `실제 정답: ${question.options[Number(question.correctAnswer)]}`
        : `실제 정답: ${question.correctAnswer}`;

      const systemPrompt = `당신은 학생의 메타인지(Metacognition) 능력을 길러주는 소크라테스식 학습 코치입니다.
규칙:
1. 학생에게 정답을 절대로 한 번에 주입하지 마세요.
2. 학생은 이 문제에 대해 [자신감 ${userAnswer.confidence}%]로 답했으나 [${userAnswer.isCorrect ? '정답' : '오답'}]이었습니다.
${isOverconfident ? '3. 특히 학생은 "자신 있게 틀린(과신)" 상태입니다. 학생이 왜 그렇게 생각했는지 스스로 오개념(Misconception)의 맹점을 깨닫도록 부드럽고 날카로운 역질문(Socratic question)을 던지세요.' : '3. 학생이 올바른 논리적 연결고리를 스스로 찾아가도록 유도하는 힌트 질문을 던지세요.'}
4. 한국어로 정중하면서도 친절하게 2~3문장 이내로 답변하세요.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `[문제]: ${question.question}\n${selectedOptionText}\n${correctOptionText}\n[오개념 포인트]: ${question.commonMisconception || '개념 혼동'}` 
        },
        ...history.map(m => ({
          role: m.sender === 'ai' ? 'assistant' : 'user',
          content: m.text
        })),
        { role: 'user', content: userMessage }
      ];

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
          messages,
          temperature: 0.6
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) return reply.trim();
      }
    } catch (err) {
      console.warn('Socratic Tutor API 실패, 기본 코칭 룰로 전환:', err);
    }
  }

  // Fallback 역질문 로직
  if (isOverconfident) {
    if (history.length <= 1) {
      return `이 문제를 풀 때 ${userAnswer.confidence}%의 강한 확신을 가지셨네요! 혹시 어떤 근거나 경험 때문에 그렇게 생각하셨는지, 당시에 떠올랐던 핵심 단서가 무엇이었는지 먼저 말씀해주실 수 있나요?`;
    }
    return `좋은 접근입니다. 그렇다면 만약 지문에서 언급된 조건이 반대로 바뀌었다면 결과는 어떻게 달라졌을까요? 그 부분에 숨겨진 차이점이 있습니다.`;
  } else {
    return `틀린 부분에 대해 너무 낙담할 필요 없습니다. 정답 해설에서 "${question.concept}"의 정의를 다시 한번 읽어보고, 왜 원래 생각하셨던 답과 충돌하는지 한 문장으로 설명해보실 수 있을까요?`;
  }
}
