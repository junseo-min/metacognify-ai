import React, { useState } from 'react';
import { SAMPLE_MATERIALS, SampleMaterial } from '../data/sampleMaterials';
import { Sparkles, FileText, UploadCloud, CheckCircle2, ArrowRight, FileType, AlertCircle } from 'lucide-react';

interface MaterialInputProps {
  onStartTraining: (materialText: string, materialTitle: string, sampleData?: SampleMaterial) => void;
  isLoading: boolean;
}

export const MaterialInput: React.FC<MaterialInputProps> = ({ onStartTraining, isLoading }) => {
  const [selectedSample, setSelectedSample] = useState<SampleMaterial | null>(SAMPLE_MATERIALS[0]);
  const [customText, setCustomText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [inputMode, setInputMode] = useState<'sample' | 'custom'>('sample');
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const [extractionMsg, setExtractionMsg] = useState('');

  const handleStart = () => {
    if (inputMode === 'sample' && selectedSample) {
      onStartTraining(selectedSample.content, selectedSample.title, selectedSample);
    } else if (inputMode === 'custom' && customText.trim()) {
      onStartTraining(customText, customTitle.trim() || '사용자 학습자료', undefined);
    }
  };

  // PDF 텍스트 비동기 추출 함수
  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    // @ts-ignore
    const pdfjsLib = window.pdfjsLib;

    if (!pdfjsLib) {
      throw new Error('PDF 파서 라이브러리를 로드하지 못했습니다. 인터넷 연결을 확인해주세요.');
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      setExtractionMsg(`PDF 파싱 중... (${i}/${pdf.numPages} 페이지)`);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // @ts-ignore
      const pageStrings = content.items.map((item: any) => item.str || '').join(' ');
      if (pageStrings.trim()) {
        fullText += `[${i}페이지]\n${pageStrings.trim()}\n\n`;
      }
    }

    return fullText.trim();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    setCustomTitle(baseName);
    setInputMode('custom');

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'pdf') {
      setIsExtractingFile(true);
      setExtractionMsg('PDF 파일 분석을 시작합니다...');
      try {
        const text = await extractTextFromPdf(file);
        if (!text || text.length < 5) {
          alert('PDF에서 텍스트를 추출하지 못했습니다. (스캔된 이미지형 PDF인 경우 텍스트를 복사해서 직접 붙여넣어 주세요)');
        } else {
          setCustomText(text);
        }
      } catch (err: any) {
        console.error(err);
        alert(`PDF 파일 처리 중 오류가 발생했습니다: ${err.message || err}`);
      } finally {
        setIsExtractingFile(false);
        setExtractionMsg('');
      }
    } else {
      // 텍스트 파일 (.txt, .md 등)
      setIsExtractingFile(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setCustomText(content);
        }
        setIsExtractingFile(false);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            4단계 인터랙티브 메타인지 훈련 파이프라인
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
            문제 풀이부터 맞춤 AI 코칭,<br />
            <span className="text-amber-300">재검증과 분리 리포트</span>까지
          </h1>
          <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            한 문제마다 <strong>[문제 풀이 + 자신감] → [4가지 유형 분류] → [맞춤 AI 코칭 & 개념 교정] → [동일 개념 변형 문제 재검증]</strong>의 4단계 훈련이 실시간으로 작동합니다.
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-medium text-indigo-200/90">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              정답+자신감 높은 문항은 재검증 생략(피로도 제로)
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              TXT 및 PDF 강의자료 원클릭 추출 지원
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
            추천 검증자료 (인지심리학 & 메타인지)
          </button>
          <button
            onClick={() => setInputMode('custom')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              inputMode === 'custom'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            내 강의자료 직접 입력 (TXT / PDF)
          </button>
        </div>

        {/* Tab 1: Recommended Sample Materials */}
        {inputMode === 'sample' && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              테스트할 강의자료를 선택하세요
            </p>
            <div className="grid grid-cols-1 gap-4">
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
                    <span className="text-xs font-semibold text-indigo-600 font-mono">
                      4개 핵심 개념 & 변형 재검증 문제 완비
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">{sample.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
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

        {/* Tab 2: Custom Text / File Input (TXT + PDF SUPPORTED) */}
        {inputMode === 'custom' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="자료 제목 (예: 중간고사 1단원 요약)"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm font-medium"
              />

              {/* TXT / PDF Upload Button */}
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-indigo-400 bg-indigo-50/60 hover:bg-indigo-100/70 text-indigo-700 text-xs font-bold cursor-pointer transition-colors shadow-sm">
                <UploadCloud className="w-4 h-4 text-indigo-600" />
                <span>파일 업로드 (.txt, .pdf)</span>
                <input
                  type="file"
                  accept=".txt,.md,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Extracting Indicator */}
            {isExtractingFile && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800 flex items-center gap-2 animate-pulse">
                <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>{extractionMsg || '파일에서 텍스트를 추출하고 있습니다...'}</span>
              </div>
            )}

            <div className="relative">
              <textarea
                rows={9}
                placeholder="시험 준비용 강의 노트나 교재 텍스트를 직접 붙여넣거나, 상단의 '파일 업로드' 버튼으로 TXT 또는 PDF 파일을 불러오세요..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm leading-relaxed"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 px-1">
                <span>글자 수: {customText.length}자</span>
                <span className="text-slate-400">TXT / PDF 지원</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            문제를 풀면 <strong className="text-indigo-600">즉시 AI 코칭과 개념 재검증</strong>이 시작됩니다.
          </div>

          <button
            onClick={handleStart}
            disabled={isLoading || isExtractingFile || (inputMode === 'custom' && customText.trim().length === 0)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl gradient-primary text-white font-bold text-sm shadow-lg shadow-indigo-300/40 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI가 개념별 문제 쌍을 출제하는 중...</span>
              </>
            ) : (
              <>
                <span>메타인지 4단계 훈련 시작</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
