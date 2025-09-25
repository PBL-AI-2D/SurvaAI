'use client';

import { useState, useRef, useEffect } from 'react';
import { isEqual } from 'lodash';
import { Input } from '@/components/ui/input';
import { KriteriaSection } from './kriteria-section';
import { UpdateUserSurveiPayload } from '@/features/survey/types/types';
import { DateRangeSection } from '@/components/umum/form/date-range-input';
import { FormGroup } from '@/components/umum/form/form-group';
import { useAutosave } from '@/hooks/useAutoSave';

interface SurveyFormProps {
  surveyId: string;
  initialData: UpdateUserSurveiPayload;
  onAutoSave: (data: UpdateUserSurveiPayload) => void;
  disabled?: boolean;
}

function isValidDateRange(start?: string, end?: string) {
  if (!start || !end) return false;
  return new Date(start) <= new Date(end);
}

export function SurveyForm({
  surveyId,
  initialData,
  onAutoSave,
  disabled = false,
}: SurveyFormProps) {
  const [localForm, setLocalForm] = useState(initialData);
  const [lastSavedForm, setLastSavedForm] = useState(initialData);
  const isMounted = useRef(false);

  const autosave = useAutosave((data: UpdateUserSurveiPayload) => {
    if (!disabled) {
      onAutoSave(data);
      setLastSavedForm(data);
    }
  }, 3000);

  useEffect(() => {
    if (!isEqual(initialData, localForm)) {
      setLocalForm(initialData);
      setLastSavedForm(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const { status, umpan_balik, ...formToSave } = localForm;
    const { status: _, umpan_balik: __, ...lastSaved } = lastSavedForm;

    if (
      !isEqual(formToSave, lastSaved) &&
      isValidDateRange(formToSave.tanggal_mulai, formToSave.tanggal_berakhir)
    ) {
      autosave(formToSave);
    }
  }, [localForm]);

  const handleChange = <K extends keyof UpdateUserSurveiPayload>(
    field: K,
    value: UpdateUserSurveiPayload[K]
  ) => {
    if (!disabled) {
      setLocalForm((prev) => {
        if (isEqual(prev[field], value)) return prev;
        return { ...prev, [field]: value };
      });
    }
  };

  return (
    <form className="flex flex-col gap-5">
      {localForm.status === 'rejected' && localForm.umpan_balik && (
        <div
          className="bg-red-100 dark:bg-red-400/10 text-red-700 dark:text-red-400 border border-red-400 dark:border-red-500 px-4 py-3 rounded-xl"
        >
          <strong className="font-bold block mb-1">Feedback</strong>
          <span>{localForm.umpan_balik}</span>
        </div>
      )}

      <section
        className="border border-glass-border bg-glass-bg backdrop-blur-xl shadow-sm rounded-xl md:px-5 px-3 md:py-4 py-3 flex flex-col gap-3"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <h2 className="text-xl font-semibold mb-2">General Information</h2>
        <FormGroup label="Survey Title" htmlFor="judul">
          <Input
            id="judul"
            value={localForm.judul}
            onChange={(e) => handleChange('judul', e.target.value)}
            placeholder="e.g. 2025 Customer Satisfaction Survey"
            className="sm:text-sm text-xs"
            maxLength={255}
            disabled={disabled}
          />
        </FormGroup>
        <FormGroup label="Survey Description" htmlFor="deskripsi">
          <textarea
            id="deskripsi"
            value={localForm.deskripsi}
            onChange={(e) => handleChange('deskripsi', e.target.value)}
            rows={4}
            placeholder="Briefly describe the goal and content of the survey..."
            className="w-full sm:text-sm text-xs border border-glass-border rounded-lg p-3 resize-none bg-background/40 text-foreground placeholder:text-foreground/60 backdrop-blur-sm"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
            disabled={disabled}
          />
        </FormGroup>
      </section>

      <section
        className="border border-glass-border bg-glass-bg backdrop-blur-xl shadow-sm rounded-xl md:px-5 px-3 md:py-4 py-3 flex flex-col gap-3"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <h2 className="text-xl font-semibold mb-2">Survey Requirements</h2>
        <DateRangeSection
          startDate={localForm.tanggal_mulai || ''}
          endDate={localForm.tanggal_berakhir || ''}
          onChange={({ startDate, endDate }) => {
            handleChange('tanggal_mulai', startDate);
            handleChange('tanggal_berakhir', endDate);
          }}
          disabled={disabled}
        />
        <FormGroup label="Target Respondents" htmlFor="jumlah_responden">
          <Input
            id="jumlah_responden"
            type="number"
            min="1"
            value={localForm.jumlah_responden}
            onChange={(e) => handleChange('jumlah_responden', e.target.value)}
            placeholder="Total respondent quota"
            className="bg-background/40 sm:text-sm text-xs backdrop-blur-sm"
            disabled={disabled}
          />
        </FormGroup>
      </section>

      <section
        className="border border-glass-border bg-glass-bg backdrop-blur-xl shadow-sm rounded-xl md:px-5 px-3 md:py-4 py-3 flex flex-col gap-3"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <h2 className="text-xl font-semibold mb-2">Respondent Criteria <span className="text-muted-foreground text-sm">(Optional)</span></h2>
        <KriteriaSection
          kriteria={localForm.kriteria || {}}
          onChange={(updatedKriteria) => handleChange('kriteria', updatedKriteria)}
          disabled={disabled}
        />
      </section>
    </form>
  );
}
