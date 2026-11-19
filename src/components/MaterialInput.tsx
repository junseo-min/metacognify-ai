import React, { useState } from 'react';
import { SAMPLE_MATERIALS, SampleMaterial } from '../data/sampleMaterials';
import { Sparkles, FileText, UploadCloud, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface MaterialInputProps {
  onStartQuiz: (materialText: string, materialTitle: string, sampleData?: SampleMaterial) => void;
  isLoading: boolean;
}

export const MaterialInput: React.FC<MaterialInputProps> = ({ onStartQuiz, isLoading }) => {
  const [selectedSample, setSelectedSample] = useState<SampleMaterial | null>(SAMPLE_MATERIALS[0]);
  const [customText, setCustomText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [inputMode, setInputMode] = useState<'sample' | 'custom'>('sample');

  const handleStart = () => {
    if (inputMode === 'sample' && selectedSample) {
      onStartQuiz(selectedSample.content, selectedSample.title, selectedSample);
    } else if (inputMode === 'custom' && customText.trim()) {
      onStartQuiz(customText, customTitle.trim() || '사용자 학습자료', undefined);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCustomText(content);
        setInputMode('custom');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Background Decorative Rings */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute right-20 top-0 w-40 h-40 rounded-full bg-indigo-400/10 blur-xl pointer-events-none" />

        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            과학적 인출 연습(Retrieval Practice) 엔진
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
            "눈으로 읽어서 아는 것"과<br />
            <span className="text-amber-300">"시험에서 꺼낼 수 있는 것"</span>은 다릅니다
          </h1>
          <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            시험 범위 강의자료를 넣고 퀴즈를 풀어보세요. 자신이 맞혔을 확률(자신감)을 입력하면,
            AI가 <strong>Brier Score</strong>와 <strong>4분면 분석</strong>을 통해 당신이 ‘안다고 착각한 함정 개념’을 짚어냅니다.
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-medium text-indigo-200/90">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Fleming & Lau (2014) 메타인지 캘리브레이션
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Roediger & Karpicke (2006) 인출 연습 효과
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selection Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
          <button
            onClick={() => setInputMode('sample')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              inputMode === 'sample'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            추천 검증자료로 바로 체험
          </button>
          <button
            onClick={() => setInputMode('custom')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              inputMode === 'custom'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            내 강의자료 / 시험범위 직접 입력
          </button>
        </div>

        {/* Tab 1: Recommended Sample Materials */}
        {inputMode === 'sample' && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              테스트할 강의자료를 선택하세요
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SAMPLE_MATERIALS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => setSelectedSample(sample)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    selectedSample?.id === sample.id
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-md shadow-indigo-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {sample.category}
                    </span>
                    {selectedSample?.id === sample.id && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">{sample.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {sample.description}
                  </p>
                </div>
              ))}
            </div>

            {selectedSample && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  자료 내용 미리보기
                </div>
                <pre className="text-xs text-slate-600 font-sans whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                  {selectedSample.content}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Custom Text / File Input */}
        {inputMode === 'custom' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="자료 제목 (예: 중간고사 경영학개론 제3장)"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm font-medium"
              />

              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold cursor-pointer transition-colors">
                <UploadCloud className="w-4 h-4" />
                텍스트 파일(.txt) 불러오기
                <input
                  type="file"
                  accept=".txt,.md,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <textarea
                rows={8}
                placeholder="시험 준비용 강의 노트, 요약본, 교재 텍스트를 이곳에 붙여넣으세요... (최소 100자 이상 권장)"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm leading-relaxed"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                <span>길이: {customText.length}자</span>
                {customText.length < 50 && customText.length > 0 && (
                  <span className="text-amber-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    더 풍부한 문제를 위해 100자 이상 입력을 권장합니다.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            문제 풀이 시 <strong className="text-slate-800">"자신감(0~100%)"</strong>을 측정하여 메타인지를 진단합니다.
          </div>

          <button
            onClick={handleStart}
            disabled={isLoading || (inputMode === 'custom' && customText.trim().length === 0)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl gradient-primary text-white font-bold text-sm shadow-lg shadow-indigo-300/40 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI가 시험문제 및 인출 포인트를 생성 중...</span>
              </>
            ) : (
              <>
                <span>메타인지 인출 퀴즈 시작</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
