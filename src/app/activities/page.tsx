'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import Link from 'next/link';

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        try {
            const data = await api.getActivities();
            setActivities(data || []);
        } catch (e) {
            console.error('Failed to load activities', e);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (type: 'pdf' | 'csv') => {
        console.log("type",type);
        const url = type === 'pdf' ? api.exportPdfUrl() : api.exportCsvUrl();
        window.open(url, '_blank');
    };

    if (loading) {
        return (
            <div className="p-8 text-gray-600">
                Loading Processing Activities Registry…
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">
                        Processing Activities Registry (RoPA)
                    </h1>
                    <p className="text-gray-500 mt-1">
                        DPDP-compliant record of personal data processing activities.
                    </p>
                </div>

                <div className="flex gap-3">
  <button
    onClick={() => handleExport('csv')}
    className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium transition"
  >
    Export CSV
  </button>

  <button
    onClick={() => handleExport('pdf')}
    className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium transition"
  >
    Export PDF
  </button>

  <Link href="/activities/new">
  <button className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow">
    + New Activity
  </button>
</Link>
</div>

            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600">
                                Activity Name
                            </th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600">
                                Business Process
                            </th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600">
                                Owner
                            </th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600">
                                Risk / Sensitivity
                            </th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600">
                                DPIA
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {activities.map((a) => {
                            const riskLevel =
                                a.riskScore >= 60
                                    ? 'High'
                                    : a.riskScore >= 30
                                    ? 'Medium'
                                    : 'Low';

                            return (
                                <tr key={a.activityId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <Link href={`/activities/view?id=${a.activityId}`} className="hover:text-blue-600 hover:underline">
                                            {a.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {a.businessProcess}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {a.ownerUserId}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold
                                                ${
                                                    a.status === 'Active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : a.status === 'Archived'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {a.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <RiskBadge level={riskLevel} />
                                        <RiskBadge
                                            level={a.sensitivity || 'Internal'}
                                            type="Sensitivity"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <RiskBadge
                                            level={a.dpiaStatus || 'NotRequired'}
                                            type="DPIA"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {activities.length === 0 && (
                    <div className="p-10 text-center text-gray-500">
                        No processing activities found.
                        <br />
                        Create one manually or import an inventory.
                    </div>
                )}
            </div>
        </div>
    );
}
