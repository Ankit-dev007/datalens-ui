'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientConfigSubProcessesPage({ id }: { id: string }) {
    const router = useRouter();
    const processId = parseInt(id);

    const [subProcesses, setSubProcesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processName, setProcessName] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        if (processId) {
            loadData();
        }
    }, [processId]);

    const loadData = async () => {
        try {
            // Need a way to get process name, maybe separate API or just filter from all
            // Ideally we add api.config.getProcess(id) but for now we iterate
            const processes = await api.config.getProcesses();
            const process = processes.find((p: any) => p.id === processId);
            if (process) setProcessName(process.name);

            const fetchedSupProcesses = await api.config.getSubProcesses(processId);
            setSubProcesses(fetchedSupProcesses);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure? This will soft-delete the sub-process.')) return;
        await api.config.deleteSubProcess(id);
        loadData();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.config.createSubProcess({ ...formData, processId });
            setShowModal(false);
            setFormData({ name: '', description: '' });
            loadData();
        } catch (e) {
            alert('Failed to create sub-process');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                     <button onClick={() => router.back()} className="text-sm text-blue-600 mb-2 hover:underline">← Back to Processes</button>
                    <h1 className="text-2xl font-bold">Sub-Processes: {processName}</h1>
                    <p className="text-gray-500">Manage sub-processes.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    + New Sub-Process
                </button>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {subProcesses.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                                    <Link href={`/config/sub-process/${p.id}`}>{p.name}</Link>
                                </td>
                                <td className="px-6 py-4">{p.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {p.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Add Sub-Process</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
