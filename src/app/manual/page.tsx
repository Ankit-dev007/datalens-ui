'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ManualEntryPage() {
    const router = useRouter();
    const [activities, setActivities] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dataType: '',
        category: '',
        volume: 0,
        ownerUserId: '',
        processingActivityId: '',
        protection: 'Cleartext',
        personalDataCategories: '' // [NEW]
    });

    useEffect(() => {
        api.getActivities().then(setActivities).catch(console.error);
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.submitManualEntry({
                ...formData,
                volume: Number(formData.volume),
                personalDataCategories: formData.personalDataCategories.split(',').map(s => s.trim()).filter(Boolean)
            });
            alert('Manual data asset registered successfully!');
            router.push('/activities');
        } catch (err: any) {
            alert('Failed to save: ' + err.message);
        }
    };

    /** Shared input styles */
    const inputClass =
        'mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2.5 shadow-sm ' +
        'focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none';

    const selectClass =
        inputClass +
        ' appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%236b7280\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z\' clip-rule=\'evenodd\' /%3E%3C/svg%3E")] ' +
        'bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem]';

    return (
        <div className="p-10 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">
                    Manual Data Asset Registration
                </h1>
                <p className="mt-1 text-sm text-gray-400 max-w-3xl">
                    Register personal data assets that cannot be automatically scanned,
                    such as physical records, SaaS exports, or third-party data sources.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-10 bg-white p-8 shadow-xl rounded-xl"
            >
                {/* SECTION: DATA ITEM IDENTIFICATION */}
                <section>
                    <h2 className="mb-5 text-xs font-semibold tracking-wider uppercase text-gray-700 border-l-4 border-blue-600 pl-3">
                        Data Item Identification
                    </h2>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Data Item Name *
                            </label>
                            <input
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Processing Activity *
                            </label>
                            <select
                                name="processingActivityId"
                                required
                                value={formData.processingActivityId}
                                onChange={handleChange}
                                className={selectClass}
                            >
                                <option value="" disabled>
                                    Select related activity…
                                </option>
                                {activities.length === 0 && (
                                    <option disabled>
                                        No activities found — create one first
                                    </option>
                                )}
                                {activities.map((a) => (
                                    <option key={a.activityId} value={a.activityId}>
                                        {a.name}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                Select the processing activity where this data is used.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            className={inputClass}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Briefly describe the nature and source of this data asset.
                        </p>
                    </div>
                </section>

                {/* SECTION: DATA CLASSIFICATION */}
                <section>
                    <h2 className="mb-5 text-xs font-semibold tracking-wider uppercase text-gray-700 border-l-4 border-blue-600 pl-3">
                        Data Classification
                    </h2>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Data Type / Format
                            </label>
                            <input
                                name="dataType"
                                placeholder="PDF, Physical Binder, Excel"
                                value={formData.dataType}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                DPDP Category *
                            </label>
                            <select
                                name="category"
                                required
                                value={formData.category}
                                onChange={handleChange}
                                className={selectClass}
                            >
                                <option value="" disabled>
                                    Select DPDP category…
                                </option>
                                <option value="GOVERNMENT_ID">Government ID</option>
                                <option value="FINANCIAL">Financial</option>
                                <option value="HEALTH">Health</option>
                                <option value="CHILDREN">Children</option>
                                <option value="CONTACT">Contact Info</option>
                                <option value="EMPLOYEE">Employee Record</option>
                                <option value="OTHER">Other</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                Used for compliance risk and sensitivity assessment.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700">
                            Personal Data Categories
                        </label>
                        <input
                            name="personalDataCategories"
                            placeholder="e.g. Name, Email, Mobile Number"
                            value={formData.personalDataCategories}
                            onChange={(e) => setFormData({...formData, personalDataCategories: e.target.value})}
                            className={inputClass}
                        />
                         <p className="mt-1 text-xs text-gray-500">
                            Types of personal data contained in this data asset.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Volume (Records)
                            </label>
                            <input
                                name="volume"
                                type="number"
                                value={formData.volume}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Protection Method
                            </label>
                            <select
                                name="protection"
                                value={formData.protection}
                                onChange={handleChange}
                                className={selectClass}
                            >
                                <option value="Cleartext">Cleartext</option>
                                <option value="Encrypted">Encrypted</option>
                                <option value="Masked">Masked</option>
                                <option value="PhysicalLock">Physical Lock</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Data Owner (User ID)
                            </label>
                            <input
                                name="ownerUserId"
                                value={formData.ownerUserId}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>
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
                        Register Data Asset
                    </button>
                </div>
            </form>
        </div>
    );
}
