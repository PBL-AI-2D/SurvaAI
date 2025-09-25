'use client';

import { useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useUpdateVisualizationType } from '../../hooks/useUserSurveyQuestion';
import {
  UpdateVisualizationTypeSurveyQuestionPayload,
  VisualizationType,
} from '../../types/types';

interface VisualizationTypeSelectProps {
  questionId: string;
  surveiId: string;
  defaultValue: string;
  tipePertanyaan: string;
}

export function VisualizationTypeSelect({
  questionId,
  surveiId,
  defaultValue,
  tipePertanyaan,
}: VisualizationTypeSelectProps) {
  const [value, setValue] = useState(defaultValue);
  const { mutate, isPending } = useUpdateVisualizationType(surveiId);

  const handleChange = (newType: string) => {
    setValue(newType);
    const payload: UpdateVisualizationTypeSurveyQuestionPayload = {
      tipe_visualisasi: newType as VisualizationType,
    };
    mutate({ id: questionId, payload });
  };

  const chartOptions =
    tipePertanyaan === 'essay'
      ? ['text', 'wordcloud', 'sentiment_analysis']
      : ['pie', 'bar', 'doughnut', 'radar'];

  return (
    <div className="md:max-w-xs w-full space-y-1">
      <Label htmlFor="chart-select" className="text-foreground/80">
        Select chart type
      </Label>
      <Select value={value} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger
          id="chart-select"
          className="w-full border border-glass-border bg-glass-bg backdrop-blur-md shadow-sm text-foreground"
          style={{
            background: 'var(--glass-background)',
            borderColor: 'var(--glass-border)',
            backdropFilter: 'var(--glass-blur)',
          }}
        >
          <SelectValue placeholder="Choose a chart" />
        </SelectTrigger>
        <SelectContent
          className="bg-glass-bg border border-glass-border text-foreground backdrop-blur-md"
          style={{
            background: 'var(--glass-background)',
            borderColor: 'var(--glass-border)',
            backdropFilter: 'var(--glass-blur)',
          }}
        >
          {chartOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option
                .replace('_', ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
