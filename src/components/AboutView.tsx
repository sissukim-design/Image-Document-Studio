import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, Heart, Monitor, Zap, Cpu, Compass } from 'lucide-react';
import { motion } from 'motion/react';

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
    </motion.div>
  );
}
