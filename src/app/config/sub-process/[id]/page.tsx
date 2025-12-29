
import React from 'react';
import ClientPage from './ClientPage';

import { api } from '@/lib/api';

export async function generateStaticParams() {
    try {
        const processes = await api.config.getProcesses();
        let allSubProcesses: any[] = [];
        
        for (const p of processes) {
            try {
                const subs = await api.config.getSubProcesses(p.id);
                allSubProcesses = [...allSubProcesses, ...subs];
            } catch (innerErr) {
                // Ignore errors for individual processes to avoid failing build completely
            }
        }

        return allSubProcesses
            .filter((sp: any) => sp && sp.id)
            .map((sp: any) => ({
                id: sp.id.toString(),
            }));
    } catch (e) {
        console.error('Failed to generate static params for sub-processes:', e);
        return [];
    }
}

export const dynamicParams = false;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ClientPage id={id} />;
}
