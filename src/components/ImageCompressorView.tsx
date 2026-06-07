/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { ImageProcessingOptions, ProcessableFile } from '../types';
import { compressAndConvertImage } from '../utils/imageProcessor';
import SquooshSlider from './SquooshSlider';
import { Download, Sliders, RefreshCw, FileImage, Sparkles, Check, Settings, HelpCircle, ChevronDown, ChevronUp, Zap, Award, Info, ShieldCheck, Coins, ArrowRight, BookOpen, Clock, EyeOff, Lock } from 'lucide-react';
import { TranslationDict } from '../translations';
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
}

export default function ImageCompressorView({
  files,
  onUpdateFile,
  onClear,
  t,
  onLoadSampleFile,
  mode = 'compress'
}: ImageCompressorViewProps) {
  const isKo = t.title ? t.title.includes('이미지') : false;
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
  const [activePreset, setActivePreset] = useState<'fast' | 'recommended' | 'high' | 'custom'>('recommended');

  const applyPreset = (preset: 'fast' | 'recommended' | 'high') => {
    setActivePreset(preset);
    if (preset === 'fast') {
      setOptions((prev) => ({
        ...prev,
        quality: 0.45,
        compressEnabled: true,
      }));
    } else if (preset === 'recommended') {
      setOptions((prev) => ({
        ...prev,
        quality: 0.78,
        compressEnabled: true,
      }));
    } else if (preset === 'high') {
      setOptions((prev) => ({
        ...prev,
        quality: 0.95,
        compressEnabled: true,
      }));
    }
  };

  const [activeFile, setActiveFile] = useState<ProcessableFile | null>(null);

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

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Track active file processing states with a ref Set to prevent double invocation
  const activeProcessingSetRef = useRef<Set<string>>(new Set());

  // Reset completed/failed files to 'idle' when settings alter, so they all auto-re-process in the background
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Find files that are completed or failed
      const workFiles = files.filter(f => f.status === 'completed' || f.status === 'failed');
      
      // Keep files failed because of pre-validated size limits, do not trigger an infinite loop of reprocessing on those
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
    }, 500); // 500ms debounce to allow stable slider changes

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

  // Queue dispatcher effect: Monitors idle files and maintains a concurrency limit of 2 (with active file priority)
  useEffect(() => {
    const idleFiles = files.filter(f => f.status === 'idle');
    const processingFiles = files.filter(f => f.status === 'processing');

    const CONCURRENCY_LIMIT = 2; // Keep client thread fluid, processing max 2 cards concurrently

    if (processingFiles.length < CONCURRENCY_LIMIT && idleFiles.length > 0) {
      // Priority 1: If the active selected workspace file is idle, process it first
      const priorityFile = idleFiles.find(f => f.id === selectedFileId && !activeProcessingSetRef.current.has(f.id));
      const nextFile = priorityFile || idleFiles.find(f => !activeProcessingSetRef.current.has(f.id));

      if (nextFile) {
        processSpecificFile(nextFile);
      }
    }

    // Reactively update the global 'isProcessing' overlay state based on selected file status
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

  const currentOriginalUrl = activeFile?.previewUrl || '';
  const currentProcessedUrl = activeFile?.processedUrl || '';
  const isWebPOrJpg = options.format === 'webp' || options.format === 'jpeg';
  const showQualitySlider = isWebPOrJpg && options.compressEnabled !== false;

  const triggerDownload = (file: ProcessableFile) => {
    if (!file.processedUrl || !file.processedName) return;
    const a = document.createElement('a');
    a.href = file.processedUrl;
    a.download = file.processedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Celebrate!
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.85 }
    });
  };

  const downloadAllAsZip = async () => {
    const completed = files.filter(f => f.status === 'completed' && f.processedUrl && f.processedName);
    if (completed.length === 0) return;

    try {
      const zip = new JSZip();
      for (const f of completed) {
        if (f.processedUrl && f.processedName) {
          const response = await fetch(f.processedUrl);
          const blob = await response.blob();
          zip.file(f.processedName, blob);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `opticonvert_images_${Date.now()}.zip`;
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full" id="image-compressor-root">
      {/* Sidebar: Files panel */}
      <div className="lg:col-span-4 flex flex-col space-y-4" id="image-compressor-sidebar">
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-zinc-800 pb-3">
            <h3 className="font-semibold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <FileImage className="w-5 h-5 text-blue-500" />
              <span>Images ({files.length})</span>
            </h3>
            <button
              onClick={onClear}
              className="text-xs font-semibold text-red-500 dark:text-red-400 hover:underline cursor-pointer"
              id="clear-all-images-button"
            >
              {t.clearAll}
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[220px]" id="image-files-list">
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
                    className={`flex flex-col p-4 sm:p-3 min-h-[52px] sm:min-h-0 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? f.status === 'failed'
                          ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20'
                          : 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                        : f.status === 'failed'
                          ? 'border-red-200/50 dark:border-red-900/30 bg-red-50/10 dark:bg-red-950/5 hover:bg-gray-50 dark:hover:bg-zinc-800'
                          : 'border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40 hover:bg-gray-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {f.previewUrl ? (
                          <img
                             src={f.previewUrl}
                             alt=""
                             className="w-10 h-10 object-cover rounded-lg border border-gray-100 dark:border-zinc-800"
                             referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
                            f.status === 'failed'
                              ? 'bg-red-100/50 dark:bg-red-950/30 border-red-200/30 text-red-500'
                              : 'bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-750 text-gray-400'
                          }`}>
                            <FileImage className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex flex-col overflow-hidden leading-tight text-left">
                          <span className="text-[13px] font-semibold text-gray-800 dark:text-zinc-200 truncate pr-2">
                            {f.name}
                          </span>
                          <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500">
                            {formatSize(f.size)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {f.status === 'processing' && (
                          <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
                            {f.progress}%
                          </span>
                        )}
                        {f.status === 'completed' && savings > 0 && (
                          <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] px-1.5 py-0.5 rounded-md font-semibold">
                            -{savings}%
                          </span>
                        )}
                        {f.status === 'failed' && (
                          <span className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold leading-none shrink-0 uppercase">
                            EXCLUDED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Real-time linear progress bar for Image Compression */}
                    {f.status === 'processing' && (
                      <div className="mt-2.5 w-full bg-gray-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <motion.div
                          className="bg-blue-500 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${f.progress}%` }}
                          transition={{ duration: 0.15 }}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {files.filter(f => f.status === 'completed').length > 0 && (
            <button
              onClick={downloadAllAsZip}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md mt-1 animate-pulse"
              id="download-all-images-zip-button"
            >
              <Download className="w-4 h-4 text-white" />
              <span>{isKo ? "변환 완료 이미지 일괄 다운로드 (.zip)" : "Download All as ZIP (.zip)"}</span>
            </button>
          )}
        </div>

        {/* Bento Grid Configuration Panel */}
        <div className="flex flex-col space-y-4" id="image-compressor-configurator-box">
          
          {/* BENTO BOX 1: Interactive Wizard Tracker (1-2-3 Step Flow) */}
          <div className="bg-gradient-to-br from-blue-500/5 to-indigo-600/5 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-105/30 dark:border-blue-900/30 rounded-3xl p-5 shadow-xs text-left">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-100/30 dark:border-blue-900/20">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
                {isKo ? "⚡ 초고속 처리 로드맵" : "Processing Wizard Steps"}
              </span>
              <span className="text-[10px] font-semibold text-gray-400 font-mono">
                {files.length > 0 ? (isKo ? "진행 중" : "In Progress") : (isKo ? "업로드 대기" : "Waiting")}
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className={`flex items-center justify-center w-5.5 h-5.5 rounded-full shrink-0 text-xs font-bold transition-all ${
                  files.length > 0 
                  ? 'bg-blue-600 text-white shadow-3xs' 
                  : 'bg-gray-200 dark:bg-zinc-800 text-gray-500'
                }`}>
                  {files.length > 0 ? '✓' : '1'}
                </div>
                <div className="flex flex-col text-left">
                  <span className={`text-xs font-bold leading-tight ${files.length > 0 ? 'text-gray-950 dark:text-zinc-100 font-extrabold' : 'text-gray-400 dark:text-zinc-500 font-semibold'}`}>
                    {isKo ? "1단계: 원본 파일 로드" : "Step 1: Upload Images"}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-505 leading-normal font-medium">
                    {files.length > 0 
                      ? (isKo ? `✓ 총 ${files.length}개의 이미지 인식 완료` : `✓ Connected ${files.length} active assets.`) 
                      : (isKo ? "위 드롭존에 파일을 넣어보세요" : "Awaiting assets in dropzone above")}
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 flex-1">
                <div className={`flex items-center justify-center w-5.5 h-5.5 rounded-full shrink-0 text-xs font-bold transition-all ${
                  files.length > 0
                  ? 'bg-blue-600 text-white shadow-3xs' 
                  : 'bg-gray-200 dark:bg-zinc-800 text-gray-450 dark:text-zinc-500'
                }`}>
                  {files.length > 0 && activePreset !== 'custom' ? '✓' : '2'}
                </div>
                <div className="flex flex-col text-left">
                  <span className={`text-xs leading-tight ${files.length > 0 ? 'text-gray-800 dark:text-zinc-200 font-bold' : 'text-gray-400 dark:text-zinc-500 font-medium'}`}>
                    {isKo ? "2단계: 출력 포맷 및 압축률 지정" : "Step 2: Choose Target Format & Presets"}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 leading-normal font-medium">
                    {isKo 
                      ? `✓ 포맷: ${options.format.toUpperCase()} | 프리셋: ${activePreset === 'fast' ? '초절약' : activePreset === 'recommended' ? '추천' : activePreset === 'high' ? '고화질' : '수동 조절'}`
                      : `✓ Format: ${options.format.toUpperCase()} | Setup: ${activePreset === 'custom' ? 'Custom' : activePreset}`}
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className={`flex items-center justify-center w-5.5 h-5.5 rounded-full shrink-0 text-xs font-bold transition-all ${
                  activeFile?.status === 'completed' 
                  ? 'bg-emerald-600 text-white shadow-3xs' 
                  : 'bg-gray-200 dark:bg-zinc-800 text-gray-450 dark:text-zinc-500'
                }`}>
                  {activeFile?.status === 'completed' ? '✓' : '3'}
                </div>
                <div className="flex flex-col text-left">
                  <span className={`text-xs leading-tight ${activeFile?.status === 'completed' ? 'text-gray-800 dark:text-zinc-200 font-extrabold' : 'text-gray-400 dark:text-zinc-500 font-medium'}`}>
                    {isKo ? "3단계: 원패스 압축 및 변환 완료" : "Step 3: Instant Compress & Convert"}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 leading-normal font-medium">
                    {activeFile?.status === 'completed' 
                      ? (isKo ? "⚡ 변환이 끝났습니다! 다운로드 버튼 클릭" : "⚡ Ready to download! Enjoy maximum bandwidth savings.")
                      : (isKo ? "설정값을 바꿀 때마다 실시간 자동 수행" : "Live comparative split analysis active")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BENTO BOX 3: Export Format Grid (출력 형식 지정) */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-xs text-left">
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-gray-100 dark:border-zinc-800">
              <h4 className="text-[13px] font-extrabold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5 leading-none">
                <Sliders className="w-4 h-4 text-blue-500" />
                <span>{isKo ? "웹 표준 포맷 선택" : "Save Target Format"}</span>
              </h4>
              <span className="text-[10px] items-center font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/45 px-2 py-0.5 rounded-md uppercase">
                {options.format}
              </span>
            </div>

            <p className="text-[11px] text-gray-400 dark:text-zinc-500 leading-normal mb-3 font-medium">
              {isKo 
                ? "구글 검색엔진 노출 속도를 빠르게 하려면 WebP 형식을 적극 권장합니다." 
                : "WebP maximizes web speed and represents the modern web standard format."}
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { 
                  id: 'webp', 
                  title: 'WebP', 
                  desc: isKo ? '웹 최고효율 (검색우대)' : 'Modern web-optimized (Best)', 
                  badge: 'Recommended'
                },
                { 
                  id: 'jpeg', 
                  title: 'JPEG', 
                  desc: isKo ? '일반 호환 표준 포맷' : 'Standard photo file', 
                  badge: 'Standard'
                },
                { 
                  id: 'png', 
                  title: 'PNG', 
                  desc: isKo ? '투명 배경 보존' : 'Full transparent alpha', 
                  badge: 'Lossless'
                },
                { 
                  id: 'gif', 
                  title: 'GIF', 
                  desc: isKo ? '정적 압축 이미지 포맷' : 'Static compressed image', 
                  badge: 'Standard'
                }
              ].map((fmt) => {
                const isSelected = options.format === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => {
                      setOptions((prev) => ({ 
                        ...prev, 
                        format: fmt.id as any
                      }));
                      if (activePreset !== 'custom') {
                        setActivePreset('custom');
                      }
                    }}
                    className={`relative flex flex-col justify-between p-3.5 h-[95px] rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 ring-2 ring-blue-500/10 shadow-3xs'
                        : 'border-gray-205 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-gray-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2.5 right-2 text-blue-500 dark:text-blue-400 font-bold">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 leading-none">
                        <span className="text-[13px] font-extrabold text-gray-950 dark:text-zinc-100">
                          {fmt.title}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-gray-400 dark:text-zinc-500 leading-normal pr-1.5 pt-0.5 font-medium">
                        {fmt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Other formats dropdown */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-3.5 mt-3">
              <span className="text-[10px] text-gray-400 dark:text-zinc-500 flex items-center gap-1 font-semibold">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{isKo ? "BMP 포맷을 쓰고 싶으신가요?" : "Need legacy BMP format?"}</span>
              </span>
              <select
                value={options.format === 'bmp' ? options.format : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setOptions((prev) => ({ ...prev, format: e.target.value as any }));
                    setActivePreset('custom');
                  }
                }}
                className="text-[10.5px] font-extrabold text-gray-650 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 px-2.5 py-1.5 rounded-xl cursor-pointer hover:border-gray-350 transition-colors focus:outline-none"
              >
                <option value="">{isKo ? "선택..." : "Select..."}</option>
                <option value="bmp">BMP (Raw uncompressed)</option>
              </select>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-xs text-left">
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-gray-100 dark:border-zinc-800">
              <h4 className="text-[13px] font-extrabold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5 leading-none">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>{isKo ? "원클릭 인공지능 프리셋" : "1-Click Smart Presets"}</span>
              </h4>
              <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                {isKo ? "초보자 추천" : "Recommended"}
              </span>
            </div>

            <p className="text-[11px] text-gray-400 dark:text-zinc-500 leading-normal mb-3.5 font-medium">
              {isKo 
                ? "설정에 머리 쓰지 마세요. 터치 한 번으로 최적의 화질 대비 용량 효율을 찾아냅니다."
                : "Skip manual controls. Let the offline analyzer auto-configure settings in milliseconds."}
            </p>

            {/* Tap-friendly larger thumb-friendly preset buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'fast',
                  emoji: '⚡',
                  name: isKo ? '초경량 다이어트' : 'Tiny Size',
                  sub: isKo ? '화질 45% (용량초절약)' : 'Prioritize Speed',
                  color: 'hover:border-amber-400 hover:bg-amber-50/5 dark:hover:bg-amber-950/10'
                },
                {
                  id: 'recommended',
                  emoji: '⭐',
                  name: isKo ? '추천 최적화' : 'Standard Auto',
                  sub: isKo ? '화질 78% (베스트)' : 'Best Balance',
                  color: 'hover:border-emerald-400 hover:bg-emerald-50/5 dark:hover:bg-emerald-950/10'
                },
                {
                  id: 'high',
                  emoji: '💎',
                  name: isKo ? '무손실 최고화질' : 'Max Quality',
                  sub: isKo ? '화질 95% (원본준수)' : 'Maximum Detail',
                  color: 'hover:border-blue-400 hover:bg-blue-50/5 dark:hover:bg-blue-950/10'
                }
              ].map((p) => {
                const isActive = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id as any)}
                    className={`flex flex-col items-center justify-between p-3 min-h-[96px] rounded-2xl border text-center transition-all cursor-pointer ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-500/15 shadow-2xs scale-[1.02]'
                        : `border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 ${p.color}`
                    }`}
                  >
                    <span className="text-xl pb-1">{p.emoji}</span>
                    <div className="flex flex-col w-full text-center leading-none mt-1">
                      <span className={`text-[11px] font-extrabold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-zinc-200'}`}>
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

          {/* PROGRESSIVE DISCLOSURE COLLAPSE (고급 정밀 옵션 상세 폴더) */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-3xs text-left">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen((v) => !v)}
                className="w-full flex items-center justify-between p-4.5 font-extrabold text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Settings className={`w-4 h-4 text-indigo-550 ${isAdvancedOpen ? 'animate-spin' : ''}`} />
                  <span>{isKo ? "🛠️ 상세 정밀 조절 (고급 옵션)" : "⚙️ Advanced Fine-Tuning Keys"}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-bold text-gray-400 bg-gray-100 dark:bg-zinc-850 px-2 py-0.5 rounded-md">
                    {isAdvancedOpen ? (isKo ? "접기" : "Collapse") : (isKo ? "조절하기" : "Modify")}
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
                    transition={{ duration: 0.2 }}
                    className="p-5 border-t border-gray-100 dark:border-zinc-800 space-y-5 bg-gray-50/20"
                  >
                    
                    {/* Detailed Manual Quality (Traffic Light Indicators) */}
                    <div className="space-y-3 text-left">
                       <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-gray-700 dark:text-zinc-200 font-extrabold">{isKo ? "수동 화질 보정값 (Quality Slider)" : "Detailed Quality"}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-[11px] font-extrabold px-1.5 py-0.5 rounded ${
                            options.quality < 0.4 
                              ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' 
                              : (options.quality >= 0.7 && options.quality <= 0.85)
                                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 font-extrabold'
                                : options.quality > 0.85
                                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 font-extrabold'
                                  : 'text-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                          }`}>
                            {Math.round(options.quality * 100)}%
                          </span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="0.05"
                        max="1.00"
                        step="0.01"
                        value={options.quality}
                        onChange={(e) => {
                          setOptions((prev) => ({ ...prev, quality: parseFloat(e.target.value) }));
                          setActivePreset('custom');
                        }}
                        className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer transition-colors ${
                          options.quality < 0.4 
                            ? 'accent-amber-500 bg-amber-200 dark:bg-amber-950/40' 
                            : (options.quality >= 0.7 && options.quality <= 0.85)
                              ? 'accent-emerald-500 bg-emerald-250 dark:bg-emerald-950/40'
                              : options.quality > 0.85
                                ? 'accent-blue-500 bg-blue-200 dark:bg-blue-950/40'
                                : 'accent-amber-400 bg-amber-100 dark:bg-amber-950/20'
                        }`}
                      />
                      <div className="flex items-center justify-between text-[10px] font-bold leading-none pt-0.5 font-mono">
                         <span className="text-amber-600 dark:text-amber-400">{isKo ? "초압축 (용량 최소화)" : "Tiny Width"}</span>
                        <span className="text-emerald-600 dark:text-emerald-400">{isKo ? "골든 리체 추천★" : "Standard Auto ★"}</span>
                        <span className="text-blue-600 dark:text-blue-400">{isKo ? "초고등 화질" : "Maximum"}</span>
                      </div>
                    </div>

                    {/* SNS Crop Presets (Center Crop) */}
                    <div className="space-y-3.5 border-t border-gray-100 dark:border-zinc-800 pt-4 text-left">
                       <div className="flex items-center justify-between">
                         <span className="text-xs font-extrabold text-gray-850 dark:text-zinc-200">
                          {isKo ? "SNS 크롭 비율 지정 (중앙 기준)" : "SNS Crop Presets (Center Crop)"}
                        </span>
                        {options.cropAspectRatio && options.cropAspectRatio !== 'none' && (
                          <span className="text-[9.5px] font-extrabold text-indigo-100 bg-indigo-500 px-2 py-0.5 rounded-md">
                            {isKo ? "크롭 활성" : "Crop Active"}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'none', label: isKo ? '안함 (원본)' : 'None', desc: 'Original' },
                          { id: '1:1', label: '1:1', desc: isKo ? '인스타 피드' : 'Insta Feed' },
                          { id: '9:16', label: '9:16', desc: isKo ? '인스타 스토리' : 'Insta Story' },
                          { id: '16:9', label: '16:9', desc: isKo ? '유튜브 썸네일' : 'YT Thumbnail' },
                        ].map((preset) => {
                          const isSelected = (options.cropAspectRatio || 'none') === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                setOptions((prev) => ({ ...prev, cropAspectRatio: preset.id as any }));
                                setActivePreset('custom');
                              }}
                              className={`text-[11px] p-2 rounded-xl border text-center font-bold cursor-pointer transition-all flex flex-col items-center justify-center leading-tight ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-50/20 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 shadow-3xs ring-2 ring-indigo-500/15'
                                  : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-750 dark:text-zinc-200 hover:border-gray-300'
                              }`}
                            >
                              <span className="font-extrabold text-[12.5px]">{preset.label}</span>
                              <span className="text-[8.5px] text-gray-400 dark:text-zinc-500 block font-normal mt-0.5 whitespace-nowrap">{preset.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* STEP 3: Dimensional Scaling (리사이즈) */}
                    <div className="space-y-3.5 border-t border-gray-100 dark:border-zinc-800 pt-4 text-left">
                       <div className="flex items-center justify-between">
                         <span className="text-xs font-extrabold text-gray-850 dark:text-zinc-200">
                          {isKo ? "해상도 픽셀 크기 축소 (옵션)" : "Resize Options"}
                        </span>
                        {options.resizeMode !== 'none' && (
                          <span className="text-[9.5px] font-extrabold text-indigo-100 bg-indigo-500 px-2 py-0.5 rounded-md">
                            {isKo ? "가동중" : "On"}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'none', label: isKo ? '원본 비율 100%' : 'None (100%)' },
                          { id: 'width', label: isKo ? '너비 지정 (Width)' : 'Fit Width' },
                          { id: 'height', label: isKo ? '높이 지정 (Height)' : 'Fit Height' },
                          { id: 'percentage', label: isKo ? '비율 조정 (%)' : 'Scale %' },
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => {
                              setOptions((prev) => ({ ...prev, resizeMode: mode.id as any }));
                              setActivePreset('custom');
                            }}
                            className={`text-[11.5px] p-2 rounded-xl border text-center font-bold cursor-pointer transition-all leading-tight ${
                              options.resizeMode === mode.id
                                ? 'border-indigo-500 bg-indigo-50/20 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 shadow-3xs'
                                : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-700 dark:text-zinc-200 hover:border-gray-300'
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>

                      {options.resizeMode !== 'none' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="space-y-2 border border-dashed border-gray-200 dark:border-zinc-800 p-3.5 bg-white dark:bg-zinc-950 rounded-2xl"
                        >
                          <div className="flex items-center justify-between leading-none">
                            <label className="text-[10px] font-semibold text-gray-400" htmlFor="resize-val-input">
                              {options.resizeMode === 'percentage' 
                                ? (isKo ? "비율 입력 (%)" : "Scale Percentage") 
                                : (isKo ? "원하는 픽셀값 입력 (px)" : "Dimension Boundary")}
                            </label>
                            <span className="font-mono text-[10.5px] font-bold text-indigo-500">
                              {options.resizeValue} {options.resizeMode === 'percentage' ? '%' : 'px'}
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              id="resize-val-input"
                              value={options.resizeValue}
                              min="1"
                              max={options.resizeMode === 'percentage' ? 500 : 10000}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setOptions((prev) => ({ ...prev, resizeValue: val }));
                                setActivePreset('custom');
                              }}
                              className="w-full text-xs font-mono font-bold rounded-xl border border-gray-200 dark:border-zinc-800 pl-3 pr-8 py-2.5 bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10.5px] font-bold text-gray-400 select-none">
                              {options.resizeMode === 'percentage' ? '%' : 'px'}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          {/* BENTO BOX 4: 100% On-Device Security & Privacy Auditr (로컬 샌드박스 보안 감사 패널) */}
          <div className="bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 dark:from-emerald-950/10 dark:to-cyan-950/10 border border-emerald-200/30 dark:border-emerald-900/10 rounded-3xl p-5 shadow-3xs text-left relative overflow-hidden group">
            {/* Glossy radial gradient spot */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-24 h-24 bg-gradient-to-br from-emerald-400/10 to-cyan-500/10 rounded-full blur-xl animate-pulse" />
            
            <div className="flex items-center justify-between pb-2">
              <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                {isKo ? "보안 검증 완료" : "Audit Verified"}
              </span>
              <span className="text-[10px] text-gray-400 font-mono tracking-wider font-extrabold flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-500" /> ON-DEVICE
              </span>
            </div>

            <div className="space-y-1.5 relative">
              <h5 className="text-[11.5px] font-extrabold text-gray-950 dark:text-zinc-100 leading-snug flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{isKo ? "100% 클라이언트 사이드 보안인증 및 검열 검증" : "100% Client-Side Security Audited Sandbox"}</span>
              </h5>
              <p className="text-[9.5px] text-gray-500 dark:text-zinc-400 leading-relaxed font-semibold">
                {isKo 
                  ? "본 서비스는 브라우저 내부에서만 모든 연산을 완결합니다. [네트워크 실시간 검증 가이드] 지금 키보드의 F12 키를 눌러 개발자 도구를 여신 후, 'Network' 탭을 켜둔 상태로 파일들을 가공해 보세요. 외부 데이터 서버로 날아가는 통색 패킷이 완벽하게 0개이며, 단 1바이트의 유출 통로도 존재하지 않음을 실시간 청정 검열로 확인하실 수 있습니다."
                  : "Every operation runs completely inside your isolated browser engine. [Local Network Inspection Guide] Press F12 to open Developer Tools, head to the 'Network' monitor, and execute any compression. You will visually verify that exactly zero external API uploads happen. Your data remains perfectly safe offline inside your sandboxed RAM."}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area: Slider & Live comparative telemetry */}
      <div className="lg:col-span-8 flex flex-col space-y-4" id="image-compressor-workspace">
        {activeFile ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col space-y-5">
            {/* Header layout showing sizes and savings live */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-50 dark:border-zinc-800 pb-4">
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 truncate max-w-[280px]">
                  {activeFile.name}
                </h4>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400 dark:text-zinc-500 font-mono">
                  <span>{formatSize(activeFile.size)}</span>
                  <span>➔</span>
                  {activeFile.processedSize ? (
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      {formatSize(activeFile.processedSize)}
                    </span>
                  ) : (
                    <span className="animate-pulse">Loading size...</span>
                  )}
                  {processingTime && (
                    <>
                      <span>•</span>
                      <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 px-1.5 py-0.5 rounded-md font-sans text-[10px]">
                        {processingTime} ms
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {activeFile.status === 'completed' && activeFile.processedUrl && (
                  <button
                    onClick={() => triggerDownload(activeFile)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-md cursor-pointer transition-all"
                    id="download-selected-image-button"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.download}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Split comparison viewport */}
            <div className="relative">
              {activeFile.status === 'failed' ? (
                <div className="flex flex-col items-center justify-center p-12 border border-red-200/30 dark:border-red-900/30 rounded-2xl bg-red-50/25 dark:bg-red-950/20 text-center space-y-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="space-y-1.5 max-w-md">
                    <h4 className="font-extrabold text-gray-950 dark:text-white text-sm">
                      {isKo ? "처리 차단 혹은 작업 오류" : "Processing Suspended / Error"}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium leading-relaxed">
                      {activeFile.error || (isKo ? "알 수 없는 에러가 발생했습니다." : "An unknown error occurred.")}
                    </p>
                  </div>
                </div>
              ) : currentOriginalUrl && currentProcessedUrl ? (
                <SquooshSlider
                  originalUrl={currentOriginalUrl}
                  processedUrl={currentProcessedUrl}
                  originalLabel={`${t.original} (${formatSize(activeFile.size)})`}
                  processedLabel={`${t.processed} (${activeFile.processedSize ? formatSize(activeFile.processedSize) : 'Loading...'})`}
                  t={t}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-20 border border-gray-100 dark:border-zinc-800 rounded-2xl bg-gray-50/50 dark:bg-zinc-950/30">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-4 font-bold animate-pulse">
                    {t.processing}
                  </p>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 pt-1">
                    {isKo ? "대기열 큐 실행 순서 대기 중..." : "Waiting in parallel processing queue..."}
                  </span>
                </div>
              )}

              {/* Loader Overlay */}
              {isProcessing && (
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 flex items-center gap-2 shadow-xs pointer-events-none text-xs text-gray-600 dark:text-zinc-400">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
            </div>

            {/* Detailed Optimization Saving banner */}
            {activeFile.processedSize && activeFile.processedSize < activeFile.size && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="text-xs text-emerald-800 dark:text-emerald-400">
                  <span>Great job! You saved </span>
                  <strong className="font-bold">
                    {formatSize(activeFile.size - activeFile.processedSize)}
                  </strong>
                  <span> (</span>
                  <strong className="font-bold">
                    {Math.round(((activeFile.size - activeFile.processedSize) / activeFile.size) * 100)}%
                  </strong>
                  <span>) of space. This file compressed almost instantly on your machine.</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-gray-150 dark:border-zinc-800 rounded-3xl p-10 shadow-xs flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden min-h-[440px]">
            {/* Visual Guide Dotted Arrow pointing up */}
            <div className="flex flex-col items-center space-y-2">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="flex flex-col items-center text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-full"
              >
                <svg className="w-10 h-10 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeDasharray="3 3" 
                    d="M12 20V4m0 0l-5 5m5-5l5 5" 
                  />
                </svg>
              </motion.div>
              <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                {isKo ? "위쪽 드롭존에 파일을 넣어주세요" : "Upload Above"}
              </span>
            </div>

            <div className="space-y-2 max-w-md">
              <h4 className="font-extrabold text-gray-800 dark:text-zinc-100 text-base">
                {isKo ? "아직 선택된 이미지가 없습니다" : "No Active Image Workspace"}
              </h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-semibold">
                {isKo 
                  ? "위쪽 드롭존에 이미지(PNG, JPG, WebP)를 떨어뜨리거나 클릭하여 추가하면 비교 분석기 및 최적화 설정이 즉시 나타납니다!" 
                  : "Drag and drop some files above or click to select them to activate comparison sliders, detailed tracers, and target formats instantly."}
              </p>
            </div>

            {/* Programmatic Test Sample Creator */}
            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/45 w-full max-w-xs flex flex-col items-center">
              <span className="text-[10.5px] font-bold text-gray-400 dark:text-zinc-500 pb-2.5">
                {isKo ? "테스트용 이미지가 없으신가요?" : "Don't have an image ready?"}
              </span>
              <button
                type="button"
                onClick={() => {
                  const sample = generateSampleImage();
                  if (onLoadSampleFile) {
                    onLoadSampleFile(sample);
                    // Confetti feedback for visual delight
                    confetti({
                      particleCount: 50,
                      spread: 60,
                      origin: { y: 0.8 }
                    });
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4.5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-xs hover:shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>{isKo ? "⚡ 샘플 이미지로 테스트해보기" : "⚡ Load Cute Sample Graphic"}</span>
              </button>
              <p className="text-[9.5px] text-gray-400 dark:text-zinc-500 pt-2 font-medium leading-normal">
                {isKo ? "※ 원본 대비 화질 및 벡터 분석이 가능한 컬러 캐릭터가 로드됩니다." : "※ Instantly populates a clean colorful gradient smiley test pattern."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
