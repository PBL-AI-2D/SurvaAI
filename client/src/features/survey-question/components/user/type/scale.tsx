'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface Props {
  options: string[];
  onChange: (options: string[]) => void;
  disabled?: boolean;
}

export function ScaleQuestion({ options, onChange, disabled = false }: Props) {
  const addOption = () => {
    if (!disabled && options.length < 10) {
      const newIndex = options.length + 1;
      onChange([...options, `Label ${newIndex}`]);
    }
  };

  const removeOption = (index: number) => {
    if (!disabled && options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      onChange(newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    if (!disabled) {
      const newOptions = [...options];
      newOptions[index] = value;
      onChange(newOptions);
    }
  };

  const handleBlur = (index: number, value: string) => {
    if (!disabled && value.trim() === '') {
      const newOptions = [...options];
      newOptions[index] = `Label ${index + 1}`;
      onChange(newOptions);
    }
  };

  return (
    <div className="space-y-3">
      <p className="font-semibold text-foreground">Scale Labels</p>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-6 text-center font-medium text-foreground">{i + 1}.</span>
          <Input
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            onBlur={(e) => handleBlur(i, e.target.value)}
            placeholder={`Label ${i + 1}`}
            className="w-full sm:text-sm text-xs border-glass-border bg-background/40 text-foreground placeholder:text-foreground/60 backdrop-blur-sm"
            disabled={disabled}
          />
          {!disabled && options.length > 2 && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive/80"
              onClick={() => removeOption(i)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
      {!disabled && options.length < 10 && (
        <Button
          variant="outline"
          size="sm"
          className="sm:text-sm text-xs hover:text-foreground border-glass-border backdrop-blur-md bg-background/30"
          onClick={addOption}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Label
        </Button>
      )}
    </div>
  );
}
