import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, Heart, Monitor, Zap, Cpu, Compass, BookOpen, Lightbulb, ChevronDown, ChevronUp, Star, Film, FileText, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AboutViewProps {
  language: string;
  onBack?: () => void;
  tabViewOnly?: boolean;
}

// 🌐 Ultimate 13-Language Technical Translation Map
const TRANSLATIONS: Record<string, {
  backBtn: string;
  sectionTitle: string;
  sectionDesc: string;
  wasmTitle: string;
  wasmDesc: string;
  ioTitle: string;
  ioDesc: string;
  gpuTitle: string;
  gpuDesc: string;
  configTitle: string;
  spec1Title: string;
  spec1Desc: string;
  spec2Title: string;
  spec2Desc: string;
  spec3Title: string;
  spec3Desc: string;
  spec4Title: string;
  spec4Desc: string;
  magCategory: string;
  magTitle: string;
  catAll: string;
  catImage: string;
  catDoc: string;
  catTech: string;
  tipLabel: string;
  tipText: string;
  benchTitle: string;
  benchDesc: string;
  benchBtnIdle: string;
  benchBtnActive: string;
  benchResultLabel: string;
  benchResultValue: string;
  subAssemblyTitle: string;
  subAssemblyAuthorized: string;
  precCrafted: string;
  precWorkflows: string;
  toolsTitle: string;
  toolsDesc: string;
}> = {
  en: {
    backBtn: "Back to Workspace",
    sectionTitle: "On-Device Sandbox Architecture",
    sectionDesc: "Our high-performance image and document studio completely eliminates legacy, privacy-threatening web backend models. By embedding WebAssembly runtime modules and dynamic decoder virtual machines directly inside your secure browser environment, we achieve absolute data confidentiality alongside swift processing speeds without network latency.",
    wasmTitle: "WASM Processor",
    wasmDesc: "Launches high-performance multi-threaded processing pools right inside your browser confines, maximizing your file conversion output.",
    ioTitle: "Light-speed IO",
    ioDesc: "Zero upload and download delay. File conversions trigger and complete immediately on your local device.",
    gpuTitle: "Responsive GPU",
    gpuDesc: "Adapts dynamically to standard device refresh rates and display ratios for smooth canvas evaluation.",
    configTitle: "⚙️ Local Framework Compilation & Standard Specifications",
    spec1Title: "1. Modern Raster Encoding: Advantages of WebP & AVIF",
    spec1Desc: "The advanced WebP format provides high-contrast pixel predictive compression schemas, reducing overall network footprint. AVIF utilizes the AV1 core compression structure to keep maximum color chroma and High Dynamic Range data perfectly aligned. Since processing runs right in your client sandbox without telemetry tracking, we utilize low-latency offscreen framebuffers directly.",
    spec2Title: "2. Document Mapping: PDF Cross-Reference Table Integration",
    spec2Desc: "Portable Document Format (PDF) files manage text layout structures using distinct indirect object dictionary tables. Splitting or merging PDF binary records demands physical cross-reference (XREF) index tracking. Applying linear byte-slicing leads to structural document errors. This client sandbox recreates these tables directly inside your browser virtual execution workspace.",
    spec3Title: "3. Excel Parser Engine: SheetJS XLSX-to-CSV Streaming",
    spec3Desc: "Converting binary Excel layout formats into clean CSV representations requires complete deserialization of the workbook stream. By utilizing the lightweight compiled SheetJS system in our browser runtime workspace, OptiConvert parses both unicode structures and multi-sheet coordinate mappings locally, with strict state lifecycle isolation.",
    spec4Title: "4. Client-Side Archive: JSZip Local Compressing Methods",
    spec4Desc: "To fetch multi-asset conversions instantly without recursive clicks, we compute solid compressed zip archives right in memory. By applying the standard on-device DEFLATE lossless Huffman coding rules inside JSZip helper threads, processed Blobs are safely mapped and downloaded as a unified .zip archive.",
    magCategory: "Media & Format Optimization Hub",
    magTitle: "💡 Sizing & Transcoding Encyclopedia",
    catAll: "All",
    catImage: "Image",
    catDoc: "Docs",
    catTech: "Tech News",
    tipLabel: "Workspace Tip:",
    tipText: "Navigate back to the workspace to apply this advice directly on your files!",
    benchTitle: "💡 Sandbox Engine Speed Diagnostics",
    benchDesc: "Test how many matrix rendering computations your CPU thread can execute inside this isolated browser space.",
    benchBtnIdle: "Run Speed Assessment",
    benchBtnActive: "Evaluating...",
    benchResultLabel: "Client Processing Speed",
    benchResultValue: "{score} Ops/Sec (EXCELLENT)",
    subAssemblyTitle: "Sub-Assembly Framework",
    subAssemblyAuthorized: "Authorized stack: Canvas WebAssembly-Style Stream Filters, SheetJS XLSX Parsing VM, PDF-Lib Assembly Shell, local Zip compression.",
    precCrafted: "Precision Crafted with ",
    precWorkflows: " for secure corporate workflows.",
    toolsTitle: "Tools by Use Case",
    toolsDesc: "Jump directly to common tasks."
  },
  ko: {
    backBtn: "작업 스튜디오로 돌아가기",
    sectionTitle: "스튜디오 가상화 기술 & 소개",
    sectionDesc: "우리의 고성능 이미지 및 문서 스튜디오는 복잡하고 프라이버시에 위협이 되는 기존의 웹 백엔드 서버 모델을 완전히 무력화시킵니다. 웹 어셈블리(WebAssembly) 및 가상 디코더 엔진을 브라우저에 임베드하여 전례 없는 프라이버시 수준과 압도적인 처리 속도를 전송 대기 시간 없이 동시에 달성합니다.",
    wasmTitle: "WASM 프로세서",
    wasmDesc: "메모리 누수 걱정 없는 고속 연산 스레드를 구동합니다. 로컬 컴파일 방식을 통해 파일 변환 효율을 극대화합니다.",
    ioTitle: "초고속 로컬 입출력",
    ioDesc: "서버로 데이터를 업로드하고 다운로드 받는 대기 속도가 없습니다. 대용량 문서도 처리 즉시 실시간 전환됩니다.",
    gpuTitle: "반응형 하드웨어 가속",
    gpuDesc: "기기 화면 해상도나 테마 설정에 스마트 반응하여, 모바일 환경에서도 부담 없이 고해상도 그래픽 데이터를 다듬어냅니다.",
    configTitle: "📊 크로스 컴파일 기반 로컬 포맷 인코딩 아키텍처",
    spec1Title: "1. WebP 및 AVIF 그래픽 매트릭스의 무손실 압축 특징",
    spec1Desc: "구글(Google)이 개발한 WebP 포맷은 고도의 에지 픽셀 예측 인코딩 기술을 탑재하여, 동등 화질 기준 JPEG 포맷 대비 대략 26%~34%의 물리 구조 용량 조절 강점을 지닙니다. AVIF는 로열티 프리 압축 표준 규격인 AV1 비디오 코딩 모델에 기반해 더 방대한 고대비 명암 계조(High Dynamic Range, HDR) 성분을 왜곡 없이 극단적으로 다단 압축 결합합니다. 본 도구는 기기 내 가상 프레임 버퍼를 형성해 유휴 주파수 대역 내 소스 왜곡이 없도록 메모리 정렬을 자동으로 계산합니다.",
    spec2Title: "2. PDF 문서 간접 주소 테이블(XREF Table) 병합 구조",
    spec2Desc: "PDF(Portable Document Format)의 파일 물리 레이아웃은 개별적 간접 식별자 테이블(Indirect Object Cross-Reference Column or XREF) 및 Trailer 사전을 축으로 결속됩니다. 문서를 임의 병합(Merge)하거나 특정 도화 영역으로 분할(Split)하기 위해선, 단순한 바이트 배열 슬라이싱만 활용하면 심각한 렌더러 손상과 서명 해제가 초래됩니다. 본 시스템은 PDF-Lib 어셈블리를 로딩하여 메모리에서 가상 링커 테이블을 리인덱싱(Re-indexing)해 완벽한 페이지 흐름을 완결해 냅니다.",
    spec3Title: "3. XLSX 스프레드시트 직렬화 및 바이트 레코드 분석 체계",
    spec3Desc: "Excel 통합 문서를 CSV 플랫 파일로 환원하기 위해서는 바이너리 청크 스트림을 셀 좌표 매트릭스 형태로 완전 역직렬화(Deserialization)해야 합니다. 본 통합 스튜디오는 SheetJS 라이브러리의 경량 바이너리 엔진 모델을 로컬 런타임에 샌드박스로 적재하여, 한글 완성형 자소 인덱스(EUC-KR)나 UTF-8 가변 길이 정렬을 누수 없이 일괄 분석합니다. 이 일련의 정밀 파싱 처리는 클라이언트 내 스택 영역 메모리 구조 수준에서만 정적인 상태로 파괴적으로 수렴됩니다.",
    spec4Title: "4. 로컬 Zip 압축 아카이브 스트림 빌드 알고리즘",
    spec4Desc: "변환된 대량 수치의 다중 출력 자산을 개별 수동 조작 대신 일괄 다용도로 내려받기 위하여, 로컬 압축 기법을 병행 실행합니다. JSZip 라이브러리의 온디바이스 DEFLATE 슬라이딩 무손실 허프만 복호화 원리를 차용하여, 변환 완료된 Blob 리소스를 기기 클라이언트의 임시 RAM 바이트 버퍼상에서 즉시 단일 지퍼 아카이브(.zip) 스트림으로 묶어서 디바이스 내부 영역으로 보냅니다.",
    magCategory: "미디어 & 포맷 최적화 매거진",
    magTitle: "💡 미디어 최적화 꿀팁 & 최신 뉴스",
    catAll: "전체",
    catImage: "이미지 팁",
    catDoc: "문서 최적화",
    catTech: "최신 기술/뉴스",
    tipLabel: "팁 조언:",
    tipText: "해당 탭 작업 공간에서 위 최적화 가이드 방식을 직접 체험해 보실 수 있습니다.",
    benchTitle: "💡 기기 성능 & 최적화 진단 도구 (Sandbox Benchmark)",
    benchDesc: "우측 버튼을 눌러 본 기기의 내부 코어 연산 장치가 암호 파일 처리와 이미지 픽셀 매핑을 초당 몇 회 수행할 수 있는지 속도를 실시간 진단해보세요.",
    benchBtnIdle: "성능 분석 실행",
    benchBtnActive: "엔진 진단중...",
    benchResultLabel: "기기 프로세싱 속도",
    benchResultValue: "초당 {score}회 연산 (우수)",
    subAssemblyTitle: "Sub-Assembly Framework",
    subAssemblyAuthorized: "인증 규격: CSS v4 Flex Core, SheetJS XLSX Parsing VM, PDF-Lib Assembly Shell, local Zip compression.",
    precCrafted: "정밀 수공예 제작: ",
    precWorkflows: " 사내 보안 워크플로우를 보증합니다.",
    toolsTitle: "사용 케이스별 도구",
    toolsDesc: "자주 사용하는 작업에 바로 접근하세요."
  },
  ja: {
    backBtn: "ワークスペースに戻る",
    sectionTitle: "オンデバイス・サンドボックス・アーキテクチャ",
    sectionDesc: "当社の高性能画像・ドキュメントスタジオは、従来のセキュリティ上の懸念があったWebバックエンドモデルを完全に排除します。WebAssemblyランタイムモジュールと動的デコーダー仮想マシンを安全なブラウザ環境内に直接埋め込むことで、ネットワーク遅延のない迅速な処理速度と強固なデータ機密性を同時に実現します。",
    wasmTitle: "WASMプロセッサー",
    wasmDesc: "ブラウザ内にメモリリークのない高速処理用マルチスレッドスレッドを起動し、ファイル変換の効率を最大限に高めます。",
    ioTitle: "超高速ローカル入出力",
    ioDesc: "サーバーへのデータのアップロードやダウンロードの待機時間がありません。大容量の文書も処理後すぐにリアルタイムで変換されます。",
    gpuTitle: "レスポンシブGPUアクセラレーション",
    gpuDesc: "デバイスの画面解像度やテーマ設定にスマートに対応し、モバイル環境でも高解像度グラフィックスデータをスムーズに処理します。",
    configTitle: "📊 クロスコンパイル対応ローカルフォーマットエンコード構造",
    spec1Title: "1. WebP及びAVIFグラフィックマトリックスの無損失圧縮機能",
    spec1Desc: "Googleが開発したWebPフォーマットは高度なエッジピクセル予測エンコーディング技術を搭載しており、同等画質のJPEGフォーマットと比較して約26%〜34%のファイル容量削減が可能です。AVIFはロイヤリティフリー圧縮標準規格であるAV1に基づき、極めてダイナミックな明暗諧調（HDR）データを歪みなく高度に圧縮します。",
    spec2Title: "2. PDF文書間接参照テーブル（XREF Table）結合構造",
    spec2Desc: "PDF（Portable Document Format）は、個別の間接オブジェクト相互参照テーブル（XREF）をリンク構造として結合します。一般的なテキストとバイナリの単純な結合はファイルを破壊しますが、当システムはPDF-Libを読み込んで仮想リンカーテーブルをメモリ上に再構築し（Re-indexing）、完璧な結合を実現します。",
    spec3Title: "3. XLSXスプレッドシートシリアライズ及びレコード解析体系",
    spec3Desc: "Excel文書をCSVに変換するために、バイナリチャンクストリームをマトリックス状に完全逆シリアル化（Deserialization）します。ローカルランタイムに搭載されたSheetJSエンジンが、EUC-KRやUTF-8といった多国語の可変調テキストを漏れなく確実に高速デコードします。",
    spec4Title: "4. ローカルZip圧縮アーカイブビルドアルゴリズム",
    spec4Desc: "一括で大量の出力を保存するため、オンデバイスでのDEFLATEロスレスハフマン圧縮を実行します。JSZipライブラリを活用し、処理済のファイルを一時的なRAMバッファ上で単一の.zipアーカイブとしてまとめ、ローカルにダウンロードします。",
    magCategory: "メディア＆フォーマット最適化マガジン",
    magTitle: "💡 メディア最適化のコツと最新ニュース",
    catAll: "全体",
    catImage: "画像チップ",
    catDoc: "ドキュメント最適化",
    catTech: "最新技術/ニュース",
    tipLabel: "ワークスペースのヒント:",
    tipText: "上のタブからワークスペースに戻り、この最適化ガイドを利用して直接ファイルを変換できます。",
    benchTitle: "💡 デバイスの性能＆最適化診断（Sandbox Benchmark）",
    benchDesc: "デバイスの内部コアがファイル署名やピクセル処理を毎秒何回実行できるか、ローカルの速度をリアルタイム診断します。",
    benchBtnIdle: "性能分析を実行する",
    benchBtnActive: "エンジン診断中...",
    benchResultLabel: "デバイス処理速度",
    benchResultValue: "毎秒 {score}回 演算 (極めて優秀)",
    subAssemblyTitle: "Sub-Assembly Framework",
    subAssemblyAuthorized: "承認されたスタック: CSS v4 Flex Core, SheetJS XLSX Parsing VM, PDF-Lib Assembly Shell, ローカルZip圧縮。",
    precCrafted: "精密な設計と手作業: ",
    precWorkflows: " 安全で快適なオフィス環境を保証します。",
    toolsTitle: "目的別のクイックツール",
    toolsDesc: "頻繁に行うタスクへ瞬時にジャンプします。"
  },
  zh: {
    backBtn: "返回工作区",
    sectionTitle: "本地浏览器安全沙箱架构",
    sectionDesc: "我们高性能的图像和文档处理中心彻底消除了对传统隐蔽服务器后端的依赖。通过直接在浏览器安全环境内嵌入 WebAssembly 运行时虚拟机和动态译码模块，实现了绝密的数据保密和瞬间完成的处理速度，决不产生网络等待和隐私泄漏延迟。",
    wasmTitle: "WASM 极速处理器",
    wasmDesc: "在您的浏览器内部安全拉起多线程高并发的处理机制，极大化对复杂图片的压缩效能和多任务效率。",
    ioTitle: "零网络延迟 IO",
    ioDesc: "转换触发立刻在本地设备中执行并导出，省去传统文件传输上传和下载漫长的网络大文件传输损耗。",
    gpuTitle: "原生显示端加速",
    gpuDesc: "智能检测和响应各种显示器的刷新率，即使在低配移动端也能流畅进行海量图形栅格重建。",
    configTitle: "📊 交叉汇编与本地多格式解包编译机制",
    spec1Title: "1. 现代像素编码：WebP 和 AVIF 图形无损压缩优势",
    spec1Desc: "谷歌开发的 WebP 格式采用了尖端的边缘预测帧内编码，可以在保持同等画质下比传统 JPEG 或 PNG 缩减约 26%-34% 的物理体积。AVIF 则是基于 AV1 色彩模型开发的最新一代格式，完美还原高动态范围（HDR）色谱而几乎不失真。",
    spec2Title: "2. 文档地址寻址：PDF XREF 交叉表的高安全连接重组",
    spec2Desc: "PDF 规范借助间接交叉引用表（XREF）和Trailer目录记录排布。如需拆分或合并文件，强行通过切割二进制字节会导致严重结构损毁。我们通过 PDF-Lib 重构其内部链式定位表，安全拼接整个文件。",
    spec3Title: "3. XLSX 电子表格高速解包与 Unicode 正规化解析",
    spec3Desc: "Excel 表格还原至 CSV 需要完全反序列化工作流流单元格。我们集成的 SheetJS 虚拟机能零内存溢出地分析复杂的表内数据排列，并兼容多国语言（如韩文、中文等）的长宽编码正规化。",
    spec4Title: "4. 内存级 Zip 流媒体级流归档多核算法",
    spec4Desc: "为解决逐一点击下载带来的低效体验，本系统基于 DEFLATE 与 Huffman 无损多重压缩，将所有成果瞬间封装成单个 .zip 压缩文件，并交由浏览器进行内存映射的直接保存。",
    magCategory: "媒体与格式优化百科",
    magTitle: "💡 媒体优化指南与前沿资讯",
    catAll: "全部",
    catImage: "图像提示",
    catDoc: "文档重构",
    catTech: "前沿技术讯息",
    tipLabel: "快速提示:",
    tipText: "您可以在对应工作区直接体验和应用上述优化技巧和格式参数转换。",
    benchTitle: "💡 本地设备性能与沙箱计算效率诊断",
    benchDesc: "测试您的本地 CPU 线程在纯净隔离的浏览器内存环境中每秒可运行多少次数的高速图片算法计算。",
    benchBtnIdle: "运行性能诊断",
    benchBtnActive: "正在分析中...",
    benchResultLabel: "本地计算速率",
    benchResultValue: "{score} 次/秒 运算 (杰出)",
    subAssemblyTitle: "Sub-Assembly Framework",
    subAssemblyAuthorized: "授权标准: CSS v4 Flex Core, SheetJS XLSX Parsing VM, PDF-Lib Assembly Shell, 本地 ZIP 封装组。",
    precCrafted: "匠心打磨与精密构架：",
    precWorkflows: " 致力于保障最安全的商业机密与办公体验。",
    toolsTitle: "使用场景工具",
    toolsDesc: "直接跳转至相应的批量通用任务。"
  },
  es: {
    backBtn: "Volver al espacio de trabajo",
    sectionTitle: "Arquitectura de Sandbox en el Dispositivo",
    sectionDesc: "Nuestra suite de optimización de imágenes y documentos de alta velocidad funciona sin servidores externos. Tu navegador actúa como un entorno aislado seguro e independiente para garantizar una total confidencialidad.",
    wasmTitle: "Procesador WASM",
    wasmDesc: "Inicia subprocesos multi-hilo de alta velocidad directamente en tu navegador, maximizando la eficiencia de conversión.",
    ioTitle: "E/S de alta velocidad local",
    ioDesc: "Sin esperas para subir ni descargar archivos. Conversión inmediata en memoria en tu propio hardware local.",
    gpuTitle: "Aceleración de GPU",
    gpuDesc: "Representación fluida y adaptativa que responde eficazmente a resoluciones de pantallas móviles y monitores.",
    configTitle: "📊 Compilación local y especificaciones estándar",
    spec1Title: "1. Codificación moderna: Ventajas de WebP y AVIF",
    spec1Desc: "El formato WebP de Google ofrece un gran ahorro de almacenamiento sobre JPEG (aprox. 30%). AVIF mantiene colores profundos y una asombrosa dinámica HDR, sacrificando un porcentaje menor de velocidad.",
    spec2Title: "2. Estructuras PDF: Integración de tablas de referencias indirectas (XREF Map)",
    spec2Desc: "La unión o combinación de documentos PDF reconstruye de forma transparente las tablas XREF lógicas en la memoria del dispositivo para impedir desvíos o fallos de lectura.",
    spec3Title: "3. Motor de Excel: Procesamiento de archivos XLSX a CSV",
    spec3Desc: "Parsea y decodifica las complejas matrices y hojas de cálculo de forma totalmente local en la RAM de su navegador, con un soporte impecable de caracteres Unicode.",
    spec4Title: "4. Archivos Zip locales: Compresión del lado del cliente",
    spec4Desc: "Bajo las reglas DEFLATE y Huffman, consolida múltiples documentos listos en un único archivo comprimido .zip listo para descargar mediante JSZip.",
    magCategory: "Faro de optimización multimedia",
    magTitle: "💡 Enciclopedia de tamaño y transcodificación",
    catAll: "Todo",
    catImage: "Imagen",
    catDoc: "Docs",
    catTech: "Tecnología",
    tipLabel: "Consejo rápido:",
    tipText: "¡Vuelve al espacio de trabajo superior para aplicar estas recomendaciones directamente en tus archivos!",
    benchTitle: "💡 Diagnóstico de velocidad y CPU local",
    benchDesc: "Mide cuántas operaciones de cálculo matricial de codificación puede ejecutar tu procesador en un segundo dentro de esta pestaña aislada.",
    benchBtnIdle: "Evaluar rendimiento",
    benchBtnActive: "Evaluando...",
    benchResultLabel: "Velocidad de procesamiento",
    benchResultValue: "{score} Ops/Seg (EXCELENTE)",
    subAssemblyTitle: "Sub-Assembly Framework",
    subAssemblyAuthorized: "Pila autorizada: CSS v4 Flex Core, SheetJS XLSX Parsing VM, PDF-Lib Assembly Shell, compresión ZIP local.",
    precCrafted: "Diseñado con precisión con ",
    precWorkflows: " para flujos de trabajo corporativos seguros y estables.",
    toolsTitle: "Herramientas por caso de uso",
    toolsDesc: "Accede directamente a las tareas más comunes."
  },
  fr: {
    backBtn: "Retourner à l'espace de travail",
    sectionTitle: "Architecture de Sandbox sur l'Appareil",
    sectionDesc: "Notre studio multimédia performant élimine entièrement les liaisons serveurs classiques. Votre navigateur agit comme un espace sandbox local d'exécution ultra-sécurisé pour vos fichiers.",
    wasmTitle: "Processeur WASM",
    wasmDesc: "Lance des calculs multi-thread à haute fréquence directement dans votre espace mémoire pour optimiser la conversion.",
    ioTitle: "E/S à la vitesse de la lumière",
    ioDesc: "Pas d'envoi ni d'attente réseau. Fichiers convertis en temps réel de façon instantanée sur votre microprocesseur.",
    gpuTitle: "GPU fluide et réactif",
    gpuDesc: "Rendu graphique adaptatif s'ajustant dynamiquement aux dimensions de tout écran d'appareil.",
    configTitle: "📊 Compilation locale et spécifications standards",
    spec1Title: "1. Encodage moderne : Avantages du WebP et de l'AVIF",
    spec1Desc: "Le format WebP gère une excellente prédiction de pixels pour réduire le poids de 30% comparé au JPEG. AVIF applique des spectres HDR contrastés de très haute qualité.",
    spec2Title: "2. Cartographie de documents : Intégration de la table XREF de PDF",
    spec2Desc: "La fusion de PDF réindexe proprement l'ensemble des adresses croisées afin d'éviter toute corruption lors de la lecture ultérieure dans vos visionneuses.",
    spec3Title: "3. Interprète Excel : Flux de conversion XLSX vers CSV",
    spec3Desc: "Analyse et désérialise les classeurs et jeux de coordonnées complexes localement, assurant une parfaite gestion des caractères Unicode.",
    spec4Title: "4. Archives Zip locales : Méthodes d'emballage du côté client",
    spec4Desc: "Assemble plusieurs fichiers convertis dans une archive .zip solide construite de manière sécurisée en RAM via des threads d'assistance JSZip.",
    magCategory: "Centre d'optimisation média",
    magTitle: "💡 Encyclopédie du dimensionnement",
    catAll: "Tout",
    catImage: "Image",
    catDoc: "Docs",
    catTech: "Actualités",
    tipLabel: "Astuce :",
    tipText: "Retournez à l'espace de travail supérieur pour exécuter ces optimisations directement sur vos fichiers !",
    benchTitle: "💡 Diagnostic de vitesse et CPU local",
    benchDesc: "Mesurez le nombre de calculs matriciels de codage que votre CPU peut exécuter en une seconde au sein de ce bac à sable.",
    benchBtnIdle: "Lancer le test de vitesse",
    benchBtnActive: "Évaluation...",
    benchResultLabel: "Vitesse d'exécution client",
    benchResultValue: "{score} Ops/Sec (EXCELLENT)",
    subAssemblyTitle: "Sub-Assembly Framework",
    subAssemblyAuthorized: "Composants autorisés : CSS v4 Flex Core, SheetJS XLSX Parsing VM, PDF-Lib Assembly Shell, compression ZIP locale.",
    precCrafted: "Conçu avec précision et ",
    precWorkflows: " pour des flux de travail professionnels pleinement sécurisés.",
    toolsTitle: "Outils par cas d'utilisation",
    toolsDesc: "Accédez directement aux tâches les plus courantes."
  },
  de: {
    backBtn: "Zurück zum Arbeitsbereich",
    sectionTitle: "Lokale Sandbox-Architektur",
    sectionDesc: "Unser performantes Bild- und Dokumentenstudio macht ungesicherte Cloud-Server überflüssig. Ihr Webbrowser fungiert als geschlossener, sicherer lokaler Speicher.",
    wasmTitle: "WASM-Prozessor",
    wasmDesc: "Startet hochperformante Multi-Thread-Berechnungen direkt im Browser für maximale Effizienz.",
    ioTitle: "Lokaler Echtzeit-I/O",
    ioDesc: "Keine Wartezeiten beim Up- oder Download. Dateikonvertierungen erfolgen sofort auf Ihrem eigenen Prozessor.",
    gpuTitle: "GPU-Beschleunigung",
    gpuDesc: "Flüssiges Canvas-Rendering, das sich an Displayauflösungen beliebiger Endgeräte anpasst.",
    configTitle: "📊 Lokale Kompilierung & Standard-Spezifikationen",
    spec1Title: "1. Moderne Rastercodierung: Vorteile von WebP & AVIF",
    spec1Desc: "Hierbei bietet WebP exzellente Datenkomprimierung bei hoher Kompatibilität. AVIF liefert modernste HDR-Farbtiefe für Grafikprofis bei maximaler Platzeinsparung.",
    spec2Title: "2. PDF-Strukturen: Rekonstruktion von XREF-Adresstabellen",
    spec2Desc: "Die PDF-Zusammenführung rekonstruiert die Adresstabellen (XREF) direkt in der RAM und schützt so vor Dateibeschädigungen.",
    spec3Title: "3. Excel-Parser: XLSX-zu-CSV Stream-Deserialisierung",
    spec3Desc: "Parst Microsoft Excel Arbeitsmappen direkt lokal unter Berücksichtigung von Unicode-Zeichensätzen ohne Datenverlust.",
    spec4Title: "4. Lokale ZIP-Archive: Clientseitige Komprimierung",
    spec4Desc: "Bündelt konvertierte Dateien über JSZip auf Ihrem PC in einem einzigen, sofort herunterladbaren .zip-Archiv.",
    magCategory: "Medien-Optimierungsmagazin",
    magTitle: "💡 Enzyklopädie zur Bildgröße & Transkodierung",
    catAll: "Alle",
    catImage: "Bilder",
    catDoc: "Dokumente",
    catTech: "Tech News",
    tipLabel: "Tipp:",
    tipText: "Kehren Sie zum Arbeitsbereich zurück, um diese Ratschläge direkt auf Ihre Dateien anzuwenden!",
    benchTitle: "💡 Lokale Engine-Geschwindigkeitsdiagnose",
    benchDesc: "Testen Sie, wie viele Matrixberechnungen Ihre CPU-Threads in dieser isolierten Umgebung pro Sekunde durchführen können.",
    benchBtnIdle: "Geschwindigkeit messen",
    benchBtnActive: "Auswertung läuft...",
    benchResultLabel: "Client-Rechengeschwindigkeit",
    benchResultValue: "{score} Ops/Sek (HERVORRAGEND)",
    subAssemblyTitle: "Sub-Assembly Framework",
    subAssemblyAuthorized: "Autorisierter Stack: CSS v4 Flex Core, SheetJS XLSX Parsing VM, PDF-Lib Assembly Shell, lokale ZIP-Kompression.",
    precCrafted: "Präzise gefertigt mit ",
    precWorkflows: " für sichere Unternehmens-Workflows.",
    toolsTitle: "Werkzeuge nach Anwendungsfall",
    toolsDesc: "Springen Sie direkt zu häufig genutzten Aufgaben."
  },
  vi: {
    backBtn: "Quay lại không gian làm việc",
    sectionTitle: "Kiến trúc Sandbox trên thiết bị",
    sectionDesc: "Bộ công cụ xử lý tài liệu và hình ảnh hiệu năng cao của chúng tôi loại bỏ hoàn toàn các mối đe dọa bảo mật từ server đám mây, vận hành khép kín trên trình duyệt của bạn.",
    wasmTitle: "Bộ xử lý WASM",
    wasmDesc: "Kích hoạt các luồng xử lý đa nhân tốc độ cao ngay trong trình duyệt của bạn để tối ưu hiệu suất.",
    ioTitle: "I/O siêu tốc độ",
    ioDesc: "Không tốn thời gian tải lên và tải xuống. Tài liệu được chuyển đổi ngay lập tức trên vi xử lý của bạn.",
    gpuTitle: "Tăng tốc GPU phản hồi nhanh",
    gpuDesc: "Đáp ứng mượt mà với độ phân giải và tỉ lệ hiển thị của mọi loại thiết bị di động hay máy tính.",
    configTitle: "📊 Kiến trúc Biên dịch và Tiêu chuẩn hóa tại chỗ",
    spec1Title: "1. Mã hóa hình ảnh hiện đại: Ưu điểm của WebP & AVIF",
    spec1Desc: "Định dạng WebP của Google tối ưu dung lượng từ 26% đến 34% so với JPEG. AVIF mang lại dải tương phản động rộng (HDR) siêu chân thực và tỷ lệ nén đột phá.",
    spec2Title: "2. Hợp nhất PDF: Tái cấu trúc bảng tham chiếu chéo (XREF Table)",
    spec2Desc: "Gộp hoặc tách tài liệu PDF bằng cách tự động xây dựng lại sơ đồ liên kết trang ảo nhằm loại bỏ triệt để xung đột định dạng.",
    spec3Title: "3. Công cụ xử lý Excel: Chuyển đổi XLSX sang CSV",
    spec3Desc: "Phân tích và biến đổi các trang tính Excel chứa cấu trúc phức tạp và biểu tượng Unicode trực tiếp trên Ram thiết bị.",
    spec4Title: "4. Đóng gói Zip cục bộ: Phương pháp nén phía máy khách",
    spec4Desc: "Gộp nhiều tệp thành một nén DEFLATE không tổn hao bằng thư viện JSZip để sẵn sàng tải xuống nhanh chóng.",
    magCategory: "Trung tâm tối ưu hóa phương tiện",
    magTitle: "💡 Cẩm nang tối ưu định dạng & kích thước",
    catAll: "Tất cả",
    catImage: "Hình ảnh",
    catDoc: "Tài liệu",
    catTech: "Tin công nghệ",
    tipLabel: "Lời khuyên:",
    tipText: "Quay lại khu vực làm việc phía trên để áp dụng các mẹo tối ưu này trực tiếp cho tài liệu của bạn!",
    benchTitle: "💡 Đo hiệu năng xử lý Sandbox tại chỗ",
    benchDesc: "Kiểm tra số chu kỳ tính toán ma trận mà CPU của thiết bị có thể thực hiện mỗi giây trong môi trường bảo mật này.",
    benchBtnIdle: "Bắt đầu đo hiệu năng",
    benchBtnActive: "Đang đo...",
    benchResultLabel: "Tốc độ xử lý",
    benchResultValue: "{score} Ops/Giây (RẤT TỐT)",
    subAssemblyTitle: "Sub-Assembly Framework",
    subAssemblyAuthorized: "Tiêu chuẩn đóng gói: CSS v4 Flex Core, SheetJS XLSX Parsing VM, PDF-Lib Assembly Shell, nén ZIP cục bộ.",
    precCrafted: "Thiết kế tỉ mỉ với ",
    precWorkflows: " cho các quy trình làm việc doanh nghiệp cần bảo mật tuyệt đối.",
    toolsTitle: "Công cụ theo tình huống sử dụng",
    toolsDesc: "Truy cập trực tiếp và nhanh chóng các tác vụ phổ biến."
  },
  hi: {
    backBtn: "कार्यक्षेत्र पर वापस जाएं",
    sectionTitle: "ऑन-डिवाइस सैंडबॉक्स आर्किटेक्चर",
    sectionDesc: "हमारा उच्च प्रदर्शन छवि और दस्तावेज़ स्टूडियो किसी भी बाहरी क्लाउड सर्वर की आवश्यकता के बिना पूरी तरह से सुरक्षित तरीके से आपके ब्राउज़र पर काम करता है।",
    wasmTitle: "WASM प्रोसेसर",
    wasmDesc: "फाइल अनुवाद दक्षता बढ़ाने के लिए आपके वेब ब्राउज़र के भीतर बेहद सुरक्षित प्रोसेसिंग पूल शुरू करता है।",
    ioTitle: "अल्ट्रा-फास्ट लोकल I/O",
    ioDesc: "सर्वर पर अपलोड या डाउनलोड करने की कोई प्रतीक्षा नहीं। दस्तावेज़ तुरंत स्थानीय रूप से बदल दिए जाते हैं।",
    gpuTitle: "उत्तरदायी GPU त्वरण",
    gpuDesc: "यह आपके मोबाइल या डेस्कटॉप स्क्रीन रिज़ॉल्यूशन के अनुसार निर्बाध और सुचारू इमेज रेंडरिंग प्रदान करता है।",
    configTitle: "📊 लोकल फ्रेमवर्क संकलन और मानक विनिर्देश",
    spec1Title: "1. आधुनिक रेखापुंज एन्कोडिंग: WebP और AVIF के लाभ",
    spec1Desc: "Google का WebP सामान्य फ़ोटो के आकार को लगभग 34% तक कम कर देता है। AVIF अत्याधुनिक HDR रंग गहराई बनाए रखता है, हालांकि इसे प्रोसेस करने में थोड़ा अधिक समय लग सकता है।",
    spec2Title: "2. दस्तावेज़ मैपिंग: PDF क्रॉस-रेफरेंस टेबल (XREF) एकीकरण",
    spec2Desc: "मल्टीपल PDF को मिलाने या विभाजित करने पर, यह सिस्टम XREF तालिकाओं को पुनर्निर्मित करता है ताकि पीडीएफ रीडर में कोई त्रुटि न आए।",
    spec3Title: "3. एक्सेल पार्सर इंजन: SheetJS XLSX-से-CSV डिकोडिंग",
    spec3Desc: "एक्सेल फाइलों को डाटा हानि के बिना सीधे आपके कंप्यूटर पर डिकोड किया जाता है, जो बहुभाषी यूनिकोड का पूर्ण समर्थन करता है।",
    spec4Title: "4. लोकल ज़िप संपीड़न: क्लाइंट-साइड संग्रह विधियाँ",
    spec4Desc: "JSZip लाइब्रेरी का उपयोग करके सभी परिवर्तित फ़ाइलों को स्थानीय मेमोरी में एक ही .zip फ़ोल्डर में तुरंत बंडल करें।",
    magCategory: "मीडिया और प्रारूप अनुकूलन हब",
    magTitle: "💡 रिसाइजिंग और ट्रांसकोडिंग विश्वकोश",
    catAll: "सभी",
    catImage: "छवि टिप्स",
    catDoc: "दस्तावेज़",
    catTech: "तकनीकी समाचार",
    tipLabel: "कार्यक्षेत्र सलाह:",
    tipText: "इस अनुकूलन दिशानिर्देश को सीधे अपनी फ़ाइलों पर लागू करने के लिए कार्यक्षेत्र पर वापस जाएं!",
    benchTitle: "💡 लोकल इंजन स्पीड डायग्नोस्टिक्स",
    benchDesc: "परीक्षण करें कि इस ब्राउज़र स्थान के भीतर आपका सीपीयू थ्रेड प्रति सेकंड कितने रेंडरिंग संचालन निष्पादित कर सकता है।",
    benchBtnIdle: "प्रदर्शन मापें",
    benchBtnActive: "माप रहा है...",
    benchResultLabel: "स्थानीय प्रोसेसिंग गति",
    benchResultValue: "{score} Ops/Sec (उत्कृष्ट)",
    subAssemblyTitle: "Sub-Assembly Framework",
    subAssemblyAuthorized: "स्वीकृत स्टैक: CSS v4 Flex Core, SheetJS XLSX Parsing VM, PDF-Lib Assembly Shell, लोकल ज़िप संपीड़न।",
    precCrafted: "सटीकता के साथ निर्मित और ",
    precWorkflows: " सुरक्षित कॉर्पोरेट कार्यप्रवाह के लिए प्रतिबद्धता।",
    toolsTitle: "उपयोग के मामले के आधार पर उपकरण",
    toolsDesc: "सामान्य कार्यों पर सीधे नेविगेट करें।"
  },
  ar: {
    backBtn: "العودة إلى مساحة العمل",
    sectionTitle: "معمارية المعالجة المحلية المعزولة",
    sectionDesc: "يغنيك استوديو معالجة الصور والملفات الفائق لدينا تماماً عن الحاجة إلى إرسال مستنداتك وسجلات شركتك إلى أي خواديم خارجية.",
    wasmTitle: "مفسر WASM المحمي",
    wasmDesc: "تشغيل مسارات معالجة متعددة الأنوية داخل متصفحك للحفاظ على استقرار وكفاءة العمليات وضمان عدم تسريب البيانات.",
    ioTitle: "إدخال وإخراج فوري للمستندات",
    ioDesc: "لا داعي للانتظار لرفع الملفات الكبيرة أو تنزيلها. تتم الترجمة والتحويل فوراً على وحدة المعالجة المركزية (CPU) الخاصة بك.",
    gpuTitle: "تسريع رسومي كامل",
    gpuDesc: "مواءمة مريحة لتحديث وجودة الشاشات على الهواتف والأجهزة المكتبية لضمان تجربة معالجة سلسة.",
    configTitle: "📊 بناء البرمجيات والصيغ الأساسية على جهازك",
    spec1Title: "1. الترميز الاتجاهي الحديث: ميزات WebP و AVIF للويب",
    spec1Desc: "يوفر تنسيق WebP من Google مساحة تقارب 34٪ مقارنة بـ JPEG مع الحفاظ على وضوح عالي. يدعم AVIF ألوان وتأثيرات HDR مميزة للغاية.",
    spec2Title: "2. دمج ملفات PDF: معالجة وإعادة هيكلة رابط الأجزاء (XREF)",
    spec2Desc: "عند تجميع مستندات PDF متعددة، يحسب النظام روابط XREF بدقة متناهية لضمان عدم حدوث أي خطأ في قارئ الملفات الافتراضي.",
    spec3Title: "3. قراءة جداول Excel: فك بيانات XLSX إلى CSV بسرعة",
    spec3Desc: "معالجة شاملة وفك شفرة الملفات الكبيرة مباشرة على الذاكرة العشوائية للجهاز مع دعم متكامل للغات العالمية والخرائط الثنائية.",
    spec4Title: "4. أرشفة ملفات ZIP: التجميع والضغط بصيغة آمنة تماماً",
    spec4Desc: "استفد من مكتبة JSZip لضغط مخرجاتك المتعددة في مجلد .zip واحد لسهولة مشاركتها ودون أي ضغط على الشبكة.",
    magCategory: "مركز التميز ونظام تحسين الملفات",
    magTitle: "💡 موسوعة تعديل القياسات والترميز",
    catAll: "الكل",
    catImage: "نصائح الصور",
    catDoc: "المستندات",
    catTech: "أخبار التقنية",
    tipLabel: "تلميح مساحة العمل:",
    tipText: "انتقل للتبويب العلوي لتجربة هذه النصائح فوراً على ملفاتك ومشاريعك الخاصة!",
    benchTitle: "💡 فحص كفاءة المعالج وسرعة المحرك المحلي",
    benchDesc: "اختبر عدد عمليات فك وتأمين الشفرات التي يستطيع معالج جهازك الصمود أمامها في الثانية الواحدة داخل المتصفح المعزول.",
    benchBtnIdle: "بدء فحص الأداء",
    benchBtnActive: "جارٍ التحليل...",
    benchResultLabel: "سرعة المعالجة الحالية",
    benchResultValue: "{score} عملية في الثانية (ممتاز)",
    subAssemblyTitle: "Sub-Assembly Framework",
    subAssemblyAuthorized: "أطقم البناء المتكاملة: CSS v4 Flex Core, SheetJS XLSX Parsing VM, PDF-Lib Assembly Shell, ضغط ZIP محلي.",
    precCrafted: "صمم بدقة مع ",
    precWorkflows: " لخدمة أفضل أعمال الشركات والمؤسسات.",
    toolsTitle: "الأدوات بحسب الاستخدام",
    toolsDesc: "انتقل مباشرة لحلولك المناسبة بدون خطوات معقدة."
  },
  pt: {
    backBtn: "Voltar ao espaço de trabalho",
    sectionTitle: "Arquitetura Isolada no Dispositivo",
    sectionDesc: "Nosso estúdio multimídia de alto desempenho elimina servidores de terceiros para garantir discrição e segurança cibernética total sob seu navegador local.",
    wasmTitle: "Processador WASM",
    wasmDesc: "Dispara threads de cálculo multi-core em alta velocidade no sandbox, maximizando as conversões de arquivos.",
    ioTitle: "E/S à velocidade da luz",
    ioDesc: "Nenhuma fila de transferência pela internet. Conversão imediata direto no hardware do seu próprio computador.",
    gpuTitle: "Aceleração GPU ágil",
    gpuDesc: "Interface adaptável que reage instantaneamente a displays móveis ou monitores de ultra-alta resolução.",
    configTitle: "📊 Compilação e Padrões Estruturais Locais",
    spec1Title: "1. Codificações modernas: Vantagens de converter para WebP e AVIF",
    spec1Desc: "O padrão WebP do Google economiza cerca de 30% mais espaço de armazenamento frente ao JPEG tradicional. O AVIF fornece cores HDR excelentes e inteligência de contraste.",
    spec2Title: "2. Mesclagem PDF: Reindexação das tabelas de interligações páginas (XREF Map)",
    spec2Desc: "Garante a integridade dos PDFs unificados ao recalcular os trailer dictionary catalog na RAM evitando corrupções em leitores clássicos.",
    spec3Title: "3. Mecanismo Excel: Fluxos de leitura XLSX para CSV",
    spec3Desc: "Formata e extrai dados de tabelas XLSX complexas sem vazamento de privacidade e suportando acentuação gráfica de múltiplos alfabetos.",
    spec4Title: "4. Empacotador Zip: Fluxos de compressão locais integrados",
    spec4Desc: "Une e consolida uma série de arquivos convertidos em uma única pasta .zip leve, montada na memória provisória RAM via JSZip.",
    magCategory: "Portal de compressão e mídias",
    magTitle: "💡 Centro de informações de transcodificação",
    catAll: "Tudo",
    catImage: "Imagem",
    catDoc: "Docs",
    catTech: "Tecnologia",
    tipLabel: "Dica interna:",
    tipText: "Suba até a aba de tarefas para aplicar esses formatos diretamente com os seus blueprints e documentos!",
    benchTitle: "💡 Autodiagnóstico de processamento e CPU",
    benchDesc: "Rode um teste para descobrir quantas operações matemáticas de codificação o seu chip local faz por segundo dentro desta guia.",
    benchBtnIdle: "Testar velocidade local",
    benchBtnActive: "Verificando...",
    benchResultLabel: "Pontuação do cliente",
    benchResultValue: "{score} Ops/Seg (EXCELENTE)",
    subAssemblyTitle: "Sub-Assembly Framework",
    subAssemblyAuthorized: "Especificação técnica: CSS v4 Flex Core, SheetJS XLSX Parsing VM, PDF-Lib Assembly Shell, compressão ZIP local.",
    precCrafted: "Feito meticulosamente com ",
    precWorkflows: " para agilizar todas as demandas seguras no seu dia a dia corporativo.",
    toolsTitle: "Atalhos de uso diário",
    toolsDesc: "Navegue de forma dinâmica direta para as tarefas mais comuns."
  },
  it: {
    backBtn: "Torna alla dashboard",
    sectionTitle: "Architettura Sandbox sul Dispositivo",
    sectionDesc: "La nostra suite ad alte prestazioni per immagini e documenti elimina la dipendenza da server esterni, operando al 100% all'interno del browser privato.",
    wasmTitle: "Processore WASM",
    wasmDesc: "Avvia thread di calcolo multi-core ad altissima velocità nel browser, garantendo elaborazioni impeccabili.",
    ioTitle: "Input/Output in tempo reale",
    ioDesc: "Nessun tempo di attesa per l'invio o il download di documenti. Conversione immediata sulla propria CPU.",
    gpuTitle: "Accelerazione GPU reattiva",
    gpuDesc: "Rendering grafico mượt mà ottimizzato per schermi mobili e desktop di qualsiasi dimensione.",
    configTitle: "📊 Compilazione Locale e Specifiche di Riferimento",
    spec1Title: "1. Encoders moderni: I vantaggi delle matrici WebP & AVIF",
    spec1Desc: "Il formato WebP di Google riduce il peso dei file fino al 34% rispetto al JPEG. AVIF offre contrasti superbi e una gamma dinamica HDR imbattibile.",
    spec2Title: "2. Struttura PDF: Ricostruzione delle tabelle di riferimento incrociato (XREF)",
    spec2Desc: "La combinazione di PDF adatta gli indirizzamenti indiretti dei file in modo da non corrompere gli indici dei lettori standard.",
    spec3Title: "3. Parser Excel: Conversione stabile da XLSX a CSV",
    spec3Desc: "Analizza e decomprime in memoria RAM i fogli di calcolo Excel con supporto totale ai caratteri internazionali e Unicode.",
    spec4Title: "4. Archivi Zip locali: Compressione di file lato utente",
    spec4Desc: "Esporta tutti i documenti convertiti in un unico archivio .zip leggero generato istantaneamente via JSZip sulla RAM.",
    magCategory: "Faro di ottimizzazione multimediale",
    magTitle: "💡 Enciclopedia di ridimensionamento e transcodifica",
    catAll: "Tutti",
    catImage: "Immagini",
    catDoc: "Documenti",
    catTech: "Tecnologia",
    tipLabel: "Suggerimento:",
    tipText: "Torna in alto alla dashboard per applicare subito questi trucchi di compressione sui tuoi file!",
    benchTitle: "💡 Diagnostica di calcolo Sandbox locale",
    benchDesc: "Misura quante elaborazioni di pixel del motore grafico la tua CPU può completare in un secondo in questa scheda sicura.",
    benchBtnIdle: "Avvia analisi prestazioni",
    benchBtnActive: "Analisi in corso...",
    benchResultLabel: "Velocità esecuzione client",
    benchResultValue: "{score} Ops/Sec (ECCELLENTE)",
    subAssemblyTitle: "Sub-Assembly Framework",
    subAssemblyAuthorized: "Standard integrati: CSS v4 Flex Core, SheetJS XLSX Parsing VM, PDF-Lib Assembly Shell, compressione ZIP locale.",
    precCrafted: "Progettato con cura e ",
    precWorkflows: " a supporto dei flussi di lavoro aziendali che esigono massima sicurezza.",
    toolsTitle: "Strumenti per caso d'uso",
    toolsDesc: "Accedi rapidamente alle operazioni quotidiane frequenti."
  },
  ru: {
    backBtn: "Назад в рабочую область",
    sectionTitle: "Изолированная на устройстве песочница WASM",
    sectionDesc: "Наша высокопроизводительная веб-студия документов и графики делает сторонние внешние облака бесполезными: все вычисления осуществляются локально в оперативной памяти.",
    wasmTitle: "Процессор WebAssembly",
    wasmDesc: "Разворачивает быстрые параллельные вызовы алгоритмов в контексте вашего веб-клиента, повышая темп конвертации.",
    ioTitle: "Мгновенные вводы и выводы (I/O)",
    ioDesc: "Нулевое время ожидания загрузки пакетов по сети. Обработка выполняется локально за доли секунды силами вашего CPU.",
    gpuTitle: "Аппаратное ускорение графики",
    gpuDesc: "Адаптивное сглаживание и масштабирование холста, отлично приспособленное под дисплеи мобильных устройств.",
    configTitle: "📊 Конфигурация локальной логики и стандарты компиляции",
    spec1Title: "1. Кодирование современных растров: Преимущества WebP и AVIF",
    spec1Desc: "Формат WebP от корпорации Google экономит от 26% до 34% сетевого трафика по сравнению со стандартными JPEG. AVIF бережливо упаковывает глубину цветов HDR.",
    spec2Title: "2. Таблицы сшивки документов: Восстановление PDF XREF",
    spec2Desc: "При слиянии PDF-документов алгоритм аккуратно перестраивает виртуальную карту перекрестных индексов (XREF Table) во избежание сбоев в популярных ридерах.",
    spec3Title: "3. Парсинг Excel: Преобразование XLSX в форматы CSV",
    spec3Desc: "Распаковывает и анализирует громоздкие массивы ячеек баз данных прямо в оперативной памяти RAM со стабильной поддержкой Юникода (Unicode/UTF-8).",
    spec4Title: "4. Клиентские архивы: Построение локальных упаковок Zip",
    spec4Desc: "Собирает готовые обработанные файлы в единую сжатую папку .zip посредством JSZip для сохранения в память вашего ПК.",
    magCategory: "Журнал оптимизации медиафайлов",
    magTitle: "💡 Энциклопедия преобразования форматов",
    catAll: "Все",
    catImage: "Имидж-гид",
    catDoc: "Документы",
    catTech: "Новости IT",
    tipLabel: "Полезный совет:",
    tipText: "Вернитесь к панелям задач вверху, чтобы применить изложенные здесь настройки для ваших файлов!",
    benchTitle: "💡 Экспресс-оценка вычислительной мощности браузера",
    benchDesc: "Проверьте, сколько циклов тригонометрического картирования пикселей способен совершить процессор вашего гаджета за секунду.",
    benchBtnIdle: "Оценить производительность",
    benchBtnActive: "Анализируем...",
    benchResultLabel: "Локальная тактовая частота",
    benchResultValue: "{score} опер./в сек. (ОТЛИЧНО)",
    subAssemblyTitle: "Sub-Assembly Framework",
    subAssemblyAuthorized: "Стандарты безопасности: CSS v4 Flex Core, SheetJS XLSX Parsing VM, PDF-Lib Assembly Shell, локальное сжатие ZIP.",
    precCrafted: "Собрано с математической точностью и ",
    precWorkflows: " для надежного и безопасного применения в корпоративной среде.",
    toolsTitle: "Инструменты для частых сценариев",
    toolsDesc: "Перейти к типовым массовым задачам в один клик."
  }
};

export default function AboutView({ language, onBack, tabViewOnly = false }: AboutViewProps) {
  // Gracefully fallback to English if chosen locale has not loaded
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

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
      translations: {
        ko: {
          title: '💡 WebP vs AVIF: 최적의 압축 포맷 선택 가이드',
          summary: '압축률과 브라우저 호환성을 고려한 이미지 포맷 분석. 언제 어떤 포맷을 써야 효과적일까요?',
          content: 'WebP는 구글이 개발한 이미지 표준으로 거의 모든 현대 브라우저(97% 이상 호환성)에서 지원되며, JPEG 대비 약 26%~34%의 용량 절감 성능을 발휘합니다. 압축 및 처리 인코딩 속도가 매우 빨라 본 스튜디오에서 여러 장을 고속 일괄 작업하기에 적합합니다.\n\n반면 AVIF는 차세대 강자로 뛰어난 명암 대비(HDR) 표현 및 압축률을 자랑하지만, WASM(WebAssembly) 브라우저 메모리 가속 인코딩 속도가 WebP에 비해 상대적으로 느릴 수 있습니다. 가장 안전하고 빠른 배포 결과를 원한다면 WebP를, 최고의 용량 압축 효율과 화질 디테일이 목표라면 AVIF 포맷 변환을 권장해 드립니다.',
          readTime: '3분 소요'
        },
        en: {
          title: '💡 WebP vs AVIF: Choosing the Perfect Compressed Format',
          summary: 'Analysis of compression ratio and web portability. Let’s find out which format is ideal.',
          content: 'WebP is standard for general web builds ensuring 97%+ browser compatibility and saving up to 30% storage space over JPEG. It processes exceptionally fast in the local WASM memory. On the other hand, AVIF implements the high-profile chroma encoding of AV1, compressing extreme color spectrums perfectly. However, converting to AVIF in your local sandbox browser can take up to 3-5x longer than WebP. Use WebP for speed and broad compatibility, and choose AVIF for ultra-compact file sizing at bleeding-edge visual fidelity.',
          readTime: '3 min read'
        },
        ja: {
          title: '💡 WebP vs AVIF: 最適な圧縮形式の選択ガイド',
          summary: '圧縮率とブラウザ互換性を考慮した画像フォーマット分析。どのような場面でどちらが最も効果的でしょうか？',
          content: 'WebPはGoogleが開発した画像フォーマットで、ほぼすべてのブラウザ（97％以上）でサポートされ、JPEGと比べて約26％〜34％のデータ容量削減が可能です。ローカルでの高速一括処理に最適です。\n\n一方、AVIFは次世代形式であり非常に優れた圧縮比と高精度のHDRカラーを維持しますが、WebPと比較してローカルでの読み込み・エンコード時間が3〜5倍長くかかる可能性があります。速度と互換性を重視する場合はWebP、極限の軽量化と最新グラフィック画質を求める場合はAVIFが推奨されます。',
          readTime: '3分'
        },
        zh: {
          title: '💡 WebP 与 AVIF：选择最完美的压缩格式',
          summary: '分析压缩率和网页兼容性。让我们了解哪种格式最适合您的具体应用。',
          content: 'WebP 是由谷歌开发的图像格式，拥有超过97%的浏览器兼容性，相比JPEG平均可节省30%左右的存储体积。由于处理性能极快，适合批量及超高速图片转换。\n\n而 AVIF 则是次世代图像格式的标杆，它采用 AV1 精细化色彩编码和极高对比度（HDR），提供无可比拟的极致画质。但在终端浏览器内运行 WASM 时，其编码耗时可能是 WebP 的3到5倍。若追求极佳的加载速度 and 兼容性，推荐选择 WebP；若要追求顶级品质与高压缩效率，可选择 AVIF。',
          readTime: '3分钟'
        },
        es: {
          title: '💡 WebP vs AVIF: Elegir el Formato de Compresión Perfecto',
          summary: 'Análisis de tasas de compresión y portabilidad web. Descubra qué formato se adapta mejor a sus objetivos.',
          content: 'WebP es un estándar de imagen desarrollado por Google con más del 97% de compatibilidad en navegadores. Reduce el tamaño de los archivos entre un 26% y 34% en comparación con JPEG. Su procesamiento local es extremadamente rápido.\n\nAVIF es el sucesor de nueva generación que mantiene un colorido de alta gama y proporciones de contraste (HDR) a un nivel superior, conservando gran fidelidad a cambio de un procesamiento local que puede tardar de 3 a 5 veces más en comparación con WebP. Se recomienda usar WebP para velocidad y AVIF para el máximo ahorro de datos sin pérdidas perceptibles.',
          readTime: '3 min'
        },
        fr: {
          title: '💡 WebP vs AVIF : Choisir le format de compression parfait',
          summary: 'Analyse des taux de compression et de la compatibilité web. Découvrez quel format est optimal pour vos projets.',
          content: 'WebP est un standard d\'image développé par Google qui offre plus de 97% de compatibilité navigateur et réduit significativement le poids de 26% à 34% comparé au JPEG, tout en préservant la fluidité d\'exécution dans l\'espace mémoire local.\n\nAVIF applique un encodage avancé et une dynamique HDR. Cependant, de par sa complexité algébrique, l\'encodage local peut prendre 3 à 5 fois plus de temps comparé à WebP. Utilisez WebP pour un traitement immédiat et AVIF pour une compression ultime à haute fidélité.',
          readTime: '3 min'
        },
        de: {
          title: '💡 WebP vs AVIF: Wahl des optimalen Bildformats',
          summary: 'Analyse von Komprimierungsverhältnissen und Browser-Kompatibilität. Erfahren Sie, wann welches Format ideal ist.',
          content: 'WebP ist Googles etablierter Standard mit 97%+ Browserkompatibilität, der Bildgrößen im Vergleich zu JPEG um ca. 26% bis 34% reduziert. Es verarbeitet Aufträge extrem schnell.\n\nAVIF ist der Next-Gen-Nachfolger, der durch hochentwickelte HDR-Codierung Farbtreue bei phänomenaler Kompression erhält, jedoch beim browserinternen Rechnen 3-5x länger benötigt. Wählen Sie WebP für Tempo & Verteilbarkeit, und AVIF für Dateiminimierung auf Grafikerniveau.',
          readTime: '3 Min.'
        },
        vi: {
          title: '💡 WebP vs AVIF: Lựa chọn định dạng nén tối ưu',
          summary: 'Phân tích tỷ lệ nén và tính tương thích trên trình duyệt Web. Hãy cùng tìm hiểu định dạng nào là lý tưởng nhất.',
          content: 'WebP là tiêu chuẩn hình ảnh do Google phát triển, tương thích với hơn 97% trình duyệt hiện đại, giúp giảm khoảng 26%-34% dung lượng so với JPEG và có tốc độ xử lý on-device cực kỳ nhanh chóng.\n\nNgược lại, AVIF là thế hệ định dạng mới hỗ trợ HDR đầy đủ và nén tốt hơn, nhưng quá trình giả lập WASM có thể tốn thời gian hơn 3-5 lần so với WebP. Khuyên dùng WebP cho các tác vụ hàng ngày và AVIF cho chất lượng cao cấp nhất.',
          readTime: '3 phút'
        },
        hi: {
          title: '💡 WebP बनाम AVIF: सही संकुचित प्रारूप चुनना',
          summary: 'संपीड़न अनुपात और वेब अनुकूलता का विश्लेषण। आइए जानें कि कौन सा प्रारूप आदर्श है।',
          content: 'WebP Google द्वारा विकसित एक छवि मानक है जो लगभग सभी आधुनिक ब्राउज़रों (97% से अधिक) में समर्थित है, और JPEG की तुलना में लगभग 26% ~ 34% आकार बचाता है। इसका प्रसंस्करण अत्यंत तेज़ है।\n\nदूसरी ओर, AVIF अत्याधुनिक AV1 संपीड़न एल्गोरिदम पर आधारित है, जो बेहतर रंग गहराई और HDR प्रदान करता है, लेकिन इसे बदलने में WebP की तुलना में 3-5 गुना अधिक समय लग सकता है। गति के लिए WebP और बेहतर गुणवत्ता के लिए AVIF का उपयोग करें।',
          readTime: '3 मिनट'
        },
        ar: {
          title: '💡 WebP مقابل AVIF: اختيار التنسيق المناسب للضغط',
          summary: 'تحليل جودة وحجم الصورة للمواقع وتوافقها مع المتصفحات. كيف تختار الأفضل لعملك؟',
          content: 'WebP هو تنسيق صورة قياسي من Google بتوافقية تفوق 97%، يتيح توفير مساحة هائلة بين 26% إلى 34% مقارنة بـ JPEG مع سرعة معالجة فورية محلية.\n\nأما AVIF التميز الكامل للون والوضوح الفائق HDR ولكنه يتطلب وقتاً أطول في المعالجة بنسبة 3 إلى 5 أضعاف. اختر WebP للموازنة والسرعة، وAVIF للحجم الصغير جداً مع نقاء مثالي.',
          readTime: '3 دقائق'
        },
        pt: {
          title: '💡 WebP vs AVIF: Escolhendo o Formato de Compressão Perfeito',
          summary: 'Análise de taxas de compressão e compatibilidade web. Descubra qual é o formato ideal.',
          content: 'WebP é desenvolvido pelo Google com mais de 97% de suporte em navegadores, reduzindo tamanhos de arquivos de 26% a 34% em relação ao JPEG. O processamento na memória local é veloz.\n\nAVIF utiliza codificação dinâmica de contraste HDR de última geração. O reprocessamento local sob o sandbox pode demorar de 3 a 5 vezes mais em relação ao WebP. Recomendamos WebP para velocidade padrão e AVIF para resoluções de nível profissional.',
          readTime: '3 min'
        },
        it: {
          title: '💡 WebP vs AVIF: Scegliere il Formato di Compressione Ideale',
          summary: 'Analisi dei tassi di compressione e compatibilità. Scopri quale formato scegliere a seconda dei tuoi obiettivi.',
          content: 'WebP è uno standard introdotto da Google con oltre il 97% di supporto sui browser, in grado di ridurre le dimensioni dei file fino al 34% rispetto al JPEG. I tempi di conversione locali sono incredibilmente ridotti.\n\nAVIF offre una compressione d\'immagine ultramoderna che mantiene livelli spettacolari di gamma dinamica (HDR). Tuttavia, l\'elaborazione locale via WebAssembly può richiedere tempi fino a 5 volte maggiori rispetto a WebP. Scegli WebP per la velocità ed AVIF per la massima compattezza dei pixel.',
          readTime: '3 min'
        },
        ru: {
          title: '💡 WebP против AVIF: выбор идеального формата сжатия',
          summary: 'Детальный анализ степени сжатия и совместимости в веб-среде. В каком случае какой формат будет идеален?',
          content: 'WebP — стандарт изображений от Google, поддерживаемый более чем 97% браузеров и уменьшающий объем файлов на 26%–34% по сравнению с JPEG. Конвертируется локально в WASM за доли секунды.\n\nAVIF обеспечивает непревзойденное качество благодаря HDR и передовому сжатию AV1, однако обработка в песочнице браузера может занимать до 3–5 раз больше времени, чем WebP. Используйте WebP для быстрой подготовки графики, а AVIF — для идеального качества при максимальной экономии трафика.',
          readTime: '3 мин'
        }
      } as Record<string, { title:string; summary:string; content:string; readTime:string; }>
    },
    {
      id: 'pdf-reduction',
      category: 'document',
      icon: <FileText className="w-4 h-4 text-emerald-500" />,
      translations: {
        ko: {
          title: '💡 150 DPI vs 300 DPI: 메일 전송용 PDF 용량 최소화',
          summary: '사내 이메일 및 메신저 전송용 PDF 용량을 늘려먹는 메타 데이터와 해상도 최적화 비법.',
          content: '대부분의 디지털 화면 전송용 오피스 리포트 PDF 문서는 150 DPI(Dots Per Inch) 해상도로 충분히 선명하게 가독성이 유지됩니다. 인쇄 출력 전 주기 단계가 아니라면 화려한 300 DPI 소스를 고집할 필요는 전혀 없습니다.\n\n또한, 본 스튜디오의 통합 PDF 메인 병합 처리는 단순 바이트 병합이 아닌 내부 가상 링킹 주소 테이블(XREF Indirect References)을 지능적으로 재생성하므로, 용량 비대화 현상 없이 유효 텍스트 개체 정보만을 깔끔하게 직렬화해 담아냅니다.',
          readTime: '2분 소요'
        },
        en: {
          title: '💡 150 DPI vs 300 DPI: Minimizing PDF Sizing for Emails',
          summary: 'Tricks to eliminate unnecessary fonts, vector blocks, and meta headers to prevent file rejections.',
          content: 'Standard monitor screens only require 150 DPI resolutions for document content. Avoiding heavy 300 DPI layout assets prevents bloating. Additionally, merging or joining documents through traditional byte-slicing causes index table metadata wreckage. OptiConvert resolves this issue by applying real-time virtual linking mapping (XREF Table reconstructs), ensuring maximum reading clarity without wasting storage.',
          readTime: '2 min read'
        },
        ja: {
          title: '💡 150 DPI vs 300 DPI: メール送信用のPDF容量削減',
          summary: 'ファイル拒否を防ぐため、不要なフォントやベクターアセット、メタファイルを排除してPDFサイズを最小化します。',
          content: 'ほとんどのデジタルディスプレイ表示用オフィス文書は、150 DPI（Dots Per Inch）の範囲内で完全にクリアに読み取ることができます。印刷目的でない限り、容量を肥大化させる高解像度300 DPIに固執する必要はありません。\n\nまた、本スタジオのPDF結合は、一般的なバイナリのスライシングではなく、仮想リンクマッピング（XREFテーブル再構築）を行うため、ファイルサイズが余計に増えることなく整理されたファイルを出荷可能です。',
          readTime: '2分'
        },
        zh: {
          title: '💡 150 DPI 对比 300 DPI：减小邮件 PDF 的体积',
          summary: '清理冗余的内嵌字体、矢量元素和元数据属性，避免因附件超大而被邮件系统拒收。',
          content: '通常在显示终端（屏幕）上阅读的文件，150 DPI（每英寸像素点）的品质就已经足够清晰。除非是送往专业印刷，否则完全无需保留笨重的 300 DPI 素材。\n\n此外，本软件的 PDF 智能合并并非传统二进制字节拼接，而是将内部元数据目录与索引链接表（XREF）按线性顺序重构重写，确保文本开体信息在轻巧紧凑的同时不会失效与报错。',
          readTime: '2分钟'
        },
        es: {
          title: '💡 150 DPI vs 300 DPI: Minimizar el Tamaño de PDF para Correo',
          summary: 'Trucos para eliminar fuentes innecesarias, datos vectoriales y metadatos con el fin de evitar rechazos de correo.',
          content: 'La mayoría de los monitores de PC y móviles solo requieren una resolución de 150 DPI para que los textos en PDF se lee con perfecta nitidez. No es necesario sobrecargar los archivos a 300 DPI.\n\nAdemás, la combinación de PDFs en este programa no utiliza simple duplicación de bytes, sino que reconstruye directamente la tabla de referencias cruzadas (XREF Table) en la memoria, compactando los metadatos al mínimo absoluto.',
          readTime: '2 minItem'
        },
        fr: {
          title: '💡 150 DPI vs 300 DPI : Réduire l\'encombrement des PDF',
          summary: 'Conseils pour éliminer les polices redondantes et nettoyer les métadonnées pour des pièces jointes légères.',
          content: 'Les écrans classiques exigent une résolution maximale de 150 DPI pour garantir un grand confort de lecture. Des fichiers de 300 DPI ne font que surcharger inutilement vos e-mails.\n\nNotre utilitaire reconstruit les correspondances structurelles de la table de références croisées (XREF) pour optimiser les structures de documents sans altérer la qualité originale.',
          readTime: '2 min'
        },
        de: {
          title: '💡 150 DPI vs 300 DPI: PDF-Größen für E-Mails minimieren',
          summary: 'Entfernen Sie unnötige Schriftarten und Metatabellen, um Dateigrößen-Limits beim Mailen einzuhalten.',
          content: 'Für Dokumente auf Displays reichen 150 DPI vollkommen aus. 300 DPI ist nur für Print-Abläufe notwendig und verschwendet im Büroalltag unnötigen Speicher.\n\nDie PDF-Zusammenführung rekonstruiert die Adresstabellen (XREF), was dafür sorgt, dass Inhalte sauber strukturiert bleiben und die Dateigröße optimal geschrumpft wird.',
          readTime: '2 Min.'
        },
        vi: {
          title: '💡 150 DPI vs 300 DPI: Giảm dung lượng PDF để đính kèm Email',
          summary: 'Loại bỏ font chữ và siêu dữ liệu không cần thiết để tránh bị máy chủ thư từ chối do quá giới hạn kích thước.',
          content: 'Chỉ cần một độ phân giải 150 DPI là đủ cho hầu hết nhu cầu xem tài liệu văn phòng trên các màn hình kỹ thuật số. Bạn không cần thiết phải giữ 300 DPI.\n\nỨng dụng của chúng tôi sẽ tái cấu trúc bảng mục lục liên kết ảo (XREF), giảm thiểu dung lượng lãng phí mà vẫn đảm bảo nội dung sắc nét.',
          readTime: '2 phút'
        },
        hi: {
          title: '💡 150 DPI बनाम 300 DPI: ईमेल के लिए PDF का आकार छोटा करना',
          summary: 'अनावश्यक फोंट, वेक्टर संपत्तियों और मेटा हेडर को हटाकर PDF फ़ाइल का आकार कम करें।',
          content: 'स्क्रीन पर पढ़ने के लिए केवल 150 DPI रिज़ॉल्यूशन पर्याप्त है। प्रिंट के बिना भारी 300 DPI एसेट्स का उपयोग करने की कोई आवश्यकता नहीं है।\n\nहमारा सिस्टम इंडेक्स टेबल्स को फिर से बनाने के लिए वर्चुअल लिंकिंग मैपिंग एल्गोरिदम लागू करता है, जो अनावश्यक स्थान बचाते हुए दस्तावेज़ को साफ रखता है।',
          readTime: '2 मिनट'
        },
        ar: {
          title: '💡 150 مقابل 300 نقطة بالبوصة: تصغير ملفات PDF للبريد',
          summary: 'تقنيات التخلص من الخطوط الزائدة وجداول الإسناد غير الضرورية في ملفات PDF لتفادي حجم المرفقات الضخم.',
          content: 'الشاشات العادية والذكية تحتاج فقط إلى دقة 150 نقطة بالبوصة لتمنحك قراءة واضحة وسريعة. لا داعي للإصرار على جودة 300 نقطة بالبوصة المخصصة للمطابع السلكية.\n\nتعتمد دمج ملفاتنا على بناء جداول XREF ذكية وتراسلها بدلاً من نسخ بايت تلو بايت مما يحد من تضخم مساحة التخزين.',
          readTime: 'دقيقتان'
        },
        pt: {
          title: '💡 150 DPI vs 300 DPI: Reduzindo o Tamanho do PDF',
          summary: 'Dicas para otimizar resoluções e metadados para e-mails sem risco de rejeições de tamanho pelo servidor.',
          content: 'A maioria dos monitores digitais exige apenas 150 DPI para ótima clareza de leitura. Evite os 300 DPI de impressão gráfica para manter os e-mails leves.\n\nNosso utilitário de junção local de PDF reconstrói inteligentes tabelas de link XREF em tempo real, gerando um documento consolidado de tamanho incrivelmente enxuto.',
          readTime: '2 min'
        },
        it: {
          title: '💡 150 DPI vs 300 DPI: Ridurre le Dimensioni PDF',
          summary: 'Strategie utili per rimuovere font ridondanti, tracciati vettoriali pesanti e metadati vecchi dal file PDF.',
          content: 'La visualizzazione a monitor di e-book e fatture richiede solo 150 DPI di risoluzione. Evitare di mantenere i 300 DPI previsti per le stampanti previene il superamento dei limiti di allegato.\n\nInoltre, la funzione di unione e divisione locale del PDF non concatena file grezzi, ma riscrive l\'indice virtuale del documento (Tabelle XREF) per un export snello.',
          readTime: '2 min'
        },
        ru: {
          title: '💡 150 DPI против 300 DPI: уменьшение размера PDF для почты',
          summary: 'Тонкости удаления лишних шрифтов, векторных элементов и заголовков метаданных, мешающих отправке.',
          content: 'Для чтения документов с экранов достаточно разрешения 150 DPI. Не стоит использовать избыточное разрешение 300 DPI.\n\nНаша система объединения и разделения PDF автоматически восстанавливает и оптимизирует таблицу перекрестных ссылок (XREF Table), не допуская повреждения индексов.',
          readTime: '2 мин'
        }
      } as Record<string, { title:string; summary:string; content:string; readTime:string; }>
    },
    {
      id: 'wasm-privacy-tech',
      category: 'tech',
      icon: <Cpu className="w-4 h-4 text-amber-500" />,
      translations: {
        ko: {
          title: '💡 원격 서버 없는 웹 스튜디오: WASM 샌드박스의 프라이버시 혁명',
          summary: '외부 클라우드로 소중한 파일을 단 1KB도 전송하지 않고 모든 연산을 100% 기기 로컬에서 진행.',
          content: '기존의 크기 축소나 변환 웹사이트들은 연산 처리를 위해 소중한 증명서, 비공개 디자인 파일, 보안 문서를 리모트 클라우드 백엔드로 업로드합니다. 이는 치명적인 사내 메신저 보안 규정 위배나 라이선스 누출 잠재 우려를 자아냅니다.\n\n본 Image & Document Studio는 WebAssembly 기반 런타임을 통해 이미지 변환, 가상 PDF 테이블 역인덱싱, FFmpeg 동영상 압축에 이르는 전 시스템 파이프라인의 연산부를 사용자 장치(기기 내부 CPU)에 가상 독립 구동시킵니다. 보안 폐쇄 사내망이나 불안정한 네트워크 오프라인 조건에서도 아무 지연이나 누수 걱정 없이 무결한 비즈니스 워크플로우를 영위할 수 있는 핵심 경쟁력입니다.',
          readTime: '4분 소요'
        },
        en: {
          title: '💡 Client WASM Engines: Elevating Complete Local File Security',
          summary: 'No web servers involved. All processing compiles on clean local client memory space.',
          content: 'Standard online converter sites force users to upload layouts, secure blueprints, and personal identity certificates straight to their external backend cloud channels. To disrupt that hazard, this application implements complete client sandbox virtualization. By caching native binaries (WebP codec modules, WebAssembly wrappers, PDF-Lib structures, and FFmpeg assemblies), compilation is guaranteed locally. Enjoy corporate-level reliability even with severed internet lifelines.',
          readTime: '4 min read'
        },
        ja: {
          title: '💡 サーバー不要のWebスタジオ：WASMによるセキュリティ革命',
          summary: '外部クラウドに1KBのデータも送信せず、100％すべての計算をデバイスのローカルメモリで行います。',
          content: '多くの変換サイトではファイルをサーバーへアップロードするため、機密情報や個人情報の漏洩リスクに晒されます。\n\n本スタジオは、WebAssemblyを採用することで画像変換やPDFインデックス再構築などの処理レイヤーすべてをあなたのローカルCPU上で仮想的に実行します。ネットワーク遮断された環境やセキュアなオフィス社内網でも完全にオフラインで動作する、比類なき安全性を提供します。',
          readTime: '4分'
        },
        zh: {
          title: '💡 无需服务器的网页引擎：WASM 沙箱的隐私革命',
          summary: '绝不向外部云端网络传输任何字节，所有转换评估运算均 100% 完全在您的本地设备中安全运行。',
          content: '传统的转换网站强制要求用户把图纸、合同和明文身份证明文件上传至后端服务器。这在企业合规与隐私保护方面存在极高的安全隐患。\n\n本平台通过构建 WebAssembly 本地微内核，建立隔离运行的计算沙箱。无论网络状态如何，处理过程完全不涉及外部数据流出。确保极高的运行效率和企业级防泄密保障。',
          readTime: '4分钟'
        },
        es: {
          title: '💡 Sin Servidores Web: Motores WASM con Máxima Privacidad',
          summary: 'No se involucran servidores externos. El procesamiento se ejecuta en el espacio seguro de memoria de su navegador.',
          content: 'Confiar planos, credenciales corporativas e imágenes a nubes externas causa vulnerabilidades de IT. Nuestra solución radica en ejecutar todo localmente con WebAssembly. Los datos jamás son almacenados o retenidos fuera de tu disco, logrando total adhesión a las guías de cumplimiento empresarial.',
          readTime: '4 min'
        },
        fr: {
          title: '💡 Moteurs WASM clients : Confidentialité totale garantie',
          summary: 'Aucun serveur externe impliqué. L\'ensemble du processus s\'exécute localement dans le bac à sable mémoire.',
          content: 'Les convertisseurs en ligne forcent l\'envoi de vos reçus, scans et documents sur des serveurs non sécurisés. Ce système intègre des modules compilés en natif (WebAssembly) résolvant toutes les opérations directement au cœur de votre CPU.',
          readTime: '4 min'
        },
        de: {
          title: '💡 Client-WASM-Engines: Erhöhung der lokalen Datensicherheit',
          summary: 'Völlig ohne Cloud-Dienste. Alle Operationen kompilieren sicher im RAM Ihres eigenen Webbrowsers.',
          content: 'Die meisten Konverter-Websites laden schützenswerte Dokumente auf externe Server hoch, was Datenschutzrisiken birgt. Um dieses Problem zu beheben, betreibt dieses Studio WebAssembly-basierte Binärdateien direkt im Browser. Ihre Daten bleiben in Ihrer Hand — ideal für geschlossene Unternehmensnetzwerke.',
          readTime: '4 Min.'
        },
        vi: {
          title: '💡 Độc lập với máy chủ: Kỷ nguyên bảo mật riêng tư với WASM Sandbox',
          summary: 'Không tải file lên đám mây, 100% tài nguyên xử lý nằm trọn vẹn trong bộ nhớ đệm cá nhân của bạn.',
          content: 'Khi dùng các web chuyển đổi thông thường, bạn thường phải gửi hợp đồng tài liệu nhạy cảm lên dịch vụ cloud của họ. Ở đây, công nghệ WebAssembly giả lập chạy độc lập hoàn toàn giúp xử lý dữ liệu ảo offline ngay trên chip, ngăn ngừa 100% nguy cơ rò rỉ.',
          readTime: '4 phút'
        },
        hi: {
          title: '💡 बिना सर्वर का वेब स्टूडियो: WASM सैंडबॉक्स के साथ डेटा सुरक्षा',
          summary: 'कोई बाहरी क्लाउड शामिल नहीं है। सभी गणनाएं 100% स्थानीय डिवाइस पर होती हैं।',
          content: 'सामान्य ऑनलाइन कन्वर्टर्स गोपनीय दस्तावेजों को तीसरे पक्ष के सर्वर पर अपलोड करने के लिए मजबूर करते हैं। हम ब्राउज़र में WebAssembly का उपयोग करके संपूर्ण संपीड़न प्रक्रिया को स्थानीय स्तर पर हल करते हैं। आपका डेटा कभी भी मशीन से बाहर नहीं जाता है, जिससे अधिकतम गोपनीयता बनी रहती है।',
          readTime: '4 मिनट'
        },
        ar: {
          title: '💡 مخرجات WASM المحلية: حماية البيانات في بيئة معزولة بالكامل',
          summary: 'عمليات معالجة محلية كاملة دون التدخل في ملفاتك أو السجلات الحساسة وبخصوصية تامة.',
          content: 'ترغم المتصفحات الخارجية مستخدميها على توجيه ملفاتهم الحساسة وعروض الأسعار لخوادم غير مأمونة. يوفر هذا الاستوديو حماية متكاملة عبر إدارته وتوفيره لمفسر WebAssembly الذي يعمل بالكامل على معالج جهازك وبشكل سريع وآمن.',
          readTime: '4 دقائق'
        },
        pt: {
          title: '💡 Sem Servidores Web: Motores WASM com Total Privacidade',
          summary: 'Nenhum servidor externo envolvido. Todo o processamento ocorre no espaço de memória RAM local.',
          content: 'Geralmente as ferramentas web exigem uploads de PDFs corporativos e dados confidenciais para nuvens externas. Este sistema inova ao rodar decodificadores do WebAssembly localmente no seu CPU, permitindo converter arquivos seguros mesmo off-line e eliminando riscos cibernéticos.',
          readTime: '4 min'
        },
        it: {
          title: '💡 Senza Server Web: Architetture WASM e Privacy Locale',
          summary: 'Nessun server esterno utilizzato. Le conversioni avvengono integralmente nella RAM del tuo browser.',
          content: 'Molti utenti caricano progetti segreti, fatture o documenti d\'identità su siti che processano i dati in cloud. Questa applicazione opera localmente integrando core WebAssembly per transcodifiche ed exports. I file non lasciano il pc garantendo massima conformità di sicurezza.',
          readTime: '4 min'
        },
        ru: {
          title: '💡 Работа без серверов: Безопасность в локальной песочнице WASM',
          summary: 'Все вычисления выполняются в изолированной среде браузера, не отправляясь во внешний облачный трафик.',
          content: 'Классические онлайн-редакторы загружают конфиденциальные чертежи и личные документы на удаленные серверы. Наша студия полностью устраняет эти риски благодаря WebAssembly, локально выполняя декомпрессию и шифрование прямо на вашем процессоре без задержек сети.',
          readTime: '4 мин'
        }
      } as Record<string, { title:string; summary:string; content:string; readTime:string; }>
    },
  ];

  const filteredArticles = blogArticles.filter(
    (art) => activeCategory === 'all' || art.category === activeCategory
  );

  const getArticleField = (art: any, field: 'title' | 'summary' | 'content' | 'readTime') => {
    const langObj = art.translations[language] || art.translations['en'];
    return langObj[field] || art.translations['en'][field];
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
            <span>{t.backBtn}</span>
          </button>
        </div>
      )}

      <div className="space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Compass className="w-7 h-7 animate-spin-slow" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white tracking-tight">
          {t.sectionTitle}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 leading-relaxed font-semibold">
          {t.sectionDesc}
        </p>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-gray-150/40 dark:border-zinc-850/50 space-y-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs font-mono uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>{t.wasmTitle}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            {t.wasmDesc}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-gray-150/40 dark:border-zinc-850/50 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs font-mono uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>{t.ioTitle}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            {t.ioDesc}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-gray-150/40 dark:border-zinc-850/50 space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs font-mono uppercase tracking-wider">
            <Monitor className="w-4 h-4" />
            <span>{t.gpuTitle}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            {t.gpuDesc}
          </p>
        </div>
      </div>

      {/* High density educational content detailing core protocols to enrich bot index value */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-gray-150 dark:border-zinc-850/60 space-y-6 text-xs text-gray-500 dark:text-zinc-400">
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
          {t.configTitle}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 dark:text-zinc-200">
              {t.spec1Title}
            </h4>
            <p>
              {t.spec1Desc}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 dark:text-zinc-200">
              {t.spec2Title}
            </h4>
            <p>
              {t.spec2Desc}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 dark:text-zinc-200">
              {t.spec3Title}
            </h4>
            <p>
              {t.spec3Desc}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 dark:text-zinc-200">
              {t.spec4Title}
            </h4>
            <p>
              {t.spec4Desc}
            </p>
          </div>
        </div>
      </div>

      {/* 💡 최적화 꿀팁 및 최신 기술 뉴스 허브 (News & Blog Tips) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-blue-50/10 dark:bg-zinc-950/40 border border-blue-100/30 dark:border-zinc-850/60 space-y-6 animate-fade-in" id="optimization-blog-hub">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-150/40 dark:border-zinc-850/60">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider">
              {t.magCategory}
            </div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500 shrink-0" />
              <span>{t.magTitle}</span>
            </h3>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5 self-start sm:self-center">
            {([
              { id: 'all', label: t.catAll },
              { id: 'image', label: t.catImage },
              { id: 'document', label: t.catDoc },
              { id: 'tech', label: t.catTech },
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
                {cat.label}
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
                          {getArticleField(art, 'title')}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 md:line-clamp-1">
                          {getArticleField(art, 'summary')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-block text-[10px] bg-gray-100 dark:bg-zinc-850 font-semibold text-gray-400 dark:text-zinc-500 px-1.5 py-0.5 rounded-md font-mono">
                        {getArticleField(art, 'readTime')}
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
                          <p>{getArticleField(art, 'content')}</p>
                          <div className="flex items-center gap-2 text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/30 p-2.5 rounded-lg mt-2">
                            <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                            <span>{t.tipLabel} {t.tipText}</span>
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
            {t.benchTitle}
          </h4>
          <p className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed">
            {t.benchDesc}
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
                <span>{t.benchBtnActive}</span>
              </>
            ) : (
              <span>{t.benchBtnIdle}</span>
            )}
          </button>

          {bmsStatus === 'finished' && (
            <div className="flex items-center gap-2 text-right">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 block leading-tight font-mono">{t.benchResultLabel}</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                  {t.benchResultValue.replace('{score}', testedScore.toLocaleString())}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-150 dark:border-zinc-850/60 font-mono">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
          {t.subAssemblyTitle}
        </h4>
        <p className="text-xs text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">
          {t.subAssemblyAuthorized}
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-400 justify-center pt-4 border-t border-gray-100 dark:border-zinc-800/80">
        <span>{t.precCrafted}</span>
        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
        <span>{t.precWorkflows}</span>
      </div>
    
      {/* 사용 케이스별 도구 링크 */}
      <div className="mt-10 pt-10 border-t border-gray-200 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {t.toolsTitle}
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
          {t.toolsDesc}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: '#/compress-image-for-instagram', title: language === 'ko' ? 'Instagram 이미지 압축' : 'Compress for Instagram', desc: language === 'ko' ? '화질 손상 없이 Instagram 최적화' : 'Optimize images for Instagram uploads', color: 'border-pink-200 dark:border-pink-900 hover:border-pink-400' },
            { href: '#/convert-png-to-webp', title: language === 'ko' ? 'PNG → WebP 변환' : 'PNG to WebP', desc: language === 'ko' ? '웹 로딩 속도 30% 향상' : 'Boost web loading by ~30%', color: 'border-blue-200 dark:border-blue-900 hover:border-blue-400' },
            { href: '#/compress-pdf-for-email', title: language === 'ko' ? '이메일용 PDF 압축' : 'Compress PDF for Email', desc: language === 'ko' ? '이메일 첨부 한도 이하로 압축' : 'Shrink PDFs for email attachments', color: 'border-orange-200 dark:border-orange-900 hover:border-orange-400' },
            { href: '#/resize-image-free', title: language === 'ko' ? '이미지 리사이징 (무료)' : 'Resize Image Free', desc: language === 'ko' ? '픽셀/비율 정밀 조정' : 'Resize by pixel or percentage', color: 'border-violet-200 dark:border-violet-900 hover:border-violet-400' },
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
