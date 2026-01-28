"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "./ConfirmationModal";
import { AlertCircle } from "lucide-react";

interface ConfirmationListProps {
    refreshTrigger?: number;
}

export function ConfirmationList({ refreshTrigger = 0 }: ConfirmationListProps) {
    const [pendingItems, setPendingItems] = useState<any[]>([]);
    const [resolvedItems, setResolvedItems] = useState<any[]>([]); // [NEW] Track resolved
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [resolving, setResolving] = useState(false);

    const fetchPending = async () => {
        try {
            // Don't set full page loading, just background refresh or local loading
            // setLoading(true); 
            const data = await api.getPendingConfirmations();
            console.log("Pending Confirmations:", data); // [DEBUG]
            setPendingItems(data);
        } catch (error) {
            console.error("Failed to fetch pending confirmations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, [refreshTrigger]);

    const handleConfirm = async (id: string, decision: "YES" | "NO" | "NOT_SURE") => {
        if (decision === "NOT_SURE") {
            setSelectedItem(null); // Just close, don't remove
            return;
        }

        setResolving(true);
        try {
            await api.resolveConfirmation({ id, decision });
            
            // Optimistic update: Move to resolved
            const item = pendingItems.find(i => i.id === id);
            if (item) {
                setPendingItems(prev => prev.filter(i => i.id !== id));
                setResolvedItems(prev => [{ ...item, decision }, ...prev]);
            }
            setSelectedItem(null);
        } catch (error) {
            console.error("Failed to resolve", error);
        } finally {
            setResolving(false);
        }
    };

    if (!loading && pendingItems.length === 0 && resolvedItems.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* PENDING ITEMS */}
            {pendingItems.length > 0 && (
                <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <CardTitle className="text-lg font-medium text-yellow-800 dark:text-yellow-500">
                                ⚠ Pending Confirmations
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {pendingItems.map((item) => (
                                <div 
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded border cursor-pointer hover:border-yellow-400 transition-colors"
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">{item.table_name}.{item.column_name}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Confidence: <span className="font-medium">{(item.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">Reason: {item.reason}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                                            Needs Confirmation
                                        </Badge>
                                        <Button size="sm" variant="outline" className="h-8">Review</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* RESOLVED ITEMS (NEW) */}
            {resolvedItems.length > 0 && (
                <Card className="border-green-500 bg-green-50 dark:bg-green-900/10">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium text-green-800 dark:text-green-500">
                            Resolved Confirmations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {resolvedItems.map((item) => (
                                <div 
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded border opacity-75"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm line-through text-muted-foreground">
                                            {item.table_name}.{item.column_name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Marked as: <span className="font-bold">{item.decision === 'YES' ? 'SENSITIVE' : 'NOT SENSITIVE'}</span>
                                        </span>
                                    </div>
                                    <Badge variant={item.decision === 'YES' ? 'destructive' : 'outline'}>
                                        {item.decision === 'YES' ? 'Confirmed' : 'Rejected'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <ConfirmationModal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                item={selectedItem}
                onConfirm={handleConfirm}
                loading={resolving}
            />
        </div>
    );
}
