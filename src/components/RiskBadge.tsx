import React from 'react';

interface RiskBadgeProps {
    level: string | number;
    type?: 'Risk' | 'Sensitivity' | 'DPIA';
}

export function RiskBadge({ level, type = 'Risk' }: RiskBadgeProps) {
    let colorClass = 'bg-gray-100 text-gray-800';
    const val = String(level).toLowerCase();

    if (val === 'high' || val === 'critical' || val === 'required') {
        colorClass = 'bg-red-100 text-red-800 border border-red-200';
    } else if (val === 'medium' || val === 'sensitive') {
        colorClass = 'bg-orange-100 text-orange-800 border border-orange-200';
    } else if (val === 'low' || val === 'internal') {
        colorClass = 'bg-green-100 text-green-800 border border-green-200';
    } else if (val === 'public' || val === 'notrequired') {
        colorClass = 'bg-blue-100 text-blue-800 border border-blue-200';
    }

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
            {level}
        </span>
    );
}
