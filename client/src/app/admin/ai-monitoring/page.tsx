"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { TrendingUp, Upload, Download, Filter, ArrowUpDown, BarChart3, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { generateModelPerformanceAlert, type ModelPerformanceMetrics } from "@/utils/ai-insights";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIManagementSection } from "@/components/pages/admin/ai-management-section";

export default function AdminAIMonitoringPage() {
  const [open, setOpen] = useState(false);
  const [updatingModel, setUpdatingModel] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("Satisfaction Classifier");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [selectedModelsForComparison, setSelectedModelsForComparison] = useState<string[]>([]);

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

  // Helper function to parse accuracy percentage
  const parseAccuracy = (acc: string): number => {
    return parseFloat(acc.replace("%", ""));
  };

  // Helper function to parse date for sorting
  const parseDate = (dateStr: string): Date => {
    return new Date(dateStr);
  };

  // Calculate model performance metrics from current model
  const currentMetrics: ModelPerformanceMetrics = useMemo(() => {
    const model = models.find(m => m.name === selectedModel);
    if (!model) {
      return { accuracy: 92.8, precision: 92.5, recall: 93.1, f1: 92.8 };
    }
    return {
      accuracy: parseAccuracy(model.acc),
      precision: 92.5, // In real implementation, fetch from API
      recall: 93.1,
      f1: 92.8,
    };
  }, [selectedModel, models]);

  // Generate model performance alert
  const performanceAlert = useMemo(() => {
    return generateModelPerformanceAlert(currentMetrics, trend);
  }, [currentMetrics, trend]);

  // Filter and sort models
  const filteredAndSortedModels = useMemo(() => {
    let filtered = models.filter((m) => {
      // Status filter
      if (statusFilter !== "all" && m.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      return true;
    });

    // Sort models
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "accuracy":
          comparison = parseAccuracy(a.acc) - parseAccuracy(b.acc);
          break;
        case "date":
          comparison = parseDate(a.updated).getTime() - parseDate(b.updated).getTime();
          break;
        case "version":
          comparison = a.version.localeCompare(b.version);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [models, statusFilter, sortBy, sortOrder]);

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ["Model Name", "Version", "Accuracy", "Last Updated", "Status"];
    const rows = filteredAndSortedModels.map((m) => [
      m.name,
      m.version,
      m.acc,
      m.updated,
      m.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ai-models-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle model selection for comparison
  const toggleModelComparison = (modelName: string) => {
    setSelectedModelsForComparison((prev) =>
      prev.includes(modelName)
        ? prev.filter((name) => name !== modelName)
        : [...prev, modelName]
    );
  };

  // Get comparison data
  const comparisonData = useMemo(() => {
    if (selectedModelsForComparison.length === 0) return [];
    
    const maxIterations = Math.max(
      ...selectedModelsForComparison.map(
        (name) => trendByModel[name]?.length || 0
      )
    );

    const data: { iter: string; [key: string]: string | number }[] = [];
    for (let i = 0; i < maxIterations; i++) {
      const entry: { iter: string; [key: string]: string | number } = {
        iter: `Iter ${i + 1}`,
      };
      selectedModelsForComparison.forEach((modelName) => {
        const trend = trendByModel[modelName];
        if (trend && trend[i]) {
          entry[`${modelName} - Accuracy`] = trend[i].accuracy;
          entry[`${modelName} - F1`] = trend[i].f1;
        }
      });
      data.push(entry);
    }
    return data;
  }, [selectedModelsForComparison]);

  return (
    <div className="p-6 space-y-6">
      {/* AI Management & Control Section */}
      <Card className="bg-muted/30 border-muted-foreground/20">
        <CardHeader>
          <CardTitle className="text-xl">AI Management & Control</CardTitle>
        </CardHeader>
        <CardContent>
          <AIManagementSection />
        </CardContent>
      </Card>

      <Separator />

      {/* Model Performance Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        {/* Model Performance Alert */}
        <Card className={`bg-muted/30 border-muted-foreground/20 ${
          performanceAlert.status === "critical" ? "border-red-500/50" :
          performanceAlert.status === "warning" ? "border-yellow-500/50" :
          "border-green-500/50"
        }`}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {performanceAlert.status === "critical" && <AlertCircle className="h-5 w-5 text-red-500" />}
              {performanceAlert.status === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
              {performanceAlert.status === "good" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              Model Performance Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className={`text-sm font-medium ${
              performanceAlert.status === "critical" ? "text-red-600 dark:text-red-400" :
              performanceAlert.status === "warning" ? "text-yellow-600 dark:text-yellow-400" :
              "text-green-600 dark:text-green-400"
            }`}>
              {performanceAlert.message}
            </p>
            {performanceAlert.details.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                {performanceAlert.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top bar: actions */}
      <div className="flex items-center gap-3 flex-wrap justify-end">
        <Dialog open={comparisonOpen} onOpenChange={setComparisonOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Compare Models
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Model Comparison & Benchmarking</DialogTitle>
              <DialogDescription>
                Select multiple models to compare their performance metrics side by side.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">Select Models to Compare</h4>
                <div className="grid grid-cols-2 gap-2">
                  {models.map((m) => (
                    <div key={m.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`compare-${m.name}`}
                        checked={selectedModelsForComparison.includes(m.name)}
                        onCheckedChange={() => toggleModelComparison(m.name)}
                      />
                      <label
                        htmlFor={`compare-${m.name}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {m.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              {selectedModelsForComparison.length > 0 && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-3">Performance Comparison</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={comparisonData} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="iter" />
                          <YAxis domain={[70, 100]} />
                          <Tooltip />
                          <Legend />
                          {selectedModelsForComparison.map((modelName, idx) => {
                            const colors = ["#2563eb", "#22c55e", "#eab308", "#ef4444", "#8b5cf6", "#f97316"];
                            return (
                              <Line
                                key={`${modelName}-accuracy`}
                                type="monotone"
                                dataKey={`${modelName} - Accuracy`}
                                stroke={colors[idx % colors.length]}
                                strokeWidth={2}
                                dot={false}
                              />
                            );
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-3">Metrics Summary</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Model</TableHead>
                          <TableHead>Accuracy</TableHead>
                          <TableHead>Version</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedModelsForComparison.map((modelName) => {
                          const model = models.find((m) => m.name === modelName);
                          if (!model) return null;
                          return (
                            <TableRow key={modelName}>
                              <TableCell className="font-medium">{model.name}</TableCell>
                              <TableCell>{model.acc}</TableCell>
                              <TableCell>{model.version}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-green-500/40 text-green-400">
                                  {model.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
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

      {/* Simplified Model Performance Trend */}
      <Card className="bg-muted/30 border-muted-foreground/20">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-base">
            Model Performance Trend{" "}
            <span className="font-semibold text-foreground">({selectedModel})</span>
          </CardTitle>
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
        <CardContent>
          <div className="space-y-4">
            {/* Current Metrics Display */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
                <div className="text-xl font-semibold text-blue-700 dark:text-blue-400">
                  {currentMetrics.accuracy.toFixed(1)}%
                </div>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="text-xs text-muted-foreground mb-1">Precision</div>
                <div className="text-xl font-semibold text-green-700 dark:text-green-400">
                  {currentMetrics.precision.toFixed(1)}%
                </div>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="text-xs text-muted-foreground mb-1">Recall</div>
                <div className="text-xl font-semibold text-yellow-700 dark:text-yellow-400">
                  {currentMetrics.recall.toFixed(1)}%
                </div>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <div className="text-xs text-muted-foreground mb-1">F1-Score</div>
                <div className="text-xl font-semibold text-purple-700 dark:text-purple-400">
                  {currentMetrics.f1.toFixed(1)}%
                </div>
              </div>
            </div>
            
            {/* Simplified Trend Chart - Only Accuracy */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="iter" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[70, 100]} 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Accuracy"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "#2563eb" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lower grid: table + notifications */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Deployed models */}
        <Card className="xl:col-span-2 bg-muted/30 border-muted-foreground/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Deployed Models</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-8">
                  <div className="flex items-center">
                    <Filter className="h-3 w-3 mr-2" />
                    <SelectValue placeholder="Filter status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] h-8">
                  <div className="flex items-center">
                    <ArrowUpDown className="h-3 w-3 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="accuracy">Accuracy</SelectItem>
                  <SelectItem value="date">Last Updated</SelectItem>
                  <SelectItem value="version">Version</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="h-8"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>
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
                {filteredAndSortedModels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No models found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedModels.map((m) => (
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
                      <Drawer open={open && updatingModel === m.name} onOpenChange={(isOpen) => {
                        setOpen(isOpen);
                        if (!isOpen) setUpdatingModel(null);
                      }}>
                        <DrawerTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUpdatingModel(m.name);
                              setOpen(true);
                            }}
                          >
                            Update Model
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent className="p-0">
                          <DrawerHeader className="px-6 py-4">
                            <DrawerTitle>Update Model: {m.name}</DrawerTitle>
                          </DrawerHeader>
                          <div className="px-6 pb-6 space-y-6">
                            {/* Model Type */}
                            <div>
                              <label className="text-sm text-muted-foreground">Model Type</label>
                              <div className="mt-2">
                                <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" defaultValue={m.name}>
                                  {models.map((model) => (
                                    <option key={model.name} value={model.name}>{model.name}</option>
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
                  ))
                )}
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
            {logs.map((l, i) => (
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
