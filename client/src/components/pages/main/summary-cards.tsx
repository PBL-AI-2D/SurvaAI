"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, BarChart3, Star, ArrowUp, ArrowDown } from "lucide-react";
import { AIClassificationData } from "@/features/ai-classification/types/types";

interface SummaryCardsProps {
  satisfactionData?: AIClassificationData;
  totalResponses?: number;
  isLoading?: boolean;
}

export function SummaryCards({ 
  satisfactionData, 
  totalResponses = 0,
  isLoading = false 
}: SummaryCardsProps) {
  const totalRespondents = satisfactionData?.total_respondents || totalResponses || 0;
  const avgSatisfaction = satisfactionData?.average_satisfaction 
    ? (satisfactionData.average_satisfaction * 10).toFixed(1)
    : "0.0";
  
  // Determine trend from satisfaction percentage
  const satisfiedPct = satisfactionData?.satisfaction_percentage?.satisfied || 0;
  const trend = satisfiedPct >= 60 ? "positive" : satisfiedPct >= 40 ? "stable" : "negative";
  const trendText = trend === "positive" ? "Positive trend" 
    : trend === "negative" ? "Negative trend" 
    : "Stable trend";
  const trendColor = trend === "positive" ? "text-green-600" 
    : trend === "negative" ? "text-red-600" 
    : "text-yellow-600";
  
  const activeSegments = satisfactionData?.segments?.length || 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-background border border-border rounded-lg shadow-sm">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-background border border-border rounded-lg shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Total Respondents
              </p>
              <p className="text-2xl font-bold text-foreground">{totalRespondents.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600 font-medium">
                  {satisfactionData?.satisfaction_percentage?.satisfied.toFixed(1) || 0}% satisfied
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
              <p className="text-2xl font-bold text-foreground">{avgSatisfaction}/10</p>
              <div className="flex items-center gap-1 mt-1">
                {satisfiedPct >= 50 ? (
                  <ArrowUp className="w-3 h-3 text-green-600" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-red-600" />
                )}
                <span className={`text-xs font-medium ${satisfiedPct >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                  {satisfiedPct.toFixed(1)}% satisfied
                </span>
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
              <p className={`text-lg font-bold ${trendColor}`}>{trendText}</p>
              <div className="w-16 h-8 bg-primary/10 rounded mt-1 flex items-center justify-center">
                <TrendingUp className={`w-4 h-4 ${trend === "negative" ? "rotate-180" : ""}`} />
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
              <p className="text-2xl font-bold text-foreground">{activeSegments}</p>
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
