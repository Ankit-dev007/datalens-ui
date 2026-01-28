"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PendingItem {
    id: string;
    table_name: string;
    column_name: string;
    suggested_pii_type: string;
    confidence: number;
    reason: string;
}

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: PendingItem | null;
    onConfirm: (id: string, decision: "YES" | "NO" | "NOT_SURE") => void;
    loading: boolean;
}

export function ConfirmationModal({ isOpen, onClose, item, onConfirm, loading }: ConfirmationModalProps) {
    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
                    <h2 className="text-lg font-semibold leading-none tracking-tight">Confirm Data Sensitivity</h2>
                    <p className="text-sm text-muted-foreground">
                        The backend identified this column as potentially sensitive with low confidence.
                    </p>
                </div>

                {/* Content */}
                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">Column</p>
                            <p className="text-sm text-muted-foreground">{item.table_name}.{item.column_name}</p>
                        </div>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                             {(item.confidence * 100).toFixed(0)}% Confidence
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-semibold">AI Reason:</p>
                        <p className="text-sm text-muted-foreground italic">"{item.reason}"</p>
                    </div>

                    <div className="pt-2">
                        <p className="text-sm font-medium">Does this column contain personal or sensitive data?</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                     <Button 
                        variant="ghost" 
                        onClick={() => onConfirm(item.id, "NOT_SURE")}
                        disabled={loading}
                    >
                        Not Sure
                    </Button>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => onConfirm(item.id, "NO")}
                            className="w-full sm:w-auto"
                            disabled={loading}
                        >
                            NO
                        </Button>
                        <Button 
                            onClick={() => onConfirm(item.id, "YES")}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                            disabled={loading}
                        >
                            YES
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
