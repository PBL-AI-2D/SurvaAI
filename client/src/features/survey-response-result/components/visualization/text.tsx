'use client';

import { ResponSummary } from '../../types/types';

interface TextAnswersChartProps {
  summary: ResponSummary;
}

export default function TextAnswersChart({ summary }: TextAnswersChartProps) {
  const answers = summary.summary as string[];

  return (
    <div className="w-full max-h-[300px] overflow-y-auto rounded-xl py-3 space-y-2 pr-2">
      {answers.length === 0 ? (
        <p className="text-muted-foreground italic text-sm text-center">
          No answers yet.
        </p>
      ) : (
        answers.map((text, idx) => (
          <div
            key={idx}
            className="rounded-lg px-3 py-2 text-sm text-foreground border border-glass-border bg-glass-bg backdrop-blur-md shadow-sm"
            style={{
              background: 'var(--glass-background)',
              borderColor: 'var(--glass-border)',
              backdropFilter: 'var(--glass-blur)',
            }}
          >
            {text}
          </div>
        ))
      )}
    </div>
  );
}
