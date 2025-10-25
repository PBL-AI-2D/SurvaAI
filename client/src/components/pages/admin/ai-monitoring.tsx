"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AIMonitoringPage() {
  return (
    <section className="grid gap-4 text-foreground">
      <h1 className="text-3xl font-bold">Monitoring Akurasi Model</h1>

      <Card className="border-muted-foreground/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary">AI Insight</Badge>
            <span>Model menunjukkan penurunan akurasi 5% dalam minggu terakhir.</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Akurasi</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">87.2%</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Precision</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">85.1%</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recall</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">89.0%</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">F1-Score</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">87.0%</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Perubahan Akurasi Model (Real-time)</CardTitle></CardHeader>
          <CardContent className="h-48 grid place-items-center text-muted-foreground">[chart placeholder]</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Confusion Matrix</CardTitle></CardHeader>
          <CardContent>
            <div className="w-full overflow-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2"></th>
                    <th className="text-center p-2">P</th>
                    <th className="text-center p-2">N</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">P</td>
                    <td className="p-2 text-center bg-muted">96</td>
                    <td className="p-2 text-center">12</td>
                  </tr>
                  <tr>
                    <td className="p-2">N</td>
                    <td className="p-2 text-center">9</td>
                    <td className="p-2 text-center bg-muted">81</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Log Performa Model</CardTitle></CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <div className="grid grid-cols-3 gap-4 opacity-80"><span>2025-09-30 10:12</span><span>Dataset_A</span><span>Akurasi: 87.2%, F1: 87.0%</span></div>
            <div className="grid grid-cols-3 gap-4 opacity-80"><span>2025-09-29 09:45</span><span>Dataset_A</span><span>Akurasi: 89.5%, F1: 88.9%</span></div>
            <div className="grid grid-cols-3 gap-4 opacity-80"><span>2025-09-28 11:20</span><span>Dataset_B</span><span>Akurasi: 91.8%, F1: 90.5%</span></div>
            <div className="grid grid-cols-3 gap-4 opacity-80"><span>2025-09-27 08:30</span><span>Dataset_B</span><span>Akurasi: 92.2%, F1: 91.0%</span></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Pembaruan Model AI</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary">AI Insight</Badge>
            <span>Model terbaru meningkatkan F1-Score sebesar 12% dibanding versi sebelumnya.</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Train Ulang Model</Button>
            <Button variant="outline">Update Model</Button>
            <Button variant="secondary">Rollback Model</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="text-sm">Pilih Dataset:</div>
            <div className="sm:col-span-2">
              <Select defaultValue="Dataset_A">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih dataset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dataset_A">Dataset_A</SelectItem>
                  <SelectItem value="Dataset_B">Dataset_B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm">Parameter Training:</div>
            <div className="sm:col-span-2 text-sm text-muted-foreground">Contoh: lr=0.01, epoch=20</div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}




