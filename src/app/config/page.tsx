'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function ConfigSectorsPage() {
    const [sectors, setSectors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        loadSectors();
    }, []);

    const loadSectors = async () => {
        try {
            const data = await api.config.getSectors();
            setSectors(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure? This will delete the sector if no active processes exist.')) return;
        try {
            await api.config.deleteSector(id);
            loadSectors();
        } catch (e: any) {
             alert('Failed to delete sector: ' + (e.message || 'Unknown error'));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.config.createSector(formData);
            setShowModal(false);
            setFormData({ name: '' });
            loadSectors();
        } catch (e) {
            alert('Failed to create sector');
        }
    };

    if (loading) return <div className="p-8">Loading configuration...</div>;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Configuration: Sectors</h1>
                    <p className="text-gray-500">Manage Sectors (Top Level Hierarchy).</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    + New Sector
                </button>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sectors.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                                    <Link href={`/config/sector/${s.id}`}>{s.name}</Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Add New Sector</h2>
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
