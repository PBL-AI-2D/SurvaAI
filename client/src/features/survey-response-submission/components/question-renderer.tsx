'use client';

import { PertanyaanSurvei } from '@/features/survey/types/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionRendererProps {
  question: PertanyaanSurvei;
  value: any;
  onChange: (value: any) => void;
}

export function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  const { teks_pertanyaan, tipe_pertanyaan, opsi, is_required } = question;

  const safeString = (val: any) => (typeof val === 'string' ? val : '');

  return (
    <div className="w-full flex flex-col gap-4 text-foreground">
      <label className="font-medium text-base leading-relaxed">
        {teks_pertanyaan}
        {is_required && <span className="text-destructive ml-1">*</span>}
      </label>

      {/* Pilihan Ganda */}
      {tipe_pertanyaan === 'pilihan_ganda' && (
        <div className="space-y-2">
          {opsi.map((opt) => {
            const isSelected = safeString(value) === opt;
            return (
              <label
                key={opt}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all
                  border backdrop-blur-[var(--glass-blur)]
                  ${isSelected
                    ? 'bg-secondary-1/25 dark:bg-secondary-1/15 border-[var(--glass-border)]'
                    : 'bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-muted/40'
                  }
                `}
              >
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition
                    ${isSelected ? 'bg-foreground/70 border-foreground' : 'border-muted-foreground'}`}
                >
                  {isSelected && <Circle className="w-2.5 h-2.5 text-foreground/30" />}
                </span>
                <input
                  type="radio"
                  name={question.id}
                  value={opt}
                  checked={isSelected}
                  onChange={() => onChange(opt)}
                  className="hidden"
                />
                {opt}
              </label>
            );
          })}
        </div>
      )}

      {/* Checkbox */}
      {tipe_pertanyaan === 'checkbox' && (
        <div className="space-y-2">
          {opsi.map((opt) => {
            const selected = Array.isArray(value) ? value : [];
            const isChecked = selected.includes(opt);
            return (
              <label
                key={opt}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all
                  border backdrop-blur-[var(--glass-blur)]
                  ${isChecked
                    ? 'bg-secondary-1/25 dark:bg-secondary-1/15 border-[var(--glass-border)]'
                    : 'bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-muted/40'
                  }
                `}
              >
                <span
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition
                    ${isChecked ? 'bg-foreground/70 border-foreground' : 'border-muted-foreground'}`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 text-foreground/30" />}
                </span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    const set = new Set(selected);
                    if (e.target.checked) {
                      set.add(opt);
                    } else {
                      set.delete(opt);
                    }
                    const updated = Array.from(set);
                    onChange(updated.length > 0 ? updated : null);
                  }}
                  className="hidden"
                />
                {opt}
              </label>
            );
          })}
        </div>
      )}

      {/* Dropdown */}
      {tipe_pertanyaan === 'dropdown' && (
        <Select value={safeString(value)} onValueChange={onChange}>
          <SelectTrigger
            className={`
              w-full px-4 py-2 rounded-lg border text-base transition-colors
              bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-[var(--glass-blur)]
              hover:bg-muted/40 text-foreground
            `}
          >
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent
            className="bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-[var(--glass-blur)] text-foreground"
          >
            {opsi.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Skala */}
      {tipe_pertanyaan === 'skala' && (
        <div className="flex flex-col gap-3">
          <div className="text-sm text-center text-muted-foreground px-1">
            <span>{opsi[0]}</span>
          </div>
          <div className="flex flex-col gap-2">
            {opsi.map((opt, index) => {
              const isSelected = safeString(value) === opt;
              return (
                <Button
                  key={index}
                  type="button"
                  onClick={() => onChange(opt)}
                  className={`
                    w-full text-left text-sm font-medium rounded-xl px-4 py-3 transition-all
                    border backdrop-blur-[var(--glass-blur)] text-foreground
                    ${isSelected
                      ? 'bg-secondary-1/25 dark:bg-secondary-1/15 border-[var(--glass-border)]'
                      : 'bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-muted/40'
                    }
                  `}
                >
                  {opt}
                </Button>
              );
            })}
          </div>
          <div className="text-sm text-center text-muted-foreground px-1">
            <span>{opsi[opsi.length - 1]}</span>
          </div>
        </div>
      )}

      {/* Essay */}
      {tipe_pertanyaan === 'essay' && (
        <textarea
          className={`
            w-full rounded-xl px-4 py-3 resize-none
            border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]
            text-foreground placeholder:text-muted-foreground transition-all
            focus:outline-none focus:ring-1 focus:ring-secondary-1/40
          `}
          value={safeString(value)}
          onChange={(e) => {
            const val = e.target.value.trim();
            onChange(val.length > 0 ? val : null);
          }}
          placeholder="Write your answer here..."
          rows={4}
        />
      )}
    </div>
  );
}
