/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProcessableFile, DocumentProcessingOptions } from '../types';
import {
  mergePDFs,
  splitPDF,
  convertImagesToPDF,
  convertExcelToCsv,
  convertCsvToExcel,
  convertTxtToPdf,
  extractMetadataText
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
  Sparkles
} from 'lucide-react';
import { TranslationDict } from '../translations';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';

const generateSampleDocument = (action: string): File => {
  if (action === 'pdf-merge' || action === 'pdf-split') {
    const dummyContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 45 >>\nstream\nBT /F1 12 Tf 72 712 Td (Stickers Demo PDF Document File) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n306\n%%EOF";
    const blob = new Blob([dummyContent], { type: 'application/pdf' });
    const name = action === 'pdf-split' ? 'sample-to-split.pdf' : 'sample-pdf-merge.pdf';
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
    canvas.height = 305;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 400, 305);
      grad.addColorStop(0, '#ec4899');
      grad.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 305);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sample Receipt Image', 200, 140);
      ctx.font = '12px monospace';
      ctx.fillText('PNG to PDF automatic test', 200, 180);
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
Date: 2026-06-06
Features Selected: Automated typesetting formatting
Status check: local execution successful!`;
    const blob = new Blob([content], { type: 'text/plain' });
    return new File([blob], 'sample_text_document.txt', { type: 'text/plain' });
  }
};

interface DocumentConverterViewProps {
  files: ProcessableFile[];
  onUpdateFile: (id: string, updates: Partial<ProcessableFile>) => void;
  onClear: () => void;
  t: TranslationDict;
  onLoadSampleFile?: (file: File) => void;
}

export default function DocumentConverterView({
  files,
  onUpdateFile,
  onClear,
  t,
  onLoadSampleFile
}: DocumentConverterViewProps) {
  const isKo = t.clearAll ? t.clearAll.includes('비우기') : false;
  const [selectedAction, setSelectedAction] = useState<DocumentProcessingOptions['action']>('pdf-merge');
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
    } else if (selectedAction === 'images-to-pdf') {
      relevantFiles = files.filter(f => f.type.startsWith('image/'));
    } else if (selectedAction === 'excel-to-csv') {
      relevantFiles = files.filter(f => f.name.toLowerCase().endsWith('.xlsx') || f.name.toLowerCase().endsWith('.xls'));
    } else if (selectedAction === 'csv-to-excel') {
      relevantFiles = files.filter(f => f.name.toLowerCase().endsWith('.csv'));
    } else if (selectedAction === 'txt-to-pdf') {
      relevantFiles = files.filter(f => f.name.toLowerCase().endsWith('.txt') || f.name.toLowerCase().endsWith('.csv') || f.name.toLowerCase().endsWith('.md'));
    } else if (selectedAction === 'meta-extract') {
      // PPTX, HWP, DOCX, or anything
      relevantFiles = files;
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
    if (activeFilesOrder.length === 0) return;

    setIsProcessing(true);
    setLogMessages([]);
    addLog(`Initiating operation: ${selectedAction}...`);

    // Reset progress and mark all active files as processing
    activeFilesOrder.forEach((f) => {
      onUpdateFile(f.id, { status: 'processing', progress: 5 });
    });

    try {
      const firstFile = activeFilesOrder[0].file;

      if (selectedAction === 'pdf-merge') {
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

      } else if (selectedAction === 'meta-extract') {
        onUpdateFile(activeFilesOrder[0].id, { progress: 20 });
        const metadataText = await extractMetadataText(firstFile, (msg) => {
          addLog(msg);
          if (msg.includes('Extracting structures')) {
            onUpdateFile(activeFilesOrder[0].id, { progress: 55 });
          } else if (msg.includes('Formatting layout')) {
            onUpdateFile(activeFilesOrder[0].id, { progress: 85 });
          }
        });
        const blob = new Blob([metadataText], { type: 'text/plain' });
        const outName = firstFile.name + '_metadata_recovery.txt';
        addFinishedResult(outName, blob, 'text/plain');
      }

      // Mark all files as completed
      activeFilesOrder.forEach((f) => {
        onUpdateFile(f.id, { status: 'completed', progress: 100 });
      });

      addLog(`Operation completed successfully.`);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.85 }
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

  const addFinishedResult = (name: string, blob: Blob, type: string) => {
    const url = URL.createObjectURL(blob);
    setProcessedResults((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        name,
        url,
        size: blob.size,
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

  // Set default action descriptions
  const getActionDescription = (): { desc: string; filter: string } => {
    switch (selectedAction) {
      case 'pdf-merge':
        return { desc: t.docMergeDesc, filter: 'PDF documents only (.pdf)' };
      case 'pdf-split':
        return { desc: t.docSplitDesc, filter: 'PDF documents only (.pdf)' };
      case 'images-to-pdf':
        return { desc: t.docImagesToPdfDesc, filter: 'Images only (.png, .jpg, .webp, .bmp)' };
      case 'excel-to-csv':
        return { desc: t.docExcelToCsvDesc, filter: 'Excel files only (.xlsx, .xls)' };
      case 'csv-to-excel':
        return { desc: t.docCsvToExcelDesc, filter: 'Comma-Separated CSV files only (.csv)' };
      case 'txt-to-pdf':
        return { desc: t.docTxtToPdfDesc, filter: 'Plain Text, MD or CSV documents (.txt, .md, .csv)' };
      case 'meta-extract':
        return { desc: t.docMetaExtractDesc, filter: 'Any doc container (.pptx, .hwp, .docx, .html, etc.)' };
    }
  };

  const info = getActionDescription();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full" id="document-converter-root">
      
      {/* Sidebar Controls */}
      <div className="lg:col-span-5 flex flex-col space-y-4" id="document-converter-sidebar">
        
        {/* Tool Selector box */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
          <h3 className="font-semibold text-gray-800 dark:text-zinc-200 flex items-center gap-2 border-b border-gray-50 dark:border-zinc-800 pb-3">
            <Settings className="w-5 h-5 text-blue-500" />
            <span>{t.docAction}</span>
          </h3>

          <div className="space-y-2">
            {([
              { val: 'pdf-merge', label: t.actionMergePdf, badge: 'PDF', icon: <Layers className="w-4 h-4" /> },
              { val: 'pdf-split', label: t.actionSplitPdf, badge: 'PDF', icon: <Scissors className="w-4 h-4" /> },
              { val: 'images-to-pdf', label: t.actionImagesToPdf, badge: 'JPG/PNG', icon: <FileImage className="w-4 h-4" /> },
              { val: 'excel-to-csv', label: t.actionExcelToCsv, badge: 'EXCEL', icon: <FileSpreadsheet className="w-4 h-4" /> },
              { val: 'csv-to-excel', label: t.actionCsvToExcel, badge: 'CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
              { val: 'txt-to-pdf', label: t.actionTxtToPdf, badge: 'TXT', icon: <FileText className="w-4 h-4" /> },
              { val: 'meta-extract', label: t.actionMetaExtract, badge: 'META', icon: <Search className="w-4 h-4" /> }
            ] as const).map((opt) => {
              const checked = selectedAction === opt.val;
              
              // Define distinct matching colors for intuitive document tool visualization
              const getColorClasses = () => {
                if (!checked) {
                  return 'border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850';
                }
                switch (opt.val) {
                  case 'pdf-merge':
                  case 'pdf-split':
                    return 'border-red-500 bg-red-50/15 text-red-700 dark:text-red-400 ring-2 ring-red-500/10';
                  case 'images-to-pdf':
                    return 'border-cyan-500 bg-cyan-50/15 text-cyan-700 dark:text-cyan-400 ring-2 ring-cyan-500/10';
                  case 'excel-to-csv':
                  case 'csv-to-excel':
                    return 'border-emerald-500 bg-emerald-50/15 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/10';
                  case 'txt-to-pdf':
                    return 'border-blue-500 bg-blue-50/15 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500/10';
                  case 'meta-extract':
                    return 'border-purple-500 bg-purple-50/15 text-purple-700 dark:text-purple-400 ring-2 ring-purple-500/10';
                  default:
                    return 'border-blue-500 bg-blue-50/15 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500/10';
                }
              };

              // Define matching color for small badge/status marker
              const getBadgeColor = () => {
                switch (opt.val) {
                  case 'pdf-merge':
                  case 'pdf-split':
                    return checked ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400';
                  case 'images-to-pdf':
                    return checked ? 'bg-cyan-500 text-white' : 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400';
                  case 'excel-to-csv':
                  case 'csv-to-excel':
                    return checked ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400';
                  case 'txt-to-pdf':
                    return checked ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400';
                  case 'meta-extract':
                    return checked ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400';
                  default:
                    return checked ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400';
                }
              };

              return (
                <button
                  key={opt.val}
                  onClick={() => {
                    setSelectedAction(opt.val);
                    setLogMessages([]);
                  }}
                  className={`w-full flex items-center justify-between text-left text-[13px] px-3.5 py-3 rounded-xl border transition-all font-semibold cursor-pointer ${getColorClasses()}`}
                  id={`action-button-${opt.val}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`p-1.5 rounded-lg shrink-0 ${checked ? 'opacity-100' : 'text-gray-400 dark:text-zinc-500'}`}>
                      {opt.icon}
                    </span>
                    <span className="font-extrabold">{opt.label}</span>
                  </div>
                  
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${getBadgeColor()}`}>
                    {opt.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live terminal sandbox logging console logger */}
        <div className="bg-zinc-950 dark:border dark:border-zinc-800 rounded-2xl p-4 shadow-lg font-mono text-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between text-zinc-500 border-b border-zinc-900 pb-2.5">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-sans font-semibold tracking-wider uppercase">Sandbox Console Log</span>
            </div>
            <Activity className={`w-3.5 h-3.5 ${isProcessing ? 'text-blue-400 animate-pulse' : 'text-zinc-700'}`} />
          </div>

          <div className="overflow-y-auto max-h-[160px] h-[130px] space-y-1.5 pr-2 custom-scrollbar text-zinc-300">
            {logMessages.length === 0 ? (
              <span className="text-zinc-400 italic">Console idle. Select documents and click 'Run Document Tool' to start sandbox.</span>
            ) : (
              logMessages.map((log, index) => (
                <div key={index} className="leading-relaxed">
                  <span className="text-emerald-500">➔</span> {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="lg:col-span-7 flex flex-col space-y-4" id="document-converter-body">
        
        {/* Workspace Control Card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col space-y-5">
          <div className="border-b border-gray-50 dark:border-zinc-800 pb-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 rounded-md">
              Active Scope Limit
            </span>
            <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mt-2.5">
              {info.desc}
            </p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 font-mono">
              Accepted Signature: {info.filter}
            </p>
          </div>

          {activeFilesOrder.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <span>Ordered Input Queue ({activeFilesOrder.length})</span>
                  {selectedAction === 'pdf-merge' && (
                    <span className="text-[10px] text-gray-400 font-sans font-normal">({t.dragToReorder})</span>
                  )}
                </span>

                <div className="space-y-2 overflow-y-auto max-h-[220px]" id="selected-docs-sortable-list">
                  {activeFilesOrder.map((f, index) => (
                    <div
                      key={f.id}
                      draggable={selectedAction === 'pdf-merge' && !isProcessing}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex flex-col p-4 sm:p-3.5 min-h-[52px] sm:min-h-0 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/30 text-sm ${
                        selectedAction === 'pdf-merge' && !isProcessing ? 'cursor-grab active:cursor-grabbing' : ''
                      }`}
                      id={`doc-order-item-${f.id}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                          <div className="flex flex-col overflow-hidden text-left">
                            <span className="font-semibold text-gray-800 dark:text-zinc-200 truncate pr-2">
                              {f.name}
                            </span>
                            <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500">
                              {formatSize(f.size)} • {f.type || 'Document'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {f.status === 'processing' && (
                            <span className="text-[11.5px] font-mono font-semibold text-blue-600 dark:text-blue-400">
                              {f.progress}%
                            </span>
                          )}
                          {f.status === 'completed' && (
                            <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded-md font-semibold font-sans">
                              Done
                            </span>
                          )}
                          {f.status === 'failed' && (
                            <span className="bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-mono text-[9px] px-1.5 py-0.5 rounded-md font-semibold font-sans">
                              Error
                            </span>
                          )}

                          {/* Direction sorting handles */}
                          {selectedAction === 'pdf-merge' && !isProcessing && (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => moveItem(index, 'up')}
                                disabled={index === 0}
                                className="p-2 sm:p-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                                aria-label="Move Up"
                              >
                                <ArrowUp className="w-4 h-4 text-gray-500" />
                              </button>
                              <button
                                onClick={() => moveItem(index, 'down')}
                                disabled={index === activeFilesOrder.length - 1}
                                className="p-2 sm:p-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                                aria-label="Move Down"
                              >
                                <ArrowDown className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Real-time Loading/Progress Bar */}
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Run Tool Trigger */}
              <button
                onClick={handleExecuteTool}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all shadow-md active:scale-99.5 cursor-pointer text-sm"
                id="execute-document-tool-button"
              >
                {isProcessing ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>{t.processing}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 shrink-0" />
                    <span>{t.processButton}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 text-center space-y-6 border-2 border-dashed border-gray-150 dark:border-zinc-800 rounded-3xl bg-gray-50/20 dark:bg-zinc-950/20 min-h-[380px]">
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
                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                  {t.title && t.title.includes('이미지') ? "위쪽 드롭존에 파일을 넣어주세요" : "Upload Above"}
                </span>
              </div>

              <div className="space-y-2 max-w-sm">
                <h4 className="font-extrabold text-gray-800 dark:text-zinc-100 text-sm">
                  {t.title && t.title.includes('이미지') ? "선택한 조건에 부합하는 파일이 없습니다" : "No Eligible Files Loaded"}
                </h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-semibold">
                  {t.title && t.title.includes('이미지')
                    ? `선택하신 '${info.filter}' 형식에 적합한 파일을 하나 이상 업로드해 주세요.`
                    : `Please drop or upload target format files that match the expected structure: ${info.filter}.`}
                </p>
              </div>

              {/* Programmatic Document Sample Test Trigger */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/45 w-full max-w-xs flex flex-col items-center">
                <span className="text-[10.5px] font-bold text-gray-400 dark:text-zinc-500 pb-2.5">
                  {t.title && t.title.includes('이미지') ? "준비된 예제 문서가 없으신가요?" : "Don't have a document to test?"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const sample = generateSampleDocument(selectedAction);
                    if (onLoadSampleFile) {
                      onLoadSampleFile(sample);
                      confetti({
                        particleCount: 50,
                        spread: 60,
                        origin: { y: 0.8 }
                      });
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-xs hover:shadow-md cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>{t.title && t.title.includes('이미지') ? `⚡ 예시 파일(${info.filter.split(' ')[0]})로 테스트` : `⚡ Load Sample ${selectedAction.toUpperCase()}`}</span>
                </button>
                <p className="text-[9.5px] text-gray-400 dark:text-zinc-500 pt-2 font-medium">
                  {t.title && t.title.includes('이미지')
                    ? "※ 오프라인 샌드박스에서 즉시 변환 작동 방식을 테스트할 수 있습니다."
                    : "※ Fully safe client-side offline conversion test."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic completed results list */}
        {processedResults.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Download Ready ({processedResults.length})</span>
            </h3>

            <div className="space-y-2 max-h-[220px] overflow-y-auto" id="completed-downloads-list">
              {processedResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-50 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 text-sm"
                  id={`finished-item-${result.id}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-semibold text-gray-800 dark:text-zinc-200 truncate pr-2">
                        {result.name}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {formatSize(result.size)}
                      </span>
                    </div>
                  </div>

                  <a
                    href={result.url}
                    download={result.name}
                    className="p-3 sm:p-2.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 hover:shadow-xs transition-all flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer"
                    aria-label={`Download ${result.name}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                </div>
              ))}
            </div>

            {processedResults.length > 0 && (
              <button
                onClick={downloadAllAsZip}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md animate-pulse"
                id="download-all-docs-zip-button"
              >
                <Download className="w-4 h-4 text-white" />
                <span>{isKo ? "변환 완료 문서 일괄 다운로드 (.zip)" : "Download All documents as ZIP (.zip)"}</span>
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
