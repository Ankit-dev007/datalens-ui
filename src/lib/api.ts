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
    getActivity: (id: string) => fetchJson(`/api/activities/${id}`),
    getManualTemplates: () => fetchJson('/api/manual/templates'),
    submitManualEntry: (payload: any) => fetchJson('/api/data-assets', { method: 'POST', body: JSON.stringify(payload) }),
    getDataAssets: () => fetchJson('/api/data-assets'),
    getDataAssetsByActivity: (id: string) => fetchJson(`/api/data-assets/activity/${id}`),
    getUnmappedDiscoveries: () => fetchJson('/api/discovery/unmapped'),
    linkDiscoveryToAsset: (assetId: string, discoveryName: string, type: string) => fetchJson(`/api/data-assets/${assetId}/link_discovery`, {
        method: 'POST',
        body: JSON.stringify({ discoveryName, type })
    }),

    // Hierarchy
    getSectors: () => fetchJson('/api/hierarchy/sectors'),
    getProcesses: (sectorId: number) => fetchJson(`/api/hierarchy/processes?sectorId=${sectorId}`),
    getSubProcesses: (processId: number) => fetchJson(`/api/hierarchy/sub-processes?processId=${processId}`),
    getActivityTemplates: (subProcessId: number) => fetchJson(`/api/hierarchy/activity-templates?subProcessId=${subProcessId}`),
    uploadInventoryCSV: (csvText: string, owner?: string) => fetchJson(`/api/inventory/upload?owner=${owner || ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: csvText
    }),
    exportPdfUrl: () => `${API_BASE_URL}/api/export/pdf`,
    exportCsvUrl: () => `${API_BASE_URL}/api/export/csv`,

    // Compliance & Validation
    getComplianceValidation: () => fetchJson('/api/compliance/validation'),
    getComplianceSummary: () => fetchJson('/api/compliance/summary'),
    getPIILineage: (piiType: string) => fetchJson(`/api/compliance/pii-lineage/${piiType}`),
    getIllegalPII: () => fetchJson('/api/compliance/illegal-pii'),
    getUnmappedCompliance: () => fetchJson('/api/compliance/unmapped'),

    // Configuration Management (CRUD)
    config: {
        // Sectors
        getSectors: () => fetchJson('/api/config/sectors'),
        createSector: (data: any) => fetchJson('/api/config/sectors', { method: 'POST', body: JSON.stringify(data) }),
        updateSector: (id: number, data: any) => fetchJson(`/api/config/sectors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteSector: (id: number) => fetchJson(`/api/config/sectors/${id}`, { method: 'DELETE' }),

        // Processes
        getProcesses: (sectorId?: number) => fetchJson(sectorId ? `/api/hierarchy/processes?sectorId=${sectorId}` : '/api/config/processes'),
        createProcess: (data: any) => fetchJson('/api/config/processes', { method: 'POST', body: JSON.stringify(data) }),
        updateProcess: (id: number, data: any) => fetchJson(`/api/config/processes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteProcess: (id: number) => fetchJson(`/api/config/processes/${id}`, { method: 'DELETE' }),

        // Sub-Processes
        getSubProcesses: (processId: number) => fetchJson(`/api/config/sub-processes?processId=${processId}`),
        createSubProcess: (data: any) => fetchJson('/api/config/sub-processes', { method: 'POST', body: JSON.stringify(data) }),
        updateSubProcess: (id: number, data: any) => fetchJson(`/api/config/sub-processes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteSubProcess: (id: number) => fetchJson(`/api/config/sub-processes/${id}`, { method: 'DELETE' }),

        // Activity Templates
        getActivityTemplates: (subProcessId: number) => fetchJson(`/api/config/activity-templates?subProcessId=${subProcessId}`),
        createActivityTemplate: (data: any) => fetchJson('/api/config/activity-templates', { method: 'POST', body: JSON.stringify(data) }),
        updateActivityTemplate: (id: number, data: any) => fetchJson(`/api/config/activity-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteActivityTemplate: (id: number) => fetchJson(`/api/config/activity-templates/${id}`, { method: 'DELETE' }),
    }
};
