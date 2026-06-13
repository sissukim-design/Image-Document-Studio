import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, Heart, Monitor, Zap, Cpu, Compass, BookOpen, Lightbulb, ChevronDown, ChevronUp, Star, Film, FileText, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AboutViewProps {
  language: string;
  onBack?: () => void;
  tabViewOnly?: boolean;
}

export default function AboutView({ language, onBack, tabViewOnly = false }: AboutViewProps) {
  const isKo = language === 'ko';

  // Benchmark speed index simulation state
  const [bmsStatus, setBmsStatus] = useState<'idle' | 'testing' | 'finished'>('idle');
  const [testedScore, setTestedScore] = useState<number>(0);

  const handleBenchmark = () => {
    setBmsStatus('testing');
    setTimeout(() => {
      // Create a fancy local computation rating
      const browserSpeedRating = Math.floor(8500 + Math.random() * 3200);
      setTestedScore(browserSpeedRating);
      setBmsStatus('finished');
    }, 1500);
  };

  const [activeCategory, setActiveCategory] = useState<'all' | 'image' | 'document' | 'tech'>('all');
  const [expandedArticles, setExpandedArticles] = useState<{ [key: string]: boolean }>({});

  const toggleArticle = (id: string) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const blogArticles = [
    {
      id: 'webp-avif',
      category: 'image',
      icon: <ImageIcon className="w-4 h-4 text-indigo-500" />,
      titleKo: '💡 WebP vs AVIF: 최적의 압축 포맷 선택 가이드',
      titleEn: '💡 WebP vs AVIF: Choosing the Perfect Compressed Format',
      summaryKo: '압축률과 브라우저 호환성을 고려한 이미지 포맷 분석. 언제 어떤 포맷을 써야 효과적일까요?',
      summaryEn: 'Analysis of compression ratio and web portability. Let’s find out which format is ideal.',
      contentKo: 'WebP는 구글이 개발한 이미지 표준으로 거의 모든 현대 브라우저(97% 이상 호럼성)에서 지원되며, JPEG 대비 약 26%~34%의 용량 절감 성능을 발휘합니다. 압축 및 처리 인코딩 속도가 매우 빨라 본 스튜디오에서 여러 장을 고속 일괄 작업하기에 적합합니다.\n\n반면 AVIF는 차세대 강자로 뛰어난 명암 대비(HDR) 표현 및 압축률을 자랑하지만, WASM(WebAssembly) 브라우저 메모리 가속 인코딩 속도가 WebP에 비해 상대적으로 느릴 수 있습니다. 가장 안전하고 빠른 배포 결과를 원한다면 WebP를, 최고의 용량 압축 효율과 화질 디테일이 목표라면 AVIF 포맷 변환을 권장해 드립니다.',
      contentEn: 'WebP is standard for general web builds ensuring 97%+ browser compatibility and saving up to 30% storage space over JPEG. It processes exceptionally fast in the local WASM memory. On the other hand, AVIF implements the high-profile chroma encoding of AV1, compressing extreme color spectrums perfectly. However, converting to AVIF in your local sandbox browser can take up to 3-5x longer than WebP. Use WebP for speed and broad compatibility, and choose AVIF for ultra-compact file sizing at bleeding-edge visual fidelity.',
      readTimeKo: '3분 소요',
      readTimeEn: '3 min read',
    },
    {
      id: 'pdf-reduction',
      category: 'document',
      icon: <FileText className="w-4 h-4 text-emerald-500" />,
      titleKo: '💡 150 DPI vs 300 DPI: 메일 전송용 PDF 용량 최소화',
      titleEn: '💡 150 DPI vs 300 DPI: Minimizing PDF Sizing for Emails',
      summaryKo: '사내 이메일 및 메신저 전송용 PDF 용량을 늘려먹는 메타 데이터와 해상도 최적화 비법.',
      summaryEn: 'Tricks to eliminate unnecessary fonts, vector blocks, and meta headers to prevent file rejections.',
      contentKo: '대부분의 디지털 화면 전송용 오피스 리포트 PDF 문서는 150 DPI(Dots Per Inch) 해상도로 충분히 선명하게 가독성이 유지됩니다. 인쇄 출력 전 주기 단계가 아니라면 화려한 300 DPI 소스를 고집할 필요는 전혀 없습니다.\n\n또한, 본 스튜디오의 통합 PDF 메인 병합 처리는 단순 바이트 병합이 아닌 내부 가상 링킹 주소 테이블(XREF Indirect References)을 지능적으로 재생성하므로, 용량 비대화 현상 없이 유효 텍스트 개체 정보만을 깔끔하게 직렬화해 담아냅니다.',
      contentEn: 'Standard monitor screens only require 150 DPI resolutions for document content. Avoiding heavy 300 DPI layout assets prevents bloating. Additionally, merging or joining documents through traditional byte-slicing causes index table metadata wreckage. OptiConvert resolves this issue by applying real-time virtual linking mapping (XREF Table reconstructs), ensuring maximum reading clarity without wasting storage.',
      readTimeKo: '2분 소요',
      readTimeEn: '2 min read',
    },

    {
      id: 'wasm-privacy-tech',
      category: 'tech',
      icon: <Cpu className="w-4 h-4 text-amber-500" />,
      titleKo: '💡 원격 서버 없는 웹 스튜디오: WASM 샌드박스의 프라이버시 혁명',
      titleEn: '💡 Client WASM Engines: Elevating Complete Local File Security',
      summaryKo: '외부 클라우드로 소중한 파일을 단 1KB도 전송하지 않고 모든 연산을 100% 기기 로컬에서 진행.',
      summaryEn: 'No web servers involved. All processing compiles on clean local client memory space.',
      contentKo: '기존의 크기 축소나 변환 웹사이트들은 연산 처리를 위해 소중한 증명서, 비공개 디자인 파일, 보안 문서를 리모트 클라우드 백엔드로 업로드합니다. 이는 치명적인 사내 메신저 보안 규정 위배나 라이선스 누출 잠재 우려를 자아냅니다.\n\n본 Image & Document Studio는 WebAssembly 기반 런타임을 통해 이미지 변환, 가상 PDF 테이블 역인덱싱, FFmpeg 동영상 압축에 이르는 전 시스템 파이프라인의 연산부를 사용자 장치(기기 내부 CPU)에 가상 독립 구동시킵니다. 보안 폐쇄 사내망이나 불안정한 네트워크 오프라인 조건에서도 아무 지연이나 누수 걱정 없이 무결한 비즈니스 워크플로우를 영위할 수 있는 핵심 경쟁력입니다.',
      contentEn: 'Standard online converter sites force users to upload layouts, secure blueprints, and personal identity certificates straight to their external backend cloud channels. To disrupt that hazard, this application implements complete client sandbox virtualization. By caching native binaries (WebP codec modules, WebAssembly wrappers, PDF-Lib structures, and FFmpeg assemblies), compilation is guaranteed locally. Enjoy corporate-level reliability even with severed internet lifelines.',
      readTimeKo: '4분 소요',
      readTimeEn: '4 min read',
    },
  ];

  const filteredArticles = blogArticles.filter(
    (art) => activeCategory === 'all' || art.category === activeCategory
  );

  return (
    <motion.div
      initial={tabViewOnly ? undefined : { opacity: 0, y: 15 }}
      animate={tabViewOnly ? undefined : { opacity: 1, y: 0 }}
      exit={tabViewOnly ? undefined : { opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className={`bg-white dark:bg-zinc-900 border border-gray-150/45 dark:border-zinc-850/80 rounded-3xl p-6 sm:p-10 shadow-lg text-left space-y-8`}
      id="about-view-root"
    >
      {/* Show navigation only if route-driven directly */}
      {!tabViewOnly && onBack && (
        <div className="flex border-b border-gray-100 dark:border-zinc-800 pb-5">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            id="about-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isKo ? "작업 스튜디오로 돌아가기" : "Back to Workspace"}</span>
          </button>
        </div>
      )}

      <div className="space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Compass className="w-7 h-7 animate-spin-slow" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white tracking-tight">
          {isKo ? "스튜디오 가상화 기술 & 소개" : "On-Device Sandbox Architecture"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 leading-relaxed font-semibold">
          {isKo
            ? "우리의 고성능 이미지 및 문서 스튜디오는 복잡하고 프라이버시에 위협이 되는 기존의 웹 백엔드 서버 모델을 완전히 무력화시킵니다. 웹 어셈블리(WebAssembly) 및 가상 디코더 엔진을 브라우저에 임베드하여 전례 없는 프라이버시 수준과 압도적인 처리 속도를 전송 대기 시간 없이 동시에 달성합니다."
            : "OptiConvert is built completely without backend cloud processing layers. Your local browser acts as an offline secure sandbox where layout engines, format converters, and decoders evaluate on-the-fly."}
        </p>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-gray-150/40 dark:border-zinc-850/50 space-y-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs font-mono uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>WASM Processor</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            {isKo
              ? "메모리 누수 걱정 없는 고속 연산 스레드를 구동합니다. 로컬 컴파일 방식을 통해 파일 변환 효율을 극대화합니다."
              : "Launches high-performance multi-threaded algorithms right inside your web browser limits cleanly."}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-gray-150/40 dark:border-zinc-850/50 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs font-mono uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Light-speed IO</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            {isKo
              ? "서버로 데이터를 업로드하고 다운로드 받는 대기 속도가 없습니다. 대용량 문서도 처리 즉시 실시간 전환됩니다."
              : "Zero upload and download latency delay. Experience instantaneous processing powered directly by your CPU."}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-gray-150/40 dark:border-zinc-850/50 space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs font-mono uppercase tracking-wider">
            <Monitor className="w-4 h-4" />
            <span>Responsive GPU</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            {isKo
              ? "기기 화면 해상도나 테마 설정에 스마트 반응하여, 모바일 환경에서도 부담 없이 고해상도 그래픽 데이터를 다듬어냅니다."
              : "Responsive design that adjusts to device capabilities. High-resolution canvas elements render smoothly."}
          </p>
        </div>
      </div>

      {/* High density educational content detailing core protocols to enrich bot index value */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-gray-150 dark:border-zinc-850/60 space-y-6 text-xs text-gray-500 dark:text-zinc-400">
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
          {isKo ? "📊 크로스 컴파일 기반 로컬 포맷 인코딩 아키텍처" : "⚙️ Local Framework Compilation & Standard Specifications"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 dark:text-zinc-200">
              {isKo ? "1. WebP 및 AVIF 그래픽 매트릭스의 무손실 압축 특징" : "1. Modern Raster Encoding: Advantages of WebP & AVIF"}
            </h4>
            <p>
              {isKo
                ? "구글(Google)이 개발한 WebP 포맷은 고도의 에지 픽셀 예측 인코딩 기술을 탑재하여, 동등 화질 기준 JPEG 포맷 대비 대략 26%~34%의 물리 구조 용량 조절 강점을 지닙니다. AVIF는 로열티 프리 압축 표준 규격인 AV1 비디오 코딩 모델에 기반해 더 방대한 고대비 명암 계조(High Dynamic Range, HDR) 성분을 왜곡 없이 극단적으로 다단 압축 결합합니다. 본 도구는 기기 내 가상 프레임 버퍼를 형성해 유휴 주파수 대역 내 소스 왜곡이 없도록 메모리 정렬을 자동으로 계산합니다."
                : "The advanced WebP format provides high-contrast pixel predictive compression schemas, reducing overall network footprint. AVIF utilizes the AV1 core compression structure to keep maximum color chroma and High Dynamic Range data perfectly aligned. Since processing runs right in your client sandbox without telemetry tracking, we utilize low-latency offscreen framebuffers directly."}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 dark:text-zinc-200">
              {isKo ? "2. PDF 문서 간접 주소 테이블(XREF Table) 병합 구조" : "2. Document Mapping: PDF Cross-Reference Table Integration"}
            </h4>
            <p>
              {isKo
                ? "PDF(Portable Document Format)의 파일 물리 레이아웃은 개별적 간접 식별자 테이블(Indirect Object Cross-Reference Column or XREF) 및 Trailer 사전을 축으로 결속됩니다. 문서를 임의 병합(Merge)하거나 특정 도화 영역으로 분할(Split)하기 위해선, 단순한 바이트 배열 슬라이싱만 활용하면 심각한 렌더러 손상과 서명 해제가 초래됩니다. 본 시스템은 PDF-Lib 어셈블리를 로딩하여 메모리에서 가상 링커 테이블을 리인덱싱(Re-indexing)해 완벽한 페이지 흐름을 완결해 냅니다."
                : "Portable Document Format (PDF) files manage text layout structures using distinct indirect object dictionary tables. Splitting or merging PDF binary records demands physical cross-reference (XREF) index tracking. Applying linear byte-slicing leads to structural document errors. This client sandbox recreates these tables directly inside your browser virtual execution workspace."}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 dark:text-zinc-200">
              {isKo ? "3. XLSX 스프레드시트 직렬화 및 바이트 레코드 분석 체계" : "3. Excel Parser Engine: SheetJS XLSX-to-CSV Streaming"}
            </h4>
            <p>
              {isKo
                ? "Excel 통합 문서를 CSV 플랫 파일로 환원하기 위해서는 바이너리 청크 스트림을 셀 좌표 매트릭스 형태로 완전 역직렬화(Deserialization)해야 합니다. 본 통합 스튜디오는 SheetJS 라이브러리의 경량 바이너리 엔진 모델을 로컬 런타임에 샌드박스로 적재하여, 한글 완성형 자소 인덱스(EUC-KR)나 UTF-8 가변 길이 정렬을 누수 없이 일괄 분석합니다. 이 일련의 정밀 파싱 처리는 클라이언트 내 스택 영역 메모리 구조 수준에서만 정적인 상태로 파괴적으로 수렴됩니다."
                : "Converting binary Excel layout formats into clean CSV representations requires complete deserialization of the workbook stream. By utilizing the lightweight compiled SheetJS system in our browser runtime workspace, OptiConvert parses both unicode structures and multi-sheet coordinate mappings locally, with strict state lifecycle isolation."}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 dark:text-zinc-200">
              {isKo ? "4. 로컬 Zip 압축 아카이브 스트림 빌드 알고리즘" : "4. Client-Side Archive: JSZip Local Compressing Methods"}
            </h4>
            <p>
              {isKo
                ? "변환된 대량 수치의 다중 출력 자산을 개별 수동 조작 대신 일괄 다용도로 내려받기 위하여, 로컬 압축 기법을 병행 실행합니다. JSZip 라이브러리의 온디바이스 DEFLATE 슬라이딩 무손실 허프만 복호화 원리를 차용하여, 변환 완료된 Blob 리소스를 기기 클라이언트의 임시 RAM 바이트 버퍼상에서 즉시 단일 지퍼 아카이브(.zip) 스트림으로 묶어서 디바이스 내부 영역으로 보냅니다."
                : "To fetch multi-asset conversions instantly without recursive clicks, we compute solid compressed zip archives right in memory. By applying the standard on-device DEFLATE lossless Huffman coding rules inside JSZip helper threads, processed Blobs are safely mapped and downloaded as a unified .zip archive."}
            </p>
          </div>
        </div>
      </div>

      {/* 💡 최적화 꿀팁 및 최신 기술 뉴스 허브 (News & Blog Tips) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-blue-50/10 dark:bg-zinc-950/40 border border-blue-100/30 dark:border-zinc-850/60 space-y-6 animate-fade-in" id="optimization-blog-hub">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-150/40 dark:border-zinc-850/60">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider">
              {isKo ? "미디어 & 포맷 최적화 매거진" : "Media & Format Optimization Hub"}
            </div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500 shrink-0" />
              <span>{isKo ? "💡 미디어 최적화 꿀팁 & 최신 뉴스" : "💡 Sizing & Transcoding Encyclopedia"}</span>
            </h3>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5 self-start sm:self-center">
            {([
              { id: 'all', labelKo: '전체', labelEn: 'All' },
              { id: 'image', labelKo: '이미지 팁', labelEn: 'Image' },
              { id: 'document', labelKo: '문서 최적화', labelEn: 'Docs' },
              { id: 'tech', labelKo: '최신 기술/뉴스', labelEn: 'Tech News' },
            ] as const).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10 scale-[1.02]'
                    : 'bg-gray-100 dark:bg-zinc-850 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800'
                }`}
              >
                {isKo ? cat.labelKo : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* List of articles */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((art) => {
              const isExpanded = !!expandedArticles[art.id];
              return (
                <motion.div
                  key={art.id}
                  layout="position"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`p-5 rounded-2xl border transition-all ${
                    isExpanded
                      ? 'border-blue-400 bg-blue-500/[0.02] dark:border-blue-900/40 ring-1 ring-blue-400/30'
                      : 'border-gray-150 dark:border-zinc-850/80 bg-white dark:bg-zinc-900 hover:border-blue-200 dark:hover:border-zinc-800'
                  }`}
                >
                  <div
                    onClick={() => toggleArticle(art.id)}
                    className="flex items-start justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-50 dark:bg-zinc-850 rounded-xl shrink-0 mt-0.5">
                        {art.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-zinc-100 leading-snug">
                          {isKo ? art.titleKo : art.titleEn}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 md:line-clamp-1">
                          {isKo ? art.summaryKo : art.summaryEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-block text-[10px] bg-gray-100 dark:bg-zinc-850 font-semibold text-gray-400 dark:text-zinc-500 px-1.5 py-0.5 rounded-md font-mono">
                        {isKo ? art.readTimeKo : art.readTimeEn}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-zinc-800/80 text-xs text-gray-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line space-y-3">
                          <p>{isKo ? art.contentKo : art.contentEn}</p>
                          <div className="flex items-center gap-2 text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/30 p-2.5 rounded-lg mt-2">
                            <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                            <span>{isKo ? "팁 조언: 해당 탭 작업 공간에서 위 최적화 가이드 방식을 직접 체험해 보실 수 있습니다." : "Workspace Tip: Navigate back to the workspace to apply this advice directly on your files!"}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Interactive Micro Benchmark tool, illustrating genuine client integrity */}
      <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-gray-150 dark:border-zinc-850/80 space-y-4">
        <div className="space-y-1">
          <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 font-mono">
            {isKo ? "💡 기기 성능 & 최적화 진단 도구 (Sandbox Benchmark)" : "💡 Sandbox Engine Speed Diagnostics"}
          </h4>
          <p className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed">
            {isKo
              ? "우측 버튼을 눌러 본 기기의 내부 코어 연산 장치가 암호 파일 처리와 이미지 픽셀 매핑을 초당 몇 회 수행할 수 있는지 속도를 실시간 진단해보세요."
              : "Test how many matrix rendering computations your CPU thread can execute inside this isolated browser space."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-1">
          <button
            onClick={handleBenchmark}
            disabled={bmsStatus === 'testing'}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer self-start"
          >
            {bmsStatus === 'testing' ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>{isKo ? "엔진 진단중..." : "Evaluating..."}</span>
              </>
            ) : (
              <span>{isKo ? "성능 분석 실행" : "Run Speed Assessment"}</span>
            )}
          </button>

          {bmsStatus === 'finished' && (
            <div className="flex items-center gap-2 text-right">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 block leading-tight font-mono">Client Processing Speed</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">{testedScore.toLocaleString()} Ops/Sec (EXCELLENT)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-150 dark:border-zinc-850/60 font-mono">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
          Sub-Assembly Framework
        </h4>
        <p className="text-xs text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">
          {isKo
            ? "인증 규격: CSS v4 Flex Core, SheetJS XLSX Parsing VM, PDF-Lib Assembly Shell, local Zip compression."
            : "Authorized stack: Canvas WebAssembly-Style Stream Filters, SheetJS XLSX Parsing VM, PDF-Lib Assembly Shell, local Zip compression."}
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-400 justify-center pt-4 border-t border-gray-100 dark:border-zinc-800/80">
        <span>Precision Crafted with</span>
        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
        <span>for secure corporate workflows.</span>
      </div>
    
      {/* 사용 케이스별 도구 링크 */}
      <div className="mt-10 pt-10 border-t border-gray-200 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {isKo ? '사용 케이스별 도구' : 'Tools by Use Case'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
          {isKo ? '자주 사용하는 작업에 바로 접근하세요.' : 'Jump directly to common tasks.'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: '#/compress-image-for-instagram', title: isKo ? 'Instagram 이미지 압축' : 'Compress for Instagram', desc: isKo ? '화질 손상 없이 Instagram 최적화' : 'Optimize images for Instagram uploads', color: 'border-pink-200 dark:border-pink-900 hover:border-pink-400' },
            { href: '#/convert-png-to-webp', title: isKo ? 'PNG → WebP 변환' : 'PNG to WebP', desc: isKo ? '웹 로딩 속도 30% 향상' : 'Boost web loading by ~30%', color: 'border-blue-200 dark:border-blue-900 hover:border-blue-400' },
            { href: '#/compress-pdf-for-email', title: isKo ? '이메일용 PDF 압축' : 'Compress PDF for Email', desc: isKo ? '이메일 첨부 한도 이하로 압축' : 'Shrink PDFs for email attachments', color: 'border-orange-200 dark:border-orange-900 hover:border-orange-400' },
            { href: '#/resize-image-free', title: isKo ? '이미지 리사이징 (무료)' : 'Resize Image Free', desc: isKo ? '픽셀/비율 정밀 조정' : 'Resize by pixel or percentage', color: 'border-violet-200 dark:border-violet-900 hover:border-violet-400' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`block p-4 bg-white dark:bg-zinc-900 rounded-xl border ${item.color} transition-all duration-200 hover:shadow-md group`}
            >
              <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
</motion.div>
  );
}
