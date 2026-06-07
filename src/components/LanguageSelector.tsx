/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, Language } from '../types';

interface LanguageSelectorProps {
  currentLanguageCode: string;
  onLanguageChange: (code: string) => void;
  label: string;
}

export default function LanguageSelector({
  currentLanguageCode,
  onLanguageChange,
  label
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguageCode) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectLanguage = (code: string) => {
    onLanguageChange(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} id="language-selector-container">
      <div>
        <button
          type="button"
          onClick={toggleDropdown}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-gray-700 dark:text-zinc-300 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          id="language-select-menu-button"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label={`${label}: 현재 언어 ${currentLanguage.localName}`}
        >
          <Globe className="w-4.5 h-4.5 text-gray-400 dark:text-zinc-500" />
          <span className="hidden sm:inline">{currentLanguage.localName}</span>
          <span className="inline sm:hidden">{currentLanguage.code.toUpperCase()}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl focus:outline-none z-50 overflow-hidden max-h-96 overflow-y-auto"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-select-menu-button"
          id="language-dropdown-panel"
        >
          <div className="py-1.5" role="none">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const matches = lang.code === currentLanguageCode;
              return (
                <button
                  key={lang.code}
                  onClick={() => selectLanguage(lang.code)}
                  className={`w-full text-left inline-flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                    matches
                      ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/20'
                      : 'text-gray-700 dark:text-zinc-300'
                  }`}
                  role="menuitem"
                  id={`lang-option-${lang.code}`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{lang.localName}</span>
                    <span className="text-xs text-gray-400 dark:text-zinc-500">{lang.name}</span>
                  </div>
                  {matches && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
