
import React from 'react';
import ClientPage from './ClientPage';

import { api } from '@/lib/api';

export async function generateStaticParams() {
    try {
        const sectors = await api.config.getSectors();
        if (!Array.isArray(sectors)) return [];
        return sectors
            .filter((s: any) => s && s.id)
            .map((s: any) => ({
                id: s.id.toString(),
            }));
    } catch (e) {
        console.error('Failed to generate static params for sectors:', e);
        return [];
    }
}

export const dynamicParams = false;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ClientPage id={id} />;
}
