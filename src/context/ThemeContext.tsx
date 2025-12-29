'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Run only on client side
        setMounted(true);
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme) {
            setThemeState(storedTheme);
            updateHtmlClass(storedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setThemeState('dark');
            updateHtmlClass('dark');
        } else {
            // Default to light
            updateHtmlClass('light');
        }
    }, []);

    const updateHtmlClass = (mode: Theme) => {
        const root = document.documentElement;
        if (mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        updateHtmlClass(newTheme);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    // Prevent hydration mismatch by rendering nothing until mounted
    // Or render children without specific theme class logic if critical
    // Ideally, we want to render children but avoid flash.
    // Prevent hydration mismatch by rendering nothing until mounted
    // Or render children without specific theme class logic if critical
    // Ideally, we want to render children but avoid flash.
    // FIX: Always provide context so useTheme doesn't crash during SSR
    // if (!mounted) {
    //    return <>{children}</>;
    // }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
