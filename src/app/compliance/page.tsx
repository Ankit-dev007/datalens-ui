'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface ValidationCheck {
    checkName: string;
    severity: 'critical' | 'warning' | 'safe';
    count: number;
    items: any[];
    description: string;
}

interface ComplianceSummary {
    totalPIIInstances: number;
    mappedStorage: number;
    unmappedStorage: number;
    autoLinkedPending: number;
    completeTraceabilityChains: number;
}

export default function CompliancePage() {
    const [validationResults, setValidationResults] = useState<ValidationCheck[]>([]);
    const [summary, setSummary] = useState<ComplianceSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedCheck, setExpandedCheck] = useState<string | null>(null);

    useEffect(() => {
        loadComplianceData();
    }, []);

    const loadComplianceData = async () => {
        setLoading(true);
        try {
            const [validationData, summaryData] = await Promise.all([
                api.getComplianceValidation(),
                api.getComplianceSummary()
            ]);
            setValidationResults(validationData.checks || []);
            setSummary(summaryData);
        } catch (e) {
            console.error('Failed to load compliance data', e);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'safe': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return '🔴';
            case 'warning': return '🟡';
            case 'safe': return '🟢';
            default: return '⚪';
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    const criticalChecks = validationResults.filter(c => c.severity === 'critical');
    const warningChecks = validationResults.filter(c => c.severity === 'warning');
    const safeChecks = validationResults.filter(c => c.severity === 'safe');

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">DPDP Compliance Dashboard</h1>
                    <p className="text-gray-600 mt-1">Monitor data protection compliance and traceability</p>
                </div>
                <button 
                    onClick={loadComplianceData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                        <div className="text-sm text-gray-600 font-medium">Total PII Instances</div>
                        <div className="text-3xl font-bold text-gray-900 mt-2">{summary.totalPIIInstances}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                        <div className="text-sm text-gray-600 font-medium">Mapped Storage</div>
                        <div className="text-3xl font-bold text-green-600 mt-2">{summary.mappedStorage}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                        <div className="text-sm text-gray-600 font-medium">Unmapped Storage</div>
                        <div className="text-3xl font-bold text-red-600 mt-2">{summary.unmappedStorage}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                        <div className="text-sm text-gray-600 font-medium">Auto-Linked Pending</div>
                        <div className="text-3xl font-bold text-yellow-600 mt-2">{summary.autoLinkedPending}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                        <div className="text-sm text-gray-600 font-medium">Complete Chains</div>
                        <div className="text-3xl font-bold text-purple-600 mt-2">{summary.completeTraceabilityChains}</div>
                    </div>
                </div>
            )}

            {/* Critical Issues */}
            {criticalChecks.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg border-2 border-red-300">
                    <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                        <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
                            🔴 Critical Issues ({criticalChecks.length})
                        </h2>
                        <p className="text-sm text-red-700 mt-1">These issues require immediate attention</p>
                    </div>
                    <div className="divide-y divide-red-100">
                        {criticalChecks.map((check, idx) => (
                            <CheckItem key={idx} check={check} expanded={expandedCheck === check.checkName} onToggle={() => setExpandedCheck(expandedCheck === check.checkName ? null : check.checkName)} />
                        ))}
                    </div>
                </div>
            )}

            {/* Warnings */}
            {warningChecks.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg border-2 border-yellow-300">
                    <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
                        <h2 className="text-xl font-bold text-yellow-900 flex items-center gap-2">
                            🟡 Warnings ({warningChecks.length})
                        </h2>
                        <p className="text-sm text-yellow-700 mt-1">Review and address these items</p>
                    </div>
                    <div className="divide-y divide-yellow-100">
                        {warningChecks.map((check, idx) => (
                            <CheckItem key={idx} check={check} expanded={expandedCheck === check.checkName} onToggle={() => setExpandedCheck(expandedCheck === check.checkName ? null : check.checkName)} />
                        ))}
                    </div>
                </div>
            )}

            {/* Safe Items */}
            {safeChecks.length > 0 && (
                <div className="bg-white rounded-lg shadow border border-green-200">
                    <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                        <h2 className="text-xl font-bold text-green-900 flex items-center gap-2">
                            🟢 Compliant ({safeChecks.length})
                        </h2>
                        <p className="text-sm text-green-700 mt-1">These areas are properly configured</p>
                    </div>
                    <div className="divide-y divide-green-100">
                        {safeChecks.map((check, idx) => (
                            <CheckItem key={idx} check={check} expanded={expandedCheck === check.checkName} onToggle={() => setExpandedCheck(expandedCheck === check.checkName ? null : check.checkName)} />
                        ))}
                    </div>
                </div>
            )}

            {validationResults.length === 0 && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-gray-700">No Validation Results</h3>
                    <p className="text-gray-500 mt-2">Run a compliance check to see results</p>
                </div>
            )}
        </div>
    );
}

interface CheckItemProps {
    check: ValidationCheck;
    expanded: boolean;
    onToggle: () => void;
}

function CheckItem({ check, expanded, onToggle }: CheckItemProps) {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'safe': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-start justify-between cursor-pointer" onClick={onToggle}>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{check.checkName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(check.severity)}`}>
                            {check.count} {check.count === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{check.description}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 ml-4">
                    {expanded ? '▼' : '▶'}
                </button>
            </div>

            {expanded && check.items.length > 0 && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    {Object.keys(check.items[0]).map((key) => (
                                        <th key={key} className="px-4 py-2 text-left font-semibold text-gray-700 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {check.items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-100">
                                        {Object.values(item).map((value: any, vidx) => (
                                            <td key={vidx} className="px-4 py-2 text-gray-800">
                                                {Array.isArray(value) ? value.join(', ') : (value || '-')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {check.severity === 'critical' && (
                        <div className="mt-4 flex gap-2">
                            <a 
                                href="/inventory" 
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                            >
                                Fix in Inventory →
                            </a>
                        </div>
                    )}
                    
                    {check.severity === 'warning' && check.checkName.includes('Auto-Linked') && (
                        <div className="mt-4 flex gap-2">
                            <a 
                                href="/inventory" 
                                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium"
                            >
                                Review in Inventory →
                            </a>
                        </div>
                    )}
                </div>
            )}

            {expanded && check.items.length === 0 && (
                <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200 text-center text-green-700">
                    ✓ All clear! No issues found.
                </div>
            )}
        </div>
    );
}
