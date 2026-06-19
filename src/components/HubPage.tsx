import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Image, FileText, Zap, Shield, Globe, ArrowRight, Sparkles, Layers } from 'lucide-react';

interface HubPageProps {
  language: string;
  theme: string;
  onToggleTheme: () => void;
  LanguageSelectorComponent: React.ReactNode;
  ThemeToggleComponent: React.ReactNode;
}

export default function HubPage({ language, LanguageSelectorComponent, ThemeToggleComponent }: HubPageProps) {
  const navigate = useNavigate();

  const isKo = language === 'ko';

  const imageFeatures = isKo
    ? ['WebP · PNG · JPEG 자동 변환', '무손실 압축 슬라이더', '인스타·블로그 썸네일 규격', '일괄 최대 20파일 처리']
    : ['WebP · PNG · JPEG conversion', 'Lossless compression slider', 'Instagram & blog thumbnail presets', 'Batch up to 20 files'];

  const docFeatures = isKo
    ? ['PDF 병합·분할·페이지 추출', '이미지 → PDF 변환', '엑셀 → CSV 변환', 'PPTX · XLSX · TXT 지원']
    : ['PDF merge, split & extract', 'Image → PDF conversion', 'Excel → CSV conversion', 'PPTX · XLSX · TXT support'];

  const badge = isKo ? '100% 브라우저 처리 · 파일 미전송' : '100% In-Browser · Zero Upload';
  const heroTitle = isKo ? '파일 작업, 이제 하나씩' : 'One tool for every file';
  const heroSub = isKo
    ? '이미지 압축부터 문서 변환까지. 서버에 파일을 보내지 않고 브라우저에서 바로 처리합니다.'
    : 'From image compression to document conversion. Everything runs locally in your browser.';
  const imageCardTitle = isKo ? '이미지 압축 & 변환' : 'Image Compress & Convert';
  const imageCardSub = isKo ? 'WebP 변환, 무손실 압축, 썸네일 자동 규격' : 'WebP conversion, lossless compress, thumbnail presets';
  const docCardTitle = isKo ? '문서 변환 스튜디오' : 'Document Convert Studio';
  const docCardSub = isKo ? 'PDF 병합·분할, 이미지→PDF, 엑셀 변환' : 'PDF merge/split, image to PDF, Excel convert';
  const ctaLabel = isKo ? '바로 시작하기' : 'Start Now';
  const featureTitle = isKo ? '왜 BigGrids인가?' : 'Why BigGrids?';

  const pillars = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: isKo ? '완전 보안' : 'Full Privacy',
      desc: isKo ? '파일이 서버로 전송되지 않아 완전히 안전합니다.' : 'Files never leave your device.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: isKo ? '초고속 처리' : 'Lightning Fast',
      desc: isKo ? 'WebAssembly 기반 로컬 연산으로 대기 없이 즉시 변환.' : 'WebAssembly-powered local processing.',
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: isKo ? '13개 언어 지원' : '13 Languages',
      desc: isKo ? '한국어·영어·일본어 포함 13개 언어를 지원합니다.' : 'Korean, English, Japanese and more.',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      icon: <Layers className="w-5 h-5" />,
      title: isKo ? '20파일 일괄 처리' : 'Batch 20 Files',
      desc: isKo ? '최대 20개 파일을 한 번에 변환·압축합니다.' : 'Convert up to 20 files at once.',
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
                <defs><linearGradient id="hub-g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4f46e5"/><stop offset="100%" stopColor="#06b6d4"/></linearGradient></defs>
                <rect width="100" height="100" rx="24" fill="url(#hub-g)"/>
                <g opacity={0.3}><rect x="25" y="35" width="50" height="45" rx="4" fill="#fff"/><rect x="30" y="25" width="40" height="55" rx="4" fill="#fff"/></g>
                <rect x="35" y="45" width="30" height="35" rx="6" fill="#fff"/>
                <circle cx="50" cy="58" r="4" fill="#06b6d4"/>
                <path d="M42 72l5-5 4 4 7-7 7 7H42z" fill="#4f46e5"/>
              </svg>
            </div>
            <span className="text-base font-extrabold tracking-tight text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">BigGrids</span>
          </button>
          <div className="flex items-center gap-2">
            {LanguageSelectorComponent}
            {ThemeToggleComponent}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4 sm:px-6">
        {/* Background gradient blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100 dark:bg-indigo-950/30 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -top-12 -right-24 w-80 h-80 bg-cyan-100 dark:bg-cyan-950/30 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-6 border border-indigo-100 dark:border-indigo-900">
              <Sparkles className="w-3.5 h-3.5" />
              {badge}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-5 leading-tight"
          >
            {heroTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-gray-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed"
          >
            {heroSub}
          </motion.p>
        </div>
      </section>

      {/* Service Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => navigate('/image')}
            className="group relative cursor-pointer rounded-3xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Card gradient top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-950">
                  <Image className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                  WebP · PNG · JPEG
                </span>
              </div>

              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{imageCardTitle}</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6 leading-relaxed">{imageCardSub}</p>

              <ul className="space-y-2.5 mb-8">
                {imageFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-zinc-300">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 group-hover:gap-3 transition-all">
                {ctaLabel}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </motion.div>

          {/* Document Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => navigate('/document')}
            className="group relative cursor-pointer rounded-3xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Card gradient top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-200 dark:shadow-cyan-950">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900">
                  PDF · XLSX · PPTX
                </span>
              </div>

              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{docCardTitle}</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6 leading-relaxed">{docCardSub}</p>

              <ul className="space-y-2.5 mb-8">
                {docFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-zinc-300">
                    <span className="w-4 h-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 text-sm font-bold text-cyan-600 dark:text-cyan-400 group-hover:gap-3 transition-all">
                {ctaLabel}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why BigGrids pillars */}
      <section className="border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-black text-center text-gray-900 dark:text-white mb-10 tracking-tight"
          >
            {featureTitle}
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pillars.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 text-center"
              >
                <div className={`w-10 h-10 rounded-xl ${p.bg} flex items-center justify-center mx-auto mb-3 ${p.color}`}>
                  {p.icon}
                </div>
                <div className="text-sm font-bold text-gray-800 dark:text-zinc-200 mb-1">{p.title}</div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 leading-relaxed">{p.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-zinc-800 py-10 px-4 text-center text-xs text-gray-400 dark:text-zinc-500">
        <div className="flex items-center justify-center gap-5 mb-3 font-semibold">
          <button onClick={() => navigate('/about')} className="hover:text-indigo-500 transition-colors">About</button>
          <button onClick={() => navigate('/privacy')} className="hover:text-indigo-500 transition-colors">Privacy</button>
          <button onClick={() => navigate('/contact')} className="hover:text-indigo-500 transition-colors">Contact</button>
        </div>
        <p>© 2026 BigGrids. All file processing runs locally in your browser.</p>
      </footer>
    </div>
  );
}
