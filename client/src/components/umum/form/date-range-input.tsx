'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { FormGroup } from '@/components/umum/form/form-group';

interface DateRangeSectionProps {
  startDate: string;
  endDate: string;
  onChange: (payload: { startDate: string; endDate: string }) => void;
  disabled?: boolean;
}

function formatDateUTC(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDateOnlyUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDaysUTC(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setUTCDate(newDate.getUTCDate() + days);
  return getDateOnlyUTC(newDate);
}

export function DateRangeSection({
  startDate,
  endDate,
  onChange,
  disabled = false,
}: DateRangeSectionProps) {
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);
  const [error, setError] = useState('');
  const [duration, setDuration] = useState<number | null>(null);

  const todayUTC = getDateOnlyUTC(new Date());
  const minStartDate = formatDateUTC(addDaysUTC(todayUTC, 3));

  useEffect(() => {
    const startDateObj = getDateOnlyUTC(new Date(start));
    const endDateObj = getDateOnlyUTC(new Date(end));

    if (disabled) {
      const diffTime = endDateObj.getTime() - startDateObj.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDuration(days > 0 ? days : null);
      setError('');
      return;
    }

    const isStartValid = startDateObj >= addDaysUTC(todayUTC, 3);
    const isEndValid = endDateObj > startDateObj;

    if (!isStartValid) {
      setError('Start date must be at least 3 days from today.');
      setDuration(null);
    } else if (!isEndValid) {
      setError('End date must be at least 1 day after the start date.');
      setDuration(null);
    } else {
      setError('');
      const diffTime = endDateObj.getTime() - startDateObj.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDuration(days);
      onChange({ startDate: start, endDate: end });
    }
  }, [start, end, disabled, onChange]);

  return (
    <div className="grid md:grid-cols-3 grid-cols-1 w-full gap-5">
      <FormGroup label="Start Date" htmlFor="start-date">
        <Input
          id="start-date"
          type="date"
          value={start}
          min={minStartDate}
          className="sm:text-sm text-xs w-full bg-background/40 backdrop-blur-sm border border-glass-border text-foreground"
          onChange={(e) => setStart(e.target.value)}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Minimum: {minStartDate}
        </p>
      </FormGroup>

      <FormGroup label="End Date" htmlFor="end-date">
        <Input
          id="end-date"
          type="date"
          value={end}
          min={formatDateUTC(addDaysUTC(new Date(start), 1))}
          className="sm:text-sm text-xs w-full bg-background/40 backdrop-blur-sm border border-glass-border text-foreground"
          onChange={(e) => setEnd(e.target.value)}
          disabled={disabled}
        />
      </FormGroup>

      <FormGroup label="Total Duration (days)" htmlFor="duration">
        <Input
          id="duration"
          type="text"
          className="sm:text-sm text-xs w-full bg-background/40 backdrop-blur-sm border border-glass-border text-foreground"
          value={duration ? `${duration} days` : ''}
          readOnly
          disabled
        />
      </FormGroup>

      {error && (
        <p className="text-sm text-destructive col-span-full">{error}</p>
      )}
    </div>
  );
}
