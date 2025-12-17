'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';

export default function InventoryUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setResult('');

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                try {
                    await api.uploadInventoryCSV(text);
                    setResult('Upload successful! Inventory has been updated.');
                } catch (err: any) {
                    setResult('Error: ' + err.message);
                } finally {
                    setUploading(false);
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-10 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-white">
                    Inventory Import
                </h1>
                <p className="mt-1 text-sm text-gray-400 max-w-3xl">
                    Import a structured inventory of personal data assets to automatically
                    populate activities and data items for DPDP compliance.
                </p>
            </div>

            <div className="bg-white p-8 shadow-xl rounded-xl space-y-8">
                {/* SECTION: Instructions */}
                <section>
                    <h2 className="mb-4 text-xs font-semibold tracking-wider uppercase text-gray-700 border-l-4 border-blue-600 pl-3">
                        CSV File Requirements
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Upload a CSV file with the following headers (case-sensitive):
                    </p>
                    <div className="mt-2 bg-gray-50 border border-gray-200 rounded-md p-3 text-sm font-mono text-gray-700">
                        Name, Description, DataType, Category, Volume, Owner, ActivityName
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        Each row represents a data item and will be linked to a processing activity.
                    </p>
                </section>

                {/* SECTION: File Upload */}
                <section>
                    <h2 className="mb-4 text-xs font-semibold tracking-wider uppercase text-gray-700 border-l-4 border-blue-600 pl-3">
                        Upload File
                    </h2>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2.5 file:px-5
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                            "
                        />
                        <p className="mt-3 text-xs text-gray-500">
                            Only .csv files are supported
                        </p>
                    </div>
                </section>

                {/* ACTION FOOTER */}
                <div className="flex justify-end gap-4 pt-6 border-t bg-gray-50 -mx-8 px-8 pb-2 rounded-b-xl">
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={`px-6 py-2.5 rounded-md font-medium transition
                            ${
                                !file || uploading
                                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {uploading ? 'Uploading…' : 'Import CSV'}
                    </button>
                </div>

                {/* RESULT MESSAGE */}
                {result && (
                    <div
                        className={`p-4 rounded-md text-sm font-medium
                            ${
                                result.startsWith('Error')
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-green-50 text-green-700 border border-green-200'
                            }`}
                    >
                        {result}
                    </div>
                )}
            </div>
        </div>
    );
}
