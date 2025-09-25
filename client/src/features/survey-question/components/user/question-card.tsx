'use client';

import { useEffect, useRef, useState } from 'react';
import { useAutosave } from '@/hooks/useAutoSave';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { CheckboxQuestion } from './type/checkbox';
import { DropdownQuestion } from './type/dropdown';
import { RadioQuestion } from './type/radio';
import { ScaleQuestion } from './type/scale';
import { EssayQuestion } from './type/essay';
import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { QuestionType } from '../../types/types';

export interface QuestionCardProps {
  question: {
    id: string;
    teks_pertanyaan: string;
    tipe_pertanyaan: QuestionType;
    opsi?: string[];
    is_required?: boolean;
    index?: number;
  };
  onChange: (id: string, updates: Partial<QuestionCardProps['question']>) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  disabled?: boolean;
}

export function QuestionCard({
  question,
  onChange,
  onDelete,
  isDeleting = false,
  disabled = false,
}: QuestionCardProps) {
  const [localQuestion, setLocalQuestion] = useState(question);
  const hasMounted = useRef(false);

  const autosave = useAutosave<Partial<QuestionCardProps['question']>>(
    (updates) => {
      if (!disabled) {
        onChange(question.id, updates);
      }
    },
    3000
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const { teks_pertanyaan, tipe_pertanyaan, opsi, is_required } = localQuestion;
    autosave({
      teks_pertanyaan,
      tipe_pertanyaan,
      opsi: opsi?.map((opt, i) => opt.trim() || `Option ${i + 1}`),
      is_required,
    });
  }, [localQuestion]);

  const handleInputChange = (
    field: keyof typeof localQuestion,
    value: any
  ) => {
    setLocalQuestion((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (val: QuestionType) => {
    if (val === 'skala') {
      setLocalQuestion((prev) => ({
        ...prev,
        tipe_pertanyaan: 'skala',
        opsi: prev.opsi ?? Array(5).fill(''),
      }));
    } else if (val === 'essay') {
      setLocalQuestion((prev) => ({
        ...prev,
        tipe_pertanyaan: 'essay',
        opsi: undefined,
      }));
    } else {
      setLocalQuestion((prev) => ({
        ...prev,
        tipe_pertanyaan: val,
        opsi: prev.opsi ?? ['', ''],
      }));
    }
  };

  return (
    <Card
      className="rounded-xl p-6 gap-1 border border-glass-border bg-glass-bg backdrop-blur-xl shadow-md sm:text-sm text-xs text-foreground"
      style={{
        background: 'var(--glass-background)',
        borderColor: 'var(--glass-border)',
        backdropFilter: 'var(--glass-blur)',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      <div className="flex items-center justify-between w-full mb-2">
        {typeof question.index === 'number' && (
          <div className="text-muted-foreground font-semibold">
            Question {question.index}
          </div>
        )}
        <Button
          variant="ghost"
          onClick={() => onDelete(question.id)}
          disabled={isDeleting || disabled}
        >
          {isDeleting ? (
            <div className="animate-spin border-2 border-black dark:border-white border-t-transparent rounded-full size-5" />
          ) : (
            <Trash2 className="text-red-500/60 sm:size-5 size-4" />
          )}
        </Button>
      </div>

      <textarea
        value={localQuestion.teks_pertanyaan}
        onChange={(e) => handleInputChange('teks_pertanyaan', e.target.value)}
        placeholder="Write your question here..."
        rows={1}
        className="rounded-lg p-3 resize-none overflow-hidden border border-glass-border bg-background/40 backdrop-blur-sm text-foreground placeholder:text-foreground/60"
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = `${target.scrollHeight}px`;
        }}
        maxLength={500}
        disabled={disabled}
      />

      <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
        <div className="flex flex-col gap-2 mt-4">
          <label className="font-medium">Question Type</label>
          <Select
            value={localQuestion.tipe_pertanyaan}
            onValueChange={(val) => handleTypeChange(val as QuestionType)}
            disabled={disabled}
          >
            <SelectTrigger
              className="w-full border border-glass-border bg-background/30 backdrop-blur-sm text-foreground"
              disabled={disabled}
            >
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pilihan_ganda">Multiple Choice</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
              <SelectItem value="dropdown">Drop-down</SelectItem>
              <SelectItem value="skala">Scale</SelectItem>
              <SelectItem value="essay">Essay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:row-start-1 mt-4">
          {localQuestion.tipe_pertanyaan === 'pilihan_ganda' && (
            <RadioQuestion
              opsi={localQuestion.opsi || ['']}
              onChange={(opsi) => handleInputChange('opsi', opsi)}
              disabled={disabled}
            />
          )}
          {localQuestion.tipe_pertanyaan === 'checkbox' && (
            <CheckboxQuestion
              opsi={localQuestion.opsi || ['']}
              onChange={(opsi) => handleInputChange('opsi', opsi)}
              disabled={disabled}
            />
          )}
          {localQuestion.tipe_pertanyaan === 'dropdown' && (
            <DropdownQuestion
              opsi={localQuestion.opsi || ['']}
              onChange={(opsi) => handleInputChange('opsi', opsi)}
              disabled={disabled}
            />
          )}
          {localQuestion.tipe_pertanyaan === 'skala' && (
            <ScaleQuestion
              options={localQuestion.opsi || Array(5).fill('')}
              onChange={(opsi) => handleInputChange('opsi', opsi)}
              disabled={disabled}
            />
          )}
          {localQuestion.tipe_pertanyaan === 'essay' && (
            <EssayQuestion disabled={disabled} />
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 mt-4">
        <Checkbox
          id={`required-${question.id}`}
          checked={localQuestion.is_required}
          onCheckedChange={(checked) =>
            handleInputChange('is_required', !!checked)
          }
          disabled={disabled}
        />
        <label
          htmlFor={`required-${question.id}`}
          className="font-medium leading-none"
        >
          Required
        </label>
      </div>
    </Card>
  );
}
