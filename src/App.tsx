import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MaterialInput } from './components/MaterialInput';
import { QuizSession } from './components/QuizSession';
import { DiagnosticReport } from './components/DiagnosticReport';
import { SocraticCoach } from './components/SocraticCoach';
import { RetestModal } from './components/RetestModal';
import { ScientificBasisModal } from './components/ScientificBasisModal';
import { HistoryDashboard } from './components/HistoryDashboard';
import { Question, UserAnswer, LearningSession } from './types';
import { SampleMaterial } from './data/sampleMaterials';
import { generateQuestionsFromMaterial } from './services/openrouter';
import { analyzeMetacognition } from './services/metacognition';
import confetti from 'canvas-confetti';

export function App() {
  const [currentTab, setCurrentTab] = useState<'study' | 'history' | 'science'>('study');
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('openrouter_api_key') || '';
  });

  // Study Workflow State: 'input' | 'quiz' | 'report'
  const [studyStage, setStudyStage] = useState<'input' | 'quiz' | 'report'>('input');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Active Session Data
  const [activeTitle, setActiveTitle] = useState('');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [activeAnswers, setActiveAnswers] = useState<UserAnswer[]>([]);

  // Modals
  const [socraticTarget, setSocraticTarget] = useState<{
    question: Question;
    answer: UserAnswer;
  } | null>(null);
  const [showRetestModal, setShowRetestModal] = useState(false);
  const [showScienceModal, setShowScienceModal] = useState(false);

  // Persistent Sessions
  const [sessions, setSessions] = useState<LearningSession[]>(() => {
    const saved = localStorage.getItem('metacognify_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('metacognify_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Start Quiz Handler
  const handleStartQuiz = async (
    materialText: string,
    materialTitle: string,
    sampleData?: SampleMaterial
  ) => {
    setIsLoadingQuestions(true);
    setActiveTitle(materialTitle);

    try {
      let questions: Question[] = [];

      // 추천 샘플에 기본 질문이 있고 API 키가 없으면 기본 고품질 문제 즉시 활용
      if (sampleData?.defaultQuestions && (!apiKey || apiKey.trim().length === 0)) {
        questions = sampleData.defaultQuestions;
      } else {
        questions = await generateQuestionsFromMaterial(materialText, apiKey, 4);
      }

      setActiveQuestions(questions);
      setStudyStage('quiz');
    } catch (err) {
      console.error(err);
      alert('문제 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Quiz Complete Handler
  const handleQuizComplete = (answers: UserAnswer[]) => {
    setActiveAnswers(answers);
    setStudyStage('report');

    const analysis = analyzeMetacognition(activeQuestions, answers);
    const newSession: LearningSession = {
      id: `session-${Date.now()}`,
      title: activeTitle,
      materialSummary: activeTitle,
      createdAt: new Date().toISOString(),
      questions: activeQuestions,
      answers,
      analysis,
    };

    setSessions(prev => [newSession, ...prev]);

    // Brier Score 우수하거나 정답률 75% 이상일 때 축하 이펙트
    if (analysis.brierScore <= 0.20 || analysis.accuracyRate >= 75) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  // Retest Finished Handler
  const handleCompleteRetest = (newAnswers: UserAnswer[]) => {
    // 기존 답변 업데이트
    const updatedAnswers = activeAnswers.map(orig => {
      const retested = newAnswers.find(r => r.questionId === orig.questionId);
      return retested || orig;
    });
    setActiveAnswers(updatedAnswers);
  };

  // Select Past Session from History
  const handleSelectSession = (session: LearningSession) => {
    setActiveTitle(session.title);
    setActiveQuestions(session.questions);
    setActiveAnswers(session.answers);
    setStudyStage('report');
    setCurrentTab('study');
  };

  const handleDeleteSession = (id: string) => {
    if (confirm('이 학습 기록을 삭제하시겠습니까?')) {
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  const currentAnalysis = activeQuestions.length > 0 && activeAnswers.length > 0
    ? analyzeMetacognition(activeQuestions, activeAnswers)
    : null;

  // 취약/오답 질문 추출 (재시험용)
  const weakQuestions = activeQuestions.filter(q => {
    const ans = activeAnswers.find(a => a.questionId === q.id);
    return ans && (!ans.isCorrect || ans.quadrant === 'OVERCONFIDENT');
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Global Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'study' && studyStage === 'quiz') {
            // keep quiz stage
          }
        }}
        apiKey={apiKey}
        setApiKey={setApiKey}
        onOpenScience={() => setShowScienceModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {currentTab === 'study' && (
          <>
            {studyStage === 'input' && (
              <MaterialInput
                onStartQuiz={handleStartQuiz}
                isLoading={isLoadingQuestions}
              />
            )}

            {studyStage === 'quiz' && (
              <QuizSession
                questions={activeQuestions}
                onComplete={handleQuizComplete}
                onCancel={() => setStudyStage('input')}
              />
            )}

            {studyStage === 'report' && currentAnalysis && (
              <DiagnosticReport
                questions={activeQuestions}
                answers={activeAnswers}
                analysis={currentAnalysis}
                onStartSocraticCoach={(q, a) => setSocraticTarget({ question: q, answer: a })}
                onRetest={() => setShowRetestModal(true)}
                onNewStudy={() => setStudyStage('input')}
              />
            )}
          </>
        )}

        {currentTab === 'history' && (
          <HistoryDashboard
            sessions={sessions}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onNewStudy={() => {
              setCurrentTab('study');
              setStudyStage('input');
            }}
          />
        )}
      </main>

      {/* Modals */}
      {socraticTarget && (
        <SocraticCoach
          question={socraticTarget.question}
          userAnswer={socraticTarget.answer}
          apiKey={apiKey}
          onClose={() => setSocraticTarget(null)}
        />
      )}

      {showRetestModal && (
        <RetestModal
          questions={weakQuestions.length > 0 ? weakQuestions : activeQuestions}
          onCompleteRetest={handleCompleteRetest}
          onClose={() => setShowRetestModal(false)}
        />
      )}

      {showScienceModal && (
        <ScientificBasisModal
          onClose={() => setShowScienceModal(false)}
        />
      )}

      {/* Global Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-400">
        <p className="max-w-md mx-auto">
          MetaCognify — 인지심리학 기반 메타인지 진단 및 시험 대비 인출 훈련 웹서비스<br />
          Fleming & Lau (2014) · Roediger & Karpicke (2006) · Dunlosky et al. (2013)
        </p>
      </footer>
    </div>
  );
}

export default App;
