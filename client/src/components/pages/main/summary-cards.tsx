"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, BarChart3, Star, ArrowUp } from "lucide-react";

export function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-background border border-border rounded-lg shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Total Respondents
              </p>
              <p className="text-2xl font-bold text-foreground">3,847</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600 font-medium">
                  24.5%
                </span>
              </div>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background border border-border rounded-lg shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Avg. Satisfaction
              </p>
              <p className="text-2xl font-bold text-foreground">8.2/10</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600 font-medium">6.8%</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background border border-border rounded-lg shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Trend Prediction
              </p>
              <p className="text-lg font-bold text-green-600">Positive trend</p>
              <div className="w-16 h-8 bg-primary/10 rounded mt-1 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background border border-border rounded-lg shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Segment Overview
              </p>
              <p className="text-2xl font-bold text-foreground">4</p>
              <p className="text-xs text-muted-foreground mt-1">
                Active segments
              </p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-primary rounded-sm"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
