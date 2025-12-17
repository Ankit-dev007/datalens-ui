const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchJson(endpoint: string, options: RequestInit = {}) {
    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            console.warn(`API call to ${endpoint} failed, falling back to mock data if handled in component.`);
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }
        return res.json();
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}

export const api = {
    getStatsSummary: () => fetchJson('/api/stats/summary'),
    getPiiTypes: () => fetchJson('/api/stats/pii-types'),
    getSourceSplit: () => fetchJson('/api/stats/source-split'),
    getTopTables: () => fetchJson('/api/stats/top-tables'),
    getTopFiles: () => fetchJson('/api/stats/top-files'),
    scanFiles: (payload: any) => fetchJson('/api/scan/files', { method: 'POST', body: JSON.stringify(payload) }),
    scanDatabase: (payload: any) => fetchJson('/db-scan', { method: 'POST', body: JSON.stringify(payload) }),
    askQuestion: (question: string) => fetchJson('/api/analyze', { method: 'POST', body: JSON.stringify({ query: question }) }),
    getGraph: () => fetchJson('/api/graph'),

    // Module 2: Data Discovery & Mapping
    saveActivity: (payload: any) => fetchJson('/api/activities', { method: 'POST', body: JSON.stringify(payload) }), // Note: Need to create this endpoint in backend if not exists, or reuse save logic
    getActivities: () => fetchJson('/api/activities'), // Same note
    getManualTemplates: () => fetchJson('/api/manual/templates'),
    submitManualEntry: (payload: any) => fetchJson('/api/manual/entry', { method: 'POST', body: JSON.stringify(payload) }),
    uploadInventoryCSV: (csvText: string, owner?: string) => fetchJson(`/api/inventory/upload?owner=${owner || ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: csvText
    }),
    exportPdfUrl: () => `${API_BASE_URL}/api/export/pdf`,
    exportCsvUrl: () => `${API_BASE_URL}/api/export/csv`,
};
