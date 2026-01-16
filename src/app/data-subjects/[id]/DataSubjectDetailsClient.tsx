'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Users, Plus, Fingerprint, Database, 
    Activity, Shield, ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

export default function DataSubjectDetailsClient({ id }: { id: string }) {
    const [subject, setSubject] = useState<any>(null);
    const [lineage, setLineage] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Add Identifier State
    const [newIdentifier, setNewIdentifier] = useState({ value: '', type: 'EMAIL' });
    const [isAddingId, setIsAddingId] = useState(false);

    useEffect(() => {
        if (id) fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/data-subjects/${id}`);
            const data = await res.json();
            setSubject(data.subject);
            setLineage(data.lineage || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddIdentifier = async () => {
        if (!newIdentifier.value) return;
        try {
            await fetch(`http://localhost:5000/api/data-subjects/${id}/link-identifiers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    identifierValue: newIdentifier.value, 
                    identifierType: newIdentifier.type 
                })
            });
            setIsAddingId(false);
            setNewIdentifier({ value: '', type: 'EMAIL' });
            fetchDetails(); // Refresh
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-10 text-white">Loading...</div>;
    if (!subject) return <div className="p-10 text-white">Subject not found</div>;

    // Group lineage by Identifier
    const groupedLineage = lineage.reduce((acc: any, item: any) => {
        const key = item.identifier;
        if (!acc[key]) acc[key] = { items: [], type: 'UNKNOWN' };
        acc[key].items.push(item);
        if (item.piiType) acc[key].type = item.piiType;
        return acc;
    }, {});

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-neutral-950 text-white pb-20">
                {/* Header */}
                <div className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-xl sticky top-0 z-10">
                    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/data-subjects">
                                <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-400" />
                                    {subject.display_name}
                                </h1>
                                <p className="text-xs text-neutral-400 font-mono mt-1">ID: {subject.id}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* Actions placeholder */}
                            <Button variant="outline" className="border-neutral-700 text-neutral-300">
                                View DSAR History
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-6 py-8 space-y-8">
                    
                    {/* Identifiers Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-neutral-200 flex items-center gap-2">
                                <Fingerprint className="w-5 h-5 text-violet-400" />
                                Known Identifiers
                            </h2>
                            <Button 
                                size="sm" 
                                variant="secondary" 
                                onClick={() => setIsAddingId(!isAddingId)}
                                className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Identifier
                            </Button>
                        </div>

                        {/* Inline Add Form */}
                        {isAddingId && (
                            <Card className="mb-6 bg-neutral-900 border-neutral-800">
                                <CardContent className="p-4 flex gap-4 items-end">
                                    <div className="space-y-2 flex-1">
                                        <label className="text-xs text-neutral-400">Identifier Value</label>
                                        <Input 
                                            value={newIdentifier.value}
                                            onChange={e => setNewIdentifier({...newIdentifier, value: e.target.value})}
                                            placeholder="e.g. john@example.com"
                                            className="bg-neutral-950 border-neutral-700"
                                        />
                                    </div>
                                    <div className="space-y-2 w-48">
                                        <label className="text-xs text-neutral-400">Type</label>
                                        <select 
                                            className="w-full h-10 bg-neutral-950 border border-neutral-700 rounded-md px-3 text-sm text-white"
                                            value={newIdentifier.type}
                                            onChange={e => setNewIdentifier({...newIdentifier, type: e.target.value})}
                                        >
                                            <option value="EMAIL">Email</option>
                                            <option value="PHONE">Phone</option>
                                            <option value="AADHAAR">Aadhaar</option>
                                            <option value="PAN">PAN</option>
                                        </select>
                                    </div>
                                    <Button onClick={handleAddIdentifier} className="bg-violet-600 hover:bg-violet-700">Link</Button>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(groupedLineage).map(([identifier, data]: [string, any]) => (
                                <Card key={identifier} className="bg-neutral-900 border-neutral-800 overflow-hidden">
                                    <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-blue-500"></div>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <Badge variant="outline" className="mb-2 bg-neutral-950 border-neutral-700 text-neutral-400">
                                                    {data.type}
                                                </Badge>
                                                <div className="font-mono text-lg text-white break-all">{identifier}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 space-y-3">
                                            {/* Stats */}
                                            <div className="flex justify-between text-sm py-2 border-t border-neutral-800">
                                                <span className="text-neutral-500 flex items-center gap-2">
                                                    <Database className="w-3 h-3" /> Data Assets
                                                </span>
                                                <span className="text-white">
                                                    {new Set(data.items.map((i: any) => i.assetName)).size - (data.items[0]?.assetName ? 0 : 1)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm pb-2 border-b border-neutral-800">
                                                <span className="text-neutral-500 flex items-center gap-2">
                                                    <Activity className="w-3 h-3" /> Processes
                                                </span>
                                                <span className="text-white">
                                                     {new Set(data.items.map((i: any) => i.activityName)).size - (data.items[0]?.activityName ? 0 : 1)}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {Object.keys(groupedLineage).length === 0 && (
                                <div className="col-span-3 p-8 text-center border border-dashed border-neutral-800 rounded-lg text-neutral-500">
                                    No identifiers linked yet. Add one to see data lineage.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Traceability Table */}
                    <section>
                         <h2 className="text-lg font-semibold text-neutral-200 flex items-center gap-2 mb-4">
                            <Shield className="w-5 h-5 text-green-400" />
                            Privacy Lineage (Impact Analysis)
                        </h2>
                        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-neutral-950 text-neutral-400 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Identifier</th>
                                        <th className="px-6 py-3">PII Type</th>
                                        <th className="px-6 py-3">Found In (Asset)</th>
                                        <th className="px-6 py-3">Processed By (Activity)</th>
                                        <th className="px-6 py-3">Lawful Basis</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                                    {lineage.filter((i:any) => i.assetName).map((item: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-neutral-800/50">
                                            <td className="px-6 py-3 font-mono text-neutral-400">{item.identifier}</td>
                                            <td className="px-6 py-3">
                                                 <Badge variant="secondary" className="bg-blue-900/30 text-blue-300 hover:bg-blue-900/50">
                                                    {item.piiType}
                                                 </Badge>
                                            </td>
                                            <td className="px-6 py-3 flex items-center gap-2">
                                                <Database className="w-4 h-4 text-neutral-500" />
                                                {item.assetName}
                                            </td>
                                            <td className="px-6 py-3">{item.activityName || <span className="text-red-400 italic">Unmapped</span>}</td>
                                            <td className="px-6 py-3">
                                                {item.lawfulBasis ? (
                                                     <span className="text-green-400 flex items-center gap-1">
                                                        <Shield className="w-3 h-3" /> {item.lawfulBasis}
                                                     </span>
                                                ) : (
                                                    item.activityName && <span className="text-red-500 text-xs">Missing Basis</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {lineage.filter((i:any) => i.assetName).length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                                                No comprehensive lineage found. Identifiers may not yet be mapped to physical assets.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </ThemeProvider>
    );
}
