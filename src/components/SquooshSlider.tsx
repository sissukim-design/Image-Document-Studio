/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import { TranslationDict } from '../translations';

interface SquooshSliderProps {
  originalUrl: string;
  processedUrl: string;
  originalLabel: string;
  processedLabel: string;
  t: TranslationDict;
}

export default function SquooshSlider({
  originalUrl,
  processedUrl,
  originalLabel,
  processedLabel,
  t
}: SquooshSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100 %
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let position = (x / rect.width) * 100;
    if (position < 0) position = 0;
    if (position > 100) position = 100;
    setSliderPosition(position);
  };

  const handleMouseDown = () => {
    isDraggingRef.current = true;
  };

  const handleTouchStart = () => {
    isDraggingRef.current = true;
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Keyboard navigation for split slider
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((pos) => Math.max(0, pos - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((pos) => Math.min(100, pos + 5));
    }
  };

  return (
    <div className="flex flex-col space-y-3 w-full" id="squoosh-slider-root">
      <div
        ref={containerRef}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label={t.a11ySliderHint}
        className="relative w-full aspect-video md:aspect-[16/10] bg-gray-100 dark:bg-zinc-800 rounded-2xl overflow-hidden select-none cursor-ew-resize border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-inner"
        id="comparison-slider-container"
      >
        {/* Right Half: Processed output */}
        <img
          src={processedUrl}
          alt={processedLabel}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          referrerPolicy="no-referrer"
          id="preview-processed-image"
        />
        <div className="absolute right-4 bottom-4 bg-zinc-900/75 dark:bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-1 rounded-md tracking-wider font-medium pointer-events-none uppercase">
          {processedLabel}
        </div>

        {/* Left Half: Original input (clipped via width) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
          id="preview-original-container"
        >
          {/* We must specify container width explicitly to let img draw at full scale without compressing */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ width: containerRef.current?.getBoundingClientRect().width || '100%', height: '100%' }}
          >
            <img
              src={originalUrl}
              alt={originalLabel}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              id="preview-original-image"
            />
          </div>
        </div>
        <div
          className="absolute left-4 bottom-4 bg-blue-600/90 text-white text-[11px] font-mono px-2 py-1 rounded-md tracking-wider font-medium pointer-events-none uppercase"
          style={{ opacity: sliderPosition > 12 ? 1 : 0, transition: 'opacity 0.2s' }}
        >
          {originalLabel}
        </div>

        {/* Separator Line */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white shadow-lg pointer-events-none z-10"
          style={{ left: `${sliderPosition}%` }}
          id="comparison-separator-line"
        >
          {/* Centered Grab Button */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white dark:bg-zinc-950 text-gray-700 dark:text-zinc-200 shadow-xl border border-gray-200 dark:border-zinc-800 flex items-center justify-center cursor-ew-resize hover:scale-105 active:scale-95 transition-transform pointer-events-auto"
            id="comparison-slider-handle"
          >
            <ChevronsLeftRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-500 dark:text-zinc-400 text-center font-medium font-sans">
        {t.compareTip}
      </p>
    </div>
  );
}
