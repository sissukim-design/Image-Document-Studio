import React from 'react';
import { ShieldCheck, ArrowLeft, Heart, Lock, EyeOff, ServerCrash, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface PrivacyPolicyProps {
  language: string;
  onBack: () => void;
}

export default function PrivacyPolicyView({ language, onBack }: PrivacyPolicyProps) {
  const isKo = language === 'ko';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-gray-150/45 dark:border-zinc-850/80 rounded-3xl p-6 sm:p-10 shadow-lg text-left space-y-8"
      id="privacy-policy-viewport"
    >
      {/* Header section with back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer self-start"
          id="privacy-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isKo ? "작업 스튜디오로 돌아가기" : "Back to Workspace"}</span>
        </button>
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isKo ? "규정 100% 준수 활성화됨" : "100% COMPLIANT SHIELD"}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
          {isKo ? "개인정보처리방침 (Privacy Policy)" : "Privacy Policy"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 leading-relaxed font-medium">
          {isKo
            ? "본 스튜디오는 사용자의 개인 파일 보호와 프라이버시 존중을 최우선 가치로 삼고 있습니다. 최신 웹 기술을 적용하여 모든 변환 과정을 오직 당신의 로컬 컴퓨터 브라우저 내부에서만 완결하도록 통제합니다."
            : "We prioritize your data sovereignty. Built with absolute client-isolation paradigms, your photos, PDFs, and accounting spreadsheets never leave your device."}
        </p>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-gray-150/40 dark:border-zinc-850/60 space-y-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
            <Lock className="w-4 h-4" />
            <span>{isKo ? "100% 클라이언트 사이드 구동" : "Local Execution Block"}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            {isKo
              ? "동작에 필요한 모든 스크립트와 WebAssembly 모듈은 최초 로딩 시 디바이스 브라우저 메모리에 가상 로드됩니다. 이미지를 압축하거나 PDF를 잘라내고 붙일 때 클라우드로 업로드되지 않습니다."
              : "All processes (e.g. Canvas rendering, PDF stream merges) run on-memory inside isolated WebAssembly / Javascript layers. There is no cloud telemetry handling your records."}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-gray-150/40 dark:border-zinc-850/60 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <EyeOff className="w-4 h-4" />
            <span>{isKo ? "민감한 문서 유출 걱정 없음" : "Zero Assets Collection"}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            {isKo
              ? "계약서 정보나 고해상도 인물 사진을 다룰 때 서버 데이터베이스에 캐싱되지 않아 네트워크 침입이나 제3자에 의한 감시, 백엔드 관리자의 무단 열람으로부터 완벽하게 보장받습니다."
              : "Ideal for regulatory audits. Because our architecture lacks a database engine, raw images and sensitive spreadsheets cannot leak from our system, effectively protecting you from backend exploits."}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-gray-150/40 dark:border-zinc-850/60 space-y-2 col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <ServerCrash className="w-4 h-4" />
            <span>{isKo ? "유럽 GDPR / 캘리포니아 CCPA 기준의 원천 부합" : "GDPR & CCPA Compliant by Default"}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            {isKo
              ? "동의 수집, 열람 요청, 파기 유보 절차가 전혀 필요치 않습니다. 본 툴은 어떠한 사용자 식별 ID 생성, 외부 쿠키 추적, 트래킹 로그 등도 생산하지 않으며 사용이 끝난 파일은 브라우저 탭이 꺼짐과 즉시 영구 해제됩니다."
              : "No telemetry tools are integrated. We do not store cookie identifiers, device strings, or click patterns. When your active browser tab is closed, state parameters are garbage-collected and wiped forever."}
          </p>
        </div>
      </div>

      {/* Structured Legal clauses */}
      <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
        <div className="space-y-2">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-zinc-200 uppercase tracking-wider font-mono">
            {isKo ? "제 1조: 파일 데이터 전송 제한" : "Section 1: Data Boundaries"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            {isKo
              ? "저희 어플리케이션은 사용자 기기의 CPU 및 RAM 연산만을 소모합니다. 파일의 전송은 완전히 금지되어 있으며 브라우저 보안 오더북에 따라 Sandbox 격리된 영역에서만 동작합니다."
              : "Files imported into the compressor dropzone are encapsulated. They only exit the browser wrapper when you trigger an offline download action in order to save the product back to your device."}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-zinc-200 uppercase tracking-wider font-mono">
            {isKo ? "제 2조: 제3자 제공 사항 및 쿠키" : "Section 2: Cookies & Analytics"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            {isKo
              ? "제3자 결제대행이나 소셜 트래킹, 방문자 트래킹 스크립트 등과 전혀 일절 무관합니다. 네트워크 지연(Latency)이 없는 순수 연산 VM 위상으로만 공급됩니다."
              : "We don't sell data. We have zero connection to marketing brokers or programmatic advertising rails. No cookies are set in order to maximize light-speed execution efficiency."}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-zinc-200 uppercase tracking-wider font-mono">
            {isKo ? "제 3조: 문의 연락 및 분쟁 책임" : "Section 3: Disclaimers & Support"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            {isKo
              ? "본 소프트웨어 환경은 브라우저 규격을 완전히 충족하도록 테스트되었습니다. 모든 소스코드 처리는 상업적 및 개인적 용도로 자유롭게 변형하여 안전하게 사용하실 수 있습니다."
              : "The rendering environment is built with robust error handling. However, because compiling occurs in client memory, processing excessively massive files may trigger standard browser heap bottlenecks."}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-400 dark:text-zinc-500">
        <span>{isKo ? "최종 개정일자: 2026년 6월 7일" : "Effective Date: June 7, 2026"}</span>
        <div className="flex items-center gap-1">
          <span>Shield configured by</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>Local Engine.</span>
        </div>
      </div>
    </motion.div>
  );
}
