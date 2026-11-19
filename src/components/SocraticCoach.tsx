import React, { useState, useEffect, useRef } from 'react';
import { Question, UserAnswer, SocraticMessage } from '../types';
import { askSocraticTutor } from '../services/openrouter';
import { Sparkles, Send, X, Bot, User, Brain, AlertTriangle } from 'lucide-react';

interface SocraticCoachProps {
  question: Question;
  userAnswer: UserAnswer;
  apiKey: string;
  onClose: () => void;
}

export const SocraticCoach: React.FC<SocraticCoachProps> = ({
  question,
  userAnswer,
  apiKey,
  onClose,
}) => {
  const [messages, setMessages] = useState<SocraticMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 첫 진입 시 AI의 첫 역질문 생성
  useEffect(() => {
    const initConversation = async () => {
      setIsTyping(true);
      const isOverconfident = userAnswer.quadrant === 'OVERCONFIDENT';

      const initialPrompt = isOverconfident
        ? `이 문제에 대해 ${userAnswer.confidence}%의 강한 확신을 갖고 답을 제출하셨네요! 시험에서 이런 과신(Overconfidence)은 가장 위험한 함정입니다. 당시에 어떤 근거로 해당 선택지를 확신하셨는지 당신의 생각 과정을 짧게 들려주시겠어요?`
        : `이 문제를 틀렸지만 괜찮습니다. 정답 해설을 보지 않고, 문제를 다시 읽었을 때 핵심 개념인 '${question.concept}'이 왜 중요하게 다뤄졌는지 스스로 유추해보실 수 있을까요?`;

      setTimeout(() => {
        setMessages([
          {
            id: 'init-1',
            sender: 'ai',
            text: initialPrompt,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsTyping(false);
      }, 600);
    };

    initConversation();
  }, [question, userAnswer]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg: SocraticMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInputText('');
    setIsTyping(true);

    try {
      const aiReply = await askSocraticTutor(
        question,
        userAnswer,
        nextHistory,
        userMsg.text,
        apiKey
      );

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">소크라테스식 AI 오답 코칭</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  역질문 모드
                </span>
              </div>
              <p className="text-xs text-slate-500">
                정답 주입 대신 학습자 스스로 논리적 맹점을 찾아내도록 돕습니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/70 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Context Banner */}
        <div className="p-3.5 bg-indigo-50/50 border-b border-indigo-100 text-xs text-slate-700 space-y-1">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-indigo-900">문제: {question.concept}</span>
            <span className={`px-2 py-0.5 rounded ${userAnswer.quadrant === 'OVERCONFIDENT' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'}`}>
              내 판단: {userAnswer.confidence}% 자신감 ({userAnswer.isCorrect ? '정답' : '오답'})
            </span>
          </div>
          <p className="text-slate-600 line-clamp-1 italic">
            "{question.question}"
          </p>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${
                  isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isAi
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isAi
                        ? 'bg-white border border-slate-200/80 text-slate-800 shadow-sm rounded-tl-none'
                        : 'bg-indigo-600 text-white rounded-tr-none'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className={`text-[10px] text-slate-400 block px-1 ${!isAi && 'text-right'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 items-center text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <span className="italic">AI 코치가 당신의 생각 과정을 분석하고 있습니다...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="당시 문제를 풀 때 했던 생각이나 의문을 자유롭게 적어보세요..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-xs sm:text-sm"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-all flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
