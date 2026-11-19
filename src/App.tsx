import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MaterialInput } from './components/MaterialInput';
import { InteractiveTrainingSession } from './components/InteractiveTrainingSession';
import { ComprehensiveReport } from './components/ComprehensiveReport';
import { HistoryDashboard } from './components/HistoryDashboard';
import { ScientificBasisModal } from './components/ScientificBasisModal';
import { ProblemPair, ProblemTrainingRecord, FinalDiagnosticReport } from './types';
import { SampleMaterial } from './data/sampleMaterials';
import { generateProblemPairs } from './services/openrouter';
import { generateFinalReport } from './services/metacognition';
import confetti from 'canvas-confetti';

export function App() {
  const [currentTab, setCurrentTab] = useState<'study' | 'history' | 'science'>('study');
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('openrouter_api_key') || '';
  });

  // Study Workflow State: 'input' | 'training' | 'report'
  const [studyStage, setStudyStage] = useState<'input' | 'training' | 'report'>('input');
  const [isLoadingPairs, setIsLoadingPairs] = useState(false);

  // Active Session Data
  const [activeTitle, setActiveTitle] = useState('');
  const [activePairs, setActivePairs] = useState<ProblemPair[]>([]);
  const [currentReport, setCurrentReport] = useState<FinalDiagnosticReport | null>(null);

  // Modals
  const [showScienceModal, setShowScienceModal] = useState(false);

  // Persistent Reports Storage
  const [savedReports, setSavedReports] = useState<FinalDiagnosticReport[]>(() => {
    const saved = localStorage.getItem('metacognify_reports');
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
    localStorage.setItem('metacognify_reports', JSON.stringify(savedReports));
  }, [savedReports]);

  // Start Interactive Training Handler
  const handleStartTraining = async (
    materialText: string,
    materialTitle: string,
    sampleData?: SampleMaterial
  ) => {
    setIsLoadingPairs(true);
    setActiveTitle(materialTitle);

    try {
      let pairs: ProblemPair[] = [];

      // 추천 샘플 데이터가 있고 API 키가 없으면 기본 고품질 문제 쌍 즉시 활용
      if (sampleData?.defaultPairs && (!apiKey || apiKey.trim().length === 0)) {
        pairs = sampleData.defaultPairs;
      } else {
        pairs = await generateProblemPairs(materialText, apiKey, 3);
      }

      setActivePairs(pairs);
      setStudyStage('training');
    } catch (err) {
      console.error(err);
      alert('문제 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoadingPairs(false);
    }
  };

  // Training Finished -> Calculate Split Metrics and Generate Report
  const handleFinishTraining = (records: ProblemTrainingRecord[]) => {
    const report = generateFinalReport(
      `report-${Date.now()}`,
      activeTitle || '메타인지 훈련 세션',
      records
    );

    setCurrentReport(report);
    setSavedReports(prev => [report, ...prev]);
    setStudyStage('report');

    // 축하 이펙트
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Select Report from History
  const handleSelectReport = (report: FinalDiagnosticReport) => {
    setCurrentReport(report);
    setStudyStage('report');
    setCurrentTab('study');
  };

  const handleDeleteReport = (sessionId: string) => {
    if (confirm('이 훈련 리포트를 삭제하시겠습니까?')) {
      setSavedReports(prev => prev.filter(r => r.sessionId !== sessionId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Global Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
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
                onStartTraining={handleStartTraining}
                isLoading={isLoadingPairs}
              />
            )}

            {studyStage === 'training' && activePairs.length > 0 && (
              <InteractiveTrainingSession
                problemPairs={activePairs}
                apiKey={apiKey}
                onFinishAll={handleFinishTraining}
                onCancel={() => setStudyStage('input')}
              />
            )}

            {studyStage === 'report' && currentReport && (
              <ComprehensiveReport
                report={currentReport}
                onNewStudy={() => setStudyStage('input')}
              />
            )}
          </>
        )}

        {currentTab === 'history' && (
          <HistoryDashboard
            reports={savedReports}
            onSelectReport={handleSelectReport}
            onDeleteReport={handleDeleteReport}
            onNewStudy={() => {
              setCurrentTab('study');
              setStudyStage('input');
            }}
          />
        )}
      </main>

      {/* Scientific Basis Modal */}
      {showScienceModal && (
        <ScientificBasisModal
          onClose={() => setShowScienceModal(false)}
        />
      )}

      {/* Global Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-400">
        <p className="max-w-md mx-auto leading-relaxed">
          MetaCognify — 4단계 메타인지 인출 훈련 및 사전/사후 분리 리포트 플랫폼<br />
          Fleming & Lau (2014) · Roediger & Karpicke (2006) · Dunlosky et al. (2013)
        </p>
      </footer>
    </div>
  );
}

export default App;
