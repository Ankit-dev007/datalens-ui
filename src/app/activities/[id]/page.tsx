
import React from 'react';
import ClientPage from './ClientPage';

import { api } from '@/lib/api';

export async function generateStaticParams() {
    // Debug: Hardcoded to bypass API issues during build
    // Note: Config routes use real API, but activities API endpoint appears unstable during static generation.
    return [{ id: '1' }];
}

export const dynamicParams = false;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ClientPage id={id} />;
}
