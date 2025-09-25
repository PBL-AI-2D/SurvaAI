'use client';

import { FormSurveyPrice } from "@/features/price-configuration/components/form-survey-price";

export function ConfigurationSurveyPricePage() {
  return (
    <section className="flex flex-col flex-grow text-foreground gap-4">
      <h1 className="text-3xl font-bold">Config - Survey Price</h1>

      <FormSurveyPrice />
    </section>
  );
}
