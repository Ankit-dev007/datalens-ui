'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function NewActivityPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        businessProcess: '',
        ownerUserId: '',
        status: 'Draft',
        purpose: '',
        permittedPurpose: 'LegitimateUse',
        personalDataTypes: [] as string[],
        retentionPeriod: '',
        dpiaStatus: 'NotRequired'
    });

    const [selectedCategories, setSelectedCategories] = useState<string>('');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const categories = selectedCategories
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);

            await api.saveActivity({
                ...formData,
                personalDataTypes: categories
            });

            router.push('/activities');
        } catch (err: any) {
            alert('Failed to save: ' + err.message);
        }
    };

    return (
        <div className="p-10 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">
                    Create New Processing Activity
                </h1>
                <p className="mt-1 text-sm text-gray-400 max-w-3xl">
                    Maintain a DPDP-compliant record of how personal data is processed,
                    including purpose, lawful basis, and retention.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-10 bg-white p-8 shadow-xl rounded-xl"
            >
                {/* SECTION: BASIC INFORMATION */}
                <section>
                    <h2 className="mb-5 text-xs font-semibold tracking-wider uppercase text-gray-700 border-l-4 border-blue-600 pl-3">
                        Basic Information
                    </h2>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Activity Name *
                            </label>
                            <input
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="input-ui"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Business Process *
                            </label>
                            <input
                                name="businessProcess"
                                required
                                value={formData.businessProcess}
                                onChange={handleChange}
                                className="input-ui"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Describe how personal data is used operationally.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Owner User ID *
                            </label>
                            <input
                                name="ownerUserId"
                                required
                                value={formData.ownerUserId}
                                onChange={handleChange}
                                className="input-ui"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Responsible data owner for accountability and audits.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <SelectWrapper>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="select-ui bg-gray-50 text-gray-700"
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Active">Active</option>
                                    <option value="Archived">Archived</option>
                                </select>
                            </SelectWrapper>
                        </div>
                    </div>
                </section>

                {/* SECTION: PROCESSING DETAILS */}
                <section>
                    <h2 className="mb-5 text-xs font-semibold tracking-wider uppercase text-gray-700 border-l-4 border-blue-600 pl-3">
                        Processing Details
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Purpose of Processing *
                        </label>
                        <textarea
                            name="purpose"
                            rows={3}
                            required
                            value={formData.purpose}
                            onChange={handleChange}
                            className="input-ui"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Required for DPDP compliance and audit purposes.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Lawful Basis
                            </label>
                            <SelectWrapper>
                                <select
                                    name="permittedPurpose"
                                    value={formData.permittedPurpose}
                                    onChange={handleChange}
                                    className="select-ui"
                                >
                                    <option value="LegitimateUse">Legitimate Use</option>
                                    <option value="Consent">Consent</option>
                                    <option value="Contractual">Contractual</option>
                                    <option value="LegalObligation">Legal Obligation</option>
                                </select>
                            </SelectWrapper>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Retention Period
                            </label>
                            <input
                                name="retentionPeriod"
                                value={formData.retentionPeriod}
                                onChange={handleChange}
                                placeholder="e.g. 2 Years"
                                className="input-ui"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                As defined by internal policy or regulatory requirements.
                            </p>
                        </div>
                    </div>
                </section>

                {/* SECTION: DATA CLASSIFICATION */}
                <section>
                    <h2 className="mb-5 text-xs font-semibold tracking-wider uppercase text-gray-700 border-l-4 border-blue-600 pl-3">
                        Data Classification
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Personal Data Categories
                        </label>
                        <input
                            value={selectedCategories}
                            onChange={(e) => setSelectedCategories(e.target.value)}
                            placeholder="Name, Email, Phone, Aadhaar"
                            className="input-ui"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Use comma-separated standard categories.
                        </p>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700">
                            DPIA Status
                        </label>
                        <SelectWrapper>
                            <select
                                name="dpiaStatus"
                                value={formData.dpiaStatus}
                                onChange={handleChange}
                                className="select-ui"
                            >
                                <option value="NotRequired">Not Required</option>
                                <option value="Required">Required</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </SelectWrapper>
                    </div>
                </section>

                {/* ACTION FOOTER */}
                <div className="flex justify-end gap-4 pt-6 mt-6 border-t bg-gray-50 -mx-8 px-8 pb-2 rounded-b-xl">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-5 py-2.5 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
                    >
                        Save Activity
                    </button>
                </div>
            </form>
        </div>
    );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative">
            {children}
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm">
                ▼
            </span>
        </div>
    );
}
