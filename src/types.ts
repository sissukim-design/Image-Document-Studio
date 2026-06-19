/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProcessableFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  category: 'image' | 'document';
  progress: number;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  error?: string;
  previewUrl?: string;
  processedUrl?: string;
  processedName?: string;
  processedSize?: number;
}

export type ThemeMode = 'light' | 'dark';

export type ActiveTab = 'image' | 'document' | 'about';

export interface ImageProcessingOptions {
  quality: number; // 0.01 to 1.00
  format: 'png' | 'jpeg' | 'webp' | 'gif' | 'bmp';
  resizeMode: 'none' | 'width' | 'height' | 'percentage';
  resizeValue: number;
  compressEnabled?: boolean;
  cropAspectRatio?: 'none' | '1:1' | '9:16' | '16:9';
}

export interface DocumentProcessingOptions {
  action: 'pdf-merge' | 'pdf-split' | 'images-to-pdf' | 'excel-to-csv' | 'csv-to-excel' | 'txt-to-pdf' | 'meta-extract' | 'pdf-sign';
  pdfMergeOrder?: string[]; // array of file IDs
  excelSheetName?: string;
}

export interface Language {
  code: string;
  name: string;
  localName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', localName: 'English' },
  { code: 'ko', name: 'Korean', localName: '한국어' },
  { code: 'ja', name: 'Japanese', localName: '日本語' },
  { code: 'zh', name: 'Chinese (Simplified)', localName: '简体中文' },
  { code: 'es', name: 'Spanish', localName: 'Español' },
  { code: 'fr', name: 'French', localName: 'Français' },
  { code: 'de', name: 'German', localName: 'Deutsch' },
  { code: 'vi', name: 'Vietnamese', localName: 'Tiếng Việt' },
  { code: 'hi', name: 'Hindi', localName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', localName: 'العربية' },
  { code: 'pt', name: 'Portuguese', localName: 'Português' },
  { code: 'it', name: 'Italian', localName: 'Italiano' },
  { code: 'ru', name: 'Russian', localName: 'Русский' }
];

