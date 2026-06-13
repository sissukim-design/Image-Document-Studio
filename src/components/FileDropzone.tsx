/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, FileImage, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface FileDropzoneProps {
  onFilesSelected: (files: FileList) => void;
  title: string;
  subtitle: string;
}

export default function FileDropzone({ onFilesSelected, title, subtitle }: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full" id="dropzone-root">
      <motion.div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className={`relative flex flex-col items-center justify-center w-full min-h-[220px] p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all focus-within:ring-2 focus-within:ring-blue-500 focus:outline-none ${
          isDragActive
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/10'
            : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/50'
        }`}
        role="button"
        tabIndex={0}
        aria-label={`${title}. ${subtitle}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFileDialog();
          }
        }}
        id="dropzone-container"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          tabIndex={-1}
          aria-hidden="true"
          id="dropzone-file-input"
        />

        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div
            animate={isDragActive ? { y: -8, scale: 1.08 } : { y: [0, -4, 0] }}
            transition={isDragActive ? { duration: 0.15 } : { repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className={`p-5 rounded-full shadow-2xs transition-colors ${
              isDragActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-blue-50 text-blue-500 dark:bg-zinc-800 dark:text-zinc-400'
            }`}
          >
            <Upload className="w-8 h-8" />
          </motion.div>

          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-gray-800 dark:text-zinc-100 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium max-w-md">
              {subtitle}
            </p>
            
            {/* Limit notification alerts loaded dynamically */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 pb-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              <span className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100/35 dark:border-rose-955/10">
                {title.includes('드래그') || subtitle.includes('기기')
                  ? "50MB 제한"
                  : "50MB limit"}
              </span>
              <span className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/35 dark:border-indigo-955/10">
                {title.includes('드래그') || subtitle.includes('기기')
                  ? "최대 20파일"
                  : "Up to 20 files"}
              </span>
            </div>

            <div className="pt-1.55">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10.5px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100/40 dark:border-blue-900/10">
                <span>💡</span>
                <span>
                  {title.includes('드래그') || subtitle.includes('기기')
                    ? "자동 최적화 변환"
                    : "Auto-optimized by default: just drop files to convert with optimal smart compression!"}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-zinc-500 pt-2 border-t border-gray-100 dark:border-zinc-800 w-full justify-center">
            <div className="flex items-center gap-1">
              <FileImage className="w-3.5 h-3.5" />
              <span>Images</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Documents</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
