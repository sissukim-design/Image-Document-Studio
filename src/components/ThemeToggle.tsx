/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { ThemeMode } from '../types';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
  a11yLabel: string;
}

export default function ThemeToggle({ theme, onToggle, a11yLabel }: ThemeToggleProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
      aria-label={a11yLabel}
      title={a11yLabel}
      id="theme-toggle-button"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" id="icon-moon" />
      ) : (
        <Sun className="w-5 h-5" id="icon-sun" />
      )}
    </motion.button>
  );
}
