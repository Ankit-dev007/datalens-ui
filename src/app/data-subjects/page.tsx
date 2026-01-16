'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, User, Users } from 'lucide-react';
import { ThemeProvider } from '@/context/ThemeContext';

export default function DataSubjectsPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newSubject, setNewSubject] = useState({ displayName: '', email: '', phone: '' });

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/data-subjects');
            const data = await res.json();
            setSubjects(data);
        } catch (error) {
            console.error("Failed to fetch subjects", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/data-subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSubject),
            });
            if (res.ok) {
                setNewSubject({ displayName: '', email: '', phone: '' });
                setIsCreating(false);
                fetchSubjects();
            }
        } catch (error) {
            console.error("Failed to create subject", error);
        }
    };

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-neutral-900 text-white p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                            Data Subjects
                        </h1>
                        <p className="text-neutral-400 mt-2">Manage registered data subjects and their identifiers</p>
                    </div>
                    <Button 
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Subject
                    </Button>
                </div>

                {/* Creation Modal / Inline Form (Simplified for POC) */}
                {isCreating && (
                    <Card className="mb-8 bg-neutral-800 border-neutral-700">
                        <CardHeader>
                            <CardTitle>Register New Data Subject</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input 
                                placeholder="Full Name" 
                                value={newSubject.displayName}
                                onChange={e => setNewSubject({...newSubject, displayName: e.target.value})}
                                className="bg-neutral-900 border-neutral-700"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    placeholder="Primary Email (Optional)" 
                                    value={newSubject.email}
                                    onChange={e => setNewSubject({...newSubject, email: e.target.value})}
                                    className="bg-neutral-900 border-neutral-700"
                                />
                                <Input 
                                    placeholder="Phone Number (Optional)" 
                                    value={newSubject.phone}
                                    onChange={e => setNewSubject({...newSubject, phone: e.target.value})}
                                    className="bg-neutral-900 border-neutral-700"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">Save</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map(subject => (
                        <Link href={`/data-subjects/${subject.id}`} key={subject.id}>
                            <Card className="bg-neutral-800 border-neutral-700 hover:border-blue-500 transition-colors cursor-pointer group">
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                                            <User className="w-6 h-6 text-neutral-400 group-hover:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-neutral-100">{subject.display_name}</h3>
                                            <p className="text-sm text-neutral-500">Founded {new Date(subject.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 space-y-2">
                                        {subject.email && (
                                            <div className="text-sm text-neutral-400 flex items-center">
                                                <span className="w-16 text-neutral-500 text-xs uppercase tracking-wider">Email</span>
                                                {subject.email}
                                            </div>
                                        )}
                                        {subject.phone && (
                                            <div className="text-sm text-neutral-400 flex items-center">
                                                <span className="w-16 text-neutral-500 text-xs uppercase tracking-wider">Phone</span>
                                                {subject.phone}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}

                    {subjects.length === 0 && !loading && (
                        <div className="col-span-3 text-center py-20 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No subjects found. Register a new data subject to begin.</p>
                        </div>
                    )}
                </div>
            </div>
        </ThemeProvider>
    );
}
