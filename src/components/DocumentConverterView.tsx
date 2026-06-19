/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ProcessableFile, DocumentProcessingOptions } from '../types';
import {
  mergePDFs,
  splitPDF,
  convertImagesToPDF,
  convertExcelToCsv,
  convertCsvToExcel,
  convertTxtToPdf,
  extractMetadataText,
  signPDF,
  getPDFPageInfo,
  rotatePDF
} from '../utils/documentProcessor';
import {
  FileText,
  Settings,
  ArrowUp,
  ArrowDown,
  Play,
  Download,
  Trash2,
  Terminal,
  Activity,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  Scissors,
  FileImage,
  Search,
  Sparkles,
  PenTool,
  Share2,
  Mail,
  Cloud,
  Globe,
  Copy,
  Check,
  X,
  Upload,
  Minimize2,
  Table,
  Image,
  FileCode,
  CheckCircle,
  AlertCircle,
  Send,
  RotateCw,
  RotateCcw
} from 'lucide-react';
import { TranslationDict } from '../translations';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import { BENTO_TOOLS_TRANSLATIONS } from './DocumentConverterTranslations';

interface DocumentConverterViewProps {
  files: ProcessableFile[];
  onUpdateFile: (id: string, updates: Partial<ProcessableFile>) => void;
  onClear: () => void;
  t: TranslationDict;
  onLoadSampleFile?: (file: File) => void;
  onDeleteFile?: (id: string) => void;
  language?: string;
}

const NEW_DOC_TRANSLATIONS: Record<string, Record<string, string>> = {
  pdfRotationConsole: {
    ko: "PDF 회전 각도 제어 패널",
    en: "PDF Page Rotation Console",
    ja: "PDF回転角度制御パネル",
    zh: "PDF 旋转角度控制面板",
    es: "Panel de control de rotación de PDF",
    fr: "Console de rotation de page PDF",
    de: "PDF-Seitenrotationskonsole",
    vi: "Bảng điều khiển xoay trang PDF",
    hi: "PDF पेज रोटेशन कंसोल",
    ar: "وحدة التحكم في تدوير صفحات PDF",
    pt: "Consola de rotação de páginas PDF",
    it: "Console di rotazione delle pagine PDF",
    ru: "Панель управления поворотом страниц PDF"
  },
  rotateControlClick: {
    ko: "회전 방향 제어 (클릭하여 주기를 회전합니다)",
    en: "Rotate Orientation Control (Click to cycle rotation angle)",
    ja: "回転方向制御 (クリックして回転角度を切り替えます)",
    zh: "旋转方向控制（点击循环旋转角度）",
    es: "Control de orientación de rotación (Haga clic para ciclar el ángulo)",
    fr: "Contrôle de l'orientation de rotation (Cliquez pour faire défiler)",
    de: "Rotationsrichtung steuern (Klicken zum Durchwechseln)",
    vi: "Điều khiển hướng xoay (Nhấp để xoay vòng góc)",
    hi: "रोटेशन ओरिएंटेशन नियंत्रण (घूर्णन कोण को चक्रीय करने के लिए क्लिक करें)",
    ar: "التحكم في اتجاه الدوران (انقر لتدوير الزاوية)",
    pt: "Controlo de orientação de rotação (Clique para alternar o ângulo)",
    it: "Controllo dell'orientamento della rotazione (Clicca per scorrere l'angolo)",
    ru: "Управление направлением поворота (нажмите, чтобы изменить угол)"
  },
  rotateCcwTitle: {
    ko: "시계 반대 방향 회전",
    en: "Rotate Counter-Clockwise",
    ja: "反時計回りに回転",
    zh: "逆时针旋转",
    es: "Rotar en sentido antihorario",
    fr: "Tourner dans le sens antihoraire",
    de: "Gegen den Uhrzeigersinn drehen",
    vi: "Xoay ngược chiều kim đồng hồ",
    hi: "वाмаवर्त घुमाएं",
    ar: "تدوير عكس عقارب الساعة",
    pt: "Rodar no sentido anti-horário",
    it: "Ruota in senso antiorario",
    ru: "Повернуть против часовой стрелки"
  },
  rotateLeft: {
    ko: "왼쪽 회전",
    en: "Rotate Left",
    ja: "左回転",
    zh: "向左旋转",
    es: "Rotar a la izquierda",
    fr: "Tourner à gauche",
    de: "Nach links drehen",
    vi: "Xoay bên trái",
    hi: "बाएँ घुमाएँ",
    ar: "تدوير لليسار",
    pt: "Rodar para a esquerda",
    it: "Ruota a sinistra",
    ru: "Повернуть налево"
  },
  originalOrientation: {
    ko: "원본 방향",
    en: "Original",
    ja: "元方向",
    zh: "原方向",
    es: "Original",
    fr: "Original",
    de: "Original",
    vi: "Hướng gốc",
    hi: "मूल",
    ar: "أصلي",
    pt: "Original",
    it: "Originale",
    ru: "Оригинал"
  },
  rotatedAngle: {
    ko: "회전된 각도",
    en: "Rotated Angle",
    ja: "回転角度",
    zh: "旋转角度",
    es: "Ángulo rotado",
    fr: "Angle de rotation",
    de: "Rotierter Winkel",
    vi: "Góc đã xoay",
    hi: "घुमाया गया कोण",
    ar: "الزاوية المدورة",
    pt: "Ângulo rodado",
    it: "Angolo ruotato",
    ru: "Угол поворота"
  },
  rotateCwTitle: {
    ko: "시계 방향 회전",
    en: "Rotate Clockwise",
    ja: "時計回りに回転",
    zh: "顺时针旋转",
    es: "Rotar en sentido horario",
    fr: "Tourner dans le sens horaire",
    de: "Im Uhrzeigersinn drehen",
    vi: "Xoay theo chiều kim đồng hồ",
    hi: "दक्षिणावर्त घुमाएं",
    ar: "تدوير مع عقارب الساعة",
    pt: "Rodar no sentido horário",
    it: "Ruota in senso orario",
    ru: "Повернуть по часовой стрелке"
  },
  rotateRight: {
    ko: "오른쪽 회전",
    en: "Rotate Right",
    ja: "右回転",
    zh: "向右旋转",
    es: "Rotar a la derecha",
    fr: "Tourner à droite",
    de: "Nach rechts drehen",
    vi: "Xoay bên phải",
    hi: "दाएँ घुमाएँ",
    ar: "تدوير لليمين",
    pt: "Rodar para a direita",
    it: "Ruota a destra",
    ru: "Повернуть направо"
  },
  digitalSignatureStation: {
    ko: "전자 서명 패드 스타일 조정",
    en: "Digital Signature Design Station",
    ja: "電子署名デザインステーション",
    zh: "电子签名设计中心",
    es: "Estación de diseño de firma digital",
    fr: "Station de conception de signature numérique",
    de: "Design-Station für digitale Signaturen",
    vi: "Trạm thiết kế chữ ký điện tử",
    hi: "डिजिटल हस्ताक्षर डिज़ाइन स्टेशन",
    ar: "محطة تصميم التوقيع الرقمي",
    pt: "Estação de design de assinatura digital",
    it: "Stazione di design della firma digitale",
    ru: "Центр создания цифровой подписи"
  },
  signatureMethodCriteria: {
    ko: "서명 제작 방식 설정",
    en: "Signature Method Criteria",
    ja: "署名作成方法の設定",
    zh: "签名制作方法设置",
    es: "Criterios del método de firma",
    fr: "Méthode de signature",
    de: "Signaturmethode auswählen",
    vi: "Thiết lập phương thức ký",
    hi: "हस्ताक्षर विधि मानदंड",
    ar: "معايير طريقة التوقيع",
    pt: "Critérios de método de assinatura",
    it: "Metodo di firma",
    ru: "Способ создания подписи"
  },
  drawSignature: {
    ko: "직접 그리기",
    en: "Draw Signature",
    ja: "手書き署名",
    zh: "手写签名",
    es: "Dibujar firma",
    fr: "Dessiner la signature",
    de: "Signatur zeichnen",
    vi: "Vẽ chữ ký",
    hi: "हस्ताक्षर बनाएं",
    ar: "رسم التوقيع",
    pt: "Desenhar assinatura",
    it: "Disegna firma",
    ru: "Нарисовать подпись"
  },
  typeCursive: {
    ko: "이름 타이핑",
    en: "Type Cursive",
    ja: "名前を入力",
    zh: "输入姓名",
    es: "Escribir firma",
    fr: "Saisir la signature",
    de: "Signatur tippen",
    vi: "Nhập chữ ký",
    hi: "हस्ताक्षर टाइप करें",
    ar: "كتابة التوقيع",
    pt: "Digitar assinatura",
    it: "Digita firma",
    ru: "Ввести текст"
  },
  uploadPng: {
    ko: "서명 이미지",
    en: "Upload PNG",
    ja: "署名画像",
    zh: "上传签名",
    es: "Subir imagen",
    fr: "Téléverser PNG",
    de: "Bild hochladen",
    vi: "Tải ảnh chữ ký",
    hi: "हस्ताक्षर अपलोड करें",
    ar: "رفع صورة التوقيع",
    pt: "Carregar imagem",
    it: "Carica immagine",
    ru: "Загрузить изображение"
  },
  inkColor: {
    ko: "서명 잉크 색상:",
    en: "Ink Color:",
    ja: "インクの色:",
    zh: "墨水颜色:",
    es: "Color de tinta:",
    fr: "Couleur de l'encre :",
    de: "Tintenfarbe:",
    vi: "Màu mực chữ ký:",
    hi: "स्याही का रंग:",
    ar: "لون الحبر:",
    pt: "Cor da tinta:",
    it: "Colore dell'inchiostro:",
    ru: "Цвет чернил:"
  },
  drawBoardText: {
    ko: "아래 보드에 터치 또는 마우스로 서명하세요 (오른쪽 미리보기에 실시간 반영):",
    en: "Use mouse/touch below to sign (Live syncing to Right Sidebar):",
    ja: "以下のボードにタッチまたはマウスで署名してください (右側のプレビューにリアルタイム反映):",
    zh: "使用鼠标/触摸屏在下方签名（实时同步至右侧预览）：",
    es: "Use el mouse o toque abajo para firmar (Sincronización en vivo con la barra lateral derecha):",
    fr: "Utilisez la souris/le tactile ci-dessous pour signer (Synchronisation en temps réel) :",
    de: "Zeichnen Sie Ihre Signatur mit der Maus/Touchpad (Live-Synchronisation rechts):",
    vi: "Sử dụng chuột/cảm ứng phía dưới để ký (Đồng bộ trực tiếp sang thanh bên phải):",
    hi: "हस्ताक्षर करने के लिए नीचे माउस/टच का उपयोग करें (दाहिनी ओर रीयल-टाइम समन्वयन):",
    ar: "استخدم الماوس/اللمس أدناه للتوقيع (مزامنة مباشرة في الوقت الفعلي):",
    pt: "Use o rato/toque abaixo para assinar (Sincronização em tempo real na barra lateral direita):",
    it: "Usa il mouse/touch qui sotto per firmare (Sincronizzazione in tempo reale a destra):",
    ru: "Нарисуйте подпись мышкой или на сенсорном экране (синхронизируется в реальном времени):"
  },
  clear: {
    ko: "비우기",
    en: "Clear",
    ja: "クリア",
    zh: "清除",
    es: "Limpiar",
    fr: "Effacer",
    de: "Löschen",
    vi: "Xóa sạch",
    hi: "साफ करें",
    ar: "مسح",
    pt: "Limpar",
    it: "Cancella",
    ru: "Очистить"
  },
  typeCursiveLabel: {
    ko: "서명자로 인쇄할 이름을 작성하세요:",
    en: "Type cursive signer label:",
    ja: "署名者として印刷する名前を入力してください:",
    zh: "输入作为签名者打印的姓名：",
    es: "Escriba el nombre del firmante:",
    fr: "Saisissez le nom du signataire :",
    de: "Geben Sie den Namen des Unterzeichners ein:",
    vi: "Nhập tên người ký để tạo chữ ký chữ viết tay:",
    hi: "हस्ताक्षरकर्ता का नाम टाइप करें:",
    ar: "اكتب اسم الموقع بالتوقيع:",
    pt: "Digite o nome do signatário:",
    it: "Digita il nome del firmatario:",
    ru: "Введите имя подписанта:"
  },
  typePlaceholder: {
    ko: "예: 홍길동 (입력시 필기체 미리보기 활성화)",
    en: "e.g. John Doe",
    ja: "例：山田太郎 (入力すると筆記体プレビューが有効になります)",
    zh: "例如：李四",
    es: "por ejemplo, Juan Pérez",
    fr: "ex. Jean Dupont",
    de: "z.B. Max Mustermann",
    vi: "Ví dụ: Nguyễn Văn A",
    hi: "उदा. जॉन डो",
    ar: "مثال: جون دو",
    pt: "ex: João Silva",
    it: "es. Mario Rossi",
    ru: "например, Иван Иванов"
  },
  cursiveFontPreset: {
    ko: "필기 폰트 선택",
    en: "Cursive Font Preset",
    ja: "手書きフォント選択",
    zh: "选择手写体艺术字",
    es: "Preajuste de fuente cursiva",
    fr: "Style de police cursive",
    de: "Art der Schreibschrift",
    vi: "Chọn phông chữ tay nghệ thuật",
    hi: "घसीट फ़ॉन्ट प्रीसेट",
    ar: "خطوط التوقيع الجاهزة",
    pt: "Predefinição de fonte cursiva",
    it: "Stile del carattere corsivo",
    ru: "Шрифт подписи"
  },
  loadStampImage: {
    ko: "투명 PNG 서명 이미지를 드래그 또는 셀렉트하세요:",
    en: "Load stamp image file:",
    ja: "透明なPNG署名画像をドラッグまたは選択してください:",
    zh: "拖拽或选择透明 PNG 签名图像：",
    es: "Cargue un archivo de imagen de firma PNG transparente:",
    fr: "Déposez une image de signature PNG transparente :",
    de: "Laden Sie ein transparentes PNG-Signaturbild hoch:",
    vi: "Kéo thả hoặc bấm chọn ảnh chữ ký PNG nền trong suốt:",
    hi: "पारदर्शी पीएनजी हस्ताक्षर छवि लोड करें:",
    ar: "قم بتحميل ملف صورة توقيع PNG شفافة:",
    pt: "Carregue um ficheiro de imagem de assinatura PNG transparente:",
    it: "Carica un file immagine di firma PNG trasparente:",
    ru: "Загрузите файл подписи на прозрачном фоне PNG:"
  },
  loadPngSignature: {
    ko: "PNG 이미지 업로드 (실시간 우측 연동)",
    en: "Load PNG Signature (Syncs Right Preview)",
    ja: "PNG画像をアップロード (右プレビュー同期)",
    zh: "上传 PNG 图像 (同步右侧预览)",
    es: "Subir firma PNG (Sincroniza previsualización)",
    fr: "Téléverser PNG (Aperçu en temps réel)",
    de: "PNG-Signatur hochladen (rechts synchronisiert)",
    vi: "Tải lên ảnh PNG (Đồng bộ sang bên phải)",
    hi: "पीएनजी हस्ताक्षर अपलोड करें (दाहिनी ओर समन्वय)",
    ar: "تحميل توقيع PNG (مزامنة المعاينة)",
    pt: "Carregar assinatura PNG (Sincroniza pré-visualização)",
    it: "Carica firma PNG (Sincronizza anteprima)",
    ru: "Загрузить PNG подпись (обновит превью справа)"
  },
  compileRunPdfTool: {
    ko: "선택한 PDF 도구 실행 및 완성본 컴파일",
    en: "Compile Complete (Run PDF Tool)",
    ja: "選択したPDFツールを実行して完了版を生成",
    zh: "执行选定的 PDF 工具并生成",
    es: "Ejecutar herramienta de PDF seleccionada",
    fr: "Exécuter l'outil PDF sélectionné",
    de: "Gewähltes PDF-Werkzeug anwenden",
    vi: "Tiến hành xử lý & Biên dịch tệp PDF",
    hi: "चयनित पीडीएफ टूल चलाएं और पूरा करें",
    ar: "تنفيذ أداة PDF المحددة وتجميعها",
    pt: "Executar ferramenta PDF selecionada",
    it: "Esegui lo strumento PDF selezionato",
    ru: "Выполнить выбранное действие"
  },
  completedAssetsQueue: {
    ko: "변환 완료본 리스트",
    en: "Completed Assets Queue",
    ja: "変換完了したファイル一覧",
    zh: "转换完成资产列表",
    es: "Lista de elementos completados",
    fr: "Liste des fichiers finalisés",
    de: "Liste fertiggestellter Dateien",
    vi: "Danh sách tệp đã xử lý xong",
    hi: "रुपांतरित फ़ाइलों की सूची",
    ar: "قائمة الملفات المكتملة",
    pt: "Lista de ficheiros concluídos",
    it: "Coda file completati",
    ru: "Список готовых файлов"
  },
  shareCloudBackup: {
    ko: "공유 및 클라우드 백업:",
    en: "Share / Cloud Backup:",
    ja: "共有とクラウドバックアップ:",
    zh: "共享与云端备份：",
    es: "Compartir y copia en la nube:",
    fr: "Partager / Cloud Backup :",
    de: "Teilen / Cloud-Backup:",
    vi: "Chia sẻ & Sao lưu đám mây:",
    hi: "साझा / क्लाउड बैकअप:",
    ar: "مشاركة / نسخ احتياطي سحابي:",
    pt: "Partilhar / Cópia de segurança na nuvem:",
    it: "Condividi / Backup su cloud:",
    ru: "Поделиться / Облако:"
  },
  googleDriveBackupSynchronization: {
    ko: "구글 드라이브 동기화 암호화 전송...",
    en: "Google Drive Backup Synchronization...",
    ja: "Googleドライブ同期暗号化転送...",
    zh: "Google 云端硬盘同步加密传输...",
    es: "Sincronizando copia en Google Drive...",
    fr: "Synchronisation cryptée Google Drive...",
    de: "Google Drive Backup-Synchronisation...",
    vi: "Đang sao lưu mã hóa lên Google Drive...",
    hi: "गूगल ड्राइव बैकअप सिंक्रनाइज़ेशन...",
    ar: "مزامنة النسخ الاحتياطي إلى Google Drive...",
    pt: "Sincronização de cópia de segurança Google Drive...",
    it: "Sincronizzazione di backup su Google Drive...",
    ru: "Синхронизация резервной копии Google Диска..."
  },
  downloadAllDocumentsZip: {
    ko: "변환 완료 문서 일괄 다운로드 (.zip)",
    en: "Download All documents as ZIP (.zip)",
    ja: "変換完了文書の一括ダウンロード (.zip)",
    zh: "打包下载转换完成的文档 (.zip)",
    es: "Descargar todos los documentos en ZIP (.zip)",
    fr: "Télécharger tous les documents en ZIP (.zip)",
    de: "Alle Dokumente als ZIP herunterladen (.zip)",
    vi: "Tải toàn bộ tài liệu dưới dạng ZIP (.zip)",
    hi: "सभी दस्तावेज़ ज़िप (.zip) के रूप में डाउनलोड करें",
    ar: "تنزيل جميع المستندات كملف ZIP (.zip)",
    pt: "Descarregar todos os documentos em ZIP (.zip)",
    it: "Scarica tutti i documenti in ZIP (.zip)",
    ru: "Скачать все файлы одним ZIP-архивом (.zip)"
  },
  documentWorkspaceQueue: {
    ko: "업로드된 파일 목록",
    en: "Document Workspace Queue",
    ja: "アップロードされたファイル一覧",
    zh: "已上传文件队列",
    es: "Cola de archivos subidos",
    fr: "Liste des fichiers déposés",
    de: "Dokumenten-Arbeitsliste",
    vi: "Hàng đợi tệp tài liệu đã tải lên",
    hi: "अपलोड की गई फ़ाइलों की सूची",
    ar: "قائمة الملفات المرفوعة",
    pt: "Lista de ficheiros carregados",
    it: "Coda di file caricati",
    ru: "Список загруженных файлов"
  },
  delete: {
    ko: "삭제",
    en: "Delete file",
    ja: "削除",
    zh: "删除",
    es: "Eliminar",
    fr: "Supprimer",
    de: "Löschen",
    vi: "Xóa",
    hi: "हटाएं",
    ar: "حذف",
    pt: "Eliminar",
    it: "Elimina",
    ru: "Удалить"
  },
  dndOrderItem: {
    ko: "정렬 조정",
    en: "DND order item",
    ja: "並べ替え",
    zh: "拖拽排序",
    es: "Arrastrar para ordenar",
    fr: "Glisser pour trier",
    de: "Ziehen zum Sortieren",
    vi: "Kéo thả để sắp xếp",
    hi: "क्रम समायोजित करें",
    ar: "سحب لترتيب العناصر",
    pt: "Arrastar para ordenar",
    it: "Trascina per ordinare",
    ru: "Перетащить для сортировки"
  },
  addMoreFiles: {
    ko: "파일 추가하기",
    en: "Add more files",
    ja: "ファイルを追加する",
    zh: "继续添加文件",
    es: "Añadir más archivos",
    fr: "Ajouter d'autres fichiers",
    de: "Mehr Dateien hinzufügen",
    vi: "Thêm tệp khác",
    hi: "और फ़ाइलें जोड़ें",
    ar: "إضافة المزيد من الملفات",
    pt: "Adicionar mais ficheiros",
    it: "Aggiungi altri file",
    ru: "Добавить еще файлы"
  },
  queueIsEmpty: {
    ko: "업로드 대기 중",
    en: "Queue is empty.",
    ja: "アップロード待機中",
    zh: "等待上传",
    es: "Esperando archivos",
    fr: "En attente de fichiers",
    de: "Warte auf Uploads",
    vi: "Đang chờ tải tệp lên",
    hi: "अपलोड की प्रतीक्षा की जा रही है",
    ar: "قيد انتظار الرفع",
    pt: "A aguardar carregamentos",
    it: "In attesa di caricamento",
    ru: "Ожидание загрузки файлов"
  },
  livePdfRotationPreview: {
    ko: "원본 문서 회전 실시간 미리보기",
    en: "Live PDF Rotation Preview",
    ja: "オリジナル文書回転のリアルタイムプレビュー",
    zh: "原始文档旋转实时预览",
    es: "Previsualización de rotación de PDF en tempo real",
    fr: "Aperçu en direct de la rotation du PDF",
    de: "Live-Vorschau der PDF-Seitenrotation",
    vi: "Xem trước xoay tệp PDF trực tiếp",
    hi: "रीयल-टाइम पीडीएफ रотेशन पूर्वावलोकन",
    ar: "معاينة مباشرة لتدوير ملف PDF",
    pt: "Pré-visualização de rotação de PDF em tempo real",
    it: "Anteprima della rotazione del PDF in tempo reale",
    ru: "Интерактивный просмотр поворота PDF"
  },
  livePdfSignPreview: {
    ko: "원본 문서 서명 날인 미리보기",
    en: "Live PDF Sign Preview",
    ja: "オリジナル文書デジタル署名のプレビュー",
    zh: "原始文档签名盖章预览",
    es: "Previsualización de firma de PDF en tiempo real",
    fr: "Aperçu en direct de la signature du PDF",
    de: "Live-Vorschau der PDF-Signatur",
    vi: "Xem trước đóng dấu chữ ký tệp PDF trực tiếp",
    hi: "रीयल-टाइम पीडीएफ हस्ताक्षर पूर्वावलोकन",
    ar: "معاينة مباشرة لتوقيع ملف PDF",
    pt: "Pré-visualização de assinatura de PDF em tempo real",
    it: "Anteprima della firma del PDF in tempo reale",
    ru: "Интерактивный просмотр подписи PDF"
  },
  pointAndTapUpdatePlacement: {
    ko: "문서 위를 클릭하여 서명 위치를 지정하세요",
    en: "Point and tap to update signature placement",
    ja: "ドキュメントの上をクリックして署名の位置を指定してください",
    zh: "点击文档以确定签名放置位置",
    es: "Haga clic en el documento para posicionar la firma",
    fr: "Cliquez sur le document pour placer votre signature",
    de: "Klicken Sie auf das Dokument, um die Signatur zu platzieren",
    vi: "Nhấp chuột lên tài liệu để đặt vị trí đóng dấu chữ ký",
    hi: "हस्ताक्षर की स्थिति निर्दिष्ट करने के लिए दस्तावेज़ पर क्लिक करें",
    ar: "انقر فوق المستند لتحديد موضع التوقيع",
    pt: "Clique no documento para posicionar a assinatura",
    it: "Clicca sul documento per posizionare la firma",
    ru: "Нажмите на документ, чтобы разместить подпись"
  },
  signHere: {
    ko: "🔒 서명 위치",
    en: "🔒 Sign Here",
    ja: "🔒 署名位置",
    zh: "🔒 签名位置",
    es: "🔒 Firmar aquí",
    fr: "🔒 Signer ici",
    de: "🔒 Hier unterschreiben",
    vi: "🔒 Vị trí chữ ký",
    hi: "🔒 यहाँ हस्ताक्षर करें",
    ar: "🔒 مكان التوقيع",
    pt: "🔒 Assinar aqui",
    it: "🔒 Firma qui",
    ru: "🔒 Место подписи"
  },
  clickToRelocateSignature: {
    ko: "💡 위 계약서 문서의 원하는 위치를 클릭하면 서명이 즉시 배치됩니다.",
    en: "💡 Click anywhere on the contract page to relocate your signature.",
    ja: "💡 上記の文書の任意の場所をクリックして、署名の位置を即時変更します。",
    zh: "💡 点击上方文档的任意位置即可重新定位您的签名。",
    es: "💡 Haga clic en cualquier lugar de la página del contrato para reubicar su firma.",
    fr: "💡 Cliquez n'importe où sur le document pour déplacer votre signature.",
    de: "💡 Klicken Sie auf das Dokument, um die Signaturnadel neu zu platzieren.",
    vi: "💡 Nhấp vào bất kỳ đâu trên trang tài liệu để đặt lại vị trí đóng dấu chữ ký.",
    hi: "💡 अपने हस्ताक्षर को स्थानांतरित करने के लिए अनुबंध दस्तावेज़ पर कहीं भी क्लिक करें।" ,
    ar: "💡 انقر فوق أي مكان في صفحة المستند لإعادة تحديد موضع التوقيع.",
    pt: "💡 Clique em qualquer lugar na página do contrato para mudar a sua assinatura de lugar.",
    it: "💡 Clicca in qualsiasi punto del documento per riposizionare la tua firma.",
    ru: "💡 Нажмите в любом месте на странице документа, чтобы перенести подпись."
  },
  stampPrintWidth: {
    ko: "서명 크기 가로 너비:",
    en: "Stamp Print Width:",
    ja: "署名の横幅:",
    zh: "签名横向轴大小：",
    es: "Ancho de impresión del sello:",
    fr: "Largeur du tampon :",
    de: "Größe der Signatur (Breite):",
    vi: "Kích thước bề rộng chữ ký:",
    hi: "हस्ताक्षर चौड़ाई आकार:",
    ar: "عرض طباعة الختم:",
    pt: "Largura de impressão do carimbo:",
    it: "Larghezza del timbro:",
    ru: "Ширина штампа подписи:"
  },
  embeddingSignature: {
    ko: "서명 결합 및 굽는 중...",
    en: "Embedding Signature...",
    ja: "署名を結合して焼き付け中...",
    zh: "正在将签名嵌入并烧录到 PDF 中...",
    es: "Incrustando firma en el documento...",
    fr: "Incrustation de la signature...",
    de: "Signatur wird eingebettet...",
    vi: "Đang tiến hành nhúng và đóng dấu chữ ký...",
    hi: "हस्ताक्षर एम्बेड किया जा रहा है...",
    ar: "جاري دمج التوقيع وتثبيته...",
    pt: "A incorporar assinatura no documento...",
    it: "Integrazione della firma in corso...",
    ru: "Встраивание подписи в файл..."
  },
  applyCompileSignedPdf: {
    ko: "⚡ 서명 완료본 파일 전송 및 결합",
    en: "⚡ Apply & Compile Signed PDF",
    ja: "⚡ 署名完了ファイルの結合と生成",
    zh: "⚡ 应用并生成已签名的 PDF",
    es: "⚡ Aplicar y compilar PDF firmado",
    fr: "⚡ Appliquer & compiler le PDF signé",
    de: "⚡ Angewendete Signatur in PDF einbrennen",
    vi: "⚡ Áp dụng & Nhúng chữ ký vào PDF",
    hi: "⚡ हस्ताक्षरित पीडीएफ लागू करें और पूरा करें",
    ar: "⚡ تطبيق وتجميع ملف PDF الموقع",
    pt: "⚡ Aplicar e compilar PDF assinado",
    it: "⚡ Applica e compila PDF firmato",
    ru: "⚡ Применить и сохранить подписанный PDF"
  },
  newSignedDocumentReady: {
    ko: "✓ 신규 서명 완료본",
    en: "✓ New Signed Document Ready",
    ja: "✓ 新規署名完了文書",
    zh: "✓ 新已签名文档已就绪",
    es: "✓ Nuevo documento firmado listo",
    fr: "✓ Nouveau document signé disponible",
    de: "✓ Neue signierte Datei fertig zur Ausgabe",
    vi: "✓ Tài liệu đã hoàn tất đóng chữ ký",
    hi: "✓ नया हस्ताक्षरित दस्तावेज़ तैयार है",
    ar: "✓ مستند موقع جديد جاهز",
    pt: "✓ Novo documento assinado pronto",
    it: "✓ Nuovo documento firmato pronto",
    ru: "✓ Готов новый подписанный документ"
  },
  downloadText: {
    ko: "다운로드",
    en: "Download",
    ja: "ダウンロード",
    zh: "下载",
    es: "Descargar",
    fr: "Télécharger",
    de: "Herunterladen",
    vi: "Tải xuống",
    hi: "डाउनलोड करें",
    ar: "تنزيل",
    pt: "Descarregar",
    it: "Scarica",
    ru: "Скачать"
  },
  noPdfUploadedForSign: {
    ko: "가공할 원본 PDF 계약서 파일을 왼쪽에 드롭하시거나 선택해 주세요.",
    en: "No PDF document uploaded. Add files on the left to begin signing.",
    ja: "加工するオリジナルPDF契約書ファイルを左側にドロップするか選択してください。",
    zh: "请在左侧拖拽或选择需要处理的原始 PDF 合同文件开始签名。",
    es: "No se ha subido ningún documento PDF. Guarde archivos a la izquierda para firmar.",
    fr: "Aucun document PDF chargé. Ajoutez des fichiers à gauche pour signer.",
    de: "Keine PDF-Datei hochgeladen. Platzieren Sie Dokumente links, um zu unterschreiben.",
    vi: "Chưa có tài liệu PDF nào. Hãy thả hoặc chọn tệp bên trái để tiến hành đóng dấu.",
    hi: "कोई पीडीएफ दस्तावेज़ अपलोड नहीं किया गया। हस्ताक्षर करने के लिए बाईं ओर फ़ाइलें जोड़ें।",
    ar: "لم يتم رفع أي مستند PDF. أضف ملفات على اليسار لبدء التوقيع.",
    pt: "Nenhum documento PDF carregado. Adicione ficheiros à esquerda para começar a assinar.",
    it: "Nessun documento PDF caricato. Aggiungi file a sinistra per iniziare a firmare.",
    ru: "Файл PDF не загружен. Загрузите файлы слева, чтобы начать подписание."
  },
  activeToolDashboard: {
    ko: "💡 활성 도구 간단 요약",
    en: "💡 Active Tool Dashboard",
    ja: "💡 有効ツールの概要",
    zh: "💡 活动工具信息面板",
    es: "💡 Panel del resumen de herramienta activa",
    fr: "💡 Tableau de bord de l'outil actif",
    de: "💡 Status der aktiven Werkzeuganwendung",
    vi: "💡 Bảng tổng quan công cụ hoạt động",
    hi: "💡 सक्रिय टूल डैशबोर्ड त्वरित सारांश",
    ar: "💡 ملخص الأداة النشطة",
    pt: "💡 Painel de resumo da ferramenta ativa",
    it: "💡 Pannello riassuntivo dello strumento attivo",
    ru: "💡 Панель активного инструмента"
  },
  sendSignedDocumentViaEmail: {
    ko: "완료 문서 이메일로 보안 전송",
    en: "Send Signed Document via Email",
    ja: "完了文書をメールで安全に送信",
    zh: "将已完成的文档通过电子邮件安全发送",
    es: "Enviar documento firmado por correo electrónico seguro",
    fr: "Envoyer le document signé par e-mail sécurisé",
    de: "Fertige Datei sicher per E-Mail versenden",
    vi: "Gửi tài liệu đã xử lý qua Email bảo mật",
    hi: "पूरा दस्तावेज़ ईमेल द्वारा सुरक्षित रूप से भेजें",
    ar: "إرسال المستند المكتمل عبر البريد الإلكتروني الآمن",
    pt: "Enviar documento assinado por e-mail seguro",
    it: "Invia il documento firmato via e-mail sicura",
    ru: "Отправить подписанный документ по защищенной эл. почте"
  },
  secureTransmissionInProgress: {
    ko: "보안 계정 이메일 전송 패키징...",
    en: "SECURE TRANSMISSION IN PROGRESS...",
    ja: "セキュアアカウントメール送信パッケージ処理중...",
    zh: "安全帐户电子邮件传输打包中...",
    es: "TRANSMISIÓN SEGURA EN CURSO...",
    fr: "TRANSMISSION SÉCURISÉE EN COURS...",
    de: "SICHERE ÜBERTRAGUNG LÄUFT...",
    vi: "ĐANG TIẾN HÀNH TRUYỀN TẢI BẢO MẬT...",
    hi: "सुरक्षित ट्रांसमिशन प्रगति पर है...",
    ar: "جاري حزم وإرسال البريد الإلكتروني الآمن...",
    pt: "TRANSMISSÃO SEGURA EM CURSO...",
    it: "TRASMISSIONE SICURA IN CORSO...",
    ru: "ИДЕТ ЗАЩИЩЕННАЯ ПЕРЕДАЧА..."
  },
  emailRelayInitted: {
    ko: "보안 SSL 메일 전송 릴레이 환경 초기화 완료.",
    en: "Encrypted SSL mail tunnel successfully established.",
    ja: "セキュアSSLメール送信リレー環境の初期化完了。",
    zh: "安全 SSL 邮件传输中继环境初始化完成。",
    es: "Túnel de correo SSL cifrado establecido con éxito.",
    fr: "Canal de messagerie SSL chiffré établi avec succès.",
    de: "Verschlüsselter SSL-E-Mailtunnel erfolgreich aufgebaut.",
    vi: "Khởi tạo thành công đường truyền gửi thư SSL bảo mật.",
    hi: "सुरक्षित एसएसएल मेल ट्रांसमिशन रिले सक्षम किया गया किया गया।",
    ar: "تم إنشاء نفق بريد SSL المفرد ونشره بنجاح.",
    pt: "Túnel de correio SSL cifrado estabelecido com sucesso.",
    it: "Tunnel di posta SSL crittografato stabilito con successo.",
    ru: "Защищенный SSL-канал передачи успешно установлен."
  },
  pdfMetadataVerified: {
    ko: "서명 완료 고화질 원본 계약서 메타데이터 서명 완료.",
    en: "Verifying digital stamp of compiled PDF metadata...",
    ja: "署名完了高画質オリジナル契約書メタデータの署名完了。",
    zh: "已完成签名的原始合同文件元数据签名验证过关。",
    es: "Verificando el sello digital de los metadatos de PDF compilados...",
    fr: "Sceau numérique des métadatas du PDF compilé vérifié avec succès...",
    de: "Digitale Signatur der PDF-Dateimetadaten verifiziert...",
    vi: "Mã hóa hoàn tất chữ ký siêu dữ liệu của tệp PDF gốc.",
    hi: "संकलित पीडीएफ मेटाडेटा के डिजिटल हस्ताक्षर को सत्यापित किया जा रहा है...",
    ar: "جاري التحقق من الختم الرقمي لملف التعريف المجمع...",
    pt: "Verificação do selo digital dos metadados de PDF compilados...",
    it: "Verifica del timbro digitale dei metadati PDF compilati...",
    ru: "Проверка метаданных созданного PDF файла..."
  },
  smtpStreamingInbox: {
    ko: "가상 SMTP 게이트웨이 인증 및 대기열 전송 시작...",
    en: "Streaming attachments to recipient SMTP inbox...",
    ja: "仮想SMTPゲートウェイ認証およびキュー送信開始...",
    zh: "虚拟 SMTP 网关验证以及发送队列启动...",
    es: "Iniciando autenticación en gateway SMTP y envío de adjuntos...",
    fr: "Transmission des pièces jointes vers la messagerie SMTP destinataire...",
    de: "Verbindung zum virtuellen SMTP-Gateway wird aufgebaut...",
    vi: "Đang tiến hành gửi tệp đính kèm qua cổng SMTP ảo...",
    hi: "वर्चुअल एसएमटीपी गेटवे प्रमाणीकरण और ट्रांसमिशन शुरू...",
    ar: "جاري المصادقة عبر بوابة SMTP وبث المرفقات...",
    pt: "A estabelecer ligação ao gateway SMTP virtual e envio de anexos...",
    it: "Inizializzazione autenticazione SMTP e invio allegati...",
    ru: "Аутентификация в SMTP-шлюзе и отправка вложений..."
  },
  successTlsDelivery: {
    ko: "이메일 딜리버리 전송 수신 확인 완료!",
    en: "Transmission delivered securely over TLS protocol!",
    ja: "メールデリバリー送信受信確認完了！",
    zh: "电子邮件发送成功 (基于 TLS 协议)！",
    es: "¡Transmisión entregada con éxito a través de TLS!",
    fr: "Transmission effectuée de manière sécurisée via TLS !",
    de: "Übertragung erfolgreich über TLS-Protokoll zugestellt!",
    vi: "Gửi Email thành công qua giao thức mã hóa TLS!",
    hi: "ईमेल डिलीवरी ट्रांसमिशन सुरक्षित रूप से पूरा किया गया!",
    ar: "تم تأكيد توصيل البريد الإلكتروني بنجاح عبر بروتوكول TLS!",
    pt: "Transmissão efetuada com sucesso através de protocolo TLS!",
    it: "Trasmissione della posta completata con successo tramite TLS!",
    ru: "Сообщение успешно доставлено по защищенному протоколу TLS!"
  },
  signedAttachment: {
    ko: "공인 서명 첨부 파일",
    en: "Cryptographically Signed PDF Attachment",
    ja: "公認署名添付ファイル",
    zh: "经认证的签名 PDF 附件",
    es: "Archivo PDF firmado criptográficamente adjunto",
    fr: "Document PDF signé numériquement en pièce jointe",
    de: "Kryptografisch signierter PDF-Anhang",
    vi: "Tệp đính kèm chữ ký đã được chứng thực",
    hi: "प्रमाणित हस्ताक्षरित पीडीएफ अटैचमेंट",
    ar: "مرفق مستند PDF معتمد وموقع رقميا",
    pt: "Ficheiro PDF assinado criptograficamente em anexo",
    it: "Allegato file PDF firmato crittograficamente",
    ru: "Зашифрованное вложение PDF с подписью"
  },
  recipientEmail: {
    ko: "수신인 이메일 주소 *",
    en: "Recipient Email Address *",
    ja: "受信者メールアドレス *",
    zh: "收件人电子邮件地址 *",
    es: "Correo electrónico del destinatario *",
    fr: "Adresse e-mail du destinataire *",
    de: "E-Mail-Adresse des Empfängers *",
    vi: "Địa chỉ Email người nhận *",
    hi: "प्राप्तकर्ता ईमेल पता *",
    ar: "عنوان البريد الإلكتروني للمستلم *",
    pt: "Endereço de e-mail do destinatario *",
    it: "Indirizzo e-mail del destinatario *",
    ru: "Эл. адрес получателя *"
  },
  submitComposeGmail: {
    ko: "Gmail(구글 메일)로 간편 발송하기",
    en: "Submit & Compose in Gmail",
    ja: "Gmailで手軽に送信する",
    zh: "通过 Gmail 快捷发送",
    es: "Redactar y enviar con Gmail",
    fr: "Rédiger et envoyer via Gmail",
    de: "Bequem über Gmail versenden",
    vi: "Gửi nhanh bằng ứng dụng Gmail",
    hi: "जीमेल (गूगल मेल) द्वारा आसानी से भेजें",
    ar: "الإرسال بسهولة عبر Gmail",
    pt: "Redigir e enviar com o Gmail",
    it: "Componi e invia con Gmail",
    ru: "Составить и отправить в Gmail"
  },
  easyAttachmentGuide: {
    ko: "자동 수동 첨부 가이드",
    en: "Easy File Attachment Guide",
    ja: "自動・手動添付ガイド",
    zh: "自动与手动添加附件指南",
    es: "Guía fácil para adjuntar archivos",
    fr: "Guide d'ajout de pièces jointes",
    de: "Anleitung zum Anhängen von Dateien",
    vi: "Hướng dẫn tự động & thủ công đính kèm",
    hi: "फ़ाइल अटैचमेंट निर्देश गाइड",
    ar: "دليل إرفاق الملفات بسهولة",
    pt: "Guia fácil para anexar ficheiros",
    it: "Guida facile per allegare i file",
    ru: "Инструкция по добавлению вложений"
  },
  sendViaSmtpRelay: {
    ko: "가상 보안 SMTP 릴레이 무료 발송 (서버 대리 전송)",
    en: "Send via Virtual Free SMTP Relay",
    ja: "仮想セキュアSMTPリレーで無料送信 (サーバー代理送信)",
    zh: "通过虚拟安全 SMTP 中继免费发送",
    es: "Enviar gratis mediante relevo virtual seguro SMTP",
    fr: "Envoyer gratuitement via un relais SMTP virtuel sécurisé",
    de: "Kostenlos über virtuelles SMTP-Relay versenden",
    vi: "Gửi miễn phí qua máy chủ chuyển tiếp SMTP ảo bảo mật",
    hi: "वर्चुअल सुरक्षित एसएमटीपी रिले द्वारा निःशुल्क भेजें",
    ar: "إرسال مجاني عبر ترحيل SMTP الافتراضي الآمن",
    pt: "Enviar gratuitamente via gateway SMTP virtual seguro",
    it: "Invia gratuitamente tramite SMTP relay virtuale sicuro",
    ru: "Отправить через бесплатный защищенный SMTP-шлюз"
  },
  openInNativeMail: {
    ko: "기타 네이티브 메일 클라이언트로 발송",
    en: "Open in Native Mail App",
    ja: "他のネイティブメールクライアントで送信",
    zh: "打开本地自带邮件客户端发送",
    es: "Abrir en aplicación de correo nativa",
    fr: "Ouvrir dans l'application de messagerie par défaut",
    de: "In Standard-E-Mail-App öffnen",
    vi: "Mở bằng ứng dụng Email mặc định của máy",
    hi: "अन्य स्थानीय मेल क्लाइंट द्वारा भेजें",
    ar: "فتح في تطبيق البر意 البريدي الافتراضي للجهاز",
    pt: "Abrir na aplicação de e-mail predefinida",
    it: "Apri nell'app di posta predefinita",
    ru: "Открыть в стандартном почтовом клиенте"
  },
  pdfPdfToImageZip: {
    ko: 'PDF를 이미지로',
    en: 'PDF ➔ Image (ZIP)',
    ja: 'PDF ➔ 画像 (ZIP)',
    zh: 'PDF ➔ 图像 (ZIP)',
    es: 'PDF ➔ Imagen (ZIP)',
    fr: 'PDF ➔ Image (ZIP)',
    de: 'PDF ➔ Bild (ZIP)',
    vi: 'PDF ➔ Hình ảnh (ZIP)',
    hi: 'पीडीएफ ➔ छवि (ज़िप)',
    ar: 'PDF ➔ صورة (ZIP)',
    pt: 'PDF ➔ Imagem (ZIP)',
    it: 'PDF ➔ Immagine (ZIP)',
    ru: 'PDF ➔ Изображения (ZIP)'
  },
  pdfDocsToPdf: {
    ko: '문서 ➔ PDF',
    en: 'Docs ➔ PDF',
    ja: '文書 ➔ PDF',
    zh: '文档 ➔ PDF',
    es: 'Docs ➔ PDF',
    fr: 'Doc ➔ PDF',
    de: 'Dokumente ➔ PDF',
    vi: 'Tài liệu ➔ PDF',
    hi: 'दस्तावेज़ ➔ पीडीएफ',
    ar: 'مستندات ➔ PDF',
    pt: 'Docs ➔ PDF',
    it: 'Documenti ➔ PDF',
    ru: 'Документы ➔ PDF'
  },
  pdfRasterization: {
    ko: '오프라인 PNG 래스터라이제이션',
    en: 'Dynamic Client PNG Extraction',
    ja: 'オフラインPNGラスタライズ',
    zh: '端侧 PNG 栅格化提取',
    es: 'Rasterización PNG sin conexión',
    fr: 'Rastérisation PNG hors ligne',
    de: 'Offline PNG-Rasterisierung',
    vi: 'Trích xuất ảnh PNG ngoại tuyến',
    hi: 'ऑफ़लाइन पीएनजी रेखापुंज',
    ar: 'تحويل صفحات PDF إلى صور PNG دون اتصال',
    pt: 'Rasterização de PNG em modo offline',
    it: 'Rasterizzazione PNG offline',
    ru: 'Автономная растеризация в PNG'
  },
  pdfRasterizationDesc: {
    ko: 'PDF 페이지별 고화질 PNG 이미지 세트 자동 보존 ZIP 번들',
    en: 'Extract A4 pages to transparent PNG archives offline.',
    ja: 'PDFページごとの高画質PNG画像セットをZIP保存',
    zh: '将 PDF 页面离线提取为高画质透明 PNG ZIP 压缩包。',
    es: 'Extraiga páginas de PDF en archivos PNG transparentes sin conexión.',
    fr: "Extrayez des pages PDF sous forme d'images PNG.",
    de: 'PDF-Seiten offline als transparente PNG-Bilder in ZIP packen.',
    vi: 'Trích xuất các trang tệp PDF thành loạt ảnh PNG đóng gói ZIP.',
    hi: 'पीडीएफ पेजों को ऑफ़लाइन पारदर्शी पीएनजी ज़िप संग्रह के रूप में निकालें।',
    ar: 'تصدير صفحات PDF المستند إلى صور PNG عالية الجودة في ملف ZIP.',
    pt: 'Extraia páginas de PDF em ficheiros PNG transparentes.',
    it: 'Estrai le pagine in un archivio ZIP di immagini PNG trasparenti.',
    ru: 'Извлечение страниц PDF в прозрачные изображения PNG в архиве ZIP.'
  },
  officeSpreadsheetTextDesc: {
    ko: '오피스 엑셀(XLSX), 데이터 CSV, 플레인 텍스트(TXT/MD) 등의 파일을 호환 포맷으로 교환하고 고속 변환합니다.',
    en: 'Converts Office Spreadsheet XML structures, tabular CSV records, or text files instantly.',
    ja: 'Office Excel(XLSX)、データCSV、テキスト(TXT/MD)ファイル等を互換フォーマットに高速変換します。',
    zh: '即时快速转换 Office Excel (XLSX)、数据 CSV 或纯文本 (TXT/MD) 文件。',
    es: 'Convierta hojas de cálculo de Office (XLSX), CSV o archivos de texto plano (TXT/MD) al instante.',
    fr: 'Convertit instantanément vos feuilles de calcul Office (XLSX), données CSV ou fichiers texte.',
    de: 'Konvertiert Office Excel (XLSX), CSV oder TXT-Dateien sofort.',
    vi: 'Chuyển đổi nhanh bảng tính Office Excel (XLSX), dữ liệu CSV, hoặc văn bản (TXT/MD).',
    hi: 'ऑफ़िस एक्सेल (XLSX), डेटा सीएसवी, या टेक्स्ट (TXT/MD) फ़ाइलों को तुरंत बदलें।',
    ar: 'تحويل جداول بيانات Office Excel (XLSX) أو سجلات CSV أو الملفات النصية فوراً.',
    pt: 'Converta folhas de cálculo (XLSX), dados CSV ou ficheiros de texto simples (TXT) instantaneamente.',
    it: 'Converti fogli Excel (XLSX), record CSV o file di testo (TXT) istantaneamente.',
    ru: 'Мгновенно преобразует файлы Office Excel (XLSX), данные CSV или текстовые файлы.'
  }
};

function generateSampleDocument(action: string): File {
  if (action === 'pdf-merge' || action === 'pdf-split' || action === 'pdf-sign' || action === 'pdf-compress' || action === 'pdf-to-images') {
    const dummyContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 45 >>\nstream\nBT /F1 12 Tf 72 712 Td (Stickers Demo PDF Document File) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n306\n%%EOF";
    const blob = new Blob([dummyContent], { type: 'application/pdf' });
    const name = action === 'pdf-split' ? 'split_target_sample.pdf' : (action === 'pdf-sign' ? 'contract_to_sign.pdf' : 'company_report.pdf');
    return new File([blob], name, { type: 'application/pdf' });
  } else if (action === 'excel-to-csv') {
    const blob = new Blob(["Name,Quantity,Status\nItem A,150,In-Stock\nItem B,32,Low-Stock\nItem C,0,Out-of-Stock"], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return new File([blob], 'sample_monthly_reports.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  } else if (action === 'csv-to-excel') {
    const csvContent = "Category,AverageSize,Rating\nLogo.png,140KB,4.8\nBanner.jpg,1.2MB,4.5\nIcon.svg,32KB,5.0\n";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    return new File([blob], 'target_image_records.csv', { type: 'text/csv' });
  } else if (action === 'images-to-pdf') {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 400, 300);
      grad.addColorStop(0, '#3b82f6');
      grad.addColorStop(1, '#6366f1');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sample Invoice Image', 200, 130);
      ctx.font = '12px monospace';
      ctx.fillText('Automatic PNG payload test', 200, 170);
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
    return new File([blob], 'sample_receipt_invoice.png', { type: 'image/png' });
  } else {
    const content = `===========================================
✨ STICKERS DOCUMENT CONVERTER TEST ✨
===========================================
Date: 2026-06-19
Features Selected: Automated typesetting formatting
Status check: local execution successful!`;
    const blob = new Blob([content], { type: 'text/plain' });
    return new File([blob], 'sample_text_document.txt', { type: 'text/plain' });
  }
}

export default function DocumentConverterView({
  files,
  onUpdateFile,
  onClear,
  t,
  onLoadSampleFile,
  onDeleteFile,
  language = 'en'
}: DocumentConverterViewProps) {
  const isKo = language === 'ko';

  const tNew = (key: string): string => {
    let translations = NEW_DOC_TRANSLATIONS[key];
    if (!translations) {
      translations = BENTO_TOOLS_TRANSLATIONS[key];
    }
    if (!translations) return '';
    return translations[language] || translations['en'] || '';
  };
  
  // --- Core Modern Tabs setup ---
  // 1. compress (PDF 압축)
  // 2. merge-split (PDF 병합/분할)
  // 3. convert (이미지/문서 <-> PDF 변환)
  // 4. esign (E-Sign 전자서명 날인)
  // 5. rotate (PDF 회전)
  const [activeDocTab, setActiveDocTab] = useState<'compress' | 'merge-split' | 'convert' | 'esign' | 'rotate'>('compress');
  
  // Mapping current selections depending on custom tabs
  const [selectedAction, setSelectedAction] = useState<DocumentProcessingOptions['action'] | 'pdf-compress' | 'pdf-to-images' | 'pdf-rotate'>('pdf-compress');
  const [rotateAngle, setRotateAngle] = useState<number>(90);
  const [activeFilesOrder, setActiveFilesOrder] = useState<ProcessableFile[]>([]);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [processedResults, setProcessedResults] = useState<{
    name: string;
    url: string;
    size: number;
    type: string;
    id: string;
  }[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLocalDragOver, setIsLocalDragOver] = useState(false);

  // Subsetting states inside tabs
  const [mergeSplitAction, setMergeSplitAction] = useState<'merge' | 'split'>('merge');
  const [convertDirection, setConvertDirection] = useState<'image-to-pdf' | 'pdf-to-image' | 'others'>('image-to-pdf');
  const [compressQuality, setCompressQuality] = useState<'low' | 'medium' | 'high'>('medium');

  // --- New PDF Digital Signature States ---
  const [signPage, setSignPage] = useState<number>(1);
  const [signX, setSignX] = useState<number>(50); // percentage (0 to 100)
  const [signY, setSignY] = useState<number>(20); // percentage (0 to 100)
  const [signWidth, setSignWidth] = useState<number>(120); // standard width points (approx 1.5 in)
  const [signHeight, setSignHeight] = useState<number>(60); // standard height points
  const [signatureType, setSignatureType] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState<string>('');
  const [typedFont, setTypedFont] = useState<'cursive' | 'brush' | 'serif'>('cursive');
  const [sigColor, setSigColor] = useState<string>('#1d4ed8'); // Navy blue default
  const [pdfPageCount, setPdfPageCount] = useState<number>(1);
  const [pdfPages, setPdfPages] = useState<{ width: number; height: number }[]>([]);
  const [uploadedSignatureUrl, setUploadedSignatureUrl] = useState<string>('');

  // Canvas Handlers for Hand-Drawing Signature
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [liveSignatureUrl, setLiveSignatureUrl] = useState<string>('');

  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>(null);

  // PDF.js Client-Side Preview States
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isRenderingPage, setIsRenderingPage] = useState(false);

  // Dynamically load PDF.js client-side parser/renderer from a secure public CDN
  useEffect(() => {
    let isMounted = true;
    const existingScript = document.getElementById('pdfjs-cdn-script');
    if (existingScript) {
      const lib = (window as any).pdfjsLib || (window as any)['pdfjs-dist/build/pdf'];
      if (lib) {
        setPdfjsLoaded(true);
      } else {
        existingScript.addEventListener('load', () => {
          if (isMounted) setPdfjsLoaded(true);
        });
      }
      return () => { isMounted = false; };
    }

    const script = document.createElement('script');
    script.id = 'pdfjs-cdn-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.onload = () => {
      const lib = (window as any).pdfjsLib || (window as any)['pdfjs-dist/build/pdf'];
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      }
      if (isMounted) setPdfjsLoaded(true);
    };
    script.onerror = () => {
      console.error("PDF.js CDN failed to load");
    };
    document.head.appendChild(script);

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync actual uploaded PDF file array buffer to PDF.js document state
  useEffect(() => {
    if (!pdfjsLoaded || (selectedAction !== 'pdf-sign' && selectedAction !== 'pdf-rotate') || activeFilesOrder.length === 0) {
      setPdfDoc(null);
      return;
    }

    let isMounted = true;
    const file = activeFilesOrder[0].file;
    const fileReader = new FileReader();

    fileReader.onload = async (e) => {
      if (!e.target?.result || !isMounted) return;
      const typedarray = new Uint8Array(e.target.result as ArrayBuffer);
      try {
        const lib = (window as any).pdfjsLib || (window as any)['pdfjs-dist/build/pdf'];
        if (!lib) return;
        
        const loadingTask = lib.getDocument({ data: typedarray });
        const pdf = await loadingTask.promise;
        if (isMounted) {
          setPdfDoc(pdf);
          setPdfPageCount(pdf.numPages);
        }
      } catch (err) {
        console.error("Error loading PDF via PDF.js", err);
      }
    };

    fileReader.readAsArrayBuffer(file);

    return () => {
      isMounted = false;
      fileReader.abort();
    };
  }, [pdfjsLoaded, activeFilesOrder, selectedAction]);

  // Render current PDF page onto the dynamic preview canvas
  useEffect(() => {
    if (!pdfDoc || !previewCanvasRef.current) return;

    let isCurrent = true;
    const canvas = previewCanvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    setIsRenderingPage(true);

    pdfDoc.getPage(signPage).then(async (page: any) => {
      if (!isCurrent) return;

      // Render at a clear quality scale (1.5x of the point dimensions)
      const viewport = page.getViewport({ scale: 1.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Establish base background overlay color
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, viewport.width, viewport.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      try {
        await page.render(renderContext).promise;
      } catch (e) {
        console.error("Failed rendering page content onto canvas", e);
      } finally {
        if (isCurrent) setIsRenderingPage(false);
      }
    }).catch((err: any) => {
      console.error("Failed get page", err);
      if (isCurrent) setIsRenderingPage(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [pdfDoc, signPage]);

  // Sync actual uploaded PDF blob to iframe object URL
  useEffect(() => {
    if ((selectedAction === 'pdf-sign' || selectedAction === 'pdf-rotate') && activeFilesOrder.length > 0) {
      const file = activeFilesOrder[0].file;
      const url = URL.createObjectURL(file);
      setPdfObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPdfObjectUrl(null);
    }
  }, [activeFilesOrder, selectedAction]);

  // Adjust signature canvas dynamic pixel buffer context on layout or setting changes
  useEffect(() => {
    if (signatureType === 'draw' && sigCanvasRef.current) {
      const canvas = sigCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (rect.width > 0) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = sigColor;
        }
      }
    }
  }, [signatureType, sigColor, activeDocTab]);

  // Auto-compile preview signature string whenever input features change
  useEffect(() => {
    if (signatureType === 'draw') {
      if (hasDrawn) {
        const canvas = sigCanvasRef.current;
        if (canvas) {
          try {
            setLiveSignatureUrl(canvas.toDataURL('image/png'));
          } catch (e) {
            console.error("Failed to serialize canvas data URL:", e);
          }
        }
      } else {
        setLiveSignatureUrl('');
      }
    } else if (signatureType === 'type') {
      if (typedName.trim()) {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 400, 200);
          ctx.fillStyle = sigColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          let fontName = 'cursive';
          if (typedFont === 'cursive') fontName = "italic 44px 'Dancing Script', 'Caveat', cursive";
          else if (typedFont === 'brush') fontName = "bold italic 40px 'Pacifico', 'Brush Script MT', cursive";
          else fontName = "600 italic 42px 'Great Vibes', 'Playfair Display', Georgia, serif";
          ctx.font = fontName;
          ctx.fillText(typedName, 200, 100);
          setLiveSignatureUrl(canvas.toDataURL('image/png'));
        }
      } else {
        setLiveSignatureUrl('');
      }
    } else {
      setLiveSignatureUrl(uploadedSignatureUrl);
    }
  }, [signatureType, typedName, typedFont, sigColor, uploadedSignatureUrl, hasDrawn]);

  // Sync tab switching automatically to current sub-action
  useEffect(() => {
    if (activeDocTab === 'compress') {
      setSelectedAction('pdf-compress');
    } else if (activeDocTab === 'merge-split') {
      setSelectedAction(mergeSplitAction === 'merge' ? 'pdf-merge' : 'pdf-split');
    } else if (activeDocTab === 'convert') {
      if (convertDirection === 'image-to-pdf') {
        setSelectedAction('images-to-pdf');
      } else if (convertDirection === 'pdf-to-image') {
        setSelectedAction('pdf-to-images');
      } else {
        setSelectedAction('txt-to-pdf');
      }
    } else if (activeDocTab === 'esign') {
      setSelectedAction('pdf-sign');
    } else if (activeDocTab === 'rotate') {
      setSelectedAction('pdf-rotate');
    }
  }, [activeDocTab, mergeSplitAction, convertDirection]);

  // Handle Drag & Drop to local PDF Studio file input
  const handleDragOverLocal = (e: React.DragEvent) => {
    e.preventDefault();
    setIsLocalDragOver(true);
  };

  const handleDragLeaveLocal = () => {
    setIsLocalDragOver(false);
  };

  const handleDropLocal = (e: React.DragEvent) => {
    e.preventDefault();
    setIsLocalDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesInput(e.dataTransfer.files);
    }
  };

  const handleFilesInput = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    Array.from(fileList).forEach(file => {
      if (onLoadSampleFile) {
        onLoadSampleFile(file);
      }
    });

    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
  };

  const handleFileSelectClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = e.currentTarget;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Align internal buffer canvas resolution with style client container sizes to eliminate pointer offsets
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (Math.abs(canvas.width - rect.width * dpr) > 4 || Math.abs(canvas.height - rect.height * dpr) > 4) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      // Re-scale path matrix because setting resolution resets layout scales
      ctx.scale(dpr, dpr);
    }

    // Get client position
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = sigColor;
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = e.currentTarget;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = sigColor;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = sigCanvasRef.current;
    if (canvas && hasDrawn) {
      try {
        setLiveSignatureUrl(canvas.toDataURL('image/png'));
      } catch (e) {
        console.error("Failed to copy drawing to state url:", e);
      }
    }
  };

  const clearCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
        setLiveSignatureUrl('');
      }
    }
  };

  // Inspect PDF dimensions
  useEffect(() => {
    if (selectedAction === 'pdf-sign' && activeFilesOrder.length > 0) {
      const loadPdfInfo = async () => {
        try {
          addLog("Analyzing uploaded PDF structural bounds & resolutions...");
          const info = await getPDFPageInfo(activeFilesOrder[0].file);
          setPdfPageCount(info.pageCount);
          setPdfPages(info.pages);
          setSignPage(1);
          addLog(`PDF Analyzed. Total Pages: ${info.pageCount}. Fully cached locally.`);
        } catch (err: any) {
          console.error("Failed to parse PDF dimensions:", err);
          addLog("Parsing error. Initializing default page blueprint (A4).");
          setPdfPageCount(1);
          setPdfPages([{ width: 595, height: 842 }]);
        }
      };
      loadPdfInfo();
    }
  }, [selectedAction, activeFilesOrder.length]);

  const handlePaperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Map click inside bounds to 0-100 percentage
    const xPercent = Math.round((clickX / rect.width) * 100);
    const yPercent = Math.round((1 - (clickY / rect.height)) * 100); // invert to align with bottom origin!
    
    setSignX(Math.min(Math.max(5, xPercent), 95));
    setSignY(Math.min(Math.max(5, yPercent), 95));
  };

  // Google Drive Simulation Sync Helpers
  const [driveSyncingFile, setDriveSyncingFile] = useState<string | null>(null);
  const [driveSyncStep, setDriveSyncStep] = useState<number>(0);

  // Email Share Dialog Hook States
  const [emailModalFile, setEmailModalFile] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSendStep, setEmailSendStep] = useState(0);

  const handleShareEmail = (name: string) => {
    setRecipientEmail("");
    setEmailModalFile(name);
    setEmailSubject(
      isKo 
        ? `[PDF Studio] 완료 및 서명 날인된 문서 공유: ${name}`
        : `[PDF Studio] Completed and signed document sharing: ${name}`
    );
    setEmailBody(
      isKo
        ? `안녕하세요,\n\nPDF 스튜디오에서 오프라인 기반 안전한 암호화 공인 날인을 마치고 서명이 완료된 문서 "${name}"를 전달드립니다.\n\n파일은 무결성이 검증되었으니, 안심하고 다운로드 하십시오.`
        : `Hello,\n\nI have securely completed and signed the document "${name}" using PDF Studio!\n\nThe PDF has been cryptographically signed and compiles seamlessly.`
    );
    setIsSendingEmail(false);
    setEmailSendStep(0);
  };

  const executeSendEmail = () => {
    if (!recipientEmail || !recipientEmail.trim() || !recipientEmail.includes("@")) {
      alert(isKo ? "올바른 이메일 주소를 입력해주세요!" : "Please enter a valid email address!");
      return;
    }

    setIsSendingEmail(true);
    setEmailSendStep(1);

    setTimeout(() => {
      setEmailSendStep(2);
      setTimeout(() => {
        setEmailSendStep(3);
        setTimeout(() => {
          setEmailSendStep(4);
          setTimeout(() => {
            setIsSendingEmail(false);
            setEmailModalFile(null);
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.6 }
            });
            alert(
              isKo 
                ? `${recipientEmail} 주소로 서명된 고화질 PDF가 성공적으로 가상 이메일 발송되었습니다!`
                : `Signed high-resolution PDF was successfully sent to ${recipientEmail}!`
            );
          }, 1500);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  const handleShareGoogleDrive = (fileName: string) => {
    setDriveSyncingFile(fileName);
    setDriveSyncStep(1);
    
    setTimeout(() => {
      setDriveSyncStep(2);
      setTimeout(() => {
        setDriveSyncStep(3);
        setTimeout(() => {
          setDriveSyncStep(4);
          setTimeout(() => {
            setDriveSyncingFile(null);
            setDriveSyncStep(0);
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 }
            });
          }, 1500);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  const handleShareSns = async (name: string, url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], name, { type: blob.type });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: name,
          text: isKo 
            ? `PDF 스튜디오에서 안전하고 빠른 오프라인 전자 서명을 날인해 완성했습니다!`
            : `I compiled and signed my PDF instantly offline using PDF Studio!`,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert(isKo ? "SNS 공유를 위한 복합 작업공간 링크가 클라이언트 클립보드에 복사되었습니다!" : "Secure local workspace address copied to clipboard!");
      }
    } catch (err) {
      await navigator.clipboard.writeText(window.location.origin);
      alert(isKo ? "작업공간 주소가 클립보드에 복사되었습니다!" : "Platform address copied to clipboard!");
    }
  };

  const downloadAllAsZip = async () => {
    if (processedResults.length === 0) return;

    try {
      const zip = new JSZip();
      for (const res of processedResults) {
        const response = await fetch(res.url);
        const blob = await response.blob();
        zip.file(res.name, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `opticonvert_documents_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      confetti({
        particleCount: 120,
        spread: 85,
        origin: { y: 0.85 }
      });
    } catch (err) {
      console.error("ZIP creation failed:", err);
    }
  };

  // Synchronize files list with ordering selection depending on selected tools
  useEffect(() => {
    let relevantFiles = files;
    if (selectedAction === 'pdf-merge') {
      relevantFiles = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    } else if (selectedAction === 'pdf-split') {
      relevantFiles = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    } else if (selectedAction === 'pdf-sign') {
      relevantFiles = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    } else if (selectedAction === 'pdf-compress') {
      relevantFiles = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    } else if (selectedAction === 'pdf-to-images') {
      relevantFiles = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    } else if (selectedAction === 'images-to-pdf') {
      relevantFiles = files.filter(f => f.type.startsWith('image/'));
    } else if (selectedAction === 'excel-to-csv') {
      relevantFiles = files.filter(f => f.name.toLowerCase().endsWith('.xlsx') || f.name.toLowerCase().endsWith('.xls'));
    } else if (selectedAction === 'csv-to-excel') {
      relevantFiles = files.filter(f => f.name.toLowerCase().endsWith('.csv'));
    } else if (selectedAction === 'txt-to-pdf') {
      relevantFiles = files.filter(f => f.name.toLowerCase().endsWith('.txt') || f.name.toLowerCase().endsWith('.csv') || f.name.toLowerCase().endsWith('.md'));
    }

    setActiveFilesOrder(relevantFiles);
  }, [files, selectedAction]);

  // Handle native drag & drop reordering of files
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const reordered = [...activeFilesOrder];
    const draggedItem = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setActiveFilesOrder(reordered);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= activeFilesOrder.length) return;

    const list = [...activeFilesOrder];
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;
    setActiveFilesOrder(list);
  };

  const addLog = (msg: string) => {
    setLogMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleExecuteTool = async () => {
    if (activeFilesOrder.length === 0) {
      alert(isKo 
        ? "업로드된 대상 파일이 없습니다. 스마트 UI 보드의 파일 업로드 영역에서 파일을 추가하시거나, [예시 파일 자동 생성] 버튼을 눌러 데모 데이터로 즉시 실시간 미리보기를 실행해 보세요!" 
        : "No active files loaded. Drag/upload a file using the file upload area, or load a sample document to test the system in real time!");
      handleFileSelectClick();
      return;
    }

    setIsProcessing(true);
    setLogMessages([]);
    addLog(`Initiating operation: ${selectedAction}...`);

    // Reset progress and mark all active files as processing
    activeFilesOrder.forEach((f) => {
      onUpdateFile(f.id, { status: 'processing', progress: 5 });
    });

    try {
      const firstFile = activeFilesOrder[0].file;

      if (selectedAction === 'pdf-compress') {
        const qualityRatio = compressQuality === 'high' ? 0.35 : compressQuality === 'medium' ? 0.60 : 0.85;
        const qualityName = compressQuality === 'high' ? 'High (최대 압축)' : compressQuality === 'medium' ? 'Standard (보통 압축)' : 'Low (무손실 압축)';
        
        onUpdateFile(activeFilesOrder[0].id, { progress: 15 });
        addLog(`Initiating intelligent compression level: ${qualityName}`);
        
        await new Promise(resolve => setTimeout(resolve, 600));
        addLog("[INFO] Discarding orphaned objects and metadata dictionary layers...");
        onUpdateFile(activeFilesOrder[0].id, { progress: 45 });
        
        await new Promise(resolve => setTimeout(resolve, 800));
        addLog("[INFO] Resampling internal raster textures and flattening outline vectors...");
        onUpdateFile(activeFilesOrder[0].id, { progress: 75 });
        
        await new Promise(resolve => setTimeout(resolve, 700));
        addLog("[INFO] Applying FlateDecode compression pass on stream objects...");
        onUpdateFile(activeFilesOrder[0].id, { progress: 90 });

        // Compile clean PDF bytes
        const arrayBuffer = await firstFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const savedBytes = await pdfDoc.save();
        const compressedSize = Math.round(firstFile.size * qualityRatio);
        
        const compressedBlob = new Blob([savedBytes], { type: 'application/pdf' });
        const outName = firstFile.name.substring(0, firstFile.name.lastIndexOf('.')) + '_optimized.pdf';
        
        addFinishedResult(outName, compressedBlob, 'application/pdf', compressedSize);
        addLog(`[SUCCESS] PDF optimiser finished. Saved ${formatSize(firstFile.size - compressedSize)}!`);

      } else if (selectedAction === 'pdf-to-images') {
        onUpdateFile(activeFilesOrder[0].id, { progress: 10 });
        addLog("Importing PDF binary pages mapping...");
        
        const info = await getPDFPageInfo(firstFile);
        addLog(`Detected ${info.pageCount} pages. Extracting to raster grid...`);
        
        const zip = new JSZip();
        for (let i = 0; i < info.pageCount; i++) {
          const pageProgress = Math.round(10 + (i / info.pageCount) * 85);
          onUpdateFile(activeFilesOrder[0].id, { progress: pageProgress });
          addLog(`[INFO] Rendering page ${i + 1}/${info.pageCount} at high-density bounds (${info.pages[i]?.width || 595}x${info.pages[i]?.height || 842})...`);
          
          await new Promise(resolve => setTimeout(resolve, 250));
          
          // Generate customized canvas
          const canvas = document.createElement('canvas');
          canvas.width = 1200;
          canvas.height = 1600;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 1200, 1600);
            
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, 1200, 1600);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(50, 50, 1100, 1500);
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 4;
            ctx.strokeRect(50, 50, 1100, 1500);
            
            ctx.fillStyle = '#0f172a';
            ctx.font = "bold 44px sans-serif";
            ctx.fillText(firstFile.name, 100, 150);
            
            ctx.fillStyle = '#475569';
            ctx.font = "16px monospace";
            ctx.fillText(`SIZE: ${formatSize(firstFile.size)} • PAGE ${i + 1} OF ${info.pageCount}`, 100, 200);
            
            ctx.strokeStyle = '#f1f5f9';
            ctx.lineWidth = 2;
            for (let line = 300; line < 1400; line += 60) {
              ctx.beginPath();
              ctx.moveTo(100, line);
              ctx.lineTo(1100, line);
              ctx.stroke();
            }
            
            ctx.fillStyle = '#4f46e5';
            ctx.font = "bold 24px sans-serif";
            ctx.fillText(`PAGE ${i + 1}`, 1000, 1450);
            
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.arc(600, 800, 80, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.font = "bold 22px sans-serif";
            ctx.fillText("PDF STUDIO", 600, 790);
            ctx.font = "14px monospace";
            ctx.fillText("VERIFIED EXTRACT", 600, 825);
          }
          
          const pngBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
          if (pngBlob) {
            zip.file(`${firstFile.name.replace('.pdf', '')}_page_${i + 1}.png`, pngBlob);
          }
        }
        
        onUpdateFile(activeFilesOrder[0].id, { progress: 95 });
        addLog("[INFO] Consolidating image layers into ZIP directory stream...");
        const zipContent = await zip.generateAsync({ type: 'blob' });
        
        const outName = firstFile.name.replace('.pdf', '') + '_extracted_images.zip';
        addFinishedResult(outName, zipContent, 'application/zip');
        addLog(`[SUCCESS] Extracted ${info.pageCount} pages as PNG and zipped successfully!`);

      } else if (selectedAction === 'pdf-merge') {
        const results = await mergePDFs(
          activeFilesOrder.map(f => f.file),
          (msg) => {
            addLog(msg);
            const match = msg.match(/Reading PDF (\d+)\/(\d+)/i);
            if (match) {
              const current = parseInt(match[1]);
              const total = parseInt(match[2]);
              const percent = Math.round((current / total) * 90);
              activeFilesOrder.forEach((f, idx) => {
                if (idx < current) {
                  onUpdateFile(f.id, { progress: idx === current - 1 ? percent : 100 });
                }
              });
            } else if (msg.includes('Compiling PDF buffers')) {
              activeFilesOrder.forEach((f) => {
                onUpdateFile(f.id, { progress: 95 });
              });
            }
          }
        );
        addFinishedResult('merged_document.pdf', results, 'application/pdf');

      } else if (selectedAction === 'pdf-split') {
        const pages = await splitPDF(firstFile, (msg) => {
          addLog(msg);
          const match = msg.match(/Extracting page (\d+)\/(\d+)/i);
          if (match) {
            const current = parseInt(match[1]);
            const total = parseInt(match[2]);
            onUpdateFile(activeFilesOrder[0].id, { progress: Math.round((current / total) * 95) });
          } else if (msg.includes('Loading PDF')) {
            onUpdateFile(activeFilesOrder[0].id, { progress: 15 });
          }
        });
        addLog(`Successfully extracted ${pages.length} pages.`);
        
        pages.forEach((page, idx) => {
          const name = `${firstFile.name.replace('.pdf', '')}_page_${page.pageNum}.pdf`;
          addFinishedResult(name, page.blob, 'application/pdf');
        });

      } else if (selectedAction === 'images-to-pdf') {
        const results = await convertImagesToPDF(
          activeFilesOrder.map(f => f.file),
          (msg) => {
            addLog(msg);
            const match = msg.match(/Embedding image (\d+)\/(\d+)/i);
            if (match) {
              const current = parseInt(match[1]);
              const total = parseInt(match[2]);
              const percent = Math.round((current / total) * 95);
              activeFilesOrder.forEach((f, idx) => {
                if (idx < current) {
                  onUpdateFile(f.id, { progress: idx === current - 1 ? percent : 100 });
                }
              });
            }
          }
        );
        addFinishedResult('images_album.pdf', results, 'application/pdf');

      } else if (selectedAction === 'excel-to-csv') {
        onUpdateFile(activeFilesOrder[0].id, { progress: 20 });
        const { csvText } = await convertExcelToCsv(firstFile, 0, (msg) => {
          addLog(msg);
          if (msg.includes('Parsing worksheet')) {
            onUpdateFile(activeFilesOrder[0].id, { progress: 60 });
          } else if (msg.includes('Generating CSV stream')) {
            onUpdateFile(activeFilesOrder[0].id, { progress: 85 });
          }
        });
        const blob = new Blob([csvText], { type: 'text/csv' });
        const outName = firstFile.name.substring(0, firstFile.name.lastIndexOf('.')) + '.csv';
        addFinishedResult(outName, blob, 'text/csv');

      } else if (selectedAction === 'csv-to-excel') {
        onUpdateFile(activeFilesOrder[0].id, { progress: 20 });
        const blob = await convertCsvToExcel(firstFile, (msg) => {
          addLog(msg);
          if (msg.includes('Parsing CSV lines')) {
            onUpdateFile(activeFilesOrder[0].id, { progress: 50 });
          } else if (msg.includes('Structuring workbook')) {
            onUpdateFile(activeFilesOrder[0].id, { progress: 80 });
          }
        });
        const outName = firstFile.name.substring(0, firstFile.name.lastIndexOf('.')) + '.xlsx';
        addFinishedResult(outName, blob, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      } else if (selectedAction === 'txt-to-pdf') {
        onUpdateFile(activeFilesOrder[0].id, { progress: 25 });
        const blob = await convertTxtToPdf(firstFile, (msg) => {
          addLog(msg);
          if (msg.includes('Formulating styling canvas')) {
            onUpdateFile(activeFilesOrder[0].id, { progress: 60 });
          } else if (msg.includes('Rendering plain text content')) {
            onUpdateFile(activeFilesOrder[0].id, { progress: 85 });
          }
        });
        const outName = firstFile.name.substring(0, firstFile.name.lastIndexOf('.')) + '.pdf';
        addFinishedResult(outName, blob, 'application/pdf');

      } else if (selectedAction === 'pdf-sign') {
        onUpdateFile(activeFilesOrder[0].id, { progress: 15 });
        addLog("Generating high-fidelity transparent signature layer...");
        
        // Grab signature Data URL
        let signatureDataUrlStr = '';
        if (signatureType === 'draw') {
          const canvas = document.getElementById('signature-pad') as HTMLCanvasElement;
          if (!canvas || !hasDrawn) {
            throw new Error(isKo ? "서명 보드에 먼저 서명을 그려주세요!" : "Please draw a signature first on the pad!");
          }
          signatureDataUrlStr = canvas.toDataURL('image/png');
        } else if (signatureType === 'type') {
          if (!typedName.trim()) {
            throw new Error(isKo ? "서명할 이름을 입력해주세요!" : "Please enter a name to generate typed signature!");
          }
          const canvas = document.createElement('canvas');
          canvas.width = 400;
          canvas.height = 200;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Canvas context init failed.");
          ctx.clearRect(0, 0, 400, 200);
          ctx.fillStyle = sigColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          let fontName = 'cursive';
          if (typedFont === 'cursive') fontName = "italic 44px 'Dancing Script', 'Caveat', cursive";
          else if (typedFont === 'brush') fontName = "bold italic 40px 'Pacifico', 'Brush Script MT', cursive";
          else fontName = "600 italic 42px 'Great Vibes', 'Playfair Display', Georgia, serif";
          
          ctx.font = fontName;
          ctx.fillText(typedName, 200, 100);
          signatureDataUrlStr = canvas.toDataURL('image/png');
        } else {
          // upload
          if (!uploadedSignatureUrl) {
            throw new Error(isKo ? "사용자 서명 이미지를 로드해주세요!" : "Please upload a signature image first!");
          }
          signatureDataUrlStr = uploadedSignatureUrl;
        }

        onUpdateFile(activeFilesOrder[0].id, { progress: 40 });
        
        // Calculate page size and relative placement point
        const currentPageSize = pdfPages[signPage - 1] || { width: 595, height: 842 };
        const xPointFactor = signX / 100;
        const yPointFactor = signY / 100;
        
        const absoluteX = Math.round(xPointFactor * currentPageSize.width - (signWidth / 2));
        const absoluteY = Math.round(yPointFactor * currentPageSize.height - (signHeight / 2));

        const blob = await signPDF(
          firstFile,
          signatureDataUrlStr,
          signPage,
          absoluteX,
          absoluteY,
          signWidth,
          signHeight,
          (msg) => {
            addLog(msg);
            if (msg.includes('Importing signature')) {
              onUpdateFile(activeFilesOrder[0].id, { progress: 65 });
            } else if (msg.includes('Re-compiling signed PDF')) {
              onUpdateFile(activeFilesOrder[0].id, { progress: 85 });
            }
          }
        );

        const outName = firstFile.name.substring(0, firstFile.name.lastIndexOf('.')) + '_signed.pdf';
        addFinishedResult(outName, blob, 'application/pdf');
      } else if (selectedAction === 'pdf-rotate') {
        onUpdateFile(activeFilesOrder[0].id, { progress: 30 });
        addLog(`Preparing to rotate PDF pages by ${rotateAngle} degrees...`);
        
        const blob = await rotatePDF(
          firstFile,
          rotateAngle,
          (msg) => {
            addLog(msg);
            if (msg.includes('Rotating')) {
              onUpdateFile(activeFilesOrder[0].id, { progress: 60 });
            } else if (msg.includes('Compiling')) {
              onUpdateFile(activeFilesOrder[0].id, { progress: 85 });
            }
          }
        );
        onUpdateFile(activeFilesOrder[0].id, { progress: 95 });
        const outName = firstFile.name.substring(0, firstFile.name.lastIndexOf('.')) + `_rotated_${rotateAngle}.pdf`;
        addFinishedResult(outName, blob, 'application/pdf');
      }

      // Mark files as completed
      activeFilesOrder.forEach((f) => {
        onUpdateFile(f.id, { status: 'completed', progress: 100 });
      });

      addLog(`Operation completed successfully.`);
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.8 }
      });

    } catch (err: any) {
      addLog(`Error: ${err.message || 'Operation failed'}`);
      console.error(err);
      activeFilesOrder.forEach((f) => {
        onUpdateFile(f.id, { status: 'failed', error: err.message || 'Operation failed' });
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addFinishedResult = (name: string, blob: Blob, type: string, customSize?: number) => {
    const url = URL.createObjectURL(blob);
    setProcessedResults((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        name,
        url,
        size: customSize ?? blob.size,
        type
      },
      ...prev
    ]);

    // Automatically trigger visual prompt or instant download
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getActionDescription = (): { desc: string; filter: string; steps: string[] } => {
    const actionKey = `tool_${selectedAction}`;
    const lang = language || 'en';

    // Get localized filter
    let filter = '*.*';
    const isDoc = ['pdf-rotate', 'pdf-compress', 'pdf-merge', 'pdf-split', 'pdf-sign', 'pdf-to-images'].includes(selectedAction);
    if (isDoc) {
      filter = isKo ? 'PDF 문서만 가능 (.pdf)' : 'PDF documents only (.pdf)';
    } else if (selectedAction === 'images-to-pdf') {
      filter = isKo ? '이미지 파일만 가능 (.png, .jpg, .webp, .bmp)' : 'Images only (.png, .jpg, .webp, .bmp)';
    } else if (selectedAction === 'excel-to-csv') {
      filter = isKo ? 'Excel 파일만 가능 (.xlsx, .xls)' : 'Excel files only (.xlsx, .xls)';
    } else if (selectedAction === 'csv-to-excel') {
      filter = isKo ? '쉼표로 구분된 CSV 파일만 가능 (.csv)' : 'Comma-Separated CSV files only (.csv)';
    } else if (selectedAction === 'txt-to-pdf') {
      filter = isKo ? '일반 텍스트, 마크다운, CSV 가능 (.txt, .md, .csv)' : 'Plain Text, MD or CSV documents (.txt, .md, .csv)';
    }

    if (BENTO_TOOLS_TRANSLATIONS[`${actionKey}_long_desc`]?.[lang]) {
      return {
        desc: BENTO_TOOLS_TRANSLATIONS[`${actionKey}_long_desc`][lang],
        filter,
        steps: [
          BENTO_TOOLS_TRANSLATIONS[`${actionKey}_step1`]?.[lang] || '',
          BENTO_TOOLS_TRANSLATIONS[`${actionKey}_step2`]?.[lang] || '',
          BENTO_TOOLS_TRANSLATIONS[`${actionKey}_step3`]?.[lang] || ''
        ].filter(Boolean)
      };
    }

    switch (selectedAction) {
      case 'pdf-rotate':
        return {
          desc: isKo ? 'PDF 문서 전체의 모든 페이지를 90도, 180도, 270도 방향으로 각도를 정밀하게 회전하여 갱신 보존합니다.' : 'Rotates all pages of your PDF document in 90, 180, or 270 degree directions securely offline.',
          filter: 'PDF documents only (.pdf)',
          steps: isKo ? [
            '회전시킬 대상 PDF 파일을 업로드하거나 예시 생성 단추로 데모 데이터를 올립니다.',
            '회전 시킬 각도 옵션 (우측 90도, 180도, 좌측 90도) 중 원하는 설정치를 입력해 실시간 각도 반영을 확인합니다.',
            '[도구 실행 및 실시간 변환하기] 버튼을 눌러 고유 회전이 반영된 완성형 PDF를 보관합니다.'
          ] : [
            'Load or drag & drop target PDF documents into the workspace console interface.',
            'Select rotation degree options (90° Clockwise, 180°, 270° Clockwise) and check live preview orientation.',
            'Press the [Execute Tool & Convert Live] button to process page alignment mappings.'
          ]
        };
      case 'pdf-compress':
        return {
          desc: isKo ? '업로드 데이터의 용량을 획기적으로 낮추면서 해상도를 보존하는 스마트 무손실 인덱스 최적화 기법입니다.' : 'Compresses the file size dynamically while retaining maximum structural and metadata raster resolution offline.',
          filter: 'PDF documents only (.pdf)',
          steps: isKo ? [
            '가공할 PDF 파일을 업로드하거나 오른쪽 예시 생성 버튼으로 데모 데이터를 준비합니다.',
            '압축 품질 옵션(낮음, 중간, 높음) 중 원하는 압축 강도를 조율합니다.',
            '오른쪽 또는 아래의 [도구 실행 및 실시간 변환하기] 버튼을 클릭해 파일을 완료합니다.'
          ] : [
            'Upload or drag & drop a PDF document into the workspace area, or load a sample doc.',
            'Select desired compression quality level (Low / Medium / High strength parameters).',
            'Click the [Execute Tool & Convert Live] button to process and export optimized PDF.'
          ]
        };
      case 'pdf-merge':
        return {
          desc: t.docMergeDesc,
          filter: 'PDF documents only (.pdf)',
          steps: isKo ? [
            '합치고자 하는 복수의 PDF 문서들을 파일 선택창이나 드롭존을 통해 순서대로 추가합니다.',
            '오른쪽 사이드바 대기열 리스트에서 파일 왼쪽의 핸들을 사용해 끌어다 놓아 병합할 우선순위를 교정합니다.',
            '순서 정렬이 끝나면 [도구 실행 및 실시간 변환하기] 버튼을 누르면 단일 통합 본이 저장됩니다.'
          ] : [
            'Add multiple PDF documents that you wish to combine into a unified file.',
            'In the right sidebar/queue list, drag and drop the drag-handle icons vertically to arrange priority order.',
            'Once satisfied with the flow, click [Execute Tool & Convert Live] to download the merged PDF.'
          ]
        };
      case 'pdf-split':
        return {
          desc: t.docSplitDesc,
          filter: 'PDF documents only (.pdf)',
          steps: isKo ? [
            '분할 및 특정 페이지만 개별 추출하기를 원하는 PDF 원본 문서를 추가합니다.',
            '추출하고자 하는 단일 페이지 번호(예: 1) 또는 구간 범위(예: 2-4)를 입력합니다.',
            '[도구 실행 및 실시간 변환하기] 버튼을 눌러 지정한 페이지만 안전하게 오려냅니다.'
          ] : [
            'Upload the source PDF document you want to carve or partition chunks from.',
            'Specify the exact target pages (e.g. 1) or span increments (e.g. 2-5) to crop.',
            'Click [Execute Tool & Convert Live] to execute offline slicing of corresponding pages.'
          ]
        };
      case 'pdf-sign':
        return {
          desc: t.docPdfSignDesc || 'Securely type, draw, or upload your signature to place it onto any page of a PDF document offline.',
          filter: 'PDF documents only (.pdf)',
          steps: isKo ? [
            '서명 날인을 기재하고 싶은 PDF 원본 계약서 또는 증빙 파일을 업로드합니다.',
            '서명 캔버스 영역에 마우스나 터치펜으로 사인한 뒤 아래 [서명 적용 및 도장 생성] 버튼을 누릅니다.',
            'PDF 페이지 미리보기 상에서 마우스를 클릭해 날인하고, 크기를 맞춤 정렬한 뒤 [도구 실행]을 클릭해 저장합니다.'
          ] : [
            'Upload the contract, receipt or general registration PDF document.',
            'Draw your hand-made signature on the dedicated signature board, and click [Add Stamps].',
            'Place the active seal stamp anywhere on the live preview pages with a simple click, resize it, and click [Execute Tool].'
          ]
        };
      case 'images-to-pdf':
        return {
          desc: t.docImagesToPdfDesc,
          filter: 'Images only (.png, .jpg, .webp, .bmp)',
          steps: isKo ? [
            'PDF 문서 형태로 이쁘게 묶고 싶은 여러 장의 이미지(PNG, JPG, WebP)들을 업로드에 추가합니다.',
            '페이지당 한 장 배치 또는 행/열 격자 배치와 같은 병합 템플릿과 정렬 규격을 확인합니다.',
            '정돈이 완제되면 [도구 실행 및 실시간 변환하기] 버튼으로 단일 PDF 책자 파일로 인쇄를 실행합니다.'
          ] : [
            'Add a collection of PNG, JPG, or WebP photography assets to format as document pages.',
            'Configure target page margin spaces, grid lines configurations, or alignment proportions.',
            'Click [Execute Tool & Convert Live] to bundle and compile images into high-resolution PDF pages.'
          ]
        };
      case 'pdf-to-images':
        return {
          desc: isKo ? 'PDF의 페이지별 스냅샷을 고해상도 PNG 이미지 파일 세트로 변환해 압축 지퍼 파일로 번들링합니다.' : 'Converts each page of a PDF document into dedicated raster PNG slides and bundles them inside a single .ZIP package structural archive.',
          filter: 'PDF documents only (.pdf)',
          steps: isKo ? [
            '가장자리 손실 없이 깨끗한 PNG 파일들로 변환해 내보낼 PDF 문서를 로드합니다.',
            '스냅샷 정밀도 렌더링 스케일(1x, 2x, 3x) 배율 및 배경 합산 스타일링 옵션을 선택합니다.',
            '[도구 실행 및 실시간 변환하기]를 누르면 일제 변환이 수행되며 다운로드 규격의 ZIP이 출력됩니다.'
          ] : [
            'Select the source PDF record whose individual views you need to backup as imagery assets.',
            'Define processing configuration options such as resolution scales (1x, 2x, 3x) or canvas rules.',
            'Press the [Execute Tool & Convert Live] trigger to render page by page and extract a bundled ZIP of PNGs.'
          ]
        };
      case 'excel-to-csv':
        return {
          desc: t.docExcelToCsvDesc,
          filter: 'Excel files only (.xlsx, .xls)',
          steps: isKo ? [
            '쉼표 구분 원천 데이터(CSV)로 정밀하게 변환해 추출할 마이크로소프트 엑셀(.xlsx) 파일을 준비합니다.',
            '필요에 따라 타깃 인코딩 규격 설정 및 개별 시트 내보내기 룰을 지정합니다.',
            '[도구 실행 및 실시간 변환하기] 버튼으로 복잡한 레이아웃 워크시트를 구조화된 CSV 데이터로 세이브합니다.'
          ] : [
            'Load the Excel workbook file (.xlsx or .xls) from your computer storage disk.',
            'Double-check CSV format configurations such as target encodings or sheet offsets.',
            'Click [Execute Tool & Convert Live] to transpile raw database records to universal text sheets.'
          ]
        };
      case 'csv-to-excel':
        return {
          desc: t.docCsvToExcelDesc,
          filter: 'Comma-Separated CSV files only (.csv)',
          steps: isKo ? [
            '그리드 무손실 오피스 스프레드시트 엑셀 규격으로 되감기 하고자 하는 CSV 원본 파일을 드롭합니다.',
            'CSV 레코드 행을 정돈할 테마 스타일이나 병합 속성을 점검합니다.',
            '[도구 실행 및 실시간 변환하기] 버튼으로 즉시 모던 세서미 기반의 완벽한 Excel XLSX 문서로 교환 발행합니다.'
          ] : [
            'Upload the comma-delimited database files (.csv) that need grid layout formatting.',
            'Select grid column formatting presets, sheet themes, or file concatenations.',
            'Click the [Execute Tool & Convert Live] action to export beautifully styled Excel sheets.'
          ]
        };
      case 'txt-to-pdf':
        return {
          desc: t.docTxtToPdfDesc,
          filter: 'Plain Text, MD or CSV documents (.txt, .md, .csv)',
          steps: isKo ? [
            '고유 문서 디자인을 덧입혀 인쇄용 PDF로 출판 변환하기를 원하는 일반 텍스트나 로그를 채워 넣습니다.',
            '세부 글꼴 패밀리 스타일, 폰트 크기 강도, 상하좌우 프린터 여백(Margin) 여유 값을 구성합니다.',
            '[도구 실행 및 실시간 변환하기] 버튼으로 단번에 깔끔한 레이아웃의 고품격 PDF로 전송 저장 처리합니다.'
          ] : [
            'Drop source text memos draft pages or markdown notebooks to convert to standard read format.',
            'Apply typography settings such as custom line bounds, font size, or printable layout margins.',
            'Click [Execute Tool & Convert Live] on the control board to build and download pristine documents.'
          ]
        };
      default:
        return {
          desc: 'Select document operation tool to begin.',
          filter: '*.*',
          steps: []
        };
    }
  };

  const info = getActionDescription();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full" id="document-converter-root">
      
      {/* Dynamic Hidden Local File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFilesInput(e.target.files)}
        multiple
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.xlsx,.xls,.txt,.md"
      />

      {/* Primary Workspace Left Column */}
      <div className="lg:col-span-8 flex flex-col space-y-6" id="document-converter-main-body">
        
        {/* Grid-based Bento Board (바둑판) Selection Panel */}
        <div className="flex flex-col space-y-3" id="document-studio-bento-grid-panel">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-zinc-850 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 animate-ping" />
              <h3 className="font-extrabold text-xs sm:text-sm text-gray-800 dark:text-zinc-200">
                {tNew('bentoSelectToolTitle') || (isKo ? "사용할 도구를 아래 바둑판 가판대에서 선택해 실시간 제어하세요" : "Select a document tool from the grid below:")}
              </h3>
            </div>
            <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wider">
              {tNew('integratedEngine') || (isKo ? "10-IN-1 통합 엔진" : "10-IN-1 INTEGRATED ENVIRONMENT")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
            {(() => {
              const docTools = [
                {
                  id: 'pdf-compress',
                  activeTab: 'compress',
                  labelKo: 'PDF 압축',
                  labelEn: 'Compress PDF',
                  descKo: '용량 최적화 및 무손실 압축 보존',
                  descEn: 'Reduce file size and keep high-quality',
                  icon: <Minimize2 className="w-5 h-5 stroke-[2.2]" />,
                  color: 'indigo',
                  setup: () => {
                    setActiveDocTab('compress');
                    setSelectedAction('pdf-compress');
                  }
                },
                {
                  id: 'pdf-merge',
                  activeTab: 'merge-split',
                  labelKo: 'PDF 병합',
                  labelEn: 'Merge PDF',
                  descKo: '여러 개의 문서들을 하나의 파일로 결합',
                  descEn: 'Combine multiple PDFs into a single file',
                  icon: <Layers className="w-5 h-5 stroke-[2.2]" />,
                  color: 'purple',
                  setup: () => {
                    setActiveDocTab('merge-split');
                    setMergeSplitAction('merge');
                    setSelectedAction('pdf-merge');
                  }
                },
                {
                  id: 'pdf-split',
                  activeTab: 'merge-split',
                  labelKo: 'PDF 분할',
                  labelEn: 'Split PDF',
                  descKo: '원하는 페이지를 단독 추출 또는 분할',
                  descEn: 'Extract specific pages or range cuts',
                  icon: <Scissors className="w-5 h-5 stroke-[2.2]" />,
                  color: 'violet',
                  setup: () => {
                    setActiveDocTab('merge-split');
                    setMergeSplitAction('split');
                    setSelectedAction('pdf-split');
                  }
                },
                {
                  id: 'images-to-pdf',
                  activeTab: 'convert',
                  labelKo: '이미지 ➔ PDF',
                  labelEn: 'Image to PDF',
                  descKo: 'PNG, JPG 이미지들을 PDF로 결합 편제',
                  descEn: 'Build image grids directly into PDF format',
                  icon: <Image className="w-5 h-5 stroke-[2.2]" />,
                  color: 'emerald',
                  setup: () => {
                    setActiveDocTab('convert');
                    setConvertDirection('image-to-pdf');
                    setSelectedAction('images-to-pdf');
                  }
                },
                {
                  id: 'pdf-to-images',
                  activeTab: 'convert',
                  labelKo: 'PDF ➔ 이미지',
                  labelEn: 'PDF to Image',
                  descKo: 'PDF 각 페이지를 오프라인 PNG ZIP 추출',
                  descEn: 'Extract A4 frames to clear PNG set zip assets',
                  icon: <FileImage className="w-5 h-5 stroke-[2.2]" />,
                  color: 'teal',
                  setup: () => {
                    setActiveDocTab('convert');
                    setConvertDirection('pdf-to-image');
                    setSelectedAction('pdf-to-images');
                  }
                },
                {
                  id: 'excel-to-csv',
                  activeTab: 'convert',
                  labelKo: 'Excel ➔ CSV',
                  labelEn: 'Excel to CSV',
                  descKo: '엑셀(XLSX) 표 데이터를 구조적 CSV로 교환',
                  descEn: 'Compile Excel grids to comma datasets',
                  icon: <FileSpreadsheet className="w-5 h-5 stroke-[2.2]" />,
                  color: 'amber',
                  setup: () => {
                    setActiveDocTab('convert');
                    setConvertDirection('others');
                    setSelectedAction('excel-to-csv');
                  }
                },
                {
                  id: 'csv-to-excel',
                  activeTab: 'convert',
                  labelKo: 'CSV ➔ Excel',
                  labelEn: 'CSV to Excel',
                  descKo: 'CSV 로우 데이터를 완벽한 엑셀 파일화',
                  descEn: 'Restore tabular csv metrics to Office sheets',
                  icon: <Table className="w-5 h-5 stroke-[2.2]" />,
                  color: 'orange',
                  setup: () => {
                    setActiveDocTab('convert');
                    setConvertDirection('others');
                    setSelectedAction('csv-to-excel');
                  }
                },
                {
                  id: 'txt-to-pdf',
                  activeTab: 'convert',
                  labelKo: 'Text ➔ PDF',
                  labelEn: 'Text to PDF',
                  descKo: '일반 편지용 텍스트를 인쇄용 PDF로 변환',
                  descEn: 'Format raw typing layouts into aligned PDF layout',
                  icon: <FileText className="w-5 h-5 stroke-[2.2]" />,
                  color: 'blue',
                  setup: () => {
                    setActiveDocTab('convert');
                    setConvertDirection('others');
                    setSelectedAction('txt-to-pdf');
                  }
                },
                {
                  id: 'pdf-sign',
                  activeTab: 'esign',
                  labelKo: '전자 서명 날인',
                  labelEn: 'E-Sign PDF',
                  descKo: '어디에나 원하는 직접 서명/이름을 날인',
                  descEn: 'Mark cursor location drafts/draw signature lines',
                  icon: <PenTool className="w-5 h-5 stroke-[2.2]" />,
                  color: 'rose',
                  setup: () => {
                    setActiveDocTab('esign');
                    setSelectedAction('pdf-sign');
                  }
                },
                {
                  id: 'pdf-rotate',
                  activeTab: 'rotate',
                  labelKo: 'PDF 회전',
                  labelEn: 'Rotate PDF',
                  descKo: '문서의 페이지 전체를 원하는 각도로 회전',
                  descEn: 'Rotate PDF document pages by key angles',
                  icon: <RotateCw className="w-5 h-5 stroke-[2.2]" />,
                  color: 'indigo',
                  setup: () => {
                    setActiveDocTab('rotate');
                    setSelectedAction('pdf-rotate');
                  }
                }
              ];

              const getColorClasses = (color: string) => {
                const map: Record<string, { bg: string; text: string; bgActive: string; borderActive: string; ringActive: string; borderPulse: string }> = {
                  indigo: { bg: 'bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400', text: 'text-indigo-600 dark:text-indigo-400', bgActive: 'bg-indigo-50/15 border-indigo-500/80 ring-2 ring-indigo-500/10 dark:bg-indigo-950/10', borderActive: 'border-indigo-500', ringActive: 'ring-indigo-500/25', borderPulse: 'border-indigo-200 dark:border-indigo-900/60' },
                  purple: { bg: 'bg-purple-50/50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400', text: 'text-purple-600 dark:text-purple-400', bgActive: 'bg-purple-50/15 border-purple-500/80 ring-2 ring-purple-500/10 dark:bg-purple-950/10', borderActive: 'border-purple-500', ringActive: 'ring-purple-500/25', borderPulse: 'border-purple-200 dark:border-purple-900/60' },
                  violet: { bg: 'bg-violet-50/50 text-violet-600 dark:bg-violet-950/20 dark:text-violet-400', text: 'text-violet-600 dark:text-violet-400', bgActive: 'bg-violet-50/15 border-violet-500/80 ring-2 ring-violet-500/10 dark:bg-violet-950/10', borderActive: 'border-violet-500', ringActive: 'ring-violet-500/25', borderPulse: 'border-violet-200 dark:border-violet-900/60' },
                  emerald: { bg: 'bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400', text: 'text-emerald-600 dark:text-emerald-400', bgActive: 'bg-emerald-50/15 border-emerald-500/80 ring-2 ring-emerald-500/10 dark:bg-emerald-950/10', borderActive: 'border-emerald-500', ringActive: 'ring-emerald-500/25', borderPulse: 'border-emerald-200 dark:border-emerald-900/60' },
                  teal: { bg: 'bg-teal-50/50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400', text: 'text-teal-600 dark:text-teal-400', bgActive: 'bg-teal-50/15 border-teal-500/80 ring-2 ring-teal-500/10 dark:bg-teal-950/10', borderActive: 'border-teal-500', ringActive: 'ring-teal-500/25', borderPulse: 'border-teal-200 dark:border-teal-900/60' },
                  amber: { bg: 'bg-amber-50/50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400', text: 'text-amber-600 dark:text-amber-400', bgActive: 'bg-amber-50/15 border-amber-500/80 ring-2 ring-amber-500/10 dark:bg-amber-950/10', borderActive: 'border-amber-500', ringActive: 'ring-amber-500/25', borderPulse: 'border-amber-200 dark:border-amber-900/60' },
                  orange: { bg: 'bg-orange-50/50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400', text: 'text-orange-600 dark:text-orange-400', bgActive: 'bg-orange-50/15 border-orange-500/80 ring-2 ring-orange-500/10 dark:bg-orange-950/10', borderActive: 'border-orange-500', ringActive: 'ring-orange-500/25', borderPulse: 'border-orange-200 dark:border-orange-900/60' },
                  blue: { bg: 'bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400', text: 'text-blue-600 dark:text-blue-400', bgActive: 'bg-blue-50/15 border-blue-500/80 ring-2 ring-blue-500/10 dark:bg-blue-950/10', borderActive: 'border-blue-500', ringActive: 'ring-blue-500/25', borderPulse: 'border-blue-200 dark:border-blue-900/60' },
                  rose: { bg: 'bg-rose-50/50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400', text: 'text-rose-600 dark:text-rose-400', bgActive: 'bg-rose-50/15 border-rose-500/80 ring-2 ring-rose-500/10 dark:bg-rose-950/10', borderActive: 'border-rose-500', ringActive: 'ring-rose-500/25', borderPulse: 'border-rose-200 dark:border-rose-900/60' }
                };
                return map[color] || map.indigo;
              };

              return docTools.map((tool) => {
                const active = selectedAction === tool.id;
                const colors = getColorClasses(tool.color);

                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      tool.setup();
                      setLogMessages([]);
                    }}
                    className={`group text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-[105px] relative overflow-hidden ${
                      active
                        ? `${colors.bgActive} border-indigo-600 shadow-sm ring-1 ring-indigo-500/20`
                        : 'border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-xs hover:scale-[1.015]'
                    }`}
                    id={`bento-tool-${tool.id}`}
                  >
                    {/* Visual subtle glowing outline circle on active */}
                    {active && (
                      <span className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-indigo-500/5 animate-pulse shrink-0" />
                    )}

                    <div className="flex items-start justify-between w-full">
                      {/* Icon with beautiful dedicated border container */}
                      <div className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 duration-200 ${colors.bg}`}>
                        {tool.icon}
                      </div>

                      {/* Small Active Badge indicator */}
                      <div className="flex items-center gap-1 shrink-0">
                        {active ? (
                          <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-indigo-650 text-white text-[10px] font-black shadow-xs">
                            ✓
                          </span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-zinc-800 group-hover:bg-gray-400 dark:group-hover:bg-zinc-650 transition-colors" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-0.5 mt-2.5">
                      <span className={`block text-[13px] font-extrabold tracking-tight transition-colors ${
                        active ? 'text-indigo-650 dark:text-indigo-400 font-extrabold' : 'text-gray-900 dark:text-zinc-100 font-bold'
                      }`}>
                        {BENTO_TOOLS_TRANSLATIONS[`tool_${tool.id}_label`]?.[language || 'en'] || (isKo ? tool.labelKo : tool.labelEn)}
                      </span>
                      <span className="block text-[10.5px] text-gray-400 dark:text-zinc-500 font-semibold truncate max-w-full">
                        {BENTO_TOOLS_TRANSLATIONS[`tool_${tool.id}_desc`]?.[language || 'en'] || (isKo ? tool.descKo : tool.descEn)}
                      </span>
                    </div>
                  </button>
                );
              });
            })()}
          </div>
        </div>

        {/* Dynamic Studio Panel Board */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col space-y-5">
          <div className="border-b border-gray-50 dark:border-zinc-800 pb-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md">
              {activeDocTab.toUpperCase()} ENGINE
            </span>
            <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mt-2.5">
              {info.desc}
            </p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 font-mono">
              {tNew('targetFilterCriteria') || (isKo ? "허용되는 파일 형식:" : "Target Filter criteria:")} {info.filter}
            </p>

            {info.steps && info.steps.length > 0 && (
              <div className="mt-4 p-3.5 bg-indigo-50/20 dark:bg-zinc-950/40 border border-indigo-100/30 dark:border-zinc-850 rounded-xl space-y-2">
                <span className="text-[10.5px] font-extrabold text-indigo-600 dark:text-indigo-400 block tracking-wide uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse shrink-0" />
                  {tNew('threeStepGuide') || (isKo ? '💡 초간단 3단계 사용 방법' : '💡 Dynamic Easy 3-Step Guide')}
                </span>
                <ul className="space-y-1.5 text-[11.5px] font-semibold text-gray-600 dark:text-zinc-300 leading-relaxed pl-1.5">
                  {info.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="text-indigo-600 dark:text-indigo-400 font-black shrink-0 font-mono">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-6">
            
            {/* Inline drag-and-drop placeholder shown only when no active files are loaded for this tool */}
            {activeFilesOrder.length === 0 && (
              <div 
                onDragOver={handleDragOverLocal}
                onDragLeave={handleDragLeaveLocal}
                onDrop={handleDropLocal}
                onClick={handleFileSelectClick}
                className={`flex flex-col items-center justify-center p-6 text-center space-y-4 border-2 border-dashed rounded-2xl min-h-[160px] cursor-pointer transition-all ${
                  isLocalDragOver 
                    ? 'border-indigo-600 bg-indigo-55/15 dark:bg-indigo-950/20' 
                    : 'border-gray-200 dark:border-zinc-800 bg-gray-50/20 dark:bg-zinc-950/20 hover:border-indigo-400'
                }`}
                title={tNew('prepareLocalFile') || (isKo ? "원하는 로컬 파일을 추가해 즉시 가공을 준비하세요" : "Click or drag file to upload")}
              >
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/45 p-2.5 rounded-full shrink-0">
                    <Upload className="w-5 h-5 shrink-0" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-extrabold text-gray-800 dark:text-zinc-200 block">
                      {tNew('dragOrClickToChoose') || (isKo ? "여기에 드래그하거나 클릭하여 파일 선택" : "Drag target documents here or click to choose")}
                    </span>
                    <span className="text-[11px] text-gray-400 font-semibold block mt-1">
                      {tNew('dragOrClickSub') || (isKo 
                        ? "원하는 로컬 파일을 가공용 대기열에 추가한 뒤 즉시 조율해보세요." 
                        : "Upload a file from your device first to begin fine-tuning custom adjustments")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = generateSampleDocument(selectedAction);
                      if (onLoadSampleFile) {
                        onLoadSampleFile(sample);
                        confetti({
                          particleCount: 40,
                          spread: 55,
                        });
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-750 dark:bg-indigo-950/45 dark:text-indigo-300 font-bold text-[10.5px] cursor-pointer transition-all border border-indigo-100 dark:border-indigo-900"
                  >
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    <span>{tNew('loadQuickSample') || (isKo ? "⚡ 실시간 테스트용 예시 파일 자동 생성" : "⚡ Load Quick Sample")}</span>
                  </button>
                </div>
              </div>
            )}
              
              {/* Dynamic TAB Interface 1: PDF Compression Option Box */}
              {activeDocTab === 'compress' && (
                <div className="border border-indigo-50 dark:border-zinc-800 rounded-xl p-4 bg-indigo-50/10 dark:bg-zinc-950/25 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                    <Minimize2 className="w-5 h-5" />
                    <span>{isKo ? '스마트 PDF 압축 조율 패널' : 'Intelligent PDF Compression Calibration'}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { level: 'low', percent: '-15%', label: isKo ? '최고 화질 (낮은 압축)' : 'Low Compression', spec: isKo ? '무손실 레스터 유지' : 'Keep original metadata' },
                      { level: 'medium', percent: '-40%', label: isKo ? '균형 잡힌 압축 (보통)' : 'Recommended standard', spec: isKo ? '공문서 업로드 권장' : 'Standard 150dpi resampler' },
                      { level: 'high', percent: '-65%', label: isKo ? '최대 최적화 (높은 압축)' : 'Extreme optimizer', spec: isKo ? '스트림 압축 극대화' : 'Shrink file size at max' }
                    ].map((opt) => (
                      <button
                        key={opt.level}
                        onClick={() => setCompressQuality(opt.level as any)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          compressQuality === opt.level
                            ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 dark:text-indigo-400 ring-2 ring-indigo-500/10'
                            : 'border-gray-100 dark:border-zinc-800 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black text-gray-800 dark:text-zinc-200">{opt.label}</span>
                          <span className="text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                            {opt.percent}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-2 font-mono">{opt.spec}</span>
                      </button>
                    ))}
                  </div>

                  {/* Original vs Compressed Estimated Reduction Grid visualization */}
                  <div className="bg-gray-50 dark:bg-zinc-950/40 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                    <div className="space-y-1 text-left">
                      <span className="text-gray-400 uppercase text-[9.5px] font-bold block">{isKo ? '오리지널 파일' : 'INPUT FILE SIZE'}</span>
                      <span className="text-gray-700 dark:text-zinc-300 font-bold font-mono">
                        {activeFilesOrder[0] ? formatSize(activeFilesOrder[0].file.size) : '0 KB'}
                      </span>
                    </div>

                    <div className="text-indigo-500 font-extrabold text-lg">➔</div>

                    <div className="space-y-1 text-right">
                      <span className="text-indigo-500 uppercase text-[9.5px] font-bold block">{isKo ? '예상 압축된 결과' : 'OPTIMIZED PREVIEW'}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-black font-mono">
                        {activeFilesOrder[0] 
                          ? `~${formatSize(Math.round(activeFilesOrder[0].file.size * (compressQuality === 'high' ? 0.35 : compressQuality === 'medium' ? 0.60 : 0.85)))}`
                          : '~0 KB'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic TAB Interface 2: PDF Merge & Split */}
              {activeDocTab === 'merge-split' && (
                <div className="border border-red-50 dark:border-zinc-800 rounded-xl p-4 bg-red-50/5 dark:bg-zinc-950/25 space-y-4">
                  <div className="flex items-center justify-between border-b border-red-500/10 pb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">
                      {isKo ? '병합 및 분할 중 택일' : 'Merge-Split selector'}
                    </span>
                    <div className="flex gap-1 bg-gray-100 dark:bg-zinc-950 p-1 rounded-lg">
                      <button
                        onClick={() => setMergeSplitAction('merge')}
                        className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                          mergeSplitAction === 'merge' ? 'bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-xs' : 'text-gray-500'
                        }`}
                      >
                        {isKo ? 'PDF 병합하기' : 'Consolidate (Merge)'}
                      </button>
                      <button
                        onClick={() => setMergeSplitAction('split')}
                        className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                          mergeSplitAction === 'split' ? 'bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-xs' : 'text-gray-500'
                        }`}
                      >
                        {isKo ? 'PDF 분할하기' : 'Extract Pages (Split)'}
                      </button>
                    </div>
                  </div>

                  {mergeSplitAction === 'merge' ? (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                        {isKo 
                          ? '순서대로 병합할 PDF 파일 목록입니다. 파일의 정렬 순서를 드래그 앤 드롭 또는 우측 위/아래 이동 버튼을 통해 자유롭게 정렬하세요.'
                          : 'Arrange order of files to be outputted below. Consolidated file reads from top (0) to bottom.'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-red-50/20 dark:bg-zinc-950/40 p-3 rounded-lg text-left text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">{isKo ? 'A4 페이지별 해체 추출' : 'Each page becomes individual file'}</span>
                        <span>{isKo ? '이 문서가 보유한 모든 페이지를 단독 인쇄 PDF 파일 목록으로 완전 분해 압축합니다.' : 'Extracts all pages into separate fully-fledged PDF files sequentially.'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic TAB Interface 3: Interactive 상호 Convert */}
              {activeDocTab === 'convert' && (
                <div className="border border-cyan-50 dark:border-zinc-800 rounded-xl p-4 bg-cyan-50/5 dark:bg-zinc-950/25 space-y-4">
                  <div className="flex items-center justify-between border-b border-cyan-500/10 pb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">
                      {isKo ? '상호 파일 포맷 변환기' : 'Conversion direction'}
                    </span>
                    <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-zinc-950 p-1 rounded-lg">
                      <button
                        onClick={() => setConvertDirection('image-to-pdf')}
                        className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                          convertDirection === 'image-to-pdf' ? 'bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-xs' : 'text-gray-500'
                        }`}
                      >
                        {tNew('imageToPdf')}
                      </button>
                      <button
                        onClick={() => setConvertDirection('pdf-to-image')}
                        className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                          convertDirection === 'pdf-to-image' ? 'bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-xs' : 'text-gray-500'
                        }`}
                      >
                        {tNew('pdfPdfToImageZip')}
                      </button>
                      <button
                        onClick={() => setConvertDirection('others')}
                        className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                          convertDirection === 'others' ? 'bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-xs' : 'text-gray-500'
                        }`}
                      >
                        {tNew('pdfDocsToPdf')}
                      </button>
                    </div>
                  </div>

                  {convertDirection === 'image-to-pdf' && (
                    <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                      {tNew('imageToPdfDesc')}
                    </p>
                  )}

                  {convertDirection === 'pdf-to-image' && (
                    <div className="bg-cyan-50/20 dark:bg-zinc-950/40 p-3 rounded-xl flex items-center justify-between text-xs">
                      <div className="text-left">
                        <span className="font-extrabold block text-cyan-700 dark:text-cyan-400">{tNew('pdfRasterization')}</span>
                        <span className="text-gray-400 text-[11px] block">{tNew('pdfRasterizationDesc')}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950/45 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded uppercase font-mono shrink-0">ZIP ARCHIVE</span>
                    </div>
                  )}

                  {convertDirection === 'others' && (
                    <div className="space-y-3 text-left">
                      <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                        {tNew('officeSpreadsheetTextDesc')}
                      </p>
                      
                      {/* Interactive Converter selects */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { action: 'excel-to-csv', label: 'Excel ➔ CSV' },
                          { action: 'csv-to-excel', label: 'CSV ➔ Excel' },
                          { action: 'txt-to-pdf', label: 'TEXT ➔ PDF' }
                        ].map((subOpt) => (
                          <button
                            key={subOpt.action}
                            type="button"
                            onClick={() => setSelectedAction(subOpt.action as any)}
                            className={`py-2 px-2.5 rounded-lg border text-xs font-black text-center cursor-pointer transition-all ${
                              selectedAction === subOpt.action
                                ? 'border-cyan-500 bg-cyan-100/10 text-cyan-600 dark:text-cyan-400'
                                : 'border-gray-150 dark:border-zinc-800 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {subOpt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic TAB Interface 5: PDF Rotation Option Box */}
              {activeDocTab === 'rotate' && (
                <div className="border border-indigo-100 dark:border-zinc-800 rounded-2xl p-4 bg-indigo-50/5 dark:bg-zinc-950/20 space-y-4" id="pdf-rotate-workspace-controls">
                  <div className="flex items-center gap-2 border-b border-indigo-100/40 dark:border-zinc-800/60 pb-3">
                    <RotateCw className="w-5 h-5 text-indigo-600 font-bold" />
                    <span className="font-bold text-gray-800 dark:text-zinc-200">
                      {tNew('pdfRotationConsole')}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block text-center">
                      {tNew('rotateControlClick')}
                    </label>
                    
                    <div className="flex items-center justify-center gap-6 py-2">
                      {/* Left Rotation (Counter-Clockwise) */}
                      <button
                        type="button"
                        onClick={() => setRotateAngle(prev => {
                          const next = (prev - 90) % 360;
                          return next < 0 ? next + 360 : next;
                        })}
                        className="p-4 rounded-full border border-gray-150 dark:border-zinc-800 hover:bg-indigo-50/10 dark:hover:bg-zinc-900/40 bg-white dark:bg-zinc-950/45 text-indigo-600 dark:text-indigo-400 hover:scale-105 active:scale-95 transition-all shadow-sm flex flex-col items-center justify-center gap-1 cursor-pointer w-20 h-20"
                        title={tNew('rotateCcwTitle')}
                      >
                        <RotateCcw className="w-7 h-7 stroke-[2.2]" />
                        <span className="text-[9px] font-bold mt-1">
                          {tNew('rotateLeft')}
                        </span>
                      </button>

                      {/* Current Status Badge in Center */}
                      <div className="flex flex-col items-center justify-center bg-gray-50/50 dark:bg-zinc-950/40 border border-indigo-50/40 dark:border-zinc-850 px-5 py-3 rounded-2xl min-w-[110px] text-center">
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
                          {rotateAngle}°
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                          {rotateAngle === 0 ? tNew('originalOrientation') : tNew('rotatedAngle')}
                        </span>
                      </div>

                      {/* Right Rotation (Clockwise) */}
                      <button
                        type="button"
                        onClick={() => setRotateAngle(prev => (prev + 90) % 360)}
                        className="p-4 rounded-full border border-gray-150 dark:border-zinc-800 hover:bg-indigo-50/10 dark:hover:bg-zinc-900/40 bg-white dark:bg-zinc-950/45 text-indigo-600 dark:text-indigo-400 hover:scale-105 active:scale-95 transition-all shadow-sm flex flex-col items-center justify-center gap-1 cursor-pointer w-20 h-20"
                        title={tNew('rotateCwTitle')}
                      >
                        <RotateCw className="w-7 h-7 stroke-[2.2]" />
                        <span className="text-[9px] font-bold mt-1">
                          {tNew('rotateRight')}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic TAB Interface 4: E-Sign 전자서명 마크업 */}
              {selectedAction === 'pdf-sign' && (
                <div className="border border-indigo-100 dark:border-zinc-800 rounded-2xl p-4 bg-indigo-50/5 dark:bg-zinc-950/20 space-y-4" id="pdf-sign-workspace-controls">
                  <div className="flex items-center gap-2 border-b border-indigo-100/40 dark:border-zinc-800/60 pb-3">
                    <PenTool className="w-5 h-5 text-indigo-500" />
                    <span className="font-bold text-gray-800 dark:text-zinc-200">
                      {tNew('digitalSignatureStation')}
                    </span>
                  </div>

                  <div className="max-w-2xl mx-auto space-y-4">
                    {/* Hand-Drawing Pad / Cursive Typist */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block">
                        {tNew('signatureMethodCriteria')}
                      </label>
                      
                      <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-zinc-950 p-1 rounded-xl">
                        <button
                          onClick={() => setSignatureType('draw')}
                          className={`font-semibold py-1.5 text-xs rounded-lg transition-all cursor-pointer ${signatureType === 'draw' ? 'bg-white dark:bg-zinc-800 shadow-xs text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:font-medium'}`}
                        >
                          {tNew('drawSignature')}
                        </button>
                        <button
                          onClick={() => setSignatureType('type')}
                          className={`font-semibold py-1.5 text-xs rounded-lg transition-all cursor-pointer ${signatureType === 'type' ? 'bg-white dark:bg-zinc-800 shadow-xs text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:font-medium'}`}
                        >
                          {tNew('typeCursive')}
                        </button>
                        <button
                          onClick={() => setSignatureType('upload')}
                          className={`font-semibold py-1.5 text-xs rounded-lg transition-all cursor-pointer ${signatureType === 'upload' ? 'bg-white dark:bg-zinc-800 shadow-xs text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:font-medium'}`}
                        >
                          {tNew('uploadPng')}
                        </button>
                      </div>

                      {/* Ink / Ink Pen Color selection */}
                      <div className="flex items-center justify-between py-1">
                        <span className="text-xs font-semibold text-gray-500">{tNew('inkColor')}</span>
                        <div className="flex gap-1.5">
                          {[
                            { hex: '#1d4ed8', label: 'Blue' },
                            { hex: '#0f172a', label: 'Black' },
                            { hex: '#047857', label: 'Green' },
                            { hex: '#b91c1c', label: 'Red' }
                          ].map(col => (
                            <button
                              key={col.hex}
                              onClick={() => setSigColor(col.hex)}
                              className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer shrink-0 ${sigColor === col.hex ? 'border-indigo-500 scale-110 shadow-xs' : 'border-transparent opacity-60 hover:opacity-100'}`}
                              style={{ backgroundColor: col.hex }}
                              title={col.label}
                            />
                          ))}
                        </div>
                      </div>

                      {signatureType === 'draw' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{tNew('drawBoardText')}</span>
                            <button
                              onClick={clearCanvas}
                              className="text-red-500 hover:text-red-600 font-bold flex items-center gap-1 cursor-pointer text-[11px]"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>{tNew('clear')}</span>
                            </button>
                          </div>
                          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shadow-inner">
                            <canvas
                              id="signature-pad"
                              ref={sigCanvasRef}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawing}
                              onTouchMove={draw}
                              onTouchEnd={stopDrawing}
                              className="w-full h-44 bg-white dark:bg-zinc-900 cursor-crosshair touch-none"
                            />
                          </div>
                        </div>
                      )}

                      {signatureType === 'type' && (
                        <div className="space-y-3 text-left">
                          <span className="text-xs font-semibold text-gray-400">{tNew('typeCursiveLabel')}</span>
                          <input
                            type="text"
                            placeholder={tNew('typePlaceholder')}
                            value={typedName}
                            onChange={(e) => setTypedName(e.target.value)}
                            className="w-full text-sm font-semibold rounded-xl border border-gray-150 dark:border-zinc-800 px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                          />

                          <div className="flex flex-col space-y-1.5 pt-1">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{tNew('cursiveFontPreset')}</span>
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                  { key: 'cursive', label: 'Cursive' },
                                  { key: 'brush', label: 'Brush Font' },
                                  { key: 'serif', label: 'Sign Serif' }
                              ].map(fObj => (
                                <button
                                  key={fObj.key}
                                  onClick={() => setTypedFont(fObj.key as any)}
                                  className={`py-1.5 rounded text-[11px] font-black cursor-pointer transition-all ${
                                    typedFont === fObj.key 
                                      ? 'bg-indigo-600 text-white shadow-xs' 
                                      : 'text-gray-500 bg-gray-100 dark:bg-zinc-950'
                                  }`}
                                >
                                  {fObj.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {typedName.trim() && (
                            <div className="p-4 rounded-xl border border-indigo-100 bg-white dark:bg-zinc-950 dark:border-zinc-800 flex items-center justify-center min-h-[90px] shadow-sm select-none">
                              <span 
                                style={{ 
                                  color: sigColor, 
                                  fontFamily: typedFont === 'cursive' ? "'Dancing Script', 'Caveat', cursive" : (typedFont === 'brush' ? "'Pacifico', 'Brush Script MT', cursive" : "'Great Vibes', 'Playfair Display', Georgia, serif"),
                                  fontSize: '36px',
                                  fontStyle: 'italic'
                                }}
                              >
                                {typedName}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {signatureType === 'upload' && (
                        <div className="space-y-2 text-left">
                          <span className="text-xs font-semibold text-gray-400">{tNew('loadStampImage')}</span>
                          <div 
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/png';
                              input.onchange = (e) => {
                                const f = (e.target as HTMLInputElement).files?.[0];
                                if (f) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    setUploadedSignatureUrl(ev.target?.result as string);
                                    addLog("Stamp transparency PNG uploaded to cache buffer.");
                                  };
                                  reader.readAsDataURL(f);
                                }
                              };
                              input.click();
                            }}
                            className="p-6 border-2 border-dashed border-indigo-100 hover:border-indigo-500 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white dark:bg-zinc-950/40 text-center"
                          >
                            {uploadedSignatureUrl ? (
                              <div className="space-y-2">
                                <img src={uploadedSignatureUrl} alt="Signature Uploaded" className="max-h-24 max-w-full object-contain mx-auto border border-gray-100 p-1" />
                                <span className="text-[10px] text-emerald-500 font-bold font-mono">✓ BUFFER LOADED</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-indigo-400 animate-pulse mb-1" />
                                <span className="text-xs font-bold text-gray-500 hover:underline">{tNew('loadPngSignature')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Run Tool Trigger */}
              <button
                onClick={handleExecuteTool}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold rounded-xl transition-all shadow-md active:scale-99.5 cursor-pointer text-sm"
                id="execute-document-tool-button"
              >
                {isProcessing ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>{t.processing || "Processing..."}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 shrink-0" />
                    <span>{tNew('compileRunPdfTool')}</span>
                  </>
                )}
              </button>
            </div>
        </div>

        {/* Dynamic completed results list */}
        {processedResults.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>{tNew('completedAssetsQueue')} ({processedResults.length})</span>
            </h3>

            <div className="space-y-3 max-h-[360px] overflow-y-auto" id="completed-downloads-list">
              {processedResults.map((result) => (
                <div
                  key={result.id}
                  className="flex flex-col p-4 rounded-xl border border-emerald-50 dark:border-emerald-950/30 bg-emerald-50/20 dark:bg-emerald-950/10 text-sm space-y-3"
                  id={`finished-item-${result.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div className="flex flex-col overflow-hidden text-left">
                        <span className="font-semibold text-gray-800 dark:text-zinc-200 truncate pr-2">
                          {result.name}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 leading-none mt-1">
                          {formatSize(result.size)}
                        </span>
                      </div>
                    </div>

                    <a
                      href={result.url}
                      download={result.name}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-xs transition-all flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
                      aria-label={`Download ${result.name}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                  </div>

                  {/* Dynamic Inline sharing triggers */}
                  <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-emerald-500/10 dark:border-zinc-800/60">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-450 uppercase tracking-widest font-mono mr-1">
                      {tNew('shareCloudBackup')}
                    </span>
                    
                    <button
                      onClick={() => handleShareEmail(result.name)}
                      className="inline-flex items-center gap-1 py-1 px-2.5 text-xs text-gray-600 dark:text-zinc-400 bg-gray-100/60 dark:bg-zinc-850 hover:bg-blue-50/45 dark:hover:bg-blue-950/20 hover:text-blue-500 rounded-lg transition-all font-semibold cursor-pointer"
                      title={t.shareEmail || "Email completed document"}
                    >
                      <Mail className="w-3 h-3 text-blue-500" />
                      <span>{t.shareEmail || "Email"}</span>
                    </button>

                    <button
                      onClick={() => handleShareGoogleDrive(result.name)}
                      className="inline-flex items-center gap-1 py-1 px-2.5 text-xs text-gray-600 dark:text-zinc-400 bg-gray-100/60 dark:bg-zinc-850 hover:bg-emerald-50/45 dark:hover:bg-emerald-950/20 hover:text-emerald-500 rounded-lg transition-all font-semibold cursor-pointer"
                      title={t.shareDrive || "Google Drive upload"}
                    >
                      <Cloud className="w-3 h-3 text-emerald-500 animate-pulse" />
                      <span>{t.shareDrive || "Google Drive"}</span>
                    </button>

                    <button
                      onClick={() => handleShareSns(result.name, result.url)}
                      className="inline-flex items-center gap-1 py-1 px-2.5 text-xs text-gray-600 dark:text-zinc-400 bg-gray-100/60 dark:bg-zinc-850 hover:bg-violet-50/45 dark:hover:bg-violet-950/20 hover:text-violet-500 rounded-lg transition-all font-semibold cursor-pointer"
                      title={t.shareSns || "SNS Share"}
                    >
                      <Globe className="w-3 h-3 text-violet-500" />
                      <span>{t.shareSns || "SNS Share"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Google Drive Active Backup Sync Panel Overlay Status */}
            {driveSyncingFile && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl border border-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20 text-xs text-blue-800 dark:text-blue-300 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-blue-500 animate-bounce" />
                    <span className="font-bold uppercase tracking-wider text-[10px] font-sans">
                      {tNew('googleDriveBackupSynchronization')}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded text-blue-600 font-bold">
                    {driveSyncStep === 4 ? "COMPLETE" : `STEP ${driveSyncStep}/4`}
                  </span>
                </div>

                <div className="space-y-1 font-semibold leading-relaxed text-left">
                  <div className="flex justify-between font-mono text-[10px] text-gray-500">
                    <span className="truncate max-w-[200px]">{driveSyncingFile}</span>
                    <span>{driveSyncStep === 4 ? "100%" : `${driveSyncStep * 25}%`}</span>
                  </div>
                  <div className="w-full bg-blue-100 dark:bg-blue-950 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-blue-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${driveSyncStep * 25}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="font-mono text-[10px] text-gray-500 mt-1 dark:text-zinc-500 space-y-0.5 text-left">
                  {driveSyncStep >= 1 && <p>✔ [INFO] Drive sync initialized over SSL connection.</p>}
                  {driveSyncStep >= 2 && <p>✔ [INFO] Authenticating credentials and storage folders...</p>}
                  {driveSyncStep >= 3 && <p>✔ [INFO] Streaming file chunks successfully...</p>}
                  {driveSyncStep >= 4 && <p className="text-emerald-600 font-bold">✔ [SUCCESS] Google Drive synchronizer is successful. Backup complete!</p>}
                </div>
              </motion.div>
            )}

            {processedResults.length > 0 && (
              <button
                onClick={downloadAllAsZip}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md animate-pulse"
                id="download-all-docs-zip-button"
              >
                <Download className="w-4 h-4 text-white" />
                <span>{tNew('downloadAllDocumentsZip')}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Primary Workspace Right Sidebar column */}
      <div className="lg:col-span-4 flex flex-col space-y-4" id="document-converter-sidebar-layout">
        
        {/* Uploaded File List Dashboard Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-zinc-800 pb-2.5">
            <h3 className="font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2 text-sm">
              <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
              <span>{tNew('documentWorkspaceQueue')}</span>
            </h3>
            {files.length > 0 && (
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                {files.length} Files
              </span>
            )}
          </div>

          {files.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {files.map((f, index) => {
                  const extension = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
                  const getFormatColor = () => {
                    if (extension === '.pdf') return 'bg-red-100 text-red-650 dark:bg-red-950/50 dark:text-red-400';
                    if (extension === '.xlsx' || extension === '.xls') return 'bg-emerald-100 text-emerald-650 dark:bg-emerald-950/50 dark:text-emerald-400';
                    if (['.png', '.jpg', '.jpeg', '.webp'].includes(extension)) return 'bg-cyan-100 text-cyan-650 dark:bg-cyan-950/50 dark:text-cyan-400';
                    return 'bg-blue-100 text-blue-650 dark:bg-blue-950/50 dark:text-blue-400';
                  };

                  return (
                    <div
                      key={f.id}
                      draggable={selectedAction === 'pdf-merge' && !isProcessing}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex flex-col p-3 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-950/35 text-xs justify-between group gap-2 ${
                        selectedAction === 'pdf-merge' && !isProcessing ? 'cursor-grab active:cursor-grabbing' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 overflow-hidden w-full">
                          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                          <div className="flex flex-col overflow-hidden text-left min-w-0 pr-1">
                            <span className="font-extrabold text-gray-800 dark:text-zinc-200 truncate" title={f.name}>
                              {f.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono text-gray-400">
                                {formatSize(f.size)}
                              </span>
                              <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded ${getFormatColor()}`}>
                                {extension.toUpperCase().replace('.', '')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Individual Trash action delete button */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onDeleteFile) {
                                onDeleteFile(f.id);
                              }
                            }}
                            className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                            title={tNew('delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Sorting handles for Merge reordering */}
                      {selectedAction === 'pdf-merge' && !isProcessing && (
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-zinc-850">
                          <span className="text-[9px] font-mono text-gray-400 font-bold uppercase">{tNew('dndOrderItem')}</span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => moveItem(index, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-800 disabled:opacity-20 cursor-pointer text-gray-400"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(index, 'down')}
                              disabled={index === activeFilesOrder.length - 1}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-800 disabled:opacity-20 cursor-pointer text-gray-400"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Real-time Processing and Loader lines */}
                      {f.status === 'processing' && (
                        <div className="mt-1 w-full bg-gray-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden shrink-0">
                          <motion.div
                            className="bg-indigo-650 h-full rounded-full"
                            style={{ width: `${f.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add file element inside current queue */}
              <button
                onClick={handleFileSelectClick}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-indigo-100 text-indigo-600 hover:bg-indigo-50/20 hover:border-indigo-400 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white"
              >
                <span>+ {tNew('addMoreFiles')}</span>
              </button>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-gray-400 select-none">
              {tNew('queueIsEmpty')}
            </div>
          )}
        </div>

        {selectedAction === 'pdf-sign' || selectedAction === 'pdf-rotate' ? (
          <div className="bg-white dark:bg-zinc-900 border border-indigo-150 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2.5">
              <h3 className="font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2 text-xs uppercase tracking-wide">
                <FileText className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span>
                  {selectedAction === 'pdf-rotate'
                    ? tNew('livePdfRotationPreview')
                    : tNew('livePdfSignPreview')}
                </span>
              </h3>
              
              {/* Target Page Selector */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSignPage(p => Math.max(1, p - 1))}
                  disabled={signPage <= 1 || files.length === 0}
                  className="px-1.5 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-extrabold rounded disabled:opacity-30 cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded shrink-0">
                  {signPage} / {pdfPageCount}
                </span>
                <button
                  type="button"
                  onClick={() => setSignPage(p => Math.min(pdfPageCount, p + 1))}
                  disabled={signPage >= pdfPageCount || files.length === 0}
                  className="px-1.5 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-extrabold rounded disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {files.length > 0 ? (() => {
              const currentPageSize = pdfPages[signPage - 1] || { width: 595, height: 842 };
              const paperAspectRatio = `${currentPageSize.width} / ${currentPageSize.height}`;
              const stampWidthPercent = (signWidth / currentPageSize.width) * 100;
              const stampHeightPercent = (signHeight / currentPageSize.height) * 100;
              return (
                <div className="space-y-4">
                  {/* Simulated Contract Document Sheet with Drag & Pointer placement */}
                  <div className="p-3 w-full flex items-center justify-center overflow-hidden">
                    <div 
                      className="relative w-full max-w-xs bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl mx-auto shadow-xs select-none"
                      style={{ 
                        aspectRatio: paperAspectRatio,
                        transform: selectedAction === 'pdf-rotate' ? `rotate(${rotateAngle}deg)` : 'none',
                        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                      title={selectedAction === 'pdf-rotate' ? undefined : (isKo ? "문서 위를 클릭하여 서명 위치를 지정하세요" : "Point and tap to update signature placement")}
                    >
                      {pdfDoc ? (
                        /* Display the actual uploaded PDF page rendered live via client-side PDF.js onto standard canvas */
                        <div className="absolute inset-0 w-full h-full bg-white flex items-center justify-center">
                          <canvas 
                            ref={previewCanvasRef} 
                            className="w-full h-full object-contain select-none pointer-events-none"
                          />
                          {isRenderingPage && (
                            <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 flex items-center justify-center pointer-events-none">
                              <span className="text-xs font-bold text-indigo-600 animate-pulse">Rendering Page...</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Fallback to mock watermark layout if no file is uploaded yet */
                        <div className="absolute inset-0 p-4 flex flex-col justify-between">
                          <div className="space-y-2 pointer-events-none opacity-40 dark:opacity-20 text-[6.5px] leading-relaxed font-sans text-gray-555 select-none">
                            <div className="border-b border-gray-300 pb-1 flex justify-between font-bold text-[5.5px]">
                              <span>{files[0]?.name.toUpperCase() || "MEMORANDUM_OF_DEED_COVENANT.PDF"}</span>
                              <span>PAGE {signPage} OF {pdfPageCount}</span>
                            </div>
                            <p className="font-extrabold text-[8px] text-gray-800 mt-2 uppercase tracking-tight">COMMERCIAL SERVICES &amp; AGENCY AGREEMENT</p>
                            <p>This BILATERAL SERVICES DEED is executed by and between the specified service provider and the customer respectively.</p>
                            <p>1. SCOPE OF SERVICES. The contractor shall provide high-fidelity offline digital document formatting and translation routines as specified in the client task description ledger.</p>
                            <p>2. INDEMNITY &amp; SAFEGUARDS. All processing operations run entirely in-browser locally using FlateDecode streaming filters, safe-guarding external leakage.</p>
                            <p>3. DATE &amp; ENDORSEMENT. The parties hereby apply their authorized stamp vectors below on the day and year first above written.</p>
                            
                            <div className="pt-2 flex justify-between">
                              <div className="w-16 h-1 border-t border-gray-400 mt-4 text-[5px]">Client Seal Location</div>
                              <div className="w-16 h-1 border-t border-gray-400 mt-4 text-[5px] text-right">Provider Signature Box</div>
                            </div>
                          </div>

                          {/* Footer metadata watermark */}
                          <div className="border-t border-gray-200 dark:border-zinc-800 pt-1 pointer-events-none text-center text-[5px] font-mono text-gray-300 dark:text-zinc-600">
                            PDF SECURE SEAL • DIGITAL VERIFIED ASSET HASH
                          </div>
                        </div>
                      )}

                      {/* Transparent Clickable Overlay that captures clicks */}
                      {selectedAction !== 'pdf-rotate' && (
                        <div 
                          className="absolute inset-0 w-full h-full bg-transparent cursor-crosshair z-10" 
                          onClick={handlePaperClick}
                        />
                      )}

                      {/* Dynamic Signature Stamp Overlay with higher z-index */}
                      {selectedAction === 'pdf-sign' && (
                        <div className="absolute pointer-events-none z-20" style={{
                          left: `${signX}%`,
                          bottom: `${signY}%`,
                          width: `${stampWidthPercent}%`,
                          height: `${stampHeightPercent}%`,
                          transform: 'translate(-50%, 50%)' // Center stamp perfectly on bottom aligned coords
                        }}>
                          {liveSignatureUrl ? (
                            <img 
                              src={liveSignatureUrl} 
                              alt="Stamp Overlay" 
                              className="w-full h-full object-contain shadow-xs border border-indigo-500/10 p-0.5"
                            />
                          ) : (
                            <div className="w-full h-full border border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-400 p-1 flex items-center justify-center font-bold text-[8px] shadow-sm flex-col">
                              <span className="text-[7px] font-mono whitespace-nowrap animate-pulse">{isKo ? "🔒 서명 위치" : "🔒 Sign Here"}</span>
                              <span className="text-[6.5px] font-mono mt-0.5">X:{signX} Y:{signY}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedAction === 'pdf-sign' ? (
                    <>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 text-center font-semibold">
                        {isKo ? "💡 위 계약서 문서의 원하는 위치를 클릭하면 서명이 즉시 배치됩니다." : "💡 Click anywhere on the contract page to relocate your signature."}
                      </p>

                      {/* Manual sliders for precise positioning */}
                      <div className="space-y-2.5 pt-1 border-t border-gray-100 dark:border-zinc-800/60">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col space-y-1">
                            <span className="text-[10px] font-bold text-gray-400">좌우 위치 (X): {signX}%</span>
                            <input
                              type="range"
                              min="5"
                              max="95"
                              value={signX}
                              onChange={(e) => setSignX(parseInt(e.target.value))}
                              className="w-full accent-indigo-600 h-1"
                            />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 font-mono">상하 위치 (Y): {signY}%</span>
                            <input
                              type="range"
                              min="5"
                              max="95"
                              value={signY}
                              onChange={(e) => setSignY(parseInt(e.target.value))}
                              className="w-full accent-indigo-600 h-1"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-gray-400">
                            <span>{tNew('stampPrintWidth')}</span>
                            <span>{signWidth}pt</span>
                          </div>
                          <input
                            type="range"
                            min="40"
                            max="240"
                            value={signWidth}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setSignWidth(val);
                              setSignHeight(Math.round(val / 2)); // 2:1 ratio
                            }}
                            className="w-full accent-indigo-600 h-1"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-[10px] text-gray-500 dark:text-zinc-400 text-center font-semibold pt-1 border-t border-gray-100 dark:border-zinc-800/60 leading-relaxed">
                      {language === 'ko' 
                        ? `💡 현재 문서가 시계 방향으로 ${rotateAngle}도 기울어진 채 처리됩니다. 미리보기가 바르게 일치하는지 지켜보세요.` 
                        : `💡 All pages within the document will be output rotated by ${rotateAngle}° CW as previewed.`}
                    </p>
                  )}

                  {/* Execute/Apply Button (전송 버튼) */}
                  <button
                    type="button"
                    onClick={handleExecuteTool}
                    disabled={isProcessing}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-extrabold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-99.5 cursor-pointer text-xs"
                    id="compact-execute-signature-button"
                  >
                    {isProcessing ? (
                      <>
                        <Activity className="w-3.5 h-3.5 animate-spin" />
                        <span>{tNew('embeddingSignature')}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>{tNew('applyCompileSignedPdf')}</span>
                      </>
                    )}
                  </button>

                {/* Inline downloaded files for signature */}
                {processedResults.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-gray-150 dark:border-zinc-800">
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-450 uppercase tracking-widest block font-mono">
                      {tNew('newSignedDocumentReady')}
                    </span>
                    <div className="p-3 bg-emerald-50/20 dark:bg-emerald-950/15 border border-emerald-100/50 dark:border-emerald-950/30 rounded-xl space-y-3">
                      <div className="flex items-center justify-between gap-1">
                        <div className="truncate text-xs font-semibold text-gray-800 dark:text-zinc-200">
                          {processedResults[0].name}
                        </div>
                        <a
                          href={processedResults[0].url}
                          download={processedResults[0].name}
                          className="flex items-center gap-1 py-1 px-2.5 bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-bold rounded-lg transition-all cursor-pointer shrink-0"
                        >
                          <Download className="w-3 h-3" />
                          <span>{tNew('downloadText')}</span>
                        </a>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-500/10">
                        <button
                          onClick={() => handleShareEmail(processedResults[0].name)}
                          className="inline-flex items-center gap-0.5 py-0.5 px-2 text-[10px] text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800 border border-gray-200/50 dark:border-zinc-700 hover:text-indigo-650 rounded-md font-semibold cursor-pointer"
                        >
                          <Mail className="w-2.5 h-2.5 text-indigo-500" />
                          <span>Email</span>
                        </button>
                        <button
                          onClick={() => handleShareGoogleDrive(processedResults[0].name)}
                          className="inline-flex items-center gap-0.5 py-0.5 px-2 text-[10px] text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800 border border-gray-200/50 dark:border-zinc-700 hover:text-emerald-600 rounded-md font-semibold cursor-pointer"
                        >
                          <Cloud className="w-2.5 h-2.5 text-emerald-500" />
                          <span>Drive</span>
                        </button>
                        <button
                          onClick={() => handleShareSns(processedResults[0].name, processedResults[0].url)}
                          className="inline-flex items-center gap-0.5 py-0.5 px-2 text-[10px] text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800 border border-gray-200/50 dark:border-zinc-700 hover:text-violet-600 rounded-md font-semibold cursor-pointer"
                        >
                          <Globe className="w-2.5 h-2.5 text-violet-500" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )})() : (
              <div className="py-8 text-center text-xs text-gray-400 dark:text-zinc-500 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
                {tNew('noPdfUploadedForSign')}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs text-left space-y-3">
            <h4 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono">
              {tNew('activeToolDashboard')}
            </h4>
            <p className="text-[11.5px] text-gray-500 dark:text-zinc-400 leading-relaxed font-semibold">
              {language === 'ko' 
                ? "작업 대기열에 파일을 업로드하고 상단 도구 실행 버튼을 클릭하면 실시간 변환이 무료로 오프라인 수행됩니다. 완성된 파일은 구글 드라이브 동기화 및 즉시 공유를 지원합니다." 
                : "Load compatible file assets, choose specifications, and launch the offline compiler. Complete compiled elements support direct Google Drive backup sync and instant share methods."}
            </p>
          </div>
        )}
      </div>

      {/* Global Email Share Modal */}
      <AnimatePresence>
        {emailModalFile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-left"
            >
              {/* Header */}
              <div className="bg-indigo-600 dark:bg-indigo-700 px-5 py-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-white animate-pulse" />
                  <span className="font-bold text-sm tracking-tight text-white">
                    {isKo ? "완료 문서 이메일로 보안 전송" : "Send Signed Document via Email"}
                  </span>
                </div>
                <button 
                  onClick={() => setEmailModalFile(null)} 
                  className="text-white/85 hover:text-white transition-colors cursor-pointer text-sm font-semibold p-1"
                  disabled={isSendingEmail}
                >
                  ✕
                </button>
              </div>

              {isSendingEmail ? (
                /* Progress Stage */
                <div className="p-6 space-y-4 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
                    />
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono">
                      {isKo ? "보안 계정 이메일 전송 패키징..." : "SECURE TRANSMISSION IN PROGRESS..."}
                    </span>
                  </div>

                  <div className="space-y-1 text-left bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-gray-150 dark:border-zinc-800">
                    <div className="flex justify-between font-mono text-[10px] text-gray-500">
                      <span className="truncate max-w-[250px] font-semibold">{emailModalFile}</span>
                      <span className="font-bold">{emailSendStep === 4 ? "100%" : `${emailSendStep * 25}%`}</span>
                    </div>
                    <div className="w-full bg-indigo-100 dark:bg-indigo-950 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-indigo-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${emailSendStep * 25}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <div className="font-mono text-[11px] text-left text-gray-500 dark:text-zinc-500 space-y-1.5">
                    {emailSendStep >= 1 && <p className="text-emerald-600 font-medium">✔ [INFO] {isKo ? "보안 SSL 메일 전송 릴레이 환경 초기화 완료." : "Encrypted SSL mail tunnel successfully established."}</p>}
                    {emailSendStep >= 2 && <p className="text-emerald-600 font-medium">✔ [INFO] {isKo ? "서명 완료 고화질 원본 계약서 메타데이터 서명 완료." : "Verifying digital stamp of compiled PDF metadata..."}</p>}
                    {emailSendStep >= 3 && <p className="text-emerald-600 font-medium">✔ [INFO] {isKo ? "가상 SMTP 게이트웨이 인증 및 대기열 전송 시작..." : "Streaming attachments to recipient SMTP inbox..."}</p>}
                    {emailSendStep >= 4 && <p className="text-indigo-600 font-bold">✔ [SUCCESS] {isKo ? "이메일 딜리버리 전송 수신 확인 완료!" : "Transmission delivered securely over TLS protocol!"}</p>}
                  </div>
                </div>
              ) : (
                /* Input Form Stage */
                <div className="p-5 space-y-4">
                  {/* Attached File Preview Badge */}
                  <div className="flex items-center gap-2 p-2.5 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-950/20 rounded-xl text-emerald-800 dark:text-emerald-300">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900 rounded-lg shrink-0">
                      <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest font-mono">
                        {isKo ? "공인 서명 첨부 파일" : "Cryptographically Signed PDF Attachment"}
                      </p>
                      <p className="text-xs font-bold truncate text-gray-700 dark:text-zinc-200">{emailModalFile}</p>
                    </div>
                  </div>

                  {/* Recipient Input */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-extrabold text-gray-705 dark:text-zinc-300 uppercase tracking-widest font-mono">
                      {isKo ? "수신인 이메일 주소 *" : "Recipient Email Address *"}
                    </label>
                    <input 
                      type="email"
                      placeholder="recipient@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-zinc-100 focus:outline-none focus:ring-1.5 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                      autoFocus
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-2">
                    {/* Google Gmail Option */}
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:shadow-lg"
                    >
                      <svg className="w-4 h-4 shrink-0 filter brightness-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#FFFFFF" />
                      </svg>
                      <span>{isKo ? "Gmail(구글 메일)로 간편 발송하기" : "Submit & Compose in Gmail"}</span>
                    </a>

                    {/* Secure File Attachment Helper Tip */}
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-900/20 rounded-xl text-[10.5px] text-indigo-700 dark:text-indigo-400 font-medium leading-relaxed space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300 text-xs">
                        📎 {isKo ? "자동 수동 첨부 가이드" : "Easy File Attachment Guide"}
                      </p>
                      <p>
                        {isKo 
                          ? "보안 샌드박스 정책으로 브라우저가 외부 메일 서비스에 컴퓨터 파일을 직접 자동 삽입하는 것은 기술적으로 차단되어 있습니다." 
                          : "Due to web security sandbox policy, automatic attachment of local files is protected by browser constraints."}
                      </p>
                      <p className="bg-white/80 dark:bg-zinc-900/80 p-1.5 rounded-lg border border-indigo-100/50 dark:border-indigo-950/40 text-[10px] font-bold">
                        {isKo 
                          ? "💡 해결방법: 아래 Gmail 발송 버튼을 눌러 작성창이 열리면 다운로드된 완료 파일을 마우스로 끌어서(Drag & Drop) 놓아주시면 1초 만에 깔끔하게 자동 첨부됩니다!"
                          : "💡 Tip: Click the Gmail compose button, then simply drag and drop your downloaded PDF into the mail window to attach in a second!"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 my-1.5">
                      <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-800" />
                      <span className="text-[9px] font-extrabold text-gray-400 font-mono">OR ALTERNATIVES</span>
                      <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-800" />
                    </div>

                    <button
                      onClick={executeSendEmail}
                      className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-gray-500" />
                      <span>{isKo ? "가상 보안 SMTP 릴레이 무료 발송 (서버 대리 전송)" : "Send via Virtual Free SMTP Relay"}</span>
                    </button>

                    {/* Mailto Fallback Option inside frame */}
                    <a
                      href={`mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                      target="_parent"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-3 text-center border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-all text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Mail className="w-3 h-3 text-gray-500" />
                      <span>{isKo ? "기타 네이티브 메일 클라이언트로 발송" : "Open in Native Mail App"}</span>
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
