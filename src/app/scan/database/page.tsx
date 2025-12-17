"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { Loader2, Database } from "lucide-react";

export default function DBScanPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [dbType, setDbType] = useState("mysql");

  const [credentials, setCredentials] = useState({
    host: "",
    port: "",
    username: "",
    password: "",
    database: "",
  });

  // NEW → PDF STATES
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const handleScan = async () => {
    setLoading(true);
    setResults([]);
    setPdfBase64(null);

    try {
      const res = await api.scanDatabase({
        dbType,
        ...credentials,
      });

      const data = res.results || [];
      setResults(data);

      // save PDF from backend response
      if (res.pdfBase64) {
        setPdfBase64(res.pdfBase64);
        setPdfName(res.fileName || "db_scan_report.pdf");
      }
    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Database Scanner</h1>

      <Card>
        <CardHeader>
          <CardTitle>Scan Setup</CardTitle>
          <CardDescription>Connect to a database and scan for PII.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* DB selection */}
          <Select onValueChange={setDbType} defaultValue="mysql">
            <SelectTrigger>
              <SelectValue placeholder="Select DB" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mysql">MySQL</SelectItem>
              <SelectItem value="postgres">PostgreSQL</SelectItem>
              <SelectItem value="mssql">SQL Server</SelectItem>
              <SelectItem value="oracle">Oracle</SelectItem>
              <SelectItem value="mongo">MongoDB</SelectItem>
            </SelectContent>
          </Select>

          {/* DB Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Host"
              value={credentials.host}
              onChange={(e) => handleInputChange("host", e.target.value)}
            />
            <Input
              placeholder="Port"
              value={credentials.port}
              onChange={(e) => handleInputChange("port", e.target.value)}
            />
            <Input
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
            />
            <Input
              placeholder="Password"
              type="password"
              value={credentials.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
            <Input
              placeholder="Database Name"
              value={credentials.database}
              onChange={(e) => handleInputChange("database", e.target.value)}
            />
          </div>

          <div className="flex flex-col items-center justify-center p-6 space-y-4 border-2 border-dashed rounded-lg">
            <Database className="w-16 h-16 text-muted-foreground" />
            <p className="text-muted-foreground">Enter details and start scanning.</p>

            <Button onClick={handleScan} disabled={loading} size="lg">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Scanning..." : "Connect & Scan"}
            </Button>
          </div>
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
                  <TableHead>Table</TableHead>
                  <TableHead>Column</TableHead>
                  <TableHead>PII Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {results.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.table}</TableCell>
                    <TableCell>{item.column}</TableCell>
                    <TableCell>{item.piiType}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>{item.risk}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* PDF BUTTONS */}
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
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* PDF PREVIEW MODAL */}
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
