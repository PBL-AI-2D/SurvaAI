"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useThresholdConfig, useUpdateThresholdConfig } from "../hooks/useAdminControl";
import { useForm } from "react-hook-form";

export function ThresholdConfigDialog() {
  const [open, setOpen] = useState(false);
  const { data } = useThresholdConfig(open);
  const updateMutation = useUpdateThresholdConfig();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      confidence_high: 0.8,
      confidence_medium: 0.6,
      confidence_low: 0.0,
      sentiment_positive: 0.6,
      sentiment_neutral: 0.4,
      sentiment_negative: 0.0,
      satisfaction_high: 0.7,
      satisfaction_medium: 0.5,
      satisfaction_low: 0.0,
      low_confidence_warning: 0.6,
      minimum_respondents: 5,
    },
  });

  const config = data?.data;

  useEffect(() => {
    if (config && open) {
      reset(config);
    }
  }, [config, open, reset]);

  const onSubmit = async (formData: any) => {
    try {
      await updateMutation.mutateAsync(formData);
      setOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Settings className="mr-2 h-4 w-4" />
          Threshold Config
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Konfigurasi Threshold</DialogTitle>
          <DialogDescription>
            Atur threshold untuk confidence, sentiment, dan satisfaction
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Confidence Thresholds</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="confidence_high">High (≥)</Label>
                <Input
                  id="confidence_high"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register("confidence_high", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confidence_medium">Medium (≥)</Label>
                <Input
                  id="confidence_medium"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register("confidence_medium", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="low_confidence_warning">Warning (&lt;)</Label>
                <Input
                  id="low_confidence_warning"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register("low_confidence_warning", { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Sentiment Thresholds</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sentiment_positive">Positive (≥)</Label>
                <Input
                  id="sentiment_positive"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register("sentiment_positive", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sentiment_neutral">Neutral (≥)</Label>
                <Input
                  id="sentiment_neutral"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register("sentiment_neutral", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sentiment_negative">Negative (&lt;)</Label>
                <Input
                  id="sentiment_negative"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register("sentiment_negative", { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Satisfaction Thresholds</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="satisfaction_high">High (≥)</Label>
                <Input
                  id="satisfaction_high"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register("satisfaction_high", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="satisfaction_medium">Medium (≥)</Label>
                <Input
                  id="satisfaction_medium"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register("satisfaction_medium", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimum_respondents">Min Respondents</Label>
                <Input
                  id="minimum_respondents"
                  type="number"
                  min="1"
                  {...register("minimum_respondents", { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
