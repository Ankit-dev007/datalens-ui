"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function FileScanPage() {
  const [storageType, setStorageType] = useState("local");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // PDF STATE
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  const [credentials, setCredentials] = useState<any>({
    path: "",
    accountName: "",
    containerName: "",
    accessKey: "",
    s3Bucket: "",
    s3AccessKey: "",
    s3SecretKey: "",
    gcsBucket: "",
    gcsKeyJson: "",
  });

  const handleInput = (field: string, val: string) => {
    setCredentials((prev: any) => ({ ...prev, [field]: val }));
  };

  const handleScan = async () => {
    setLoading(true);
    setResults([]);
    setPdfBase64(null);

    try {
      const res = await api.scanFiles({
        storageType,
        credentials,
      });

      const data = res.results || [];
      setResults(data);

      if (res.pdfBase64) {
        setPdfBase64(res.pdfBase64);
        setPdfName(res.fileName || "file_scan_report.pdf");
      }
    } catch (err) {
      console.error("Scan error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">File Scanner</h1>

      <Card>
        <CardHeader>
          <CardTitle>Select Storage Type</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Select onValueChange={setStorageType} defaultValue="local">
            <SelectTrigger>
              <SelectValue placeholder="Choose Storage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Local Folder/File</SelectItem>
              <SelectItem value="azure">Azure Blob Storage</SelectItem>
              <SelectItem value="s3">AWS S3</SelectItem>
              <SelectItem value="gcs">Google Cloud Storage</SelectItem>
            </SelectContent>
          </Select>

          {/* Dynamic Credential Forms */}
          {storageType === "local" && (
            <div className="flex gap-2">
              <Input
                placeholder="C:\\Documents\\Files"
                value={credentials.path}
                onChange={(e) => handleInput("path", e.target.value)}
              />
              {typeof window !== "undefined" && window.electron && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    const folder = await window.electron?.selectFolder();
                    if (folder) handleInput("path", folder);
                  }}
                >
                  Select Folder
                </Button>
              )}
            </div>
          )}

          {storageType === "azure" && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Account Name"
                value={credentials.accountName}
                onChange={(e) => handleInput("accountName", e.target.value)}
              />
              <Input
                placeholder="Container Name"
                value={credentials.containerName}
                onChange={(e) => handleInput("containerName", e.target.value)}
              />
              <Input
                placeholder="Access Key"
                value={credentials.accessKey}
                onChange={(e) => handleInput("accessKey", e.target.value)}
              />
            </div>
          )}

          {storageType === "s3" && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="S3 Bucket"
                value={credentials.s3Bucket}
                onChange={(e) => handleInput("s3Bucket", e.target.value)}
              />
              <Input
                placeholder="Access Key"
                value={credentials.s3AccessKey}
                onChange={(e) => handleInput("s3AccessKey", e.target.value)}
              />
              <Input
                placeholder="Secret Key"
                type="password"
                value={credentials.s3SecretKey}
                onChange={(e) => handleInput("s3SecretKey", e.target.value)}
              />
            </div>
          )}

          {storageType === "gcs" && (
            <div className="space-y-2">
              <Input
                placeholder="Bucket Name"
                value={credentials.gcsBucket}
                onChange={(e) => handleInput("gcsBucket", e.target.value)}
              />
              <Input
                placeholder="Service Account JSON"
                value={credentials.gcsKeyJson}
                onChange={(e) => handleInput("gcsKeyJson", e.target.value)}
              />
            </div>
          )}

          <Button onClick={handleScan} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Scanning..." : "Start Scan"}
          </Button>
        </CardContent>
      </Card>

      {/* RESULTS TABLE */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>PII Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {results.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.file}</TableCell>
                    <TableCell>{item.piiType}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>{item.risk}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* PDF Controls */}
            {pdfBase64 && (
              <div className="flex gap-4 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = `data:application/pdf;base64,${pdfBase64}`;
                    link.download = pdfName;
                    link.click();
                  }}
                >
                  Download PDF Report
                </Button>

                <Button onClick={() => setShowPreview(true)}>Preview PDF</Button>

                {typeof window !== "undefined" && window.electron && (
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      await window.electron?.saveAndOpenPdf(pdfBase64, pdfName);
                    }}
                  >
                    Open PDF (Desktop)
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* PDF Modal */}
      {showPreview && pdfBase64 && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-[80%] h-[80%] rounded-lg shadow-xl p-4 relative">
            <button
              className="absolute top-2 right-2 text-black"
              onClick={() => setShowPreview(false)}
            >
              ✕
            </button>

            <iframe
              src={`data:application/pdf;base64,${pdfBase64}`}
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
