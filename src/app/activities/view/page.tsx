'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { api } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import { RiskBadge } from '@/components/RiskBadge';

function ActivityDetailsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activityId = searchParams.get('id');
    
    const [activity, setActivity] = useState<any>(null);
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!activityId) return;

        Promise.all([
          api.getActivity(activityId),
          api.getDataAssetsByActivity(activityId)
        ]).then(([actData, assetsData]) => {
            setActivity(actData);
            setAssets(assetsData || []);
        }).catch(err => {
            console.error(err);
        }).finally(() => setLoading(false));

    }, [activityId]);

    if (!activityId) return <div className="p-8">No Activity ID provided.</div>;
    if (loading) return <div className="p-8">Loading Activity...</div>;
    if (!activity) return <div className="p-8">Activity not found</div>;

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                 <button onClick={() => router.back()} className="mb-4 text-sm text-blue-600 hover:underline">
                    &larr; Back to Activities
                </button>
                <h1 className="text-3xl font-bold text-gray-900">{activity.name}</h1>
                <p className="text-gray-500 mt-2">{activity.description || "No description provided."}</p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow">
                <div className="space-y-4">
                     <div>
                        <span className="block text-sm font-medium text-gray-500">Business Process</span>
                        <span className="block text-lg font-medium text-gray-900">{activity.businessProcess}</span>
                    </div>
                     <div>
                        <span className="block text-sm font-medium text-gray-500">Owner</span>
                        <span className="block text-lg font-medium text-gray-900">{activity.ownerUserId}</span>
                    </div>
                     <div>
                        <span className="block text-sm font-medium text-gray-500">Status</span>
                         <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold
                                                ${
                                                    activity.status === 'Active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : activity.status === 'Archived'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                             {activity.status}
                         </span>
                    </div>
                </div>
                <div className="space-y-4">
                     <div>
                        <span className="block text-sm font-medium text-gray-500">Risk & Sensitivity</span>
                        <div className="flex gap-2 mt-1">
                             <RiskBadge level={activity.riskScore >= 60 ? 'High' : activity.riskScore >= 30 ? 'Medium' : 'Low'} />
                             <RiskBadge level={activity.sensitivity || 'Internal'} type="Sensitivity" />
                        </div>
                    </div>
                     <div>
                        <span className="block text-sm font-medium text-gray-500">DPIA Status</span>
                        <div className="mt-1">
                            <RiskBadge level={activity.dpiaStatus || 'NotRequired'} type="DPIA" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Linked Data Assets */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Linked Data Assets</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                             <tr>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Name</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Category</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Format</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Volume</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                             {assets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{asset.name}</td>
                                    <td className="px-6 py-4">{asset.dpdpCategory}</td>
                                    <td className="px-6 py-4 text-gray-500">{asset.dataType}</td>
                                    <td className="px-6 py-4 text-gray-500">{asset.volume}</td>
                                </tr>
                            ))}
                             {assets.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No registered data assets found for this activity.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function ActivityDetailsPage() {
    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <ActivityDetailsContent />
        </Suspense>
    );
}
