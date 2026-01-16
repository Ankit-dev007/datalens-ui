'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { ThemeProvider } from '@/context/ThemeContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function DSARPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    
    // New Request Form
    const [newRequest, setNewRequest] = useState({ subjectId: '', type: 'ACCESS', description: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [reqRes, subRes] = await Promise.all([
                fetch('http://localhost:5000/api/dsar'),
                fetch('http://localhost:5000/api/data-subjects')
            ]);
            setRequests(await reqRes.json());
            setSubjects(await subRes.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newRequest.subjectId) return;
        try {
            const res = await fetch('http://localhost:5000/api/dsar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRequest),
            });
            if (res.ok) {
                setIsCreating(false);
                setNewRequest({ subjectId: '', type: 'ACCESS', description: '' });
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'IN_PROGRESS': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'COMPLETED': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'REJECTED': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-neutral-400 bg-neutral-800';
        }
    };

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-neutral-900 text-white p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400">
                            DSAR Management
                        </h1>
                        <p className="text-neutral-400 mt-2">Track and fulfill Data Subject Access Requests</p>
                    </div>
                    <Button 
                        onClick={() => setIsCreating(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" /> New Request
                    </Button>
                </div>

                {isCreating && (
                    <Card className="mb-8 bg-neutral-800 border-neutral-700">
                        <CardHeader><CardTitle>Create New Request</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-neutral-400 block mb-1">Data Subject</label>
                                    <select 
                                        className="w-full h-10 bg-neutral-900 border border-neutral-700 rounded-md px-3 text-sm"
                                        value={newRequest.subjectId}
                                        onChange={e => setNewRequest({...newRequest, subjectId: e.target.value})}
                                    >
                                        <option value="">Select Subject...</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.display_name} ({s.email || 'No Email'})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-neutral-400 block mb-1">Request Type</label>
                                    <select 
                                        className="w-full h-10 bg-neutral-900 border border-neutral-700 rounded-md px-3 text-sm"
                                        value={newRequest.type}
                                        onChange={e => setNewRequest({...newRequest, type: e.target.value})}
                                    >
                                        <option value="ACCESS">Access Request</option>
                                        <option value="CORRECTION">Correction Request</option>
                                        <option value="ERASURE">Erasure Request (Right to be Forgotten)</option>
                                    </select>
                                </div>
                            </div>
                            <Input 
                                placeholder="Internal Notes / Description"
                                value={newRequest.description}
                                onChange={e => setNewRequest({...newRequest, description: e.target.value})}
                                className="bg-neutral-900 border-neutral-700"
                            />
                             <div className="flex justify-end space-x-2">
                                <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">Create Request</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-4">
                    {requests.map(req => (
                        <Link href={`/dsar/${req.id}`} key={req.id}>
                            <Card className="bg-neutral-800/50 border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer block">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${getStatusColor(req.status)} bg-opacity-10`}>
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-white">{req.request_type}</h3>
                                                <Badge variant="outline" className={`border-0 ${getStatusColor(req.status)}`}>
                                                    {req.status}
                                                </Badge>
                                            </div>
                                            <p className="text-neutral-400 text-sm mt-1">
                                                For <span className="text-white font-medium">{req.subject_name}</span> • Due {new Date(req.due_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-neutral-500">
                                        <div className="flex flex-col items-end">
                                            <span>Created {new Date(req.created_at).toLocaleDateString()}</span>
                                            {req.description && <span className="text-neutral-600 italic max-w-xs truncate">{req.description}</span>}
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-neutral-400">View Details &rarr;</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                    {requests.length === 0 && !loading && (
                         <div className="p-10 text-center text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No open DSAR requests.</p>
                        </div>
                    )}
                </div>
            </div>
        </ThemeProvider>
    );
}
