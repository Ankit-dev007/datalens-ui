export const MOCK_SUMMARY = {
    totalPii: 12540,
    riskDistribution: { high: 1540, medium: 4500, low: 6500 },
};

export const MOCK_PII_TYPES = {
    labels: ['Email', 'Phone', 'Aadhaar', 'PAN', 'Credit Card'],
    datasets: [{ label: 'Count', data: [4000, 3500, 2000, 1500, 1540], backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] }],
};

export const MOCK_SOURCE_SPLIT = {
    labels: ['Database', 'Files'],
    datasets: [{ label: 'Count', data: [8500, 4040], backgroundColor: ['#6366f1', '#ec4899'] }],
};

export const MOCK_TOP_TABLES = {
    labels: ['users', 'payments', 'employees', 'audit_logs'],
    datasets: [{ label: 'PII Count', data: [3200, 2800, 1500, 1000], backgroundColor: '#3b82f6' }],
};

export const MOCK_TOP_FILES = {
    labels: ['resume_draft.docx', 'customer_list.xlsx', 'backup_2024.sql'],
    datasets: [{ label: 'PII Count', data: [50, 400, 3590], backgroundColor: '#ec4899' }],
};

export const MOCK_GRAPH_DATA = {
    nodes: [
        { id: 'Table:Users', group: 'Table', val: 20, color: '#3b82f6' },
        { id: 'Col:Email', group: 'Column', val: 10, color: '#60a5fa' },
        { id: 'Col:Phone', group: 'Column', val: 10, color: '#60a5fa' },
        { id: 'PII:EmailAddress', group: 'PII', val: 5, color: '#ef4444' },
        { id: 'File:Backup.sql', group: 'File', val: 15, color: '#ec4899' },
        { id: 'Table:Payments', group: 'Table', val: 15, color: '#3b82f6' },
        { id: 'Col:CC', group: 'Column', val: 10, color: '#60a5fa' },
        { id: 'PII:CreditCard', group: 'PII', val: 5, color: '#ef4444' },
    ],
    links: [
        { source: 'Table:Users', target: 'Col:Email' },
        { source: 'Table:Users', target: 'Col:Phone' },
        { source: 'Col:Email', target: 'PII:EmailAddress' },
        { source: 'File:Backup.sql', target: 'PII:EmailAddress' },
        { source: 'Table:Payments', target: 'Col:CC' },
        { source: 'Col:CC', target: 'PII:CreditCard' },
    ]
};

export const MOCK_ASK_RESULT = {
    answer: "I found 1540 High Risk PII records, mostly in the 'payments' table.",
    cypher: "MATCH (t:Table)-[:HAS_COLUMN]->(c:Column)-[:IS_PII]->(p:PII {risk: 'High'}) RETURN count(p)",
    results: [{ count: 1540 }]
};
