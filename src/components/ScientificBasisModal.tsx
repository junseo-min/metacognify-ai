import React from 'react';
import { BookOpen, X, Award, ExternalLink, Brain, Layers } from 'lucide-react';

interface ScientificBasisModalProps {
  onClose: () => void;
}

export const ScientificBasisModal: React.FC<ScientificBasisModalProps> = ({ onClose }) => {
  const papers = [
    {
      author: 'Fleming & Lau (2014)',
      title: 'How to Measure Metacognition',
      journal: 'Frontiers in Human Neuroscience',
      summary: '학습자의 답변 정확도와 주관적 자신감 사이의 관계를 정량적으로 분석하는 기법을 정립. Brier Score 및 Calibration Curve를 활용하여 인지적 왜곡(과신/과소평가)을 수학적으로 산출할 수 있음을 증명했습니다.',
      application: 'MetaCognify의 Brier Score 알고리즘과 4분면 진단 매트릭스 설계에 적용되었습니다.'
    },
    {
      author: 'Roediger & Karpicke (2006)',
      title: 'Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention',
      journal: 'Psychological Science',
      summary: '자료를 반복해서 읽는 전통적인 재학습 방식보다, 기억에서 억지로 끄집어내는 인출 퀴즈를 수행할 때 장기 기억 파지율이 2배 이상 높다는 사실을 실험으로 입증했습니다.',
      application: '단순 요약 대신 "자신감 측정 기반 시험 퀴즈"를 중심 프로세스로 채택했습니다.'
    },
    {
      author: 'Dunlosky et al. (2013)',
      title: 'Improving Students\' Learning With Effective Learning Techniques',
      journal: 'Psychological Science in the Public Interest',
      summary: '10가지 대표적인 학습 기법을 메타 분석하여, 연습시험(Practice Testing)과 분산학습(Distributed Practice)이 가장 학습 가치가 높고 지속 가능한 전략임을 밝혀냈습니다.',
      application: '취약 개념과 과신 오답만을 선별하여 다시 인출하는 "재시험 클리닉" 기능으로 구현되었습니다.'
    },
    {
      author: 'Händel et al. (2020)',
      title: 'Enhanced Monitoring Accuracy and Test Performance',
      journal: 'Metacognition and Learning',
      summary: '학습자가 자신의 성과를 예측하고 실제 결과와 비교하는 메타인지 모니터링 훈련을 반복하면, 판단 정확도가 정밀해지고 궁극적인 시험 성적이 획기적으로 향상된다는 점을 검증했습니다.',
      application: '문제 제출 전 "자신감 0~100% 슬라이더 강제 입력" 및 판단 오차 피드백으로 구현되었습니다.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-primary text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">인지심리학 및 학습과학 연구 근거</h3>
              <p className="text-xs text-slate-500">
                MetaCognify가 기반으로 하는 4대 핵심 논문 및 설계 원리
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/70 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Papers List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {papers.map((p, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-300 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 font-mono">
                  {p.author}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {p.journal}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                "{p.title}"
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                {p.summary}
              </p>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl font-medium">
                🎯 <strong>서비스 적용:</strong> {p.application}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
