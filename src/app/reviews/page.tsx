"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { AlertCircle, CheckCircle, ShieldAlert, History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // Just in case, but using Select for reason

export default function ReviewsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">PII Reviews</h1>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList>
                    <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
                    <TabsTrigger value="resolved">Resolved History</TabsTrigger>
                    <TabsTrigger value="discarded">Discarded (Low Conf)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending">
                    <PendingReviews />
                </TabsContent>
                
                <TabsContent value="resolved">
                    <ResolvedReviews />
                </TabsContent>

                <TabsContent value="discarded">
                    <DiscardedReviews />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function PendingReviews() {
    const [pendingItems, setPendingItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [resolving, setResolving] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const fetchPending = async () => {
        try {
            const data = await api.getPendingConfirmations();
            setPendingItems(data);
        } catch (error) {
            console.error("Failed to fetch pending", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPending(); }, []);

    const handleConfirm = async (id: string, decision: "YES" | "NO" | "NOT_SURE") => {
        if (decision === "NOT_SURE") {
            setSelectedItem(null);
            return;
        }
        setResolving(true);
        try {
            await api.resolveConfirmation({ id, decision });
            setPendingItems(prev => prev.filter(i => i.id !== id));
            setSelectedItem(null);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error("Failed to resolve", error);
        } finally {
            setResolving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Pending Confirmations</CardTitle>
                    {showToast && <Badge variant="outline" className="text-green-600 border-green-200">Decision Saved</Badge>}
                </div>
            </CardHeader>
            <CardContent>
                {pendingItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No pending items.</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Source</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Detected Type</TableHead>
                                <TableHead>Confidence</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingItems
                                .filter(item => item.confidence >= 0.50) // [DEFENSIVE] Safety net filter
                                .map((item) => {
                                // Logic 1: Source
                                const subtype = item.source_subtype ? ` (${item.source_subtype})` : '';
                                const sourceDisplay = (item.source_type && item.source_type.charAt(0).toUpperCase() + item.source_type.slice(1)) + subtype;
                                
                                // Logic 2: Name
                                const nameDisplay = item.source_type === 'file' 
                                    ? (item.file_path ? item.file_path.split(/[\\/]/).pop() : 'Unknown File')
                                    : (item.database_name || 'Unknown DB');

                                // Logic 3: Location
                                const locationDisplay = item.source_type === 'file'
                                    ? (item.file_section || 'Content')
                                    : `${item.table_name || '?'}.${item.column_name || '?'}`;

                                return (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {sourceDisplay}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{nameDisplay}</TableCell>
                                    <TableCell>{locationDisplay}</TableCell>
                                    <TableCell><Badge variant="outline">{item.suggested_pii_type}</Badge></TableCell>
                                    <TableCell className={item.confidence < 0.6 ? "text-yellow-600 font-bold" : ""}>
                                        {(item.confidence * 100).toFixed(0)}%
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs max-w-xs truncate" title={item.reason}>{item.reason}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" onClick={() => setSelectedItem(item)}>Review</Button>
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
                <ConfirmationModal 
                    isOpen={!!selectedItem} 
                    onClose={() => setSelectedItem(null)} 
                    item={selectedItem} 
                    onConfirm={handleConfirm} 
                    loading={resolving} 
                />
            </CardContent>
        </Card>
    );
}

function ResolvedReviews() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [overrideItem, setOverrideItem] = useState<any>(null); // Item being overridden

    const fetchResolved = async () => {
        try {
            const data = await api.getResolvedConfirmations();
            setItems(data);
        } catch (error) {
            console.error("Failed to fetch resolved", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchResolved(); }, []);

    const handleOverrideSuccess = () => {
        setOverrideItem(null);
        fetchResolved(); // Refresh list
    };

    if (loading) return <div>Loading...</div>;

    return (
        <Card>
            <CardHeader><CardTitle>Decision History</CardTitle></CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No history available.</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Decision</TableHead>
                                <TableHead>Resolved By</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Admin</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => {
                                // Logic 1: Source
                                const subtype = item.source_subtype ? ` (${item.source_subtype})` : '';
                                const sourceDisplay = (item.source_type && item.source_type.charAt(0).toUpperCase() + item.source_type.slice(1)) + subtype;
                                
                                // Logic 2: Name
                                const nameDisplay = item.source_type === 'file' 
                                    ? (item.file_path ? item.file_path.split(/[\\/]/).pop() : 'Unknown File')
                                    : (item.database_name || 'Unknown DB');

                                // Logic 3: Location
                                const locationDisplay = item.source_type === 'file'
                                    ? (item.file_section || 'Content')
                                    : `${item.table_name || '?'}.${item.column_name || '?'}`;
                                
                                return (
                                <TableRow key={item.id} className={item.status === 'OVERRIDDEN' ? "opacity-50 bg-slate-50 dark:bg-slate-900" : ""}>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(item.resolved_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {sourceDisplay}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{nameDisplay}</TableCell>
                                    <TableCell>{locationDisplay}</TableCell>
                                    <TableCell>
                                        <span className={item.status.includes('CONFIRMED') ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                            {item.status.includes('CONFIRMED') ? 'PII' : 'Not PII'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {item.resolved_by}
                                        {item.override_reason && <div className="text-[10px] text-orange-600 font-semibold">Override: {item.override_reason}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={item.status === 'OVERRIDDEN' ? 'secondary' : (item.status === 'CONFIRMED' ? 'default' : 'outline')}>
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.status !== 'OVERRIDDEN' && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                onClick={() => setOverrideItem(item)}
                                            >
                                                Override
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
                {overrideItem && (
                    <OverrideDialog 
                        item={overrideItem} 
                        open={!!overrideItem} 
                        onClose={() => setOverrideItem(null)}
                        onSuccess={handleOverrideSuccess}
                    />
                )}
            </CardContent>
        </Card>
    );
}

function DiscardedReviews() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getDiscardedConfirmations()
            .then(data => setItems(data))
            .catch(err => console.error("Failed to fetch discarded", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <Card>
            <CardHeader><CardTitle className="text-muted-foreground">Discarded Items (Low Confidence)</CardTitle></CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No discarded items.</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Detected Type</TableHead>
                                <TableHead>Confidence</TableHead>
                                <TableHead>Reason</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items
                                .filter(item => item.status === 'discarded' || item.confidence < 0.50) // [DEFENSIVE]
                                .map((item) => {
                                const subtype = item.source_subtype ? ` (${item.source_subtype})` : '';
                                const sourceDisplay = (item.source_type && item.source_type.charAt(0).toUpperCase() + item.source_type.slice(1)) + subtype;
                                
                                const nameDisplay = item.source_type === 'file' 
                                    ? (item.file_path ? item.file_path.split(/[\\/]/).pop() : 'Unknown File')
                                    : (item.database_name || 'Unknown DB');

                                const locationDisplay = item.source_type === 'file'
                                    ? (item.file_section || 'Content')
                                    : `${item.table_name || '?'}.${item.column_name || '?'}`;

                                return (
                                <TableRow key={item.id} className="opacity-60 bg-muted/50">
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(item.created_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize text-muted-foreground">
                                            {sourceDisplay}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-muted-foreground">{nameDisplay}</TableCell>
                                    <TableCell className="text-muted-foreground">{locationDisplay}</TableCell>
                                    <TableCell><Badge variant="secondary">{item.suggested_pii_type}</Badge></TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {(item.confidence * 100).toFixed(0)}%
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs italic">{item.reason}</TableCell>
                                </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

function OverrideDialog({ item, open, onClose, onSuccess }: any) {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    
    const isCurrentlyConfirmed = item.status === 'CONFIRMED';
    const newDecision = isCurrentlyConfirmed ? 'NO' : 'YES';

    const handleOverride = async () => {
        if (!reason) return;
        setLoading(true);
        try {
            await api.overrideConfirmation({
                id: item.id,
                decision: newDecision,
                reason,
                user: 'admin_override' // In real app, get distinct current user
            });
            onSuccess();
        } catch (error) {
            console.error("Override failed", error);
        } finally {
            setLoading(false);
        }
    };

    const targetName = item.source_type === 'file' 
        ? `${item.file_path?.split(/[\\/]/).pop()} (${item.file_section})`
        : `${item.table_name}.${item.column_name}`;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] border-l-4 border-l-red-500">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <ShieldAlert className="h-5 w-5" />
                        Emergency Override
                    </DialogTitle>
                    <DialogDescription>
                        You are about to override a compliance decision. This action will be audited.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Target</Label>
                        <span className="col-span-3 font-mono text-xs">{targetName}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Change</Label>
                        <div className="col-span-3 flex items-center gap-2">
                            <Badge variant="outline">{isCurrentlyConfirmed ? 'PII' : 'Not PII'}</Badge>
                            <span>➔</span>
                            <Badge className={newDecision === 'YES' ? 'bg-red-600' : 'bg-slate-500'}>
                                {newDecision === 'YES' ? 'PII' : 'Not PII'}
                            </Badge>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reason" className="text-right text-red-600 font-bold">Reason</Label>
                        <Select onValueChange={setReason}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select strict reason..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="False Positive (Correction)">False Positive (Correction)</SelectItem>
                                <SelectItem value="False Negative (Correction)">False Negative (Correction)</SelectItem>
                                <SelectItem value="Legal Exemption">Legal Exemption</SelectItem>
                                <SelectItem value="Business Requirement">Business Requirement</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleOverride} 
                        disabled={!reason || loading}
                    >
                        {loading ? "Overriding..." : "Confirm Override"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
