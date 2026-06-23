import React from 'react';
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

  const hubTranslations: Record<string, Record<string, string | string[]>> = {
    badge: {
      ko: '100% 브라우저 처리 · 파일 미전송',
      en: '100% In-Browser · Zero Upload',
      ja: '100% ブラウザ処理 · ファイル送信なし',
      zh: '100% 浏览器本地处理 · 无文件上传',
      es: '100% en navegador · Cero subidas',
      fr: '100% dans le navigateur · Aucun envoi',
      de: '100% im Browser · Kein Datei-Upload',
      vi: '100% trên trình duyệt · Không tải lên máy chủ',
      hi: '100% ब्राउज़र प्रोसेसिंग · कोई फ़ाइल अपलोड नहीं',
      ar: 'معالجة بنسبة 100٪ في المتصفح · بدون رفع ملفات',
      pt: '100% no navegador · Sem upload de arquivos',
      it: '100% nel browser · Nessun caricamento di file',
      ru: '100% в браузере · Без загрузки на сервер',
    },
    heroTitle: {
      ko: '파일 작업, 이제 한 곳에서',
      en: 'One tool for every file',
      ja: 'ファイル作業を、これ一つで',
      zh: '所有文件，一个工具搞定',
      es: 'Una herramienta para cada archivo',
      fr: 'Un outil pour chaque fichier',
      de: 'Ein Tool für jede Datei',
      vi: 'Một công cụ cho mọi loại tệp',
      hi: 'हर फ़ाइल के लिए एक उपकरण',
      ar: 'أداة واحدة لكل ملف',
      pt: 'Uma ferramenta para cada arquivo',
      it: 'Uno strumento per ogni file',
      ru: 'Один инструмент для любого файла',
    },
    heroSub: {
      ko: '이미지 압축부터 문서 변환까지. 서버에 파일을 보내지 않고 브라우저에서 바로 처리합니다.',
      en: 'From image compression to document conversion. Everything runs locally in your browser.',
      ja: '画像圧縮からドキュメント変換まで。サーバーにファイルを送信せず、ブラウザ内のみで直接処理されます。',
      zh: '从图像压缩到文档转换。无需将文件上传到服务器，直接在浏览器中本地处理。',
      es: 'Desde compresión de imágenes hasta conversión de documentos. Todo funciona localmente en tu navegador sin subir archivos.',
      fr: 'De la compression d\'images à la conversion de documents. Tout est traité localement dans votre navigateur.',
      de: 'Von der Bildkomprimierung bis zur Dokumentenkonvertierung. Alles wird lokal in Ihrem Browser verarbeitet.',
      vi: 'Từ nén hình ảnh đến chuyển đổi tài liệu. Mọi thứ được xử lý cục bộ ngay trên trình duyệt của bạn.',
      hi: 'छवि संपीड़न से लेकर दस्तावेज़ रूपांतरण तक। सब कुछ आपके ब्राउज़र में सुरक्षित रूप से चलता है।',
      ar: 'من ضغط الصور إلى تحويل المستندات. كل شيء يتم تشغيله محلياً مباشرة في متصفحك دون إرسال ملفات.',
      pt: 'Da compressão de imagens à conversão de documentos. Tudo funciona localmente no seu navegador.',
      it: 'Dalla compressione delle immagini alla conversione dei documenti. Tutto viene elaborato localmente nel tuo browser.',
      ru: 'От сжатия изображений до конвертации документов. Все обрабатывается локально в вашем браузере.',
    },
    imageCardTitle: {
      ko: '이미지 압축 & 변환',
      en: 'Image Compress & Convert',
      ja: '画像圧縮・変換',
      zh: '图片压缩与转换',
      es: 'Comprimir y convertir imágenes',
      fr: 'Compression & Conversion d\'images',
      de: 'Bildkomprimierung & Konvertierung',
      vi: 'Nén & Chuyển đổi hình ảnh',
      hi: 'छवि संपीड़न और रूपांतरण',
      ar: 'ضغط وتحويل الصور',
      pt: 'Compressão e conversão de imagens',
      it: 'Compressione e conversione immagini',
      ru: 'Сжатие и конвертация изображений',
    },
    imageCardSub: {
      ko: 'WebP 변환, 무손실 압축, 썸네일 자동 규격',
      en: 'WebP conversion, lossless compress, thumbnail presets',
      ja: 'WebP変換、ロスレス圧縮、サムネイル自動サイズ調整',
      zh: 'WebP 转换、无损压缩、社交媒体缩略图自动裁剪',
      es: 'Conversión WebP, compresión sin pérdidas, ajustes para miniaturas',
      fr: 'Conversion WebP, compression sans perte, formats de miniatures',
      de: 'WebP-Konvertierung, verlustfreie Komprimierung, Thumbnail-Vorgaben',
      vi: 'Chuyển đổi WebP, nén không hao hụt, kích thước thu nhỏ tự động',
      hi: 'वेबपी रूपांतरण, दोषरहित संपीड़न, थंबनेल प्रीसेट',
      ar: 'تحويل WebP، وتحسين دون خسارة الجودة، وإعدادات معينة للمصغرات',
      pt: 'Conversão WebP, compressão sem perdas, predefinições de miniatura',
      it: 'Conversione WebP, compressione lossless, preset per miniature',
      ru: 'Конвертация в WebP, сжатие без потерь, шаблоны миниатюр',
    },
    imageFeatures: {
      ko: ['WebP · PNG · JPEG 자동 변환', '무손실 압축 슬라이더', '인스타·블로그 썸네일 규격', '일괄 최대 20파일 처리'],
      en: ['WebP · PNG · JPEG conversion', 'Lossless compression slider', 'Instagram & blog thumbnail presets', 'Batch up to 20 files'],
      ja: ['WebP・PNG・JPEGの自動相互変換', 'リアルタイム画質比較スライダー', 'SNS・ブログ専用サムネイル規格', '最大20ファイルの同時一括処理'],
      zh: ['WebP · PNG · JPEG 自动相互转换', '超清无损像素级滑动对比游标', 'Instagram 与博客缩略图尺寸预设', '支持多达 20 个文件一键批量处理'],
      es: ['Conversión automática WebP · PNG · JPEG', 'Slider de comparación de calidad en vivo', 'Ajustes de tamaño para Instagram y blogs', 'Procese hasta 20 archivos a la vez'],
      fr: ['Conversion automatique WebP · PNG · JPEG', 'Comparateur visuel de qualité en direct', 'Préréglages de taille Instagram et blogs', 'Traitement par lot jusqu\'à 20 fichiers'],
      de: ['Automatische WebP · PNG · JPEG Konvertierung', 'Echtzeit-Vergleichs-Schieberegler', 'Preset-Größen für Instagram & Blogs', 'Stapelverarbeitung von bis zu 20 Dateien'],
      vi: ['Tự động chuyển đổi WebP · PNG · JPEG', 'Trượt so sánh chất lượng ảnh trực quan', 'Cấu hình sẵn mạng xã hội & blog', 'Xử lý loạt tối đa lên đến 20 tệp'],
      hi: ['वेबपी · पीएनजी · जेपीईजी ऑटो रूपांतरण', 'दोषरहित संपीड़न स्लाइडर तुलना', 'इंस्टाग्राम और ब्लॉग थंबनेल प्रीसेट', 'एक साथ 20 फाइलों का बैच प्रोसेसिंग'],
      ar: ['تحويل تلقائي بين WebP · PNG · JPEG', 'لوحة مقارنة الجودة في الوقت الحقيقي', 'إعدادات مخصصة لمقاسات إنستغرام والمدونات', 'دعم معالجة الدفعة حتى 20 ملفاً دفعة واحدة'],
      pt: ['Conversão automática WebP · PNG · JPEG', 'Controle deslizante de comparação em tempo real', 'Formatos para Instagram e miniaturas de blog', 'Processamento em lote para até 20 arquivos'],
      it: ['Conversione automatica WebP · PNG · JPEG', 'Slider di confronto lossless in tempo reale', 'Formati immagine per Instagram e blog', 'Elaborazione in batch fino a 20 file'],
      ru: ['Автоконвертация WebP · PNG · JPEG', 'Интерактивный слайдер качества', 'Готовые шаблоны для Instagram и блогов', 'Пакетная обработка до 20 файлов'],
    },
    docCardTitle: {
      ko: 'PDF 스튜디오',
      en: 'PDF Studio',
      ja: 'PDF スタジオ',
      zh: 'PDF 工作室',
      es: 'PDF Studio',
      fr: 'Studio PDF',
      de: 'PDF Studio',
      vi: 'Studio PDF',
      hi: 'पीडीएफ स्टूडियो',
      ar: 'استوديو PDF',
      pt: 'Estúdio PDF',
      it: 'Studio PDF',
      ru: 'PDF Студия',
    },
    docCardSub: {
      ko: 'PDF 병합·분할, 서명 날인, 이미지 변환 및 안전한 클라우드 전송',
      en: 'PDF merge/split, signature stamps, image conversion & cloud sharing',
      ja: 'PDF結合・分割、電子署名・捺印、画像変換、安全なクラウド共有',
      zh: 'PDF 合并与拆分、手写字体数字签名与盖章、图片转换及云同步',
      es: 'Fusión/división de PDF, firmas digitales, conversión de imágenes y nube',
      fr: 'Fusion/division de PDF, signatures & cachets, conversion d\'images & partage',
      de: 'PDFs zusammenführen/teilen, digitale Signaturen, Bildkonvertierung & Cloud',
      vi: 'Ghép và tách PDF, ký tên đóng dấu số, chuyển đổi ảnh và chia sẻ đám mây',
      hi: 'पीडीएफ मर्ज/विभाजन, हस्ताक्षर स्टांप, छवि रूपांतरण और क्लाउड साझाकरण',
      ar: 'دمج وتقسيم ملفات PDF، التوقيع الرقمي والختم الإلكتروني، وتحويل الصور والمشاركة السحابية',
      pt: 'Mesclar/dividir PDF, assinaturas digitais, conversão de imagens e nuvem',
      it: 'Unione/divisione PDF, firma digitale, conversione immagini e sincronizzazione cloud',
      ru: 'Объединение и разделение PDF, подпись страниц, конвертация и отправка в облако',
    },
    docFeatures: {
      ko: ['PDF 병합·분할·페이지 추출', '이미지 ➔ PDF 변환', '마우스/폰트 서명 및 오프라인 날인', '구글 드라이브 sync 및 SNS 간편 공유'],
      en: ['PDF merge, split & extract', 'Image ➔ PDF conversion', 'Mouse/Font signature & alignment', 'Google Drive sync & SNS share'],
      ja: ['PDF結合・分割・特定のページ抽出', '各種画像からPDFドキュメントへの一括変換', 'マウス描画・フォント署名とオフライン押印', 'Google Drive連携およびSNS簡単共有'],
      zh: ['PDF 自由合并、细粒度拆分与页面抽取', '多张图片（PNG/JPG/WebP）转 PDF', '手写鼠标绘制及字体签名、离线盖章', '谷歌云盘同步以及社交媒体轻量级一键分享'],
      es: ['Fusión, división y extracción de páginas PDF', 'Conversión directa de imágenes a PDF', 'Firma con ratón/fuente y sello digital', 'Sincronización con Google Drive y compartir'],
      fr: ['Fusion, division et extraction de pages PDF', 'Conversion directe d\'images en PDF', 'Signature dessinée/tapée & tampons de cachets', 'Sincronisation Google Drive et partage rapide'],
      de: ['PDF-Zusammenführung, Aufteilung & Extraktion', 'Direkte Bild-zu-PDF-Konvertierung', 'Maus-/Schriftart-Signatur & Stempel', 'Google Drive-Synchronisierung & Teilen'],
      vi: ['Ghép, tách và trích xuất trang từ PDF', 'Chuyển đổi trực tiếp hình ảnh sang PDF', 'Ký chuột/Ký phông chữ và đóng dấu ngoại tuyến', 'Đồng bộ Google Drive và chia sẻ mạng xã hội'],
      hi: ['पीडीएफ मर्ज, विभाजन और पेज निकालना', 'छवि से पीडीएफ में त्वरित रूपांतरण', 'माउस खींचकर या फ़ॉन्ट द्वारा हस्ताक्षर और सील', 'गूगल ड्राइव सिंक और आसान सोशल शेयरिंग'],
      ar: ['دمج وتقسيم واستخراج صفحات PDF بدقة عالية', 'تحويل فوري وشامل لعدة صور إلى مستند PDF واحد', 'التوقيع برسم الماوس أو بالخطوط والختم الإلكتروني', 'مزامنة مع غوغل درايف ومشاركة سهلة ومباشرة عبر الإنترنت'],
      pt: ['Mesclagem, divisão e extração de páginas PDF', 'Conversão direta de imagens para PDF', 'Assinatura com mouse/fonte e selos digitais', 'Sincronização com Google Drive e compartilhamento'],
      it: ['Unione, divisione ed estrazione pagine PDF', 'Conversione diretta delle immagini in PDF', 'Firma tracciata a mano/testo e timbri analogici', 'Sincronizzazione Google Drive e condivisione social'],
      ru: ['Объединение, разделение и извлечение страниц PDF', 'Быстрая конвертация фотографий в PDF-буклет', 'Электронная подпись от руки/печатью и штампами', 'Синхронизация с Google Диском и отправка в соцсети'],
    },
    ctaLabel: {
      ko: '바로 시작하기',
      en: 'Start Now',
      ja: '今すぐ開始',
      zh: '立即体验',
      es: 'Comenzar ahora',
      fr: 'Démarrer',
      de: 'Jetzt starten',
      vi: 'Bắt đầu ngay',
      hi: 'अभी शुरू करें',
      ar: 'ابدأ الآن',
      pt: 'Começar agora',
      it: 'Inizia ora',
      ru: 'Начать сейчас',
    },
    featureTitle: {
      ko: '왜 BigGrids인가?',
      en: 'Why BigGrids?',
      ja: 'BigGridsを選ぶ理由',
      zh: '为什么选择 BigGrids？',
      es: '¿Por qué elegir BigGrids?',
      fr: 'Pourquoi BigGrids ?',
      de: 'Warum BigGrids?',
      vi: 'Tại sao nên chọn BigGrids?',
      hi: 'BigGrids ही क्यों?',
      ar: 'لماذا تختار BigGrids؟',
      pt: 'Por que usar o BigGrids?',
      it: 'Perché scegliere BigGrids?',
      ru: 'Почему BigGrids?',
    },
    pillar_privacy_title: {
      ko: '완전 보안',
      en: 'Full Privacy',
      ja: '抜群の安全性',
      zh: '重隐私与安全',
      es: 'Privacidad total',
      fr: 'Sécurité totale',
      de: 'Voller Datenschutz',
      vi: 'Bảo mật tuyệt đối',
      hi: 'पूर्ण गोपनीयता',
      ar: 'خصوصية وأمان كامل',
      pt: 'Privacidade total',
      it: 'Privacy totale',
      ru: 'Полная приватность',
    },
    pillar_privacy_desc: {
      ko: '파일이 서버로 전송되지 않아 완전히 안전합니다.',
      en: 'Files never leave your device.',
      ja: 'ファイルがサーバーに送信されないので完全に安全です。',
      zh: '所有操作均在本地进行，文件永远不会上传 to 服务器。',
      es: 'Los archivos nunca abandonan su dispositivo.',
      fr: 'Vos fichiers ne quittent jamais votre machine.',
      de: 'Ihre Dateien verlassen niemals Ihr Gerät.',
      vi: 'Tệp tin không được gửi lên máy chủ nên hoàn toàn an toàn.',
      hi: 'फ़ाइलें कभी भी आपके डिवाइस से बाहर नहीं जाती हैं।',
      ar: 'ملفاتك ومعلوماتك لا تغادر جهازك أو متصفحك أبداً.',
      pt: 'Os arquivos nunca deixam o seu computador.',
      it: 'I file non lasciano mai il tuo dispositivo.',
      ru: 'Файлы не загружаются на сервер и обрабатываются локально.',
    },
    pillar_fast_title: {
      ko: '초고속 처리',
      en: 'Lightning Fast',
      ja: '超高速パフォーマンス',
      zh: '秒级极速响应',
      es: 'Ultra rápido',
      fr: 'Vitesse éclair',
      de: 'Blitzschnell',
      vi: 'Xử lý siêu tốc',
      hi: 'बिजली जैसी तेज गति',
      ar: 'سرعة برق فائقة',
      pt: 'Velocidade extrema',
      it: 'Velocità fulminea',
      ru: 'Мгновенная работа',
    },
    pillar_fast_desc: {
      ko: 'WebAssembly 기반 로컬 연산으로 대기 없이 즉시 변환.',
      en: 'WebAssembly-powered local processing.',
      ja: 'WebAssemblyを用いたローカル処理で、待ち時間のない高速変換。',
      zh: '基于 WebAssembly 的高频本地计算，瞬间完成转换，无需排队等待。',
      es: 'Procesamiento local ultrarrápido impulsado por WebAssembly.',
      fr: 'Calculs locaux optimisés pour une conversion immédiate.',
      de: 'WebAssembly-gestützte lokale Verarbeitung ohne Wartezeiten.',
      vi: 'Tính toán cục bộ dựa trên WebAssembly chuyển đổi ngay mà không cần chờ.',
      hi: 'WebAssembly द्वारा संचालित अत्यधिक तेज़ स्थानीय प्रसंस्करण।',
      ar: 'معالجة محلية مدعومة بتقنية WebAssembly فائقة السرعة.',
      pt: 'Processamento na sua máquina impulsionado por WebAssembly.',
      it: 'Elaborazione locale ultra-veloce basata su WebAssembly.',
      ru: 'Локальные расчеты с технологией WebAssembly без тайм-аутов.',
    },
    pillar_lang_title: {
      ko: '13개 언어 지원',
      en: '13 Languages',
      ja: '13言語に対応',
      zh: '支持 13 种常用语言',
      es: '13 idiomas',
      fr: '13 langues',
      de: '13 Sprachen',
      vi: 'Hỗ trợ 13 ngôn ngữ',
      hi: '13 भाषाओं का समर्थन',
      ar: 'دعم 13 لغة عالمية',
      pt: '13 idiomas',
      it: '13 lingue supportate',
      ru: 'Поддержка 13 языков',
    },
    pillar_lang_desc: {
      ko: '한국어·영어·일본어 포함 13개 언어를 지원합니다.',
      en: 'Korean, English, Japanese and more.',
      ja: '日本語、英語、韓国語を含む13のお好きな多言語を選択可能。',
      zh: '包含中文、英文、韩文、日文等 13 种热门国家语言切换。',
      es: 'Soporte completo para español, inglés, coreano y más.',
      fr: 'Disponible en français, anglais, coréen et bien d\'autres.',
      de: 'Deutsch, Englisch, Koreanisch und viele weitere Sprachen.',
      vi: 'Hỗ trợ tiếng Việt, tiếng Anh, tiếng Nhật, tiếng Hàn và các tiếng khác.',
      hi: 'हिन्दी, अंग्रेजी, कोरियाई और कई भाषाओं में उपलब्ध।',
      ar: 'دعم كامل ومبسط للغة العربية والإنجليزية ولغات أخرى.',
      pt: 'Suporte para português, inglês, coreano e outros.',
      it: 'Disponibile in italiano, inglese, coreano e altro ancora.',
      ru: 'Переведено на русский, английский, корейский и другие.',
    },
    pillar_batch_title: {
      ko: '20파일 일괄 처리',
      en: 'Batch 20 Files',
      ja: '一括20ファイル処理',
      zh: '20 个文件并行批量处理',
      es: 'Lote de 20 archivos',
      fr: '20 fichiers par lot',
      de: 'Stapelverarbeitung',
      vi: 'Xử lý loạt tối đa 20 tệp',
      hi: '20 फ़ाइलों का बैच',
      ar: 'معالجة 20 ملفاً دفعة واحدة',
      pt: 'Lote de até 20 arquivos',
      it: 'Elaborazione batch di 20 file',
      ru: 'Пакетная обработка 20 файлов',
    },
    pillar_batch_desc: {
      ko: '최대 20개 파일을 한 번에 변환·압축합니다.',
      en: 'Convert up to 20 files at once.',
      ja: '退屈な手作業にさよなら。最大20個のファイルを1回で一括圧縮・変換。',
      zh: '支持多达 20 个目标文件同时排队渲染、批量压缩和打包。',
      es: 'Convierta o comprima hasta 20 archivos de una sola vez.',
      fr: 'Convertissez ou compressez jusqu\'à 20 documents en un clic.',
      de: 'Konvertieren oder komprimieren Sie bis zu 20 Dateien gleichzeitig.',
      vi: 'Chuyển đổi hoặc nén tối đa 20 tập tin riêng lẻ chỉ trong một thao tác.',
      hi: 'एक ही बार में 20 से अधिक फाइलों को कनवर्ट या संपीड़ित करें.',
      ar: 'ضغط وتنظيم وتحويل ما يصل إلى 20 ملفًا مختلفًا في آن واحد.',
      pt: 'Converta ou comprima até 20 arquivos simultaneamente.',
      it: 'Converti o comprimi simultaneamente fino a 20 elementi.',
      ru: 'Конвертируйте или сжимайте до 20 файлов одновременно.',
    },
    about_label: {
      ko: '소개',
      en: 'About',
      ja: '当サービスについて',
      zh: '关于 BigGrids',
      es: 'Acerca de',
      fr: 'À propos',
      de: 'Über uns',
      vi: 'Giới thiệu',
      hi: 'हमारे बारे में',
      ar: 'حول الأداة',
      pt: 'Sobre nós',
      it: 'Chi siamo',
      ru: 'О сервисе',
    },
    privacy_label: {
      ko: '개인정보처리방침',
      en: 'Privacy',
      ja: 'プライバシーポリシー',
      zh: '隐私政策',
      es: 'Privacidad',
      fr: 'Confidentialité',
      de: 'Datenschutz',
      vi: 'Chính sách bảo mật',
      hi: 'गोपनीयता नीति',
      ar: 'سياسة الخصوصية',
      pt: 'Privacidade',
      it: 'Privacy',
      ru: 'Конфиденциальность',
    },
    contact_label: {
      ko: '문의',
      en: 'Contact',
      ja: 'お問い合わせ',
      zh: '联系我们',
      es: 'Contacto',
      fr: 'Contact',
      de: 'Kontakt',
      vi: 'Liên hệ',
      hi: 'संपर्क करें',
      ar: 'اتصل بنا',
      pt: 'Contato',
      it: 'Contatti',
      ru: 'Контакты',
    },
    footer_copyright: {
      ko: '© 2026 BigGrids. 모든 파일 처리는 서버 전송 없이 브라우저 내에서 안전하게 즉시 수행됩니다.',
      en: '© 2026 BigGrids. All file processing runs locally in your browser.',
      ja: '© 2026 BigGrids. すべての処理はサーバーを介さずブラウザ内で完全に完了します。',
      zh: '© 2026 BigGrids. 所有文件的全部压缩转换等流程均脱机在您本地的浏览器中安全运行。',
      es: '© 2026 BigGrids. Todo el procesamiento de archivos se realiza localmente en su navegador.',
      fr: '© 2026 BigGrids. L\'intégralité des traitements s\'exécute localement dans votre navigateur.',
      de: '© 2026 BigGrids. Alle Dateioperationen finden absolut sicher lokal in Ihrem Browser statt.',
      vi: '© 2026 BigGrids. Mọi hoạt động phân tích xử lý tệp diễn ra cục bộ, bảo mật ngay trên trình duyệt.',
      hi: '© 2026 BigGrids. सभी दस्तावेज ऑपरेशन्स आपके स्थानीय ब्राउज़र में पूरी तरह सुरक्षित सम्पन्न होते हैं।',
      ar: 'جميع الحقوق محفوظة © 2026 BigGrids. تتم جميع معالجة المستندات والتحويلات بشكل آمن تماماً داخل متصفحك دون اتصال.',
      pt: '© 2026 BigGrids. Todo o processamento de arquivos é realizado localmente no seu navegador.',
      it: '© 2026 BigGrids. Tutte le funzionalità di lavoro file vengono eseguite localmente nel tuo browser.',
      ru: '© 2026 BigGrids. Все операции с файлами происходят локально и безопасно в вашем браузере.',
    }
  };

  const getTranslation = (key: string): string => {
    const entry = hubTranslations[key];
    return (entry?.[language] as string) || (entry?.['en'] as string) || '';
  };

  const getTranslationArray = (key: string): string[] => {
    const entry = hubTranslations[key];
    return (entry?.[language] as string[]) || (entry?.['en'] as string[]) || [];
  };

  const imageFeatures = getTranslationArray('imageFeatures');
  const docFeatures = getTranslationArray('docFeatures');
  const badge = getTranslation('badge');
  const heroTitle = getTranslation('heroTitle');
  const heroSub = getTranslation('heroSub');
  const imageCardTitle = getTranslation('imageCardTitle');
  const imageCardSub = getTranslation('imageCardSub');
  const docCardTitle = getTranslation('docCardTitle');
  const docCardSub = getTranslation('docCardSub');
  const ctaLabel = getTranslation('ctaLabel');
  const featureTitle = getTranslation('featureTitle');

  const pillars = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: getTranslation('pillar_privacy_title'),
      desc: getTranslation('pillar_privacy_desc'),
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: getTranslation('pillar_fast_title'),
      desc: getTranslation('pillar_fast_desc'),
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: getTranslation('pillar_lang_title'),
      desc: getTranslation('pillar_lang_desc'),
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      icon: <Layers className="w-5 h-5" />,
      title: getTranslation('pillar_batch_title'),
      desc: getTranslation('pillar_batch_desc'),
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
                <defs>
                  <linearGradient id="hub-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="105%" stopColor="#5b21b6" />
                  </linearGradient>
                  <linearGradient id="hub-lightning-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#eab308" />
                  </linearGradient>
                </defs>
                <path d="M 50 8 C 72 8 88 18 88 18 C 88 48 76 78 50 93 C 24 78 12 48 12 18 C 12 18 28 8 50 8 Z" fill="url(#hub-shield-grad)" stroke="#ffffff" strokeWidth="2" />
                <path d="M 50 14 C 68 14 81.5 22.5 81.5 22.5 C 81.5 47.5 71.5 72.5 50 85 C 28.5 72.5 18.5 47.5 18.5 22.5 C 18.5 22.5 32 14 50 14 Z" fill="none" stroke="#c084fc" strokeWidth="1.5" strokeOpacity="0.4" />
                <path d="M 54 22 L 32 52 H 49 L 44 78 L 70 46 H 51 L 54 22 Z" fill="url(#hub-lightning-grad)" />
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
          <button onClick={() => navigate('/about')} className="hover:text-indigo-500 transition-colors">{getTranslation('about_label')}</button>
          <button onClick={() => navigate('/privacy')} className="hover:text-indigo-500 transition-colors">{getTranslation('privacy_label')}</button>
          <button onClick={() => navigate('/contact')} className="hover:text-indigo-500 transition-colors">{getTranslation('contact_label')}</button>
        </div>
        <p>{getTranslation('footer_copyright')}</p>
      </footer>
    </div>
  );
}
