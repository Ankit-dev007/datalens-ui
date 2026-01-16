'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, CheckCircle, AlertTriangle, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';

export default function DSARDetailsClient({ id }: { id: string }) {
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lineage, setLineage] = useState<any[]>([]);
    const [decision, setDecision] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetchDetails();
            fetchDecision();
        }
    }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/dsar/${id}`);
            const data = await res.json();
            setRequest(data);
            
            // If data subject exists, fetch their compliance lineage for "Impact Analysis" view
            if (data.data_subject_id) {
                const subRes = await fetch(`http://localhost:5000/api/data-subjects/${data.data_subject_id}`);
                const subData = await subRes.json();
                setLineage(subData.lineage || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDecision = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/dsar/${id}/decision`);
            const data = await res.json();
            if (data.decision) setDecision(data);
        } catch (e) { console.error(e); }
    };

    const [checklistData, setChecklistData] = useState<any>(null);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'audit'>('overview');

    useEffect(() => {
        if (activeTab === 'checklist' && !checklistData) fetchChecklist();
        if (activeTab === 'audit' && !auditLogs.length) fetchAudit();
    }, [activeTab]);

    const fetchChecklist = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/dsar/${id}/checklist`);
            const data = await res.json();
            setChecklistData(data);
            // Optionally update decision if newer
            if(data.autoDecision && (!decision || new Date(data.autoDecision.evaluatedAt) > new Date(decision.evaluatedAt))) {
                 setDecision(data.autoDecision);
            }
        } catch (e) { console.error(e); }
    };

    const fetchAudit = async () => {
         try {
            const res = await fetch(`http://localhost:5000/api/dsar/${id}/audit`);
            setAuditLogs(await res.json());
        } catch (e) { console.error(e); }
    };

    const updateStatus = async (status: string) => {
        const res = await fetch(`http://localhost:5000/api/dsar/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            fetchDetails();
            if (activeTab === 'audit') fetchAudit(); // Refresh audit
        }
    };

    if (loading) return <div className="p-10 text-white">Loading...</div>;
    if (!request) return <div className="p-10 text-white">Request not found</div>;

    const isOverdue = new Date(request.due_date) < new Date() && request.status !== 'COMPLETED';

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-neutral-950 text-white pb-20">
                {/* Header */}
                 <div className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-xl sticky top-0 z-10">
                    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                         <div className="flex items-center space-x-4">
                            <Link href="/dsar">
                                <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold flex items-center gap-2">
                                    {request.request_type} Request
                                    {isOverdue && <Badge variant="destructive" className="ml-2">Overdue</Badge>}
                                </h1>
                                <p className="text-xs text-neutral-400 font-mono mt-1">ID: {request.id}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="text-sm text-neutral-400 mr-2">Status:</span>
                             <select
                                className="bg-neutral-800 border-neutral-700 text-white rounded px-3 py-1 text-sm h-9"
                                value={request.status}
                                onChange={(e) => updateStatus(e.target.value)}
                            >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* Left Col: Request Info & Nav */}
                    <div className="space-y-6 lg:col-span-1">
                        <Card className="bg-neutral-900 border-neutral-800">
                            <CardHeader><CardTitle className="text-lg">Request Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-xs text-neutral-500 uppercase tracking-wider">Data Subject</label>
                                    <div className="text-white font-medium text-lg flex items-center gap-2 mt-1">
                                        <User className="w-4 h-4 text-blue-400" />
                                        {request.subject_name}
                                    </div>
                                    <div className="text-neutral-400 text-sm">{request.subject_email}</div>
                                </div>
                                <hr className="border-neutral-800" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-neutral-500 uppercase tracking-wider">Created</label>
                                        <div className="text-neutral-300 mt-1">{new Date(request.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-neutral-500 uppercase tracking-wider text-red-400">Due By</label>
                                        <div className="text-neutral-300 mt-1 flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-red-400" />
                                            {new Date(request.due_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Navigation Tabs (Vertical) */}
                        <div className="space-y-2">
                            <Button 
                                variant={activeTab === 'overview' ? 'secondary' : 'ghost'} 
                                className="w-full justify-start" 
                                onClick={() => setActiveTab('overview')}
                            >
                                <Shield className="w-4 h-4 mr-2" /> Impact Analysis
                            </Button>
                            <Button 
                                variant={activeTab === 'checklist' ? 'secondary' : 'ghost'} 
                                className="w-full justify-start"
                                onClick={() => setActiveTab('checklist')}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Guided Checklist
                            </Button>
                            <Button 
                                variant={activeTab === 'audit' ? 'secondary' : 'ghost'} 
                                className="w-full justify-start"
                                onClick={() => setActiveTab('audit')}
                            >
                                <Clock className="w-4 h-4 mr-2" /> Audit Logs
                            </Button>
                        </div>
                    </div>

                    {/* Right Col: Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        
                        {/* DECISION BANNER (AUTO-DECISION) */}
                        {decision && (
                            <div className={`p-5 rounded-lg border flex items-start gap-4 ${
                                decision.decision === 'BLOCK' ? 'bg-red-950/30 border-red-900/50' :
                                decision.decision === 'ALLOW' ? 'bg-green-950/30 border-green-900/50' :
                                'bg-yellow-950/30 border-yellow-900/50'
                            }`}>
                                <div className={`p-2 rounded-full ${
                                    decision.decision === 'BLOCK' ? 'bg-red-900/50 text-red-400' :
                                    decision.decision === 'ALLOW' ? 'bg-green-900/50 text-green-400' :
                                    'bg-yellow-900/50 text-yellow-400'
                                }`}>
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-lg font-bold ${
                                            decision.decision === 'BLOCK' ? 'text-red-400' :
                                            decision.decision === 'ALLOW' ? 'text-green-400' :
                                            'text-yellow-400'
                                        }`}>
                                            Recommendation: {decision.decision} REQUEST
                                        </h3>
                                        <span className="text-xs text-neutral-500 font-mono">
                                            {new Date(decision.evaluatedAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-neutral-300 mt-1">{decision.reason}</p>
                                    
                                    {/* Evidence Summary */}
                                    {decision.evidence?.activities?.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-neutral-800/50">
                                            <p className="text-xs text-neutral-500 uppercase font-semibold mb-2">Evidence:</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {decision.evidence.activities.slice(0, 3).map((act: any, idx: number) => (
                                                    <div key={idx} className="bg-neutral-900/50 p-2 rounded text-xs flex justify-between">
                                                        <span className="text-neutral-300">{act.name}</span>
                                                        <Badge variant="outline" className="text-[10px] h-5">{act.lawfulBasis}</Badge>
                                                    </div>
                                                ))}
                                                {decision.evidence.activities.length > 3 && (
                                                    <div className="text-xs text-neutral-500 italic p-2">+ {decision.evidence.activities.length - 3} more activities</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-emerald-400" />
                                        Impact Analysis
                                    </h2>
                                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                                        Traceability Active
                                    </Badge>
                                </div>
                                <Card className="bg-neutral-900 border-neutral-800">
                                    <CardContent className="p-0">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-neutral-950 text-neutral-400 font-medium border-b border-neutral-800">
                                                <tr>
                                                    <th className="px-6 py-4">Data Asset</th>
                                                    <th className="px-6 py-4">PII Type</th>
                                                    <th className="px-6 py-4">Processing Purpose</th>
                                                    <th className="px-6 py-4">Lawful Basis</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-800 text-neutral-300">
                                                {lineage.filter((i:any) => i.assetName).map((item: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-neutral-800/50">
                                                        <td className="px-6 py-4 font-medium text-white">{item.assetName}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded text-xs">{item.piiType}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-neutral-400">{item.purpose}</td>
                                                        <td className="px-6 py-4">
                                                            {item.lawfulBasis ? (
                                                                <span className="text-emerald-400 flex items-center gap-1">
                                                                    <CheckCircle className="w-3 h-3" /> {item.lawfulBasis}
                                                                </span>
                                                            ) : (
                                                                <span className="text-red-400 flex items-center gap-1">
                                                                    <AlertTriangle className="w-3 h-3" /> Missing Basis
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {lineage.filter((i:any) => i.assetName).length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                                                            No traceable data found for this subject.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* CHECKLIST TAB */}
                        {activeTab === 'checklist' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-violet-400" />
                                    Guided Compliance Checklist
                                </h2>
                                
                                {!checklistData ? (
                                    <div className="text-center py-10 text-neutral-500">Loading checklist...</div>
                                ) : (
                                    <>
                                        {/* Status Banner */}
                                        <div className={`p-4 rounded-lg flex items-start gap-3 ${checklistData.complianceStatus.canProceed ? 'bg-green-900/20 border border-green-900/50' : 'bg-red-900/20 border border-red-900/50'}`}>
                                            {checklistData.complianceStatus.canProceed ? (
                                                <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
                                            ) : (
                                                <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                                            )}
                                            <div>
                                                <h3 className={`font-bold ${checklistData.complianceStatus.canProceed ? 'text-green-400' : 'text-red-400'}`}>
                                                    {checklistData.complianceStatus.canProceed ? 'Request Can Proceed' : 'Action Blocked'}
                                                </h3>
                                                <div className="space-y-1 mt-2">
                                                    {checklistData.complianceStatus.issues.map((issue: any, i: number) => (
                                                        <div key={i} className={`text-sm flex items-center gap-2 ${issue.severity === 'BLOCKER' ? 'text-red-400 font-bold' : 'text-neutral-300'}`}>
                                                            • {issue.message}
                                                        </div>
                                                    ))}
                                                    {checklistData.complianceStatus.issues.length === 0 && (
                                                        <div className="text-sm text-green-300">All compliance checks passed.</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Execution Steps */}
                                        <Card className="bg-neutral-900 border-neutral-800">
                                            <CardHeader><CardTitle>Execution Steps</CardTitle></CardHeader>
                                            <CardContent>
                                                <div className="space-y-6">
                                                    {checklistData.checklist.assets.map((asset: any, i: number) => (
                                                        <div key={i} className="border border-neutral-800 rounded-lg p-4">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div>
                                                                    <h4 className="font-bold text-white text-lg">{asset.name}</h4>
                                                                    <p className="text-sm text-neutral-400">Owner: {asset.owner || 'Unknown'}</p>
                                                                </div>
                                                                <Badge variant="outline">{asset.storageLocations.join(', ')}</Badge>
                                                            </div>
                                                            <div className="bg-neutral-950 rounded p-3 text-sm space-y-2">
                                                                <div className="flex justify-between">
                                                                    <span className="text-neutral-500">PII Types:</span>
                                                                    <span className="text-neutral-300">{asset.piiTypes.join(', ')}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-neutral-500">Processing:</span>
                                                                    <span className="text-neutral-300">
                                                                        {asset.processingActivities.map((pa:any) => pa.name).join(', ')}
                                                                    </span>
                                                                </div>
                                                                 <div className="flex justify-between">
                                                                    <span className="text-neutral-500">Retention:</span>
                                                                    <span className="text-neutral-300">
                                                                        {asset.processingActivities.map((pa:any) => pa.retentionPeriod).join(', ') || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                     {checklistData.checklist.assets.length === 0 && (
                                                        <div className="text-center text-neutral-500 py-4">No data assets to process.</div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </>
                                )}
                            </div>
                        )}

                        {/* AUDIT TAB */}
                        {activeTab === 'audit' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                    Audit Trail
                                </h2>
                                <Card className="bg-neutral-900 border-neutral-800">
                                    <CardContent className="p-0">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-neutral-950 text-neutral-400 font-medium border-b border-neutral-800">
                                                <tr>
                                                    <th className="px-6 py-4">Timestamp</th>
                                                    <th className="px-6 py-4">Action</th>
                                                    <th className="px-6 py-4">Details</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-800 text-neutral-300">
                                                {auditLogs.map((log: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-neutral-800/50">
                                                        <td className="px-6 py-4 font-mono text-neutral-500">
                                                            {new Date(log.performed_at).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-white">{log.action}</td>
                                                        <td className="px-6 py-4 text-neutral-400 truncate max-w-xs" title={JSON.stringify(log.details)}>
                                                            {JSON.stringify(log.details)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {auditLogs.length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">
                                                            No audit logs found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}
