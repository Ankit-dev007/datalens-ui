"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { AlertCircle, CheckCircle } from "lucide-react";

export function PendingConfirmations() {
    const [pendingItems, setPendingItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [resolving, setResolving] = useState(false);
    const [showResolvedToast, setShowResolvedToast] = useState(false);

    const fetchPending = async () => {
        try {
            const data = await api.getPendingConfirmations();
            setPendingItems(data);
        } catch (error) {
            console.error("Failed to fetch pending confirmations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleConfirm = async (id: string, decision: "YES" | "NO" | "NOT_SURE") => {
        if (decision === "NOT_SURE") {
            setSelectedItem(null);
            return;
        }

        setResolving(true);
        try {
            await api.resolveConfirmation({ id, decision });
            
            // Remove from list
            setPendingItems(prev => prev.filter(i => i.id !== id));
            setSelectedItem(null);
            
            // Show simple feedback
            setShowResolvedToast(true);
            setTimeout(() => setShowResolvedToast(false), 3000);
        } catch (error) {
            console.error("Failed to resolve", error);
        } finally {
            setResolving(false);
        }
    };

    if (loading) return null;
    if (pendingItems.length === 0) return null;

    return (
        <Card className="border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10 mb-8">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <CardTitle className="text-lg font-medium text-yellow-800 dark:text-yellow-500">
                            Needs Confirmation ({pendingItems.length})
                        </CardTitle>
                    </div>
                    {showResolvedToast && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 animate-in fade-in slide-in-from-right">
                            <CheckCircle className="w-3 h-3 mr-1" /> Decision Saved
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border bg-white dark:bg-slate-900">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Table</TableHead>
                                <TableHead>Column</TableHead>
                                <TableHead>Detected Type</TableHead>
                                <TableHead>Confidence</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.table_name}</TableCell>
                                    <TableCell>{item.column_name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{item.suggested_pii_type || 'Unknown'}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className={item.confidence < 0.6 ? "text-yellow-600 font-bold" : ""}>
                                            {(item.confidence * 100).toFixed(0)}%
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                            Needs Confirmation
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs max-w-xs truncate" title={item.reason}>
                                        {item.reason}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            size="sm" 
                                            variant="default"
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                            onClick={() => setSelectedItem(item)}
                                        >
                                            Review
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <ConfirmationModal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                item={selectedItem}
                onConfirm={handleConfirm}
                loading={resolving}
            />
        </Card>
    );
}
