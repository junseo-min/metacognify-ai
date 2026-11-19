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
  if (apiKey && apiKey.trim().length > 5) {
    try {
      const systemPrompt = `당신은 인지심리학 기반 메타인지 진단 출제자입니다.
제공된 학습자료에서 핵심 개념을 추출하여, 각 개념당 [1차 기본 문제]와 [동일 개념의 새로운 변형 재검증 문제] 쌍을 총 ${count}개 출제하세요.
객관식 4지선다(보기 4개)로 작성해야 합니다.
반드시 아래 JSON 스키마만 순수 JSON 배열로 반환하세요. 백틱이나 마크다운은 포함하지 마세요.

JSON 스키마:
[
  {
    "id": "pair-1",
    "concept": "핵심 개념명",
    "primaryQuestion": {
      "id": "p1-q1",
      "concept": "핵심 개념명",
      "question": "1차 기본 문제 지문",
      "options": ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
      "correctAnswer": 0, // 0~3
      "explanation": "해설",
      "commonMisconception": "흔한 오개념 원인"
    },
    "retestQuestion": {
      "id": "p1-q2",
      "concept": "핵심 개념명",
      "question": "동일 개념을 다른 각도나 새로운 상황에서 묻는 변형 재검증 문제",
      "options": ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
      "correctAnswer": 1, // 0~3
      "explanation": "재검증 문제 해설",
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
            { role: 'user', content: `[학습 자료]:\n${materialText.slice(0, 3000)}` }
          ],
          temperature: 0.5
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
      console.warn('OpenRouter API 문제 생성 실패, 기본 템플릿으로 폴백합니다:', err);
    }
  }

  // Fallback 생성기
  return generateFallbackPairs(materialText, count);
}

function generateFallbackPairs(text: string, count: number): ProblemPair[] {
  const paragraphs = text
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 20);

  const pairs: ProblemPair[] = [];
  for (let i = 0; i < Math.min(count, Math.max(paragraphs.length, 2)); i++) {
    const pText = paragraphs[i % paragraphs.length] || text.slice(0, 80);
    const concept = `학습 개념 #${i + 1}`;

    pairs.push({
      id: `fallback-pair-${Date.now()}-${i}`,
      concept,
      primaryQuestion: {
        id: `fb-${i}-q1`,
        concept,
        question: `다음 지문의 핵심 원리와 관련하여 가장 올바른 진술은 무엇인가?\n\n"${pText.slice(0, 100)}..."`,
        options: [
          '지문에서 설명하는 원리는 시험에서 인출 단서로서 필수적인 핵심 구조를 이룬다.',
          '이 내용은 단순 배경 지식일 뿐 실제 문제 풀이에는 전혀 활용되지 않는다.',
          '지문의 조건이 반대로 적용되어도 결과는 동일하게 도출된다.',
          '현대 인지과학에서 이미 반증된 이론으로 간주된다.'
        ],
        correctAnswer: 0,
        explanation: '지문의 핵심 메커니즘을 정확히 파악하여 인출할 수 있는지 점검하는 문항입니다.',
        commonMisconception: '지문 속 친숙한 단어 몇 개만 보고 맥락을 깊이 따지지 않는 경향이 있습니다.'
      },
      retestQuestion: {
        id: `fb-${i}-q2`,
        concept,
        question: `[재검증] 위 "${concept}" 개념을 실제 실전 문제나 새로운 맥락에 적용할 때 가장 유의해야 할 점은?`,
        options: [
          '조건의 예외 상황을 고려하지 않고 단순 암기된 공식만 기계적으로 대입하면 오답이 된다.',
          '모든 보기를 읽지 않고 첫 번째 보기만 보고 바로 정답으로 체크한다.',
          '자신감이 0%일 때만 정답으로 인정된다.',
          '개념의 정의보다 지문의 분량이 더 중요하다.'
        ],
        correctAnswer: 0,
        explanation: '개념의 내재적 원리를 이해해야 새로운 변형 문제에서도 흔들리지 않고 정답을 도출할 수 있습니다.',
        commonMisconception: '변형 문제가 나오면 동일한 개념임에도 불구하고 다른 문제로 오인하는 오류가 발생합니다.'
      }
    });
  }

  return pairs;
}

/**
 * 유형별 맞춤형 AI 코칭 응답 생성 (1~2회 집중, 피로도 최소화)
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
  // 유형 1: 자신감 높음 + 정답 (피로도 방지: 즉시 짧은 칭찬 및 통과 안내)
  if (quadrant === 'CALIBRATED_ACCURATE') {
    return `🎉 완벽합니다! ${confidence}%의 높은 자신감으로 정확한 정답을 맞히셨습니다. 자신이 잘 알고 있다는 사실을 정확히 모니터링하고 계시네요. 불필요한 긴 질문 없이 바로 다음 단계로 넘어가셔도 좋습니다!`;
  }

  // API 호출이 가능할 경우 OpenRouter 호출
  if (apiKey && apiKey.trim().length > 5) {
    try {
      const isCorrectAnswer = quadrant === 'UNDERCONFIDENT';
      const systemPrompt = `당신은 학생의 메타인지를 돕는 소크라테스식 튜터입니다.
규칙:
1. 정답을 직접 주입하지 마세요.
2. 학생 상태: [${quadrant}], 자신감 ${confidence}%, 정답 여부: ${isCorrectAnswer ? '정답' : '오답'}
${quadrant === 'OVERCONFIDENT' ? '3. 학생은 "자신 있게 틀린(과신)" 가장 위험한 상태입니다. 학생이 왜 그렇게 생각했는지 스스로 맹점과 오개념을 깨닫도록 부드럽지만 날카로운 1회의 역질문을 던지세요.' : '3. 학생의 개념 확신을 북돋우거나 논리적 연결고리를 짚어주는 1회의 짧은 질문을 던지세요.'}
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
          temperature: 0.6
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
      return `⚠️ 이 문제에 대해 ${confidence}%의 강한 확신을 가지셨네요! 하지만 실제 정답은 달랐습니다. 혹시 당시에 어떤 단어나 기억 때문에 이 선택지를 정답이라고 굳게 믿으셨는지 짧게 말씀해주실 수 있나요?`;
    }
    return `좋은 고찰입니다. 그 부분에 숨겨진 오개념 맹점이 있습니다. 아래의 [개념 교정 해설]을 확인하고 동일 개념 재검증 문제로 실력을 바로잡아보세요.`;
  }

  if (quadrant === 'UNDERCONFIDENT') {
    return `정답을 맞히셨는데 자신감이 ${confidence}%로 낮으셨네요! 어떤 선택지가 당신을 가장 헷갈리게 만들었나요? 스스로의 직관을 조금 더 신뢰하셔도 좋습니다.`;
  }

  // RECOGNIZED_IGNORANCE
  return `모른다는 사실을 솔직하게 인지하고 ${confidence}%로 표기하신 것은 훌륭한 메타인지의 시작입니다! 이 개념의 핵심 정의에서 가장 모호했던 부분이 어디였나요?`;
}
