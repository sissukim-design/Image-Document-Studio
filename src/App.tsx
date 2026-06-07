/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ProcessableFile, ThemeMode, ActiveTab } from './types';
import { TRANSLATIONS } from './translations';
import ThemeToggle from './components/ThemeToggle';
import LanguageSelector from './components/LanguageSelector';
import FileDropzone from './components/FileDropzone';
import ImageCompressorView from './components/ImageCompressorView';
import DocumentConverterView from './components/DocumentConverterView';
import PrivacyPolicyView from './components/PrivacyPolicyView';
import ContactView from './components/ContactView';
import AboutView from './components/AboutView';
import { ShieldCheck, Info, FileText, Image, Globe, Heart, RefreshCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [language, setLanguage] = useState<string>(() => {
    try {
      const mainLang = (navigator.language || '').toLowerCase();
      const allLangs = (navigator.languages || []).map(l => l.toLowerCase());
      if (mainLang.includes('ko') || allLangs.some(l => l.includes('ko'))) {
        return 'ko';
      }
    } catch (e) {
      // Ignored
    }
    return 'en'; // Safe default for all international visitors and bots
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('image');
  const [files, setFiles] = useState<ProcessableFile[]>([]);
  const [a11yAnnouncement, setA11yAnnouncement] = useState<string>('');
  const [currentHash, setCurrentHash] = useState<string>(window.location.hash);

  // Settle theme selectors
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Synchronize dynamic routing via URL hashes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
      window.scrollTo({ top: 0, behavior: 'instant' as any });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleGoHome = () => {
    window.location.hash = '';
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const triggerA11yAnnouncement = (message: string) => {
    setA11yAnnouncement(message);
    setTimeout(() => setA11yAnnouncement(''), 3000);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      triggerA11yAnnouncement(nextTheme === 'dark' ? t.a11yThemeChanged : t.a11yThemeChanged);
      return nextTheme;
    });
  };

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    triggerA11yAnnouncement(TRANSLATIONS[code]?.a11yLanguageChanged || t.a11yLanguageChanged);
  };

  // Process dropped or loaded files
  const handleFilesSelected = (selectedFiles: FileList | File[]) => {
    const newProcessableFiles: ProcessableFile[] = [];
    let imageCount = 0;
    let docCount = 0;
    let sizeLimitErrorTriggered = false;

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB Limit

    for (let i = 0; i < selectedFiles.length; i++) {
      const currentFile = selectedFiles[i];
      const isImage = currentFile.type.startsWith('image/') || 
                      /\.(jpg|jpeg|png|webp|gif|bmp|tiff)$/i.test(currentFile.name);

      const id = Math.random().toString(36).substring(2, 9) + '-' + i;
      const isSizeExceeded = currentFile.size > MAX_FILE_SIZE;

      if (isSizeExceeded) {
        sizeLimitErrorTriggered = true;
      }

      const previewUrl = (isImage && !isSizeExceeded) ? URL.createObjectURL(currentFile) : undefined;

      newProcessableFiles.push({
        id,
        file: currentFile,
        name: currentFile.name,
        size: currentFile.size,
        type: currentFile.type,
        category: isImage ? 'image' : 'document',
        progress: 0,
        status: isSizeExceeded ? 'failed' : 'idle',
        error: isSizeExceeded 
          ? (language === 'ko' 
              ? '파일당 최대 50MB 용량 제한을 초과했습니다. 브라우저 RAM 메모리 보호 및 탭 꺼짐(Out of Memory) 현상 방지를 위해 대용량 파일은 자동 실시간 처리에서 제외됩니다.' 
              : 'File size exceeds the 50MB limit. This file is excluded to protect browser RAM and prevent Out of Memory tab crashes.')
          : undefined,
        previewUrl
      });

      if (isImage) imageCount++;
      else docCount++;
    }

    setFiles((prev) => [...newProcessableFiles, ...prev]);
    
    if (sizeLimitErrorTriggered) {
      triggerA11yAnnouncement(
        language === 'ko'
          ? "일부 파일이 50MB 크기 한도를 초과하여 실패 처리되었습니다."
          : "Some files exceeded the 50MB size limit and failed to import."
      );
    } else {
      triggerA11yAnnouncement(`Loaded ${selectedFiles.length} files successfully.`);
    }

    // Smart UI routing: Switch active tab based on predominant type
    if (imageCount > docCount) {
      if (activeTab !== 'image') {
        setActiveTab('image');
      }
    } else if (docCount > 0) {
      setActiveTab('document');
    }
  };

  const handleUpdateFile = (id: string, updates: Partial<ProcessableFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleClearAllFiles = () => {
    // Revoke object URLs to prevent memory leak
    files.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      if (f.processedUrl) URL.revokeObjectURL(f.processedUrl);
    });
    setFiles([]);
    triggerA11yAnnouncement('Cleared all active files.');
  };

  const imageCategorizedFiles = files.filter((f) => f.category === 'image');
  const documentCategorizedFiles = files.filter((f) => f.category === 'document');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors duration-200 selection:bg-blue-600 selection:text-white" id="main-application-container">
      
      {/* Invisible live announcements box for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" id="a11y-announcements-region">
        {a11yAnnouncement}
      </div>

      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900 transition-colors" id="app-navbar-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0" id="brand-emblem">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="header-g" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5"/>
                    <stop offset="100%" stopColor="#06b6d4"/>
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="24" fill="url(#header-g)"/>
                <g opacity={0.3}>
                  <rect x="25" y="35" width="50" height="45" rx="4" fill="#fff" />
                  <rect x="30" y="25" width="40" height="55" rx="4" fill="#fff" />
                </g>
                <rect x="35" y="45" width="30" height="35" rx="6" fill="#fff" />
                <circle cx="50" cy="58" r="4" fill="#06b6d4"/>
                <path d="M42 72l5-5 4 4 7-7 7 7H42z" fill="#4f46e5"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-gray-800 dark:text-white">
                {t.title}
              </h1>
              <span className="text-[10px] sm:text-xs font-mono font-medium text-gray-400 dark:text-zinc-500">
                CLIENT-EXCLUSIVE v1.0.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector
              currentLanguageCode={language}
              onLanguageChange={handleLanguageChange}
              label={t.language || 'Language'}
            />
            <ThemeToggle
              theme={theme}
              onToggle={handleToggleTheme}
              a11yLabel={t.themeToggle || 'Toggle Theme'}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="primary-main-workspace">
        <AnimatePresence mode="wait">
          {currentHash === '#/privacy' ? (
            <div key="privacy-page-wrapper">
              <PrivacyPolicyView language={language} onBack={handleGoHome} />
            </div>
          ) : currentHash === '#/about' ? (
            <div key="about-page-wrapper">
              <AboutView language={language} onBack={handleGoHome} />
            </div>
          ) : currentHash === '#/contact' ? (
            <div key="contact-page-wrapper">
              <ContactView language={language} onBack={handleGoHome} />
            </div>
          ) : (
            <motion.div
              key="workspace-dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Banner with subheadline and Privacy verification */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-150/40 dark:border-zinc-900 shadow-xs" id="privacy-intro-banner">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400 leading-relaxed md:max-w-xl">
                    {t.subtitle}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 pt-1">
                    <ShieldCheck className="w-4 h-4 shrink-0ID" />
                    <span>{t.privacyNotice}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 shrink-0 select-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-mono font-semibold text-gray-500 dark:text-zinc-400">LOCALHOST-VM SECURED</span>
                </div>
              </div>

              {/* Dynamic dropzone on top */}
              <div className="w-full" id="workspace-dropzone-section">
                <FileDropzone
                  onFilesSelected={handleFilesSelected}
                  title={t.dropzoneTitle}
                  subtitle={t.dropzoneSubtitle}
                />
              </div>

              {/* Layout toggle tabs */}
              <div className="flex flex-col space-y-6" id="workspace-tab-section">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-900 pb-1">
                               <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 dark:bg-zinc-900/60 p-1.5 rounded-2xl shadow-inner text-sm font-semibold max-w-full">
                    <button
                      onClick={() => setActiveTab('image')}
                      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-3.5 sm:py-2 min-h-[44px] rounded-xl transition-all cursor-pointer text-xs sm:text-sm ${
                        activeTab === 'image'
                          ? 'bg-white dark:bg-zinc-950 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
                      }`}
                      aria-selected={activeTab === 'image'}
                      role="tab"
                    >
                      <Image className="w-4 h-4 shrink-0" />
                      <span>{t.tabImage}</span>
                      {imageCategorizedFiles.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 font-mono font-bold">
                          {imageCategorizedFiles.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab('document')}
                      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-3.5 sm:py-2 min-h-[44px] rounded-xl transition-all cursor-pointer text-xs sm:text-sm ${
                        activeTab === 'document'
                          ? 'bg-white dark:bg-zinc-950 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
                      }`}
                      aria-selected={activeTab === 'document'}
                      role="tab"
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>{t.tabDocument}</span>
                      {documentCategorizedFiles.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 font-mono font-bold">
                          {documentCategorizedFiles.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab('about')}
                      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-3.5 sm:py-2 min-h-[44px] rounded-xl transition-all cursor-pointer text-xs sm:text-sm ${
                        activeTab === 'about'
                          ? 'bg-white dark:bg-zinc-950 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
                      }`}
                      aria-selected={activeTab === 'about'}
                      role="tab"
                    >
                      <Info className="w-4 h-4 shrink-0" />
                      <span>{t.tabAbout}</span>
                    </button>
                  </div>
                  
                  {files.length > 0 && (
                    <button
                      onClick={handleClearAllFiles}
                      className="text-xs font-semibold text-red-500 hover:underline cursor-pointer px-2 py-1"
                      id="clear-all-application-files-button"
                    >
                      {t.clearAll}
                    </button>
                  )}
                </div>

                <div className="w-full" id="tab-panels-workspace">
                  <AnimatePresence mode="wait">
                    {activeTab === 'image' && (
                      <motion.div
                        key="image-tab"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ImageCompressorView
                          files={imageCategorizedFiles}
                          onUpdateFile={handleUpdateFile}
                          onClear={handleClearAllFiles}
                          t={t}
                          onLoadSampleFile={(sampleFile: File) => handleFilesSelected([sampleFile])}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'document' && (
                      <motion.div
                        key="document-tab"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.2 }}
                      >
                        <DocumentConverterView
                          files={files}
                          onUpdateFile={handleUpdateFile}
                          onClear={handleClearAllFiles}
                          t={t}
                          onLoadSampleFile={(sampleDoc: File) => handleFilesSelected([sampleDoc])}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'about' && (
                      <AboutView language={language} tabViewOnly={true} />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* SEO & FAQ Block with modern bento-styled cards */}
              <section className="mt-16 pt-8 border-t border-gray-100 dark:border-zinc-900" id="app-seo-faq-section">
                <div className="text-center space-y-2 mb-10">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight">
                    {language === 'ko' ? "자주 묻는 질문 & 가이드" : "Frequently Asked Questions"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-xl mx-auto font-medium">
                    {language === 'ko' 
                      ? "스티커즈 이미지 및 문서 스튜디오를 100% 활용하는 팁을 안내해 드립니다."
                      : "Learn how to get the most out of our client-side conversion studio."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-zinc-900 border border-gray-150/45 dark:border-zinc-850 p-6 rounded-2xl shadow-3xs space-y-2 text-left">
                    <span className="text-[10px] uppercase font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">Security & Privacy</span>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200">
                      {language === 'ko' ? "Q. 제 파일이 외부 서버로 업로드되나요?" : "Q. Are my files uploaded to any server?"}
                    </h4>
                    <p className="text-xs text-gray-400 dark:text-zinc-400 leading-relaxed font-semibold">
                      {language === 'ko'
                        ? "아닙니다! 본 도구는 100% 클라이언트 브라우저 기반으로 동작합니다. WebAssembly 기술을 사용하여 기기 내부 연산만 수행하므로 파일 유출이나 대역폭 걱정 없이 안심하고 대용량 이미지를 변환하실 수 있습니다. [추가 정보] 본 스튜디오는 최신 WebAssembly(Wasm) 마이크로커널 규격을 가동하여 기존 서버 전송 방식의 전통적인 변환기 대비 최대 3배 이상 단축된 고속 변환 속도를 자랑하며, 기기 내부 브라우저 가상 샌드박스 장벽을 적극 응용함으로써 사용자의 소중한 데이터 자산과 대용량 문서를 완벽한 오프라인 보안 기류 하에 안전하게 격리 처리합니다."
                        : "Absolutely not. All operations are processed on-device inside your sandboxed browser environment using WebAssembly. Your photos and sensitive records never touch any external API, making the system incredibly safe. [Additional Info] Since all operations proceed within pure memory-compile parameters, latency is capped by your local CPU potential rather than network bandwidth constraints. You can audit and verify this zero-ingress policy by opening your browser's Developer Tools (F12) Network panel and reviewing the activity log while processing archives."}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 border border-gray-150/45 dark:border-zinc-850 p-6 rounded-2xl shadow-3xs space-y-2 text-left">
                    <span className="text-[10px] uppercase font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">Smart Presets</span>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200">
                      {language === 'ko' ? "Q. '스마트 최적화 프리셋'이란 무엇인가요?" : "Q. What are Smart Presets?"}
                    </h4>
                    <p className="text-xs text-gray-400 dark:text-zinc-400 leading-relaxed font-semibold">
                      {language === 'ko'
                        ? "복잡한 슬라이더 수치 조정을 할 필요 없이, 초경량 다이어트(최저 용량), 추천 표준 최적화(최고 가성비), 무손실 최고화질(디자인 원본 보존) 중 터치 한 번으로 목적에 따른 연산 품질과 포맷을 자동 지정하는 도구입니다. [팁(Tip)] 각 버튼의 프리셋 아키텍처는 보편적인 크로마 서브샘플링(Chroma Subsampling, YUV 4:2:0) 인디케이터 비율과 메타데이터 소모 임계값을 지배적으로 선행 계산하여 조율되었습니다. 모바일 트래픽 낭비를 현격히 줄여 로딩 시간을 단축하려면 초경량 압축 프리셋을, 섬세한 텍스트 디자인 인쇄 원본을 영구 보존하려면 무손실 최고화질 사양을 선택하는 것이 정교한 방법입니다."
                        : "Smart presets are pre-configured rendering boundaries that adjust format settings, pixel counts, and target ratios instantly. You can choose Tiny Size, Recommended Balance, or lossless Maximum Quality with a single click. [Tip] Our recommended balance uses strict visual modeling limits, reducing initial sizes by up to 80% while preserving color fidelity. Choose the Tiny Size preset for lightweight web asset deployment to optimize mobile loading timings and directly boost SEO PageSpeed score metrics."}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 border border-gray-150/45 dark:border-zinc-850 p-6 rounded-2xl shadow-3xs space-y-2 text-left md:col-span-2">
                    <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">Resolutions & Scaler</span>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200">
                      {language === 'ko' ? "Q. 이미지 해상도를 강제로 줄일 수도 있나요?" : "Q. Can I scale dimensional resolutions?"}
                    </h4>
                    <p className="text-xs text-gray-400 dark:text-zinc-400 leading-relaxed font-semibold">
                      {language === 'ko'
                        ? "네, 가능합니다! 고급 설정 슬라이드 패널을 펼쳐 '해상도 픽셀 축소' 섹션을 선택하시면, 고정 해상도 너비(Width), 높이(Height), 또는 백분율 비율(Scale %)을 자유롭게 입력하여 인쇄 또는 고화질 로딩 목적에 알맞은 파일로 커스터마이징할 수 있습니다. [추가 정보] 리사이징 처리 시 브라우저 내부 하드웨어 고속 가속엔진의 바이큐빅 볏선형 결합 보간 필터링(Anti-Aliasing Interpolation Kernel)이 즉시 발동하여 축소 시 우려되는 계단 현상이나 윤곽선 흐려짐을 최소한으로 자동 감소시켜 줍니다. 특히 종횡비 고정 잠금(Aspect Ratio Lock) 장치가 항상 유지되므로 출력 캔버스가 찌그러지거나 기형적으로 왜곡되는 것을 미연에 안전하게 밀착 설계 방지합니다."
                        : "Yes, easily define custom layouts within the Progressive Advanced control drawer. Scale coordinates proportionally via fixed width boundary limits, height restrictions, or an dynamic scale-down percentage slider. [Additional Note] Scaling algorithms invoke modern anti-aliasing interpolation filters to ensure clear edges and tiny typography readability. Downscaling preserves original photo orientation structures automatically on-the-fly, confirming that your layout stays aligned and retains proper display ratios with robust pixel density."}
                    </p>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-gray-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 text-xs text-gray-400 dark:text-zinc-500 transition-colors" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          
          {/* Linked subpages router triggers */}
          <div className="flex items-center justify-center gap-6 pb-2 pt-1 font-extrabold text-xs text-gray-500 dark:text-zinc-400 select-none">
            <a href="#/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-all ring-offset-white dark:ring-offset-zinc-950 focus:outline-none focus:underline" id="footer-link-privacy">
              {language === 'ko' ? "개인정보처리방침" : "Privacy Policy"}
            </a>
            <span className="text-gray-300 dark:text-zinc-800">•</span>
            <a href="#/about" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-all ring-offset-white dark:ring-offset-zinc-950 focus:outline-none focus:underline" id="footer-link-about">
              {language === 'ko' ? "서비스 소개" : "About"}
            </a>
            <span className="text-gray-300 dark:text-zinc-800">•</span>
            <a href="#/contact" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-all ring-offset-white dark:ring-offset-zinc-950 focus:outline-none focus:underline" id="footer-link-contact">
              {language === 'ko' ? "문의하기" : "Contact"}
            </a>
          </div>

          <p>© 2026 Image & Document Studio. All file processing operates completely inside local sandboxed containers. No telemetry tracks your assets.</p>
          <div className="flex items-center justify-center gap-4 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
              <span>Full Local Sandbox Shield Enabled</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <Globe className="w-4.5 h-4.5 text-blue-500" />
              <span>All Google-supported Multilingual Locales</span>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
