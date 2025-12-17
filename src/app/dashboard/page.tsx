"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from '@/components/charts/PieChart';
import { BarChart } from '@/components/charts/BarChart';
import { api } from '@/lib/api';
import { MOCK_SUMMARY, MOCK_PII_TYPES, MOCK_SOURCE_SPLIT, MOCK_TOP_TABLES, MOCK_TOP_FILES } from '@/lib/mockData';

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(MOCK_SUMMARY);
  const [piiTypes, setPiiTypes] = useState<any>(MOCK_PII_TYPES);
  const [sourceSplit, setSourceSplit] = useState<any>(MOCK_SOURCE_SPLIT);
  const [topTables, setTopTables] = useState<any>(MOCK_TOP_TABLES);
  const [topFiles, setTopFiles] = useState<any>(MOCK_TOP_FILES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sum, types, split, tables, files] = await Promise.allSettled([
          api.getStatsSummary(),
          api.getPiiTypes(),
          api.getSourceSplit(),
          api.getTopTables(),
          api.getTopFiles(),
        ]);

        if (sum.status === 'fulfilled' && sum.value) setSummary(sum.value);
        if (types.status === 'fulfilled' && types.value) setPiiTypes(types.value);
        if (split.status === 'fulfilled' && split.value) setSourceSplit(split.value);
        if (tables.status === 'fulfilled' && tables.value) setTopTables(tables.value);
        if (files.status === 'fulfilled' && files.value) setTopFiles(files.value);
      } catch (e) {
        console.error("Dashboard fetch error, using mocks", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Compliance Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PII Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalPii.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-500">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{summary.riskDistribution.high.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500">Medium Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{summary.riskDistribution.medium.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-500">Low Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{summary.riskDistribution.low.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Tables by PII Count</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <BarChart data={topTables} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>PII Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={piiTypes} />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Data Source Split</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={sourceSplit} />
          </CardContent>
        </Card>
        <Card className="col-span-4">
           <CardHeader>
            <CardTitle>Top Files by PII Count</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <BarChart data={topFiles} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
