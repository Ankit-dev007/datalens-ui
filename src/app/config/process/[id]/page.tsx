
import React from 'react';
import ClientPage from './ClientPage';

import { api } from '@/lib/api';

export async function generateStaticParams() {
    try {
        const processes = await api.config.getProcesses();
        if (!Array.isArray(processes)) return [];
        return processes
            .filter((p: any) => p && p.id)
            .map((p: any) => ({
                id: p.id.toString(),
            }));
    } catch (e) {
        console.error('Failed to generate static params for processes:', e);
        return [];
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ClientPage id={id} />;
}
