"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Search, TrendingUp, Upload } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AdminAIMonitoringPage() {
  const [open, setOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Satisfaction Classifier");
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy data (wireframe)
  const kpis = [
    { label: "Model Accuracy", value: "92.8%", badge: "Excellent" },
    { label: "Precision", value: "92.5%", badge: "Excellent" },
    { label: "Recall", value: "93.1%", badge: "Excellent" },
    { label: "F1 Score", value: "92.8%", badge: "Excellent" },
  ];

  // Dummy trend data untuk masing-masing model
  const trendByModel: Record<
    string,
    { iter: string; accuracy: number; f1: number; precision: number; recall: number }[]
  > = {
    "Satisfaction Classifier": [
      { iter: "Iter 1", accuracy: 81, f1: 80, precision: 82, recall: 79 },
      { iter: "Iter 2", accuracy: 85, f1: 84, precision: 85, recall: 83 },
      { iter: "Iter 3", accuracy: 87, f1: 86, precision: 87, recall: 86 },
      { iter: "Iter 4", accuracy: 88, f1: 88, precision: 88, recall: 87 },
      { iter: "Iter 5", accuracy: 90, f1: 89, precision: 90, recall: 89 },
      { iter: "Iter 6", accuracy: 92, f1: 92, precision: 92, recall: 91 },
    ],
    "Preference Segmentation": [
      { iter: "Iter 1", accuracy: 75, f1: 73, precision: 78, recall: 70 },
      { iter: "Iter 2", accuracy: 80, f1: 78, precision: 82, recall: 76 },
      { iter: "Iter 3", accuracy: 83, f1: 82, precision: 84, recall: 81 },
      { iter: "Iter 4", accuracy: 85, f1: 84, precision: 86, recall: 83 },
      { iter: "Iter 5", accuracy: 87, f1: 86, precision: 88, recall: 85 },
      { iter: "Iter 6", accuracy: 89, f1: 88, precision: 90, recall: 87 },
    ],
    "Sentiment Analysis": [
      { iter: "Iter 1", accuracy: 88, f1: 87, precision: 89, recall: 86 },
      { iter: "Iter 2", accuracy: 90, f1: 89, precision: 91, recall: 88 },
      { iter: "Iter 3", accuracy: 92, f1: 91, precision: 93, recall: 90 },
      { iter: "Iter 4", accuracy: 93, f1: 93, precision: 94, recall: 92 },
      { iter: "Iter 5", accuracy: 94, f1: 94, precision: 95, recall: 93 },
      { iter: "Iter 6", accuracy: 95, f1: 95, precision: 96, recall: 94 },
    ],
    "Response Quality Filter": [
      { iter: "Iter 1", accuracy: 78, f1: 77, precision: 79, recall: 76 },
      { iter: "Iter 2", accuracy: 80, f1: 79, precision: 81, recall: 78 },
      { iter: "Iter 3", accuracy: 82, f1: 81, precision: 83, recall: 80 },
      { iter: "Iter 4", accuracy: 84, f1: 83, precision: 85, recall: 82 },
      { iter: "Iter 5", accuracy: 86, f1: 85, precision: 87, recall: 84 },
      { iter: "Iter 6", accuracy: 87, f1: 87, precision: 88, recall: 86 },
    ],
    "Churn Predictor": [
      { iter: "Iter 1", accuracy: 82, f1: 81, precision: 83, recall: 80 },
      { iter: "Iter 2", accuracy: 84, f1: 83, precision: 85, recall: 82 },
      { iter: "Iter 3", accuracy: 86, f1: 85, precision: 87, recall: 84 },
      { iter: "Iter 4", accuracy: 88, f1: 87, precision: 89, recall: 86 },
      { iter: "Iter 5", accuracy: 89, f1: 89, precision: 90, recall: 88 },
      { iter: "Iter 6", accuracy: 90, f1: 90, precision: 91, recall: 89 },
    ],
    "Engagement Ranker": [
      { iter: "Iter 1", accuracy: 79, f1: 78, precision: 80, recall: 77 },
      { iter: "Iter 2", accuracy: 81, f1: 80, precision: 82, recall: 79 },
      { iter: "Iter 3", accuracy: 83, f1: 82, precision: 84, recall: 81 },
      { iter: "Iter 4", accuracy: 85, f1: 84, precision: 86, recall: 83 },
      { iter: "Iter 5", accuracy: 87, f1: 86, precision: 88, recall: 85 },
      { iter: "Iter 6", accuracy: 88, f1: 88, precision: 89, recall: 87 },
    ],
  };

  const trend = trendByModel[selectedModel] ?? trendByModel["Satisfaction Classifier"];

  const models = [
    { name: "Satisfaction Classifier", version: "v2.4.1", acc: "92.8%", updated: "Mar 18, 2025", status: "Active" },
    { name: "Preference Segmentation", version: "v1.8.3", acc: "88.7%", updated: "Mar 15, 2025", status: "Active" },
    { name: "Sentiment Analysis", version: "v3.1.0", acc: "94.2%", updated: "Mar 12, 2025", status: "Active" },
    { name: "Response Quality Filter", version: "v1.2.5", acc: "88.5%", updated: "Mar 10, 2025", status: "Active" },
    { name: "Churn Predictor", version: "v3.0.2", acc: "90.1%", updated: "Mar 20, 2025", status: "Active" },
    { name: "Engagement Ranker", version: "v2.6.0", acc: "89.4%", updated: "Mar 17, 2025", status: "Active" },
  ];

  const logs = [
    { text: "Satisfaction Classifier v2.4.1 deployed successfully", time: "Mar 18, 2025 14:32" },
    { text: "Preference Model retrained with 5,000 new samples", time: "Mar 15, 2025 10:15" },
    { text: "Sentiment Analysis model accuracy improved to 94.2%", time: "Mar 12, 2025 16:48" },
    { text: "Model performance monitoring alert: Check Preference Model", time: "Mar 08, 2025 09:22" },
    { text: "Automated retraining scheduled for next week", time: "Mar 05, 2025 11:09" },
  ];

  const normalizedQuery = searchQuery.toLowerCase().trim();

  const filteredModels = models.filter((m) => {
    if (!normalizedQuery) return true;

    return (
      m.name.toLowerCase().includes(normalizedQuery) ||
      m.version.toLowerCase().includes(normalizedQuery) ||
      m.acc.toLowerCase().includes(normalizedQuery) ||
      m.updated.toLowerCase().includes(normalizedQuery) ||
      m.status.toLowerCase().includes(normalizedQuery)
    );
  });

  const filteredLogs = logs.filter((l) => {
    if (!normalizedQuery) return true;

    return (
      l.text.toLowerCase().includes(normalizedQuery) ||
      l.time.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Top bar: search */}
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
          <Input
            placeholder="Search models, metrics, logs..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="bg-muted/30 border-muted-foreground/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{k.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-semibold">{k.value}</div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{k.badge}</Badge>
                <TrendingUp className="h-4 w-4 opacity-80" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend chart + dropdown */}
      <Card className="bg-muted/30 border-muted-foreground/20">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-base text-muted-foreground">
            Model Performance Trend{" "}
            <span className="font-semibold text-foreground">({selectedModel})</span>
          </CardTitle>

          {/* Dropdown di kanan */}
          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {models.map((m) => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </CardHeader>

        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="iter" />
              <YAxis domain={[70, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#2563eb" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="f1" stroke="#22c55e" strokeDasharray="6 4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="precision" stroke="#eab308" strokeDasharray="3 3 1 3" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="recall" stroke="#ef4444" strokeDasharray="2 6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lower grid: table + notifications */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Deployed models */}
        <Card className="xl:col-span-2 bg-muted/30 border-muted-foreground/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Deployed Models</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model Name</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.map((m) => (
                  <TableRow
                    key={m.name}
                    className={cn(
                      "cursor-pointer",
                      selectedModel === m.name && "bg-muted"
                    )}
                    onClick={() => setSelectedModel(m.name)}
                  >
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.version}</TableCell>
                    <TableCell>{m.acc}</TableCell>
                    <TableCell>{m.updated}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-green-500/40 text-green-400">
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Drawer open={open} onOpenChange={setOpen}>
                        <DrawerTrigger asChild>
                          <Button size="sm" variant="secondary">Update Model</Button>
                        </DrawerTrigger>
                        <DrawerContent className="p-0">
                          <DrawerHeader className="px-6 py-4">
                            <DrawerTitle>Update Model</DrawerTitle>
                          </DrawerHeader>
                          <div className="px-6 pb-6 space-y-6">
                            {/* Model Type */}
                            <div>
                              <label className="text-sm text-muted-foreground">Model Type</label>
                              <div className="mt-2">
                                <select className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                                  {models.map((m) => (
                                    <option key={m.name}>{m.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Upload Dataset */}
                            <div>
                              <label className="text-sm text-muted-foreground">Upload Dataset</label>
                              <div className="mt-2 flex flex-col items-center justify-center border border-dashed rounded-lg py-10">
                                <Upload className="h-6 w-6 mb-2 opacity-70" />
                                <p className="text-sm">Drop CSV file here or click to browse</p>
                                <p className="text-xs text-muted-foreground mt-1">Maximum file size: 50MB</p>
                                <input type="file" accept=".csv" className="mt-3 text-sm" />
                              </div>
                            </div>

                            <Button className="w-full" onClick={() => setOpen(false)}>
                              Start Retraining
                            </Button>
                          </div>
                        </DrawerContent>
                      </Drawer>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Notification log */}
        <Card className="bg-muted/30 border-muted-foreground/20">
          <CardHeader>
            <CardTitle className="text-base">Notification Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredLogs.map((l, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-start gap-2">
                  <div className={cn("h-2 w-2 rounded-full mt-2", i === 0 ? "bg-green-400" : "bg-muted-foreground/50")} />
                  <div>
                    <p className="text-sm">{l.text}</p>
                    <p className="text-xs text-muted-foreground">{l.time}</p>
                  </div>
                </div>
                {i < logs.length - 1 && <Separator className="opacity-20" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
