import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProcessableFile, ThemeMode, ActiveTab } from "./types";
import { TRANSLATIONS } from "./translations";
import { EXTRA_TRANSLATIONS } from "./translations_extra";
import ThemeToggle from "./components/ThemeToggle";
import LanguageSelector from "./components/LanguageSelector";
import FileDropzone from "./components/FileDropzone";
import ImageCompressorView from "./components/ImageCompressorView";
import DocumentConverterView from "./components/DocumentConverterView";
import PrivacyPolicyView from "./components/PrivacyPolicyView";
import ContactView from "./components/ContactView";
import AboutView from "./components/AboutView";
import LandingPage from "./components/LandingPage";
import HubPage from "./components/HubPage";
import {
  ShieldCheck,
  Info,
  FileText,
  Image,
  Globe,
  Heart,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const categoryTranslations: Record<
  string,
  { security: string; presets: string; resolutions: string }
> = {
  en: {
    security: "Security & Privacy",
    presets: "Smart Presets",
    resolutions: "Resolutions & Scaler",
  },
  ko: {
    security: "보안 및 개인정보 보호",
    presets: "스마트 프리셋",
    resolutions: "해상도 및 압축",
  },
  ja: {
    security: "セキュリティとプライバシー",
    presets: "スマートプリセット",
    resolutions: "解像度とスケーラー",
  },
  zh: {
    security: "安全与隐私",
    presets: "智能预设",
    resolutions: "分辨率与缩放",
  },
  es: {
    security: "Seguridad y Privacidad",
    presets: "Ajustes Inteligentes",
    resolutions: "Resoluciones y Escala",
  },
  fr: {
    security: "Sécurité & Confidentialité",
    presets: "Préréglages Intelligents",
    resolutions: "Résolutions & Redimensionnement",
  },
  de: {
    security: "Sicherheit & Datenschutz",
    presets: "Intelligente Presets",
    resolutions: "Auflösungen & Skalierung",
  },
  vi: {
    security: "Bảo mật & Riêng tư",
    presets: "Cấu hình Thông minh",
    resolutions: "Độ phân giải & Tỉ lệ",
  },
  hi: {
    security: "सुरक्षा और गोपनीयता",
    presets: "स्मार्ट प्रीसेट",
    resolutions: "रिजॉल्यूशन और स्केलर",
  },
  ar: {
    security: "الأمان والخصوصية",
    presets: "الإعدادات الذكية",
    resolutions: "الدقة ومقياس الأبعاد",
  },
  pt: {
    security: "Segurança & Privacidade",
    presets: "Ajustes Inteligentes",
    resolutions: "Resoluções & Escala",
  },
  it: {
    security: "Sicurezza & Privacy",
    presets: "Profili Rapidi",
    resolutions: "Risoluzioni e Proporzioni",
  },
  ru: {
    security: "Безопасность и конфиденциальность",
    presets: "Умные пресеты",
    resolutions: "Разрешение и масштабирование",
  },
};

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [language, setLanguage] = useState<string>(() => {
    try {
      const mainLang = (navigator.language || "").toLowerCase();
      const allLangs = (navigator.languages || []).map((l) => l.toLowerCase());
      const check = (code) =>
        mainLang.startsWith(code) || allLangs.some((l) => l.startsWith(code));
      if (check("ko")) return "ko";
      if (check("ru")) return "ru";
      return "en";
    } catch (e) {
      // Ignored
    }
    return "en";
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>("image");

  const [files, setFiles] = useState<ProcessableFile[]>([]);
  const [a11yAnnouncement, setA11yAnnouncement] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  // Sync active tab with URL path
  useEffect(() => {
    if (pathname === "/document") setActiveTab("document");
    else if (pathname === "/" || pathname === "/image") setActiveTab("image");
  }, [pathname]);

  // Settle theme selectors
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const handleGoHome = () => {
    navigate("/");
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const xt = EXTRA_TRANSLATIONS[language] || EXTRA_TRANSLATIONS.en;

  const triggerA11yAnnouncement = (message: string) => {
    setA11yAnnouncement(message);
    setTimeout(() => setA11yAnnouncement(""), 3000);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === "light" ? "dark" : "light";
      triggerA11yAnnouncement(
        nextTheme === "dark" ? t.a11yThemeChanged : t.a11yThemeChanged,
      );
      return nextTheme;
    });
  };

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    triggerA11yAnnouncement(
      TRANSLATIONS[code]?.a11yLanguageChanged || t.a11yLanguageChanged,
    );
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
      const isImage =
        currentFile.type.startsWith("image/") ||
        /\.(jpg|jpeg|png|webp|gif|bmp|tiff)$/i.test(currentFile.name);

      const id = Math.random().toString(36).substring(2, 9) + "-" + i;
      const isSizeExceeded = currentFile.size > MAX_FILE_SIZE;

      if (isSizeExceeded) {
        sizeLimitErrorTriggered = true;
      }

      const previewUrl =
        isImage && !isSizeExceeded
          ? URL.createObjectURL(currentFile)
          : undefined;

      newProcessableFiles.push({
        id,
        file: currentFile,
        name: currentFile.name,
        size: currentFile.size,
        type: currentFile.type,
        category: isImage ? "image" : "document",
        progress: 0,
        status: isSizeExceeded ? "failed" : "idle",
        error: isSizeExceeded
          ? language === "ko"
            ? "파일당 최대 50MB 용량 제한을 초과했습니다. 브라우저 RAM 메모리 보호 및 탭 꺼짐(Out of Memory) 현상 방지를 위해 대용량 파일은 자동 실시간 처리에서 제외됩니다."
            : "File size exceeds the 50MB limit. This file is excluded to protect browser RAM and prevent Out of Memory tab crashes."
          : undefined,
        previewUrl,
      });

      if (isImage) imageCount++;
      else docCount++;
    }

    setFiles((prev) => [...newProcessableFiles, ...prev]);

    if (sizeLimitErrorTriggered) {
      triggerA11yAnnouncement(
        language === "ko"
          ? "일부 파일이 50MB 크기 한도를 초과하여 실패 처리되었습니다."
          : "Some files exceeded the 50MB size limit and failed to import.",
      );
    } else {
      triggerA11yAnnouncement(
        `Loaded ${selectedFiles.length} files successfully.`,
      );
    }

    // Smart UI routing: Switch active tab based on predominant type
    if (imageCount > docCount) {
      if (activeTab !== "image") {
        setActiveTab("image");
      }
    } else if (docCount > 0) {
      setActiveTab("document");
    }
  };

  const handleUpdateFile = (id: string, updates: Partial<ProcessableFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    );
  };

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) {
        if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
        if (target.processedUrl) URL.revokeObjectURL(target.processedUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleClearAllFiles = () => {
    // Revoke object URLs to prevent memory leak
    files.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      if (f.processedUrl) URL.revokeObjectURL(f.processedUrl);
    });
    setFiles([]);
    triggerA11yAnnouncement("Cleared all active files.");
  };

  const imageCategorizedFiles = files.filter((f) => f.category === "image");
  const documentCategorizedFiles = files.filter(
    (f) => f.category === "document",
  );

  // Hub page at root
  if (pathname === "/") {
    return (
      <HubPage
        language={language}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        LanguageSelectorComponent={
          <LanguageSelector
            currentLanguageCode={language}
            onLanguageChange={handleLanguageChange}
            label={t.language || "Language"}
          />
        }
        ThemeToggleComponent={
          <ThemeToggle
            theme={theme}
            onToggle={handleToggleTheme}
            a11yLabel={t.themeToggle || "Toggle Theme"}
          />
        }
      />
    );
  }

  if (pathname.startsWith("/landing/")) {
    const slug = pathname.replace("/landing/", "");
    return (
      <LandingPage
        slug={slug}
        onStart={(tab) => {
          setActiveTab(tab as ActiveTab);
          navigate("/");
        }}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors duration-200 selection:bg-blue-600 selection:text-white"
      id="main-application-container"
    >
      {/* Invisible live announcements box for screen readers */}
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        id="a11y-announcements-region"
      >
        {a11yAnnouncement}
      </div>

      <header
        className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900 transition-colors"
        id="app-navbar-header"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0" id="brand-emblem">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient
                    id="header-g"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="24" fill="url(#header-g)" />
                <g opacity={0.3}>
                  <rect
                    x="25"
                    y="35"
                    width="50"
                    height="45"
                    rx="4"
                    fill="#fff"
                  />
                  <rect
                    x="30"
                    y="25"
                    width="40"
                    height="55"
                    rx="4"
                    fill="#fff"
                  />
                </g>
                <rect x="35" y="45" width="30" height="35" rx="6" fill="#fff" />
                <circle cx="50" cy="58" r="4" fill="#06b6d4" />
                <path d="M42 72l5-5 4 4 7-7 7 7H42z" fill="#4f46e5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <button onClick={() => navigate("/")} className="text-left">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  BigGrids
                </h1>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector
              currentLanguageCode={language}
              onLanguageChange={handleLanguageChange}
              label={t.language || "Language"}
            />
            <ThemeToggle
              theme={theme}
              onToggle={handleToggleTheme}
              a11yLabel={t.themeToggle || "Toggle Theme"}
            />
          </div>
        </div>
      </header>

      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        id="primary-main-workspace"
      >
        <AnimatePresence mode="wait">
          {pathname === "/privacy" ? (
            <div key="privacy-page-wrapper">
              <PrivacyPolicyView language={language} onBack={handleGoHome} />
            </div>
          ) : pathname === "/about" ? (
            <div key="about-page-wrapper">
              <AboutView language={language} onBack={handleGoHome} />
            </div>
          ) : pathname === "/contact" ? (
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
              {/* Dynamic dropzone on top */}
              {/* Service page header */}
              {(pathname === "/image" || pathname === "/document") && (
                <div className="w-full">
                  {pathname === "/image" ? (
                    <div className="flex items-center gap-3 mb-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-100 dark:border-indigo-900/50">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-950 shrink-0">
                        <Image className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white leading-tight">
                          {language === "ko"
                            ? "이미지 압축 & 변환"
                            : "Image Compress & Convert"}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                          {language === "ko"
                            ? "WebP·PNG·JPEG 무손실 압축 및 규격 변환"
                            : "WebP · PNG · JPEG lossless compression & resize"}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate("/")}
                        className="text-xs text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 transition-colors font-semibold shrink-0 whitespace-nowrap"
                      >
                        ← {language === "ko" ? "홈으로" : "Hub"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mb-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 border border-cyan-100 dark:border-cyan-900/50">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-md shadow-cyan-200 dark:shadow-cyan-950 shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white leading-tight">
                          {language === "ko" ? "PDF 스튜디오" : "PDF Studio"}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                          {language === "ko"
                            ? "PDF 병합·분할·서명 날인·이미지 변환"
                            : "PDF merge, split, signature stamps, image convert"}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate("/")}
                        className="text-xs text-cyan-500 hover:text-cyan-700 dark:text-cyan-400 flex items-center gap-1 transition-colors font-semibold shrink-0 whitespace-nowrap"
                      >
                        ← {language === "ko" ? "홈으로" : "Hub"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="w-full" id="workspace-dropzone-section">
                <FileDropzone
                  onFilesSelected={handleFilesSelected}
                  title={t.dropzoneTitle}
                  subtitle={t.dropzoneSubtitle}
                />
              </div>

              {/* Layout toggle tabs - hidden on dedicated pages */}
              <div
                className="flex flex-col space-y-6"
                id="workspace-tab-section"
              >
                <div 
                  className="items-center justify-between border-b border-gray-100 dark:border-zinc-900 pb-1"
                  style={{
                    display:
                      pathname === "/image" || pathname === "/document"
                        ? "none"
                        : "flex",
                  }}
                >
                  <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 dark:bg-zinc-900/60 p-1.5 rounded-2xl shadow-inner text-sm font-semibold max-w-full">
                    <button
                      onClick={() => {
                        setActiveTab("image");
                        navigate("/image");
                      }}
                      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-3.5 sm:py-2 min-h-[44px] rounded-xl transition-all cursor-pointer text-xs sm:text-sm ${
                        activeTab === "image"
                          ? "bg-white dark:bg-zinc-950 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200"
                      }`}
                      aria-selected={activeTab === "image"}
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
                      onClick={() => {
                        setActiveTab("document");
                        navigate("/document");
                      }}
                      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-3.5 sm:py-2 min-h-[44px] rounded-xl transition-all cursor-pointer text-xs sm:text-sm ${
                        activeTab === "document"
                          ? "bg-white dark:bg-zinc-950 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200"
                      }`}
                      aria-selected={activeTab === "document"}
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
                      onClick={() => setActiveTab("about")}
                      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-3.5 sm:py-2 min-h-[44px] rounded-xl transition-all cursor-pointer text-xs sm:text-sm ${
                        activeTab === "about"
                          ? "bg-white dark:bg-zinc-950 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200"
                      }`}
                      aria-selected={activeTab === "about"}
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
                    {activeTab === "image" && (
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
                          onLoadSampleFile={(sampleFile: File) =>
                            handleFilesSelected([sampleFile])
                          }
                          language={language}
                        />
                      </motion.div>
                    )}

                    {activeTab === "document" && (
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
                          onLoadSampleFile={(sampleDoc: File) =>
                            handleFilesSelected([sampleDoc])
                          }
                          onDeleteFile={handleDeleteFile}
                          language={language}
                        />
                      </motion.div>
                    )}

                    {activeTab === "about" && (
                      <AboutView language={language} tabViewOnly={true} />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* SEO & FAQ Block with modern bento-styled cards */}
              <section
                className="mt-16 pt-8 border-t border-gray-100 dark:border-zinc-900"
                id="app-seo-faq-section"
              >
                <div className="text-center space-y-2 mb-10">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight">
                    {xt.faqTitle}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-xl mx-auto font-medium">
                    {xt.faqSubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-zinc-900 border border-gray-150/45 dark:border-zinc-850 p-6 rounded-2xl shadow-3xs space-y-2 text-left">
                    <span className="text-[10px] uppercase font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                      {
                        (
                          categoryTranslations[language] ||
                          categoryTranslations.en
                        ).security
                      }
                    </span>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200">
                      {xt.faqQ1}
                    </h4>
                    <p className="text-xs text-gray-400 dark:text-zinc-400 leading-relaxed font-semibold">
                      {xt.faqA1}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 border border-gray-150/45 dark:border-zinc-850 p-6 rounded-2xl shadow-3xs space-y-2 text-left">
                    <span className="text-[10px] uppercase font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                      {
                        (
                          categoryTranslations[language] ||
                          categoryTranslations.en
                        ).presets
                      }
                    </span>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200">
                      {xt.faqQ2}
                    </h4>
                    <p className="text-xs text-gray-400 dark:text-zinc-400 leading-relaxed font-semibold">
                      {xt.faqA2}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 border border-gray-150/45 dark:border-zinc-850 p-6 rounded-2xl shadow-3xs space-y-2 text-left md:col-span-2">
                    <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                      {
                        (
                          categoryTranslations[language] ||
                          categoryTranslations.en
                        ).resolutions
                      }
                    </span>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200">
                      {xt.faqQ3}
                    </h4>
                    <p className="text-xs text-gray-400 dark:text-zinc-400 leading-relaxed font-semibold">
                      {xt.faqA3}
                    </p>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer
        className="py-12 border-t border-gray-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 text-xs text-gray-400 dark:text-zinc-500 transition-colors"
        id="app-footer"
      >
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          {/* Linked subpages router triggers */}
          <div className="flex items-center justify-center gap-6 pb-2 pt-1 font-extrabold text-xs text-gray-500 dark:text-zinc-400 select-none">
            <a
              href="/privacy"
              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-all ring-offset-white dark:ring-offset-zinc-950 focus:outline-none focus:underline"
              id="footer-link-privacy"
            >
              {xt.footerPrivacy}
            </a>
            <span className="text-gray-300 dark:text-zinc-800">•</span>
            <a
              href="/about"
              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-all ring-offset-white dark:ring-offset-zinc-950 focus:outline-none focus:underline"
              id="footer-link-about"
            >
              {xt.footerAbout}
            </a>
            <span className="text-gray-300 dark:text-zinc-800">•</span>
            <a
              href="/contact"
              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-all ring-offset-white dark:ring-offset-zinc-950 focus:outline-none focus:underline"
              id="footer-link-contact"
            >
              {xt.footerContact}
            </a>
          </div>

          <p>
            © 2026 Image & Document Studio. All file processing operates
            completely inside local sandboxed containers. No telemetry tracks
            your assets.
          </p>
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
