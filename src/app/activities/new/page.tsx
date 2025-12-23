'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function NewActivityPage() {
    const router = useRouter();
    const [sectors, setSectors] = useState<any[]>([]);
    const [processes, setProcesses] = useState<any[]>([]);
    const [subProcesses, setSubProcesses] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);

    const [selectedSector, setSelectedSector] = useState('');
    const [selectedProcess, setSelectedProcess] = useState('');
    const [selectedSubProcess, setSelectedSubProcess] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        businessProcess: '',
        ownerUserId: '',
        status: 'Draft',
        purpose: '',
        permittedPurpose: 'LegitimateUse',
        personalDataTypes: [] as string[],
        retentionPeriod: '',
        dpiaStatus: 'NotRequired',
        activityTemplateId: undefined as number | undefined
    });

    const [selectedCategories, setSelectedCategories] = useState<string>('');

    // Load Sectors on mount
    useEffect(() => {
        api.getSectors().then(setSectors).catch(console.error);
    }, []);

    // Load Processes when Sector changes
    useEffect(() => {
        if (selectedSector) {
            api.getProcesses(Number(selectedSector)).then(setProcesses).catch(console.error);
            setProcesses([]);
        } else {
            setProcesses([]);
        }
        setSubProcesses([]);
        setTemplates([]);
    }, [selectedSector]);

    // Load SubProcesses when Process changes
    useEffect(() => {
        if (selectedProcess) {
            api.getSubProcesses(Number(selectedProcess)).then(setSubProcesses).catch(console.error);
            // Auto update business process text
            const p = processes.find(p => p.id === Number(selectedProcess));
            if (p) {
               setFormData(prev => ({ ...prev, businessProcess: p.name }));
            }
        } else {
            setSubProcesses([]);
        }
        setTemplates([]);
    }, [selectedProcess, processes]);

    // Load Templates when SubProcess changes
    useEffect(() => {
        if (selectedSubProcess) {
            api.getActivityTemplates(Number(selectedSubProcess)).then(setTemplates).catch(console.error);
             // Append to business process text
            const sp = subProcesses.find(sp => sp.id === Number(selectedSubProcess));
            const p = processes.find(p => p.id === Number(selectedProcess));
             if (p && sp) {
               setFormData(prev => ({ ...prev, businessProcess: `${p.name} > ${sp.name}` }));
            }
        } else {
            setTemplates([]);
        }
    }, [selectedSubProcess, subProcesses, selectedProcess, processes]);

    // Autocomplete when Template changes
    useEffect(() => {
        if (selectedTemplate) {
            const t = templates.find(t => t.id === Number(selectedTemplate));
            if (t) {
                setFormData(prev => ({
                    ...prev,
                    name: t.name,
                    purpose: t.description || prev.purpose,
                    activityTemplateId: t.id
                }));
            }
        }
    }, [selectedTemplate, templates]);


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.saveActivity({
                ...formData,
                // personalDataTypes: categories // Removed as per new requirement
            });

            router.push('/activities');
        } catch (err: any) {
            alert('Failed to save: ' + err.message);
        }
    };

    return (
        <div className="p-10 max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Create New Processing Activity</h1>
                <p className="mt-1 text-sm text-gray-400">
                    Define activity using the standard compliance hierarchy.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10 bg-white p-8 shadow-xl rounded-xl">
                 {/* HIERARCHY SELECTION */}
                 <section className="bg-blue-50 p-6 rounded-lg -mx-4 border border-blue-100">
                    <h2 className="mb-4 text-xs font-bold tracking-wider uppercase text-blue-800">
                        Classification Hierarchy
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Sector</label>
                             <SelectWrapper>
                                <select 
                                    className="select-ui"
                                    value={selectedSector}
                                    onChange={(e) => setSelectedSector(e.target.value)}
                                >
                                    <option value="">Select Sector...</option>
                                    {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                             </SelectWrapper>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Process</label>
                             <SelectWrapper>
                                <select 
                                    className="select-ui"
                                    value={selectedProcess}
                                    onChange={(e) => setSelectedProcess(e.target.value)}
                                    disabled={!selectedSector}
                                >
                                    <option value="">Select Process...</option>
                                    {processes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                             </SelectWrapper>
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700">Sub-Process</label>
                             <SelectWrapper>
                                <select 
                                    className="select-ui"
                                    value={selectedSubProcess}
                                    onChange={(e) => setSelectedSubProcess(e.target.value)}
                                    disabled={!selectedProcess}
                                >
                                    <option value="">Select Sub-Process...</option>
                                    {subProcesses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                             </SelectWrapper>
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700">Activity Template</label>
                             <SelectWrapper>
                                <select 
                                    className="select-ui"
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    disabled={!selectedSubProcess}
                                >
                                    <option value="">Select Template (Optional)...</option>
                                     {templates.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                             </SelectWrapper>
                        </div>
                    </div>
                 </section>

                {/* BASIC INFO */}
                <section>
                    <h2 className="mb-5 text-xs font-semibold tracking-wider uppercase text-gray-700 border-l-4 border-blue-600 pl-3">
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Activity Name *</label>
                            <input name="name" required value={formData.name} onChange={handleChange} className="input-ui" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Business Process *</label>
                            <input name="businessProcess" required value={formData.businessProcess} onChange={handleChange} className="input-ui" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Owner User ID *</label>
                            <input name="ownerUserId" required value={formData.ownerUserId} onChange={handleChange} className="input-ui" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                             <SelectWrapper>
                                <select name="status" value={formData.status} onChange={handleChange} className="select-ui">
                                    <option value="Draft">Draft</option>
                                    <option value="Active">Active</option>
                                    <option value="Archived">Archived</option>
                                </select>
                            </SelectWrapper>
                        </div>
                    </div>
                </section>

                {/* PROCESSING DETAILS - (Keep strict structure as previous) */}
                <section>
                     <h2 className="mb-5 text-xs font-semibold tracking-wider uppercase text-gray-700 border-l-4 border-blue-600 pl-3">Processing Details</h2>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Purpose *</label>
                        <textarea name="purpose" rows={3} required value={formData.purpose} onChange={handleChange} className="input-ui" />
                    </div>
                     <div className="grid grid-cols-2 gap-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Lawful Basis</label>
                            <SelectWrapper>
                                <select name="permittedPurpose" value={formData.permittedPurpose} onChange={handleChange} className="select-ui">
                                    <option value="LegitimateUse">Legitimate Use</option>
                                    <option value="Consent">Consent</option>
                                    <option value="Contractual">Contractual</option>
                                    <option value="LegalObligation">Legal Obligation</option>
                                </select>
                             </SelectWrapper>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Retention Period</label>
                            <input name="retentionPeriod" value={formData.retentionPeriod} onChange={handleChange} placeholder="e.g. 2 Years" className="input-ui" />
                        </div>
                    </div>
                     <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700">DPIA Status</label>
                         <SelectWrapper>
                            <select name="dpiaStatus" value={formData.dpiaStatus} onChange={handleChange} className="select-ui">
                                <option value="NotRequired">Not Required</option>
                                <option value="Required">Required</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </SelectWrapper>
                    </div>
                </section>

                <div className="flex justify-end gap-4 pt-6 mt-6 border-t bg-gray-50 -mx-8 px-8 pb-2 rounded-b-xl">
                    <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-md border border-gray-300 bg-white">Cancel</button>
                    <button type="submit" className="px-5 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700">Save Activity</button>
                </div>
            </form>
        </div>
    );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative">
            {children}
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm">▼</span>
        </div>
    );
}
