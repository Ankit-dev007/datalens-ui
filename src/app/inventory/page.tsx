'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function DataAssetInventoryPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getDataAssets()
            .then(setAssets)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8">Loading Data Assets...</div>;

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold">Data Asset Inventory</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Name</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Category</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Type</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Volume</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Owner</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600">Protection</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {assets.map((asset) => (
                            <tr key={asset.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{asset.name}</td>
                                <td className="px-6 py-4">{asset.dpdpCategory}</td>
                                <td className="px-6 py-4 text-gray-500">{asset.dataType}</td>
                                <td className="px-6 py-4 text-gray-500">{asset.volume}</td>
                                <td className="px-6 py-4 text-gray-500">{asset.ownerUserId}</td>
                                <td className="px-6 py-4 text-gray-500">{asset.protectionMethod}</td>
                            </tr>
                        ))}
                         {assets.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No data assets registered.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
