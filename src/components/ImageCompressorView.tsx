/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { ImageProcessingOptions, ProcessableFile } from '../types';
import { compressAndConvertImage } from '../utils/imageProcessor';
import SquooshSlider from './SquooshSlider';
import { Download, Sliders, RefreshCw, FileImage, Sparkles, Check, Settings, HelpCircle, ChevronDown, ChevronUp, Zap, Info, ShieldCheck, ArrowRight, Clock, Image } from 'lucide-react';
import { TranslationDict } from '../translations';
import { EXTRA_TRANSLATIONS } from '../translations_extra';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';

const generateSampleImage = (): File => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Elegant gradient backdrop
    const grad = ctx.createLinearGradient(0, 0, 800, 600);
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(0.5, '#ec4899');
    grad.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);

    // Decorative stars & sparkles
    ctx.fillStyle = '#fef08a';
    const drawStar = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r/3, cy - r/3);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx + r/3, cy + r/3);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r/3, cy + r/3);
      ctx.lineTo(cx - r, cy);
      ctx.lineTo(cx - r/3, cy - r/3);
      ctx.closePath();
      ctx.fill();
    };

    drawStar(150, 150, 20);
    drawStar(650, 150, 25);
    drawStar(150, 450, 30);
    drawStar(650, 450, 18);

    // Cute smiley yellow character
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(400, 300, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(365, 275, 12, 0, Math.PI * 2);
    ctx.arc(435, 275, 12, 0, Math.PI * 2);
    ctx.fill();

    // Eye shines
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(361, 271, 4, 0, Math.PI * 2);
    ctx.arc(431, 271, 4, 0, Math.PI * 2);
    ctx.fill();

    // Rosy cheeks
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(335, 310, 15, 0, Math.PI * 2);
    ctx.arc(465, 310, 15, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(400, 315, 45, 0, Math.PI, false);
    ctx.stroke();

    // Text labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Squoosh Test Pattern ✨', 400, 90);

    ctx.font = '20px monospace';
    ctx.fillStyle = '#e0e7ff';
    ctx.fillText('Stickers Image Optimizer Demo', 400, 520);
  }

  const dataUrl = canvas.toDataURL('image/png');
  const base64Str = dataUrl.split(',')[1];
  const byteCharacters = atob(base64Str);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/png' });
  return new File([blob], 'sample-compressor-test.png', { type: 'image/png' });
};

interface ImageCompressorViewProps {
  files: ProcessableFile[];
  onUpdateFile: (id: string, updates: Partial<ProcessableFile>) => void;
  onClear: () => void;
  t: TranslationDict;
  onLoadSampleFile?: (file: File) => void;
  mode?: 'convert' | 'compress';
  language?: string;
}

export default function ImageCompressorView({
  files,
  onUpdateFile,
  onClear,
  t,
  onLoadSampleFile,
  mode = 'compress',
  language
}: ImageCompressorViewProps) {
  const isKo = t.title ? t.title.includes('이미지') : false;
  const lang = language || (isKo ? 'ko' : 'en');
  const xt = EXTRA_TRANSLATIONS[lang] || EXTRA_TRANSLATIONS.en;

  // Local state declarations
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [options, setOptions] = useState<ImageProcessingOptions>({
    quality: 0.78,
    format: 'webp',
    resizeMode: 'none',
    resizeValue: 1080,
    compressEnabled: true,
    cropAspectRatio: 'none',
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<'fast' | 'recommended' | 'high' | 'instagram' | 'thumbnail' | 'email' | 'facebook' | 'web' | 'custom'>('recommended');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [activeFile, setActiveFile] = useState<ProcessableFile | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Track active file processing states with a ref Set to prevent double invocation
  const activeProcessingSetRef = useRef<Set<string>>(new Set());

  // Auto-select the first file when loaded if nothing is selected
  useEffect(() => {
    if (files.length > 0) {
      if (!selectedFileId || !files.some(f => f.id === selectedFileId)) {
        setSelectedFileId(files[0].id);
      }
    } else {
      setSelectedFileId(null);
    }
  }, [files, selectedFileId]);

  useEffect(() => {
    const file = files.find((f) => f.id === selectedFileId);
    setActiveFile(file || null);
  }, [files, selectedFileId]);

  // Apply basic quality preset configuration helper
  const applyPreset = (preset: 'fast' | 'recommended' | 'high') => {
    setActivePreset(preset);
    if (preset === 'fast') {
      setOptions((prev) => ({
        ...prev,
        quality: 0.45,
        compressEnabled: true,
        cropAspectRatio: 'none',
        resizeMode: 'none'
      }));
    } else if (preset === 'recommended') {
      setOptions((prev) => ({
        ...prev,
        quality: 0.78,
        compressEnabled: true,
        cropAspectRatio: 'none',
        resizeMode: 'none'
      }));
    } else if (preset === 'high') {
      setOptions((prev) => ({
        ...prev,
        quality: 0.95,
        compressEnabled: true,
        cropAspectRatio: 'none',
        resizeMode: 'none'
      }));
    }
  };

  // Reset completed/failed files to 'idle' when settings alter, so they all auto-re-process in the background
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const workFiles = files.filter(f => f.status === 'completed' || f.status === 'failed');
      const MAX_FILE_SIZE = 50 * 1024 * 1024;
      const reProcessableFiles = workFiles.filter(f => f.size <= MAX_FILE_SIZE);

      if (reProcessableFiles.length > 0) {
        activeProcessingSetRef.current.clear();
        reProcessableFiles.forEach(f => {
          if (f.processedUrl) {
            URL.revokeObjectURL(f.processedUrl);
          }
          onUpdateFile(f.id, { 
            status: 'idle', 
            progress: 0, 
            processedUrl: undefined, 
            processedName: undefined, 
            processedSize: undefined,
            error: undefined
          });
        });
      }
    }, 450); // Debounced to allow stable quick settings changes

    return () => clearTimeout(timeoutId);
  }, [options]);

  // High performance sequential single file process executor
  const processSpecificFile = async (targetFile: ProcessableFile) => {
    if (activeProcessingSetRef.current.has(targetFile.id)) return;
    activeProcessingSetRef.current.add(targetFile.id);

    onUpdateFile(targetFile.id, { status: 'processing', progress: 10 });

    try {
      const currentOptions = optionsRef.current;
      const result = await compressAndConvertImage(
        targetFile.file,
        currentOptions,
        (progress) => {
          onUpdateFile(targetFile.id, { progress });
        }
      );

      onUpdateFile(targetFile.id, {
        status: 'completed',
        progress: 100,
        processedUrl: result.url,
        processedName: getProcessedFileName(targetFile.name, currentOptions.format),
        processedSize: result.blob.size
      });

      if (targetFile.id === selectedFileId) {
        setProcessingTime(result.durationMs);
      }
    } catch (err: any) {
      console.error(err);
      onUpdateFile(targetFile.id, { status: 'failed', error: err.message || 'Error occurred' });
    } finally {
      activeProcessingSetRef.current.delete(targetFile.id);
    }
  };

  // Queue dispatcher effect: Monitors idle files and maintains a dynamic queue with up to 3 parallel processes
  useEffect(() => {
    const idleFiles = files.filter(f => f.status === 'idle');
    const processingFiles = files.filter(f => f.status === 'processing');

    const CONCURRENCY_LIMIT = 3; // Elevated parallel thread to optimize multi-image bulk processing speed

    if (processingFiles.length < CONCURRENCY_LIMIT && idleFiles.length > 0) {
      const priorityFile = idleFiles.find(f => f.id === selectedFileId && !activeProcessingSetRef.current.has(f.id));
      const nextFile = priorityFile || idleFiles.find(f => !activeProcessingSetRef.current.has(f.id));

      if (nextFile) {
        processSpecificFile(nextFile);
      }
    }

    const isSelectedFileProcessing = files.some(f => f.id === selectedFileId && f.status === 'processing');
    if (isSelectedFileProcessing !== isProcessing) {
      setIsProcessing(isSelectedFileProcessing);
    }
  }, [files, selectedFileId]);

  const getProcessedFileName = (originalName: string, format: string): string => {
    const dotIdx = originalName.lastIndexOf('.');
    const base = dotIdx !== -1 ? originalName.substring(0, dotIdx) : originalName;
    return `${base}_optimized.${format}`;
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    const completedFiles = files.filter((f) => f.status === 'completed' && f.processedUrl && f.processedName);
    
    if (completedFiles.length === 0) return;

    try {
      for (const file of completedFiles) {
        if (file.processedUrl && file.processedName) {
          const res = await fetch(file.processedUrl);
          const blob = await res.blob();
          zip.file(file.processedName, blob);
        }
      }

      const contentBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(contentBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimized-stickers-images-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.85 }
      });
    } catch (err) {
      console.error("ZIP creation failed:", err);
    }
  };

  const currentOriginalUrl = activeFile?.previewUrl || '';
  const currentProcessedUrl = activeFile?.processedUrl || '';
  const isWebPOrJpg = options.format === 'webp' || options.format === 'jpeg';
  const showQualitySlider = isWebPOrJpg && options.compressEnabled !== false;

  // Dictionary setup
  const tRoadmapTitle = {
    ko: "🚦 일괄 연산 로드맵", en: "🚦 Fast-Lane Roadmap", ja: "🚦 処理ロードマップ", zh: "🚦 处理指南", es: "🚦 Ruta de Proceso", fr: "🚦 Feuille de Route", de: "🚦 Verarbeitungs-Roadmap", vi: "🚦 Nhật ký xử lý", hi: "🚦 प्रसंस्करण नक्शा", ar: "🚦 خريطة المعالجة", pt: "🚦 Roteiro de Processamento", it: "🚦 Stato del Flusso", ru: "🚦 Дорожная карта"
  }[lang] || "🚦 Roadmap";

  const tProgressLabel = {
    ko: "압축하는 중", en: "Compressing", ja: "圧縮中", zh: "压缩中", es: "Comprimiendo", fr: "Compression", de: "Kompression", vi: "Đang nén", hi: "संपीड़न जारी", ar: "جاري الضغط", pt: "Compactando", it: "Compressione", ru: "Сжатие"
  }[lang] || "Compressing";

  const tWaitingLabel = {
    ko: "대기 중", en: "Waiting", ja: "待機中", zh: "等待中", es: "Esperando", fr: "En attente", de: "Warten", vi: "Đang chờ", hi: "प्रतीक्षा", ar: "في الانتظار", pt: "Aguardando", it: "In attesa", ru: "Ожидание"
  }[lang] || "Waiting";

  const tSnsPresetsLabel = {
    ko: "📝 용도별 고속 규격 맞춤 (구글링 사이즈)",
    en: "📝 Standard Output Target Presets (Fast Sizes)",
    ja: "📝 用途別規格最適化（クイック設定）",
    zh: "📝 平台快速智能剪裁预设",
    es: "📝 Ajustes de Tamaño Óptimos para Redes",
    fr: "📝 Formats Standards pour Réseaux Sociaux",
    de: "📝 Plattformspezifische Bildformate",
    vi: "📝 Thiết lập nhanh theo nhu cầu nền tảng",
    hi: "📝 सोशल मीडिया प्रारूप प्रीसेट",
    ar: "📝 إعدادات مخصصة لمنصات التواصل",
    pt: "📝 Ajustes de Tamanho para Redes Sociais",
    it: "📝 Impostazioni di Formato per Social",
    ru: "📝 Готовые спецификации под соцсети"
  }[lang] || "📝 Standard Output Target Presets";

  const tSnsPresetsDesc = {
    ko: "인스타, 블로그 썸네일, 이메일 최장축, 페이스북 웹 연동 맞춤 최적 해상도 및 포맷 규격을 검증하여 제공합니다.",
    en: "Strictly matching Instagram square feed, blog thumbnail, layout email attachment, and FB optimization standards.",
    ja: "Instagram、ブログ、メール、Facebookの推奨形式・サイズを検証したデータを提供します。",
    zh: "已匹配 Instagram 贴图、博客封面、轻量邮件传输及 Facebook 网页标准布局。",
    es: "Mapea resoluciones recomendadas para Instagram, miniaturas de blog, email y Facebook.",
    fr: "Propose des dimensions calibrées pour Instagram, miniatures de blog, pièces jointes et Facebook.",
    de: "Optimiert für Instagram, Blog-Bilder, E-Mail-Anhänge und Facebook-Layouts.",
    vi: "Đã tối ưu hóa cho Instagram, ảnh thu nhỏ Blog, tệp đính kèm Email và Facebook.",
    hi: "इंस्टाग्राम, ब्लॉग, ईमेल अटैचमेंट और फेसबुक के अनुकूलन आकारों को प्रदान करता है।",
    ar: "يدمج المقاسات الموصى بها لـ إنستقرام، صورة مدونة، مرفق بريد، وفيسبوك.",
    pt: "Oferece resoluções homologadas para Instagram, miniaturas de blog, email e Facebook.",
    it: "Calibrato sulle dimensioni raccomandate per Instagram, blog, allegati email e Facebook.",
    ru: "Оптимальные разрешения для Instagram, блогов, почты и Facebook."
  }[lang] || "Standard social parameters.";

  const tPresetsLabels = {
    instagramko: '인스타그램 피드용', instagramen: 'Instagram square', instagramja: 'Instagramフィード', instagramzh: 'Instagram 动态贴图', instagrames: 'Instagram Feed', instagramfr: 'Fil Instagram', instagramde: 'Instagram-Feed', instagramvi: 'Đăng Instagram', instagramhi: 'इंस्टाग्राम फ़ीड', instagramar: 'منشور إنستقرام', instagrampt: 'Feed do Instagram', instagramit: 'Feed Instagram', instagramru: 'Лента Instagram',
    thumbnailko: '네이버·티스토리 썸네일', thumbnailen: 'Blog Thumbnail', thumbnailja: 'ブログ・サムネイル', thumbnailzh: '博客封面缩略图', thumbnailes: 'Minia de Blog', thumbnailfr: 'Miniature de Blog', thumbnailde: 'Blog-Vorschaubild', thumbnailvi: 'Ảnh nhỏ Blog', thumbnailhi: 'ब्लॉग थंबनेल', thumbnailar: 'مصغرة بلوق', thumbnailpt: 'Miniatura de Blog', thumbnailit: 'Miniatura Blog', thumbnailru: 'Превью блога',
    emailko: '이메일 첨부용 (속도극대화)', emailen: 'Email Attachment', emailja: 'メール添付用', emailzh: '邮件轻量附件', emailes: 'Email Liviano', emailfr: 'Pièce Jointe Mail', emailde: 'Leichter Mail-Anhang', emailvi: 'Đính kèm Email', emailhi: 'ईमेल अनुलग्नक', emailar: 'مرفق خفيف للبريد', emailpt: 'Anexo de Email', emailit: 'Allegato Email Leggero', emailru: 'Вложение в письмо',
    facebookko: '페이스북 공유용 (고호환)', facebooken: 'Facebook optimization', facebookja: 'Facebook最適化', facebookzh: 'Facebook网页优化', facebookes: 'Optimizado para FB', facebookfr: 'Optimisé pour FB', facebookde: 'Facebook-Optimiert', facebookvi: 'Tối ưu Facebook', facebookhi: 'फेसबुक अनुकूलन', facebookar: 'تحسين فيسبوك', facebookpt: 'Optimizado para FB', facebookit: 'Ottimizzato Facebook', facebookru: 'Для Facebook',
    webko: '웹사이트 게재용 (SEO 고속)', weben: 'Web SEO Optimized', webja: 'Web SEO 高速化', webzh: 'Web SEO 高性能', webes: 'Web SEO Optimizado', webfr: 'Optimisé Web SEO', webde: 'Web-SEO Optimiert', webvi: 'Tối ưu Web SEO', webhi: 'वेब एसईओ अनुकूलन', webar: 'تحسين محركات الويب', webpt: 'Web SEO Optimizado', webit: 'Ottimizzato Web SEO', webru: 'Для сайтов (SEO)'
  };

  const getSnsLabel = (key: 'instagram' | 'thumbnail' | 'email' | 'facebook' | 'web'): string => {
    return (tPresetsLabels as any)[`${key}${lang}`] || (tPresetsLabels as any)[`${key}en`];
  };

  const tOneClickHeader = {
    ko: "⚡ 스마트 일괄 원패스 압축 비율", en: "⚡ One-click Smart Settings", ja: "⚡ スマート一括推奨設定", zh: "⚡ 智能快捷一键调节", es: "⚡ Ajustes Inteligentes Rápidos", fr: "⚡ Réglages de Raccourci Uniques", de: "⚡ Intelligente Ein-Klick-Profile", vi: "⚡ Cấu hình nén nhanh một chạm", hi: "⚡ वन-क्लिक स्मार्ट संपीड़न", ar: "⚡ إعدادات ذكية بنقرة واحدة", pt: "⚡ Configurações Inteligentes", it: "⚡ Profili di Compressione Rapidi", ru: "⚡ Предустановки в один клик"
  }[lang] || "⚡ Smart Settings";

  const tFastPresetsHeader = {
    ko: "🛠️ 고밀도 수동 정밀 조절", en: "🛠️ Manual Compression Configs", ja: "🛠️ マニュアル高度パラメータ", zh: "🛠️ 手动精细化控制面板", es: "🛠️ Controles Manuales Interactivos", fr: "🛠️ Options de Précision Manuelle", de: "🛠️ Manuelle Präzisionssteuerung", vi: "🛠️ Bảng điều khiển thủ công chi tiết", hi: "🛠️ मैनुअल कॉन्फ़िगरेशन विकल्प", ar: "🛠️ إعدادات يدوية فائقة التفصيل", pt: "🛠️ Controles Manuais Avançados", it: "🛠️ Controlli di Precisione Manuali", ru: "🛠️ Ручные параметры точности"
  }[lang] || "🛠️ Manual Configs";

  const tNoImgSelected = {
    ko: "아직 선택된 이미지가 없습니다", en: "No Active Image Workspace", ja: "まだ画像が選択されていません", zh: "暂无选定图像单元", es: "No hay foto seleccionada", fr: "Aucun espace sélectionné", de: "Bisher kein Bild ausgewählt", vi: "Chưa chọn hoặc tải hình ảnh lên", hi: "कोई चयनित छवि नहीं है", ar: "لا توجد صور محددة للعمل عليها", pt: "Nenhuma imagem selecionada", it: "Nessuna immagine attiva", ru: "Изображение не выбрано"
  }[lang] || "No Active Image Workspace";

  const tPlaceholderExplain = {
    ko: "파일을 업로드하면 실시간 무손실 압축율 및 원본 화질을 픽셀 단위로 대조하여 볼 수 있는 초정밀 슬라이더와 분석기가 활성화됩니다.",
    en: "Once you upload layout photos, our real-time high-fidelity comparison slider and analytical dashboard will automatically spawn.",
    ja: "ファイルをアップロードすると、画質の差をピクセル単位で比較できるスライダー画面が有効化されます。",
    zh: "上传任意文件后，即刻唤醒高倍率智能滑块对比视窗及多维比率分析图，支持实时像素细节对比。",
    es: "Al subir fotos, se activará el control de píxeles interactivo para contrastar la calidad cara a cara.",
    fr: "Uploadez des fichiers pour lancer le comparateur interactif de rendu visuel pixel por pixel.",
    de: "Nach dem Upload wird der interaktive Vorher-Nachher-Vergleich und die Spektralanalyse gestartet.",
    vi: "Đã sẵn sàng tạo trình so sánh ảnh trượt so sánh tỷ lệ nén trực quan từng pixel thực tế.",
    hi: "फ़ाइलें अपलोड करने पर सटीक कंट्रास्ट स्लाइडर सक्रिय हो जाता है ताकी गुणवत्ता का मिलان किया जा सके।",
    ar: "بمجرد الرفع، سيعمل شريط المقارنة اللحظية والتحليلات لمشاهدة الفروقات لقطة بقطة وجزء بجزء.",
    pt: "Uploade arquivos para liberar o controle deslizante de comparação interativa de alta fidelidade.",
    it: "Una volta caricati i file, si illuminerà lo slider di confronto e l'interfaccia di diagnostica.",
    ru: "После загрузки файлов активируется детальный интерактивный слайдер сравнения качества."
  }[lang] || "Once you upload a file, the slider comparison tool will activate.";

  const tNoImgSamplePrompt = {
    ko: "테스트용 이미지가 없으신가요?", en: "Don't have an image ready?", ja: "テスト用の画像がありませんか？", zh: "手头没有现成测试图？", es: "¿No tiene imágenes listas?", fr: "Pas de visuel sous la main ?", de: "Keine passende Grafik zur Hand?", vi: "Bạn chưa có sẵn hình ảnh thử nghiệm?", hi: "क्या आपके पास जांच हेतु चित्र नहीं है?", ar: "ألا توجد لديك صور جاهزة للاختبار?", pt: "Sem imagens para teste?", it: "Non hai immagini di prova pronte?", ru: "Нет изображения для теста?"
  }[lang] || "Don't have an image ready?";

  const tSampleBtnText = {
    ko: "⚡ 샘플 이미지로 즉시 체험해보기", en: "⚡ Load Cute Sample Graphic", ja: "⚡ サンプル画像で試してみる", zh: "⚡ 加载超萌渐变样图进行测试", es: "⚡ Cargar patrón de prueba lindo", fr: "⚡ Charger un exemple de test multicolore", de: "⚡ Bunte Beispieldatei laden", vi: "⚡ Nạp hình ảnh hoạt hình mẫu miễn phí", hi: "⚡ नमू나 이미지 로드해보기", ar: "⚡ تجربة محاكاة كرتونية سريعة", pt: "⚡ Baixar vetor de testes", it: "⚡ Carica l'immagine campione colorata", ru: "⚡ Загрузить тестовую графику"
  }[lang] || "⚡ Load Cute Sample Graphic";

  const imgLocalDict: Record<string, Record<string, string>> = {
    splitCompareStage: {
      ko: "실시간 스플릿 스쿼시 슬라이더 대조기",
      en: "Hifi-Split Compare Stage",
      ja: "リアルタイム比較スライダー",
      zh: "实时无损画质滑块对比",
      es: "Panel de comparación en tiempo real",
      fr: "Comparateur en temps réel en direct",
      de: "Echtzeit-Vergleichs-Schieberegler",
      vi: "Trình so sánh ảnh trượt trực quan",
      hi: "वास्तविक समय तुलना स्लाइडر",
      ar: "لوحة المقارنة الحية اللحظية",
      pt: "Visualizador de comparação em tempo real",
      it: "Slider di confronto in tempo real",
      ru: "Интерактивное сравнение качества"
    },
    origPrefix: {
      ko: "원본: ",
      en: "Orig: ",
      ja: "元: ",
      zh: "原始: ",
      es: "Orig: ",
      fr: "Orig : ",
      de: "Orig: ",
      vi: "Gốc: ",
      hi: "मूल: ",
      ar: "الأصل: ",
      pt: "Orig: ",
      it: "Orig: ",
      ru: "Ориг: "
    },
    optPrefix: {
      ko: "압축본: ",
      en: "Opt: ",
      ja: "最適化: ",
      zh: "优化: ",
      es: "Optimizado: ",
      fr: "Optimisé : ",
      de: "Opt: ",
      vi: "Nén: ",
      hi: "अनुकूलित: ",
      ar: "المحسن: ",
      pt: "Optimizado: ",
      it: "Ottimizzato: ",
      ru: "Оптим: "
    },
    originalLabelText: {
      ko: "원본",
      en: "Original",
      ja: "オリジナル",
      zh: "原始",
      es: "Original",
      fr: "Original",
      de: "Original",
      vi: "Hình ảnh gốc",
      hi: "मूल छवि",
      ar: "الصورة الأصلية",
      pt: "Original",
      it: "Originale",
      ru: "Оригинал"
    },
    optLabelText: {
      ko: "압축본",
      en: "Optimized",
      ja: "最適化",
      zh: "优化本",
      es: "Optimizado",
      fr: "Optimisé",
      de: "Optimiert",
      vi: "Đã tối ưu",
      hi: "अनुकूलित",
      ar: "المحسنة",
      pt: "Optimizado",
      it: "Ottimizzato",
      ru: "Сжатый"
    },
    waitingText: {
      ko: "대기 중...",
      en: "Processing...",
      ja: "処理中...",
      zh: "正在加载...",
      es: "Procesando...",
      fr: "En cours...",
      de: "Verarbeitung...",
      vi: "Đang thiết lập...",
      hi: "प्रसंस्करण...",
      ar: "جاري المعالجة...",
      pt: "Processando...",
      it: "In elaborazione...",
      ru: "Обработка..."
    },
    downloadOpt: {
      ko: "개별 완성파일 즉시저장",
      en: "Download Optimized File",
      ja: "最適化ファイルを保存",
      zh: "下载当前 optimization 图像",
      es: "Descargar foto optimizada",
      fr: "Télécharger le visuel optimisé",
      de: "Optimiertes Bild herunterladen",
      vi: "Tải xuống hình ảnh đã nén",
      hi: "अनुकूलित फ़ाइल सहेजें",
      ar: "تحميل الملف المحسن فورا",
      pt: "Baixar arquivo otimizado",
      it: "Scarica il file ottimizzato",
      ru: "Скачать оптимизированный файл"
    },
    imageListPrefix: {
      ko: "이미지 목록",
      en: "Loaded Images",
      ja: "画像リスト",
      zh: "图像列表",
      es: "Lista de fotos",
      fr: "Liste des images",
      de: "Bilderliste",
      vi: "Danh sách hình ảnh",
      hi: "छवियों की सूची",
      ar: "قائمة الصور المحملة",
      pt: "Lista de imagens",
      it: "Lista immagini",
      ru: "Список файлов"
    },
    noActiveImagesToOptimize: {
      ko: "우측 혹은 상단 영역에 이미지를 넣어주세요",
      en: "No active images to optimize",
      ja: "右側または上部のエリアに画像をドロップしてください",
      zh: "将目标图片放入拖拽区域",
      es: "Cargue imágenes en el área superior para optimizar",
      fr: "Veuillez importer des images ci-dessus pour lancer le traitement",
      de: "Ziehen Sie Bilder in die Arbeitsfläche oben",
      vi: "Vui lòng tải thả hình ảnh để bắt đầu tối ưu hóa",
      hi: "अनुकूलित करने के लिए ऊपर चित्र डालें",
      ar: "يرجى سحب وإفلات الصور هنا للبدء",
      pt: "Carregue imagens na área de trabalho para otimizar",
      it: "Trascina qui le immagini per ottimizzarle",
      ru: "Пожалуйста, перетащите изображения в пустую область"
    },
    excludedText: {
      ko: "제외됨", en: "EXCLUDED", ja: "除外", zh: "已排除", es: "EXCLUIDO", fr: "EXCLU", de: "AUSGESCHLOSSEN", vi: "LOẠI TRỪ", hi: "अपवर्जित", ar: "مستبعد", pt: "EXCLUÍDO", it: "ESCLUSO", ru: "ИСКЛЮЧЕНО"
    },
    clickInstant: {
      ko: "클릭 즉시 반영", en: "Instant", ja: "即時反映", zh: "即时应用", es: "Instantáneo", fr: "Instantané", de: "Sofort", vi: "Tức thì", hi: "तत्काल", ar: "لحظي", pt: "Instantâneo", it: "Istantaneo", ru: "Мгновенно"
    },
    collapseText: {
      ko: "접기", en: "Collapse", ja: "折りたたむ", zh: "收起", es: "Contraer", fr: "Réduire", de: "Einklappen", vi: "Thu gọn", hi: "सिकुड़ें", ar: "طي", pt: "Recolher", it: "Riduci", ru: "Свернуть"
    },
    detailsText: {
      ko: "펴기", en: "Details", ja: "詳細設定", zh: "展开", es: "Expandir", fr: "Détails", de: "Details", vi: "Chi tiết", hi: "विवरण", ar: "تفاصيل", pt: "Detalhes", it: "Dettagli", ru: "Детали"
    },
    qualityScaleText: {
      ko: "품질 수치 입력 (Quality %)", en: "Manual Quality Scale", ja: "品質パーセント指定", zh: "设定输出品质 (%)", es: "Calidad manual (%)", fr: "Chiffre de qualité (%)", de: "Qualitätsstufe (%)", vi: "Chất lượng (%)", hi: "गुणवत्ता मान (%)", ar: "مستوى الجودة (%)", pt: "Qualidade manual (%)", it: "Qualità manuale (%)", ru: "Параметр качества (%)"
    },
    lowQualityText: {
      ko: "최저 용량", en: "Low quality", ja: "最低画質", zh: "低画质", es: "Baja calidad", fr: "Basse qualité", de: "Geringe Qualität", vi: "Dung lượng thấp", hi: "न्यूनतम आकार", ar: "جودة خفيفة", pt: "Baixa qualidade", it: "Bassa qualità", ru: "Меньший размер"
    },
    recommendedText: {
      ko: "기본 추천★", en: "Recommended ★", ja: "推奨設定★", zh: "默认推荐★", es: "Recomendado ★", fr: "Recommandé ★", de: "Empfohlen ★", vi: "Khuyên dùng ★", hi: "अनुशंसित ★", ar: "الموصى به ★", pt: "Recomendado ★", it: "Raccomandato ★", ru: "Рекомендуется ★"
    },
    highQualityText: {
      ko: "무손실 지향", en: "High quality", ja: "高画質", zh: "高清无损", es: "Alta calidad", fr: "Haute qualité", de: "Hohe Qualität", vi: "Chất lượng gốc", hi: "उच्च गुणवत्ता", ar: "عالية الجودة", pt: "Alta qualidade", it: "Alta qualità", ru: "Макс. качество"
    },
    originalWidthText: {
      ko: "비활성화", en: "Original width", ja: "元のサイズ", zh: "原始尺寸", es: "Ancho original", fr: "Largeur originale", de: "Originalgröße", vi: "Tỷ lệ gốc", hi: "मूल चौड़ाई", ar: "الأبعاد الأصلية", pt: "Largura original", it: "Larghezza originale", ru: "Исходная ширина"
    },
    setWidthText: {
      ko: "너비 기준 (Width px)", en: "Set fixed Width", ja: "幅を指定 (Width px)", zh: "指定固定宽度", es: "Ancho fijo (px)", fr: "Largeur fixe (px)", de: "Breite festlegen (px)", vi: "Độ rộng (px)", hi: "चौड़ाई विशिष्ट करें", ar: "عرض ثابت (بكسل)", pt: "Largura fixa (px)", it: "Larghezza fissa (px)", ru: "Задать ширину (px)"
    },
    percentScaleText: {
      ko: "비율 축소 (%)", en: "Percentage Scale", ja: "比率で縮小 (%)", zh: "等比例缩放 (%)", es: "Escala porcentual (%)", fr: "Ratio en (%)", de: "Skalierung (%)", vi: "Tỷ lệ phần trăm (%)", hi: "प्रतिशत संकुचन", ar: "نسبة مئوية (%)", pt: "Escalar por percentagem (%)", it: "Percentuale (%)", ru: "Процентное сжатие (%)"
    },
    forceOutputFormatText: {
      ko: "출력 파일 포맷 변환", en: "Force output format", ja: "出力形式の変換", zh: "目标输出格式", es: "Formato de salida", fr: "Format de sortie", de: "Ausgabeformat", vi: "Định dạng đầu ra", hi: "आउटपुट प्रारूप बदलें", ar: "نوع صيغة المستند", pt: "Formato de saída", it: "Formato output", ru: "Преобразовать формат"
    },
    cropBoundariesText: {
      ko: "스마트 종횡비 자르기 (Crop Aspect Ratio)", en: "Crop boundaries", ja: "アスペクト比クロップ", zh: "裁切画面比例", es: "Relación de aspecto", fr: "Ratio d'aspect rogné", de: "Schnittverhältnis", vi: "Cắt tỷ lệ khung hình", hi: "आस्पेक्ट रेशियो काटें", ar: "خيارات القص", pt: "Proporção de tela", it: "Rapporto di ritaglio", ru: "Умная обрезка сторон"
    }
  };

  const getImgText = (key: string): string => {
    return imgLocalDict[key]?.[lang] || imgLocalDict[key]?.[ 'en' ] || '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full" id="image-compressor-root">
      
      {/* LEFT COLUMN: Main Visual Workspace Canvas Stage (Takes 7 or 8 columns) */}
      <div className="lg:col-span-7 xl:col-span-8 lg:order-1 flex flex-col space-y-4" id="image-compressor-workspace">
        
        {/* TARGET FORMAT SELECTOR & QUALITY SLIDER CARD */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850/80 rounded-3xl p-4 shadow-3xs flex flex-col gap-3.5 text-left transition-colors" id="target-format-controller-and-quality-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: format selection */}
            <div className="flex flex-col space-y-1.5 shrink-0">
              <span className="text-[11px] font-extrabold text-gray-800 dark:text-zinc-200 uppercase tracking-wider font-mono">
                {lang === 'ko' ? '변환할 확장자 선택' : 'Target Output Format'}
              </span>
              <div className="bg-gray-100/70 dark:bg-zinc-950 p-1 rounded-xl flex items-center gap-1 border border-gray-200/40 dark:border-zinc-800/70 w-fit">
                {[
                  { id: 'webp', label: 'WebP' },
                  { id: 'jpeg', label: 'JPG' },
                  { id: 'png', label: 'PNG' },
                  { id: 'gif', label: 'GIF' }
                ].map((fmt) => {
                  const isSelected = options.format === fmt.id || (options.format === 'bmp' && fmt.id === 'png'); // fallback
                  return (
                    <button
                      key={fmt.id}
                      onClick={() => {
                        setOptions((prev) => ({ ...prev, format: fmt.id as any }));
                        setActivePreset('custom');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md shadow-blue-500/15 scale-[1.01] border-none'
                          : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-gray-200/50 dark:hover:bg-zinc-850/40'
                      }`}
                      id={`target-format-btn-${fmt.id}`}
                    >
                      {fmt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: compact quality slider */}
            <div className="flex flex-col space-y-1.5 flex-1 max-w-sm md:ml-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-gray-800 dark:text-zinc-200 uppercase tracking-wider font-mono">
                  {lang === 'ko' ? '압축 품질' : 'Compression Quality'}
                </span>
                <span className={`font-mono text-[10.5px] font-extrabold px-1.5 py-0.5 rounded ${
                  options.quality < 0.45 
                    ? 'text-amber-600 bg-amber-50 dark:bg-amber-955/20' 
                    : 'text-emerald-605 bg-emerald-50 dark:bg-emerald-955/30'
                }`}>
                  {Math.round(options.quality * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.10"
                  max="1.00"
                  step="0.01"
                  value={options.quality}
                  onChange={(e) => {
                    setOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }));
                    setActivePreset('custom');
                  }}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-200/60 dark:bg-zinc-800 accent-blue-600 dark:accent-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Bottom Live Feedback Tip */}
          <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-2.5 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 bg-blue-50/50 dark:bg-blue-950/20 px-2.5 py-1 rounded-lg text-blue-600 dark:text-blue-400 font-semibold border border-blue-100/10 dark:border-blue-900/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400"></span>
              </span>
              <span className="font-medium">
                {lang === 'ko' 
                  ? `선택한 [${options.format.toUpperCase() === 'JPEG' ? 'JPG' : options.format.toUpperCase()}]으로 변환 준비 완료` 
                  : `Ready to convert to [${options.format.toUpperCase() === 'JPEG' ? 'JPG' : options.format.toUpperCase()}]`
                }
              </span>
            </div>
            {files.length > 0 && (
              <span className="text-gray-400 dark:text-zinc-500 font-mono text-[9.5px]">
                {lang === 'ko' ? '설정 변경 시 자동 실시간 변환' : 'Live updates apply instantly'}
              </span>
            )}
          </div>
        </div>

        {files.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-8 shadow-3xs flex flex-col items-center justify-center text-center min-h-[500px]" id="empty-workspace-state">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-zinc-800 flex items-center justify-center text-blue-500 mb-5 shadow-2xs">
              <FileImage className="w-8 h-8" />
            </div>
            
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight">
              {tNoImgSelected}
            </h3>
            <p className="text-xs text-gray-400 dark:text-zinc-550 leading-relaxed font-semibold max-w-lg mt-2.5 mb-8">
              {tPlaceholderExplain}
            </p>

            <div className="w-full max-w-sm rounded-2xl bg-gray-50/50 dark:bg-zinc-950 p-5 border border-gray-100 dark:border-zinc-850">
              <span className="text-[10.5px] font-bold text-gray-400 block pb-3">{tNoImgSamplePrompt}</span>
              {onLoadSampleFile && (
                <button
                  onClick={() => onLoadSampleFile(generateSampleImage())}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-3xs hover:shadow-md cursor-pointer"
                  id="load-sample-image-button"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>{tSampleBtnText}</span>
                </button>
              )}
              <span className="text-[9px] text-gray-350 dark:text-zinc-650 block pt-2.5 font-medium">
                {xt.imageNote}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-xs flex flex-col space-y-4 text-left" id="active-slider-stage">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-50 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5 leading-none">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse shrink-0" />
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-zinc-100 truncate pr-2">
                  {getImgText('splitCompareStage') || "Hifi-Split Compare Stage"}
                </h4>
              </div>

              {activeFile?.processedSize && (
                <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-gray-400">
                  <span className="text-gray-400 bg-gray-50 dark:bg-zinc-950 px-2 py-1 rounded">
                    {getImgText('origPrefix') || "Orig: "}{formatSize(activeFile.size)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                  <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded">
                    {getImgText('optPrefix') || "Opt: "}{formatSize(activeFile.processedSize)}
                  </span>
                  <span className="text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-md">
                    -{Math.round(((activeFile.size - activeFile.processedSize) / activeFile.size) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Slider container with standard frame protection */}
            <div className="relative w-full aspect-video min-h-[290px] sm:min-h-[440px] rounded-2xl bg-neutral-950 overflow-hidden border border-gray-100 dark:border-zinc-850 shadow-inner" id="compare-canvas-stage">
              {isProcessing && (
                <div className="absolute inset-0 bg-neutral-950/80 z-20 flex flex-col items-center justify-center space-y-3.5">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                  <span className="text-xs font-bold text-white tracking-widest uppercase font-mono">
                    {tProgressLabel}...
                  </span>
                </div>
              )}

              {currentOriginalUrl && (
                <SquooshSlider
                  originalUrl={currentOriginalUrl}
                  processedUrl={currentProcessedUrl || currentOriginalUrl}
                  originalLabel={`${getImgText('originalLabelText') || 'Original'} (${formatSize(activeFile?.size || 0)})`}
                  processedLabel={
                    activeFile?.status === 'completed'
                      ? `${getImgText('optLabelText') || 'Optimized'} (${formatSize(activeFile?.processedSize || 0)})`
                      : (getImgText('waitingText') || 'Processing...')
                  }
                  t={t}
                />
              )}
            </div>

            {/* Downloader toolbar inline */}
            {activeFile?.status === 'completed' && activeFile.processedUrl && (
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 dark:bg-zinc-950/60 p-4 rounded-2xl border border-gray-100 dark:border-zinc-850">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40 text-[10.5px] px-2 py-0.5 rounded flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{xt.step3Completed.split('!')[0]}</span>
                  </span>
                  {processingTime && (
                    <span className="text-[10px] font-mono text-gray-300 dark:text-zinc-650 flex items-center gap-1 leading-none font-semibold">
                      <Clock className="w-3 h-3" />
                      <span>{processingTime}ms</span>
                    </span>
                  )}
                </div>

                <a
                  href={activeFile.processedUrl}
                  download={activeFile.processedName}
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-3xs cursor-pointer"
                  id="active-file-download-button"
                >
                  <Download className="w-4 h-4" />
                  <span>{getImgText('downloadOpt') || "Download Optimized File"}</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Command Side-Desk holding Files list, Presets, and Parameters drawer (Takes 5 or 4 columns) */}
      <div className="lg:col-span-5 xl:col-span-4 lg:order-2 flex flex-col space-y-4" id="image-compressor-sidebar">
        
        {/* Section 1: Files Manager List */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-zinc-800 pb-3">
            <h3 className="font-extrabold text-[13px] text-gray-800 dark:text-zinc-200 flex items-center gap-1.5 leading-none">
              <FileImage className="w-4.5 h-4.5 text-blue-500" />
              <span>{(getImgText('imageListPrefix') || 'Loaded Images')} ({files.length})</span>
            </h3>
            {files.length > 0 && (
              <button
                onClick={onClear}
                className="text-[11px] font-extrabold text-red-500 dark:text-red-400 hover:underline cursor-pointer"
                id="clear-all-images-button"
              >
                {t.clearAll}
              </button>
            )}
          </div>

          {files.length === 0 ? (
            <div className="py-7 text-center text-[11px] text-gray-400 font-medium">
              {getImgText('noActiveImagesToOptimize') || "No active images to optimize"}
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[190px]" id="image-files-list">
              <AnimatePresence>
                {files.map((f) => {
                  const isSelected = f.id === selectedFileId;
                  const savings = f.processedSize ? Math.round(((f.size - f.processedSize) / f.size) * 100) : 0;

                  return (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setSelectedFileId(f.id)}
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? f.status === 'failed'
                            ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20'
                            : 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                          : f.status === 'failed'
                            ? 'border-red-200/50 dark:border-red-900/30 bg-red-50/10 dark:bg-red-950/5 hover:bg-gray-50 dark:hover:bg-zinc-800'
                            : 'border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40 hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {f.previewUrl ? (
                            <img
                              src={f.previewUrl}
                              alt=""
                              className="w-8 h-8 object-cover rounded-md border border-gray-100 dark:border-zinc-800 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-750 text-gray-400 flex items-center justify-center shrink-0">
                              <FileImage className="w-4.5 h-4.5" />
                            </div>
                          )}
                          <div className="flex flex-col overflow-hidden leading-snug text-left">
                            <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate max-w-[130px] sm:max-w-[170px]">
                              {f.name}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500 font-semibold">
                              {formatSize(f.size)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {f.status === 'processing' && (
                            <span className="text-[10.5px] font-mono font-bold text-blue-600 dark:text-blue-400">
                              {f.progress}%
                            </span>
                          )}
                          {f.status === 'completed' && savings > 0 && (
                            <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold leading-none">
                              -{savings}%
                            </span>
                          )}
                          {f.status === 'failed' && (
                            <span className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 font-mono text-[8px] px-1.5 py-0.5 rounded font-bold uppercase leading-none shrink-0">
                              {getImgText('excludedText') || "EXCLUDED"}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {files.filter(f => f.status === 'completed').length > 0 && (
            <button
              onClick={downloadAllAsZip}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-3xs hover:shadow-md transition-all cursor-pointer"
              id="download-all-images-zip-button"
            >
              <Download className="w-4 h-4 text-white" />
              <span>{t.downloadAll}</span>
            </button>
          )}
        </div>

        {/* Section 2: One-Click Quick Presets for SNS/SEO (Google-Optimized Dimensions) */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-xs text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
              {tSnsPresetsLabel}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-zinc-500 leading-normal mb-3.5 font-medium">
            {tSnsPresetsDesc}
          </p>

          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'instagram', label: getSnsLabel('instagram'), icon: '📸', desc: { ko: '1080px (1:1) · WebP (고압축)', ja: '1080px (1:1) · WebP (高圧縮)', zh: '1080px (1:1) · WebP (高压缩)', es: '1080px (1:1) · WebP (Compacto)', fr: '1080px (1:1) · WebP (Compressé)', de: '1080px (1:1) · WebP (Kompakt)' }[lang] || '1080px (1:1) · WebP', settings: { quality: 0.82, format: 'webp' as const, resizeMode: 'width' as const, resizeValue: 1080, cropAspectRatio: '1:1' as const, compressEnabled: true } },
              { id: 'thumbnail', label: getSnsLabel('thumbnail'), icon: '🖼', desc: { ko: '1000px (1:1) · WebP (정사각형)', ja: '1000px (1:1) · WebP (正方形)', zh: '1000px (1:1) · WebP (正方形)', es: '1000px (1:1) · WebP (Cuadrado)', fr: '1000px (1:1) · WebP (Carré)', de: '1000px (1:1) · WebP (Quadrat)' }[lang] || '1000px (1:1) · WebP', settings: { quality: 0.80, format: 'webp' as const, resizeMode: 'width' as const, resizeValue: 1000, cropAspectRatio: '1:1' as const, compressEnabled: true } },
              { id: 'email', label: getSnsLabel('email'), icon: '✉', desc: { ko: '800px · JPEG (최저용량)', ja: '800px · JPEG (低容量)', zh: '800px · JPEG (低容量)', es: '800px · JPEG (Ligero)', fr: '800px · JPEG (Léger)', de: '800px · JPEG (Leicht)' }[lang] || '800px · JPEG (Light)', settings: { quality: 0.65, format: 'jpeg' as const, resizeMode: 'width' as const, resizeValue: 800, cropAspectRatio: 'none' as const, compressEnabled: true } },
              { id: 'facebook', label: getSnsLabel('facebook'), icon: '👍', desc: { ko: '1200px · JPEG (고화질표준)', ja: '1200px · JPEG (標準高画質)', zh: '1200px · JPEG (标准高清)', es: '1200px · JPEG (Estable)', fr: '1200px · JPEG (Standard)', de: '1200px · JPEG (Stabil)' }[lang] || '1200px · JPEG (Stable)', settings: { quality: 0.80, format: 'jpeg' as const, resizeMode: 'width' as const, resizeValue: 1200, cropAspectRatio: 'none' as const, compressEnabled: true } },
            ].map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setOptions(prev => ({ ...prev, ...preset.settings }));
                    setActivePreset(preset.id as any);
                  }}
                  className={`flex flex-col items-start justify-between p-3.5 min-h-[90px] rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/20 text-indigo-600 dark:border-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 ring-2 ring-indigo-500/15 shadow-3xs scale-[1.01]'
                      : 'border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40 hover:bg-indigo-50/30'
                  }`}
                  id={`preset-${preset.id}-button`}
                >
                  <div className="flex items-center gap-1.5 pb-1">
                    <span className="text-base leading-none">{preset.icon}</span>
                    <span className="text-[11px] font-extrabold text-gray-800 dark:text-zinc-200 leading-none truncate max-w-[125px]">
                      {preset.label}
                    </span>
                  </div>
                  <span className="text-[9.5px] text-gray-400 dark:text-zinc-550 leading-tight font-mono font-semibold pt-1">
                    {preset.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: One-Click Standard Multi-Ratio Compression */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-xs text-left">
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-gray-100 dark:border-zinc-800">
            <h4 className="text-[12.5px] font-extrabold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5 leading-none">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{tOneClickHeader}</span>
            </h4>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
              {getImgText('clickInstant') || "Instant"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'fast', emoji: '⚡', name: xt.presetTiny, sub: xt.presetTinySub, color: 'hover:border-amber-400 hover:bg-amber-50/5' },
              { id: 'recommended', emoji: '⭐', name: xt.presetStandard, sub: xt.presetStandardSub, color: 'hover:border-emerald-400 hover:bg-emerald-50/5' },
              { id: 'high', emoji: '💎', name: xt.presetMax, sub: xt.presetMaxSub, color: 'hover:border-blue-400 hover:bg-blue-50/5' }
            ].map((p) => {
              const isActive = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id as any)}
                  className={`flex flex-col items-center justify-between p-2.5 min-h-[90px] rounded-xl border text-center transition-all cursor-pointer ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50/25 dark:bg-indigo-950/20 ring-2 ring-indigo-500/15 shadow-2xs scale-[1.01]'
                      : `border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40 ${p.color}`
                  }`}
                  id={`macro-preset-${p.id}-button`}
                >
                  <span className="text-base pb-1">{p.emoji}</span>
                  <div className="flex flex-col w-full text-center leading-none mt-1">
                    <span className="text-[10px] font-bold text-gray-800 dark:text-zinc-300">
                      {p.name}
                    </span>
                    <span className="text-[8.5px] text-gray-400 dark:text-zinc-500 leading-relaxed pt-1.5 font-medium">
                      {p.sub}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Advanced Fine-Tuning Keys Drawer Control */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-3xs text-left">
          <button
            onClick={() => setIsAdvancedOpen(o => !o)}
            className="w-full flex items-center justify-between p-4.5 font-extrabold text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
            id="toggle-advanced-configs-button"
          >
            <span className="flex items-center gap-1.5">
              <Settings className={`w-4 h-4 text-indigo-550 ${isAdvancedOpen ? 'animate-spin' : ''}`} />
              <span>{tFastPresetsHeader}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10.5px] font-bold text-gray-400 bg-gray-100 dark:bg-zinc-850 px-2 py-0.5 rounded">
                {isAdvancedOpen ? (getImgText('collapseText') || "Collapse") : (getImgText('detailsText') || "Details")}
              </span>
              {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          <AnimatePresence>
            {isAdvancedOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="p-5 border-t border-gray-100 dark:border-zinc-800 space-y-5 bg-gray-50/20"
              >
                {/* 1. Manual Quality Slider */}
                {showQualitySlider && (
                  <div className="space-y-3 text-left">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-gray-700 dark:text-zinc-200 font-extrabold">
                        {getImgText('qualityScaleText') || "Manual Quality Scale"}
                      </span>
                      <span className={`font-mono text-[10.5px] font-extrabold px-1.5 py-0.5 rounded ${
                        options.quality < 0.45 
                          ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' 
                          : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                      }`}>
                        {Math.round(options.quality * 100)}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0.10"
                      max="1.00"
                      step="0.01"
                      value={options.quality}
                      onChange={(e) => {
                        setOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }));
                        setActivePreset('custom');
                      }}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-zinc-850 accent-indigo-600"
                    />
                    <div className="flex items-center justify-between text-[8px] font-bold font-mono text-gray-400">
                      <span>{getImgText('lowQualityText') || "Low quality"}</span>
                      <span>{getImgText('recommendedText') || "Recommended ★"}</span>
                      <span>{getImgText('highQualityText') || "High quality"}</span>
                    </div>
                  </div>
                )}

                {/* 2. Resize Mode selector */}
                <div className="space-y-3.5 border-t border-gray-100/60 dark:border-zinc-800/60 pt-4 text-left">
                  <span className="text-xs font-extrabold text-gray-800 dark:text-zinc-200 block">
                    {xt.resizeTitle}
                  </span>

                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'none', label: getImgText('originalWidthText') || 'Original width' },
                      { id: 'width', label: getImgText('setWidthText') || 'Set fixed Width' },
                      { id: 'percent', label: getImgText('percentScaleText') || 'Percentage Scale' }
                    ].map((modeItem) => {
                      const isActive = options.resizeMode === modeItem.id;
                      return (
                        <button
                          key={modeItem.id}
                          onClick={() => {
                            setOptions(prev => ({
                              ...prev,
                              resizeMode: modeItem.id as any,
                              resizeValue: modeItem.id === 'width' ? 1080 : modeItem.id === 'percent' ? 80 : 100
                            }));
                            setActivePreset('custom');
                          }}
                          className={`py-2 px-3 rounded-lg border text-center text-[10.5px] font-semibold transition-all cursor-pointer ${
                            isActive
                              ? 'border-indigo-500 bg-indigo-50/20 text-indigo-600 dark:border-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                              : 'border-gray-105 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-500'
                          }`}
                        >
                          {modeItem.label}
                        </button>
                      );
                    })}
                  </div>

                  {options.resizeMode !== 'none' && (
                    <div className="pt-2 bg-white dark:bg-zinc-950 p-3.5 rounded-xl border border-gray-100 dark:border-zinc-850 space-y-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-gray-400 block leading-none">
                        {options.resizeMode === 'width' ? xt.resizePixelVal : xt.resizeScalePercent}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={options.resizeValue || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setOptions(prev => ({ ...prev, resizeValue: val }));
                            setActivePreset('custom');
                          }}
                          min="1"
                          max="9999"
                          className="w-full text-xs font-mono font-bold bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 text-gray-800 dark:text-zinc-100"
                        />
                        <span className="text-xs font-mono font-bold text-gray-400 shrink-0">
                          {options.resizeMode === 'width' ? 'px' : '%'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Output Format selector */}
                <div className="space-y-3.5 border-t border-gray-100/60 dark:border-zinc-800/60 pt-4 text-left">
                  <span className="text-xs font-extrabold text-gray-800 dark:text-zinc-200 block">
                    {getImgText('forceOutputFormatText') || "Force output format"}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'webp', title: 'WebP', desc: { ko: '차세대 고대용량 웹 포맷', ja: '次世代Web形式', zh: '新型网络图像格式', es: 'Formato web moderno', fr: 'Format web moderne', de: 'Modernes Webformat' }[lang] || 'Modern Web' },
                      { id: 'png', title: 'PNG', desc: { ko: '무손실 알파 보존', ja: '可逆圧縮・透過対応', zh: '无损透明通道', es: 'Compresión sin pérdidas', fr: 'Sans perte et canal alpha', de: 'Verlustfreie Kompression' }[lang] || 'Lossless' },
                      { id: 'jpeg', title: 'JPEG', desc: { ko: '초강력 호환 레거시', ja: '互換性重視の標準形式', zh: '经典通用格式', es: 'Alta compatibilidad', fr: 'Haute compatibilité', de: 'Maximale Kompatibilität' }[lang] || 'High compatibility' }
                    ].map((fmtItem) => {
                      const isSelected = options.format === fmtItem.id;
                      return (
                        <button
                          key={fmtItem.id}
                          onClick={() => {
                            setOptions(prev => ({ ...prev, format: fmtItem.id as any }));
                            setActivePreset('custom');
                          }}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50/20 text-indigo-600 dark:border-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                              : 'border-gray-105 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-505'
                          }`}
                        >
                          <span className="text-[11px] font-extrabold">{fmtItem.title}</span>
                          <span className="text-[8.5px] text-gray-400 leading-none pt-1">{fmtItem.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Crop aspect ratio */}
                <div className="space-y-3 pt-4 border-t border-gray-100/60 dark:border-zinc-800/60 text-left">
                  <span className="text-xs font-extrabold text-gray-800 dark:text-zinc-200 block">
                    {getImgText('cropBoundariesText') || "Crop boundaries"}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'none', label: xt.cropNone || 'No Crop' },
                      { id: '1:1', label: xt.cropInstaFeed || 'Square 1:1' },
                      { id: '9:16', label: xt.cropInstaStory || 'Vertical 9:16' },
                      { id: '16:9', label: xt.cropYtThumb || 'Widescreen 16:9' }
                    ].map((cropItem) => {
                      const isSelected = options.cropAspectRatio === cropItem.id;
                      return (
                        <button
                          key={cropItem.id}
                          onClick={() => {
                            setOptions(prev => ({ ...prev, cropAspectRatio: cropItem.id as any }));
                            setActivePreset('custom');
                          }}
                          className={`py-2 px-2 rounded-lg border text-center text-[10.5px] font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50/20 text-indigo-600 dark:border-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                              : 'border-gray-105 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-500'
                          }`}
                        >
                          {cropItem.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Legacy BMP notice */}
                <div className="flex items-center justify-between border-t border-gray-100/50 dark:border-zinc-800/50 pt-3.5 mt-3 text-[10.5px]">
                  <span className="text-gray-400 font-semibold flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{xt.isBmpFormat || "Need bitmap raw formats?"}</span>
                  </span>
                  <select
                    value={options.format === 'bmp' ? 'bmp' : ''}
                    onChange={(e) => {
                      if (e.target.value === 'bmp') {
                        setOptions(prev => ({ ...prev, format: 'bmp' }));
                        setActivePreset('custom');
                      }
                    }}
                    className="bg-white dark:bg-zinc-950 border border-gray-150 rounded px-1.5 py-1 text-[10px] font-bold"
                  >
                    <option value="">{xt.selectOption || "No"}</option>
                    <option value="bmp">BMP (Raw)</option>
                  </select>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section 5: Step Tracker roadmap */}
        <div className="bg-gradient-to-br from-blue-500/5 to-indigo-600/5 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100/25 dark:border-blue-900/10 rounded-3xl p-5 shadow-xs text-left">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-100/25 dark:border-blue-900/10">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
              {tRoadmapTitle}
            </span>
            <span className="text-[10px] font-semibold text-gray-400 font-mono">
              {files.length > 0 ? tProgressLabel : tWaitingLabel}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`flex items-center justify-center w-5.5 h-5.5 rounded-full shrink-0 text-[10.5px] font-bold transition-all ${
                files.length > 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {files.length > 0 ? '✓' : '1'}
              </div>
              <div className="flex flex-col text-left">
                <span className={`text-xs font-bold leading-tight ${files.length > 0 ? 'text-gray-950 dark:text-zinc-100 font-extrabold' : 'text-gray-450'}`}>
                  {xt.step1Title}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-550 pt-0.5 leading-normal">
                  {files.length > 0 ? xt.step1DescCompleted.replace('{count}', files.length.toString()) : xt.step1DescWaiting}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`flex items-center justify-center w-5.5 h-5.5 rounded-full shrink-0 text-[10.5px] font-bold transition-all ${
                files.length > 0 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                2
              </div>
              <div className="flex flex-col text-left">
                <span className={`text-xs font-bold leading-tight ${files.length > 0 ? 'text-gray-950 dark:text-zinc-100 font-extrabold' : 'text-gray-450'}`}>
                  {xt.step2Title}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-550 pt-0.5 leading-normal">
                  {files.length > 0 
                    ? xt.step2Desc.replace('{format}', options.format.toUpperCase()).replace('{preset}', activePreset.toUpperCase())
                    : xt.step1DescWaiting
                  }
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`flex items-center justify-center w-5.5 h-5.5 rounded-full shrink-0 text-[10.5px] font-bold transition-all ${
                files.some(f => f.status === 'completed') ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {files.some(f => f.status === 'completed') ? '✓' : '3'}
              </div>
              <div className="flex flex-col text-left">
                <span className={`text-xs font-bold leading-tight ${files.some(f => f.status === 'completed') ? 'text-gray-950 dark:text-zinc-100 font-extrabold' : 'text-gray-450'}`}>
                  {xt.step3Title}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-555 pt-0.5 leading-normal">
                  {files.some(f => f.status === 'completed') ? xt.step3Completed : xt.step3Incomplete}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
