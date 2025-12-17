'use client';

import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SettingsPage() {
    return (
        <div className="p-10 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Settings
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-3xl">
                    Manage your application preferences and configuration.
                </p>
            </div>

            <div className="space-y-6">
                {/* Theme Settings Section */}
                <section className="bg-white dark:bg-gray-900 p-8 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800">
                    <h2 className="mb-4 text-xs font-semibold tracking-wider uppercase text-gray-700 dark:text-gray-300 border-l-4 border-blue-600 pl-3">
                        Appearance
                    </h2>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Theme Preference</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Switch between light and dark modes.
                            </p>
                        </div>
                        <ThemeToggle />
                    </div>
                </section>

                {/* Placeholder for future settings */}
                <section className="bg-white dark:bg-gray-900 p-8 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 opacity-50">
                    <h2 className="mb-4 text-xs font-semibold tracking-wider uppercase text-gray-700 dark:text-gray-300 border-l-4 border-gray-400 pl-3">
                        General (Coming Soon)
                    </h2>
                    <p className="text-sm text-gray-400">
                        Additional configuration options will be available here.
                    </p>
                </section>
            </div>
        </div>
    );
}
