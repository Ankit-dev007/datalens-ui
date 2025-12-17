'use client';

import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle Dark Mode"
        >
            {theme === 'light' ? (
                <>
                    <Sun className="h-5 w-5 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Light Mode</span>
                </>
            ) : (
                <>
                    <Moon className="h-5 w-5 text-blue-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Dark Mode</span>
                </>
            )}
        </button>
    );
}
