'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface Props {
  opsi: string[];
  onChange: (opsi: string[]) => void;
  disabled?: boolean;
}

export function DropdownQuestion({ opsi, onChange, disabled = false }: Props) {
  const addOption = () => {
    if (!disabled) {
      const newIndex = opsi.length + 1;
      onChange([...opsi, `Option ${newIndex}`]);
    }
  };

  const removeOption = (index: number) => {
    if (!disabled) {
      const newOptions = opsi.filter((_, i) => i !== index);
      onChange(newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    if (!disabled) {
      const newOptions = [...opsi];
      newOptions[index] = value;
      onChange(newOptions);
    }
  };

  const handleBlur = (index: number, value: string) => {
    if (!disabled && value.trim() === '') {
      const newOptions = [...opsi];
      newOptions[index] = `Option ${index + 1}`;
      onChange(newOptions);
    }
  };

  return (
    <div className="space-y-3">
      <p className="font-semibold text-foreground">Dropdown Options</p>
      {opsi.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-6 text-center font-medium text-muted-foreground">{i + 1}.</span>
          <Input
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            onBlur={(e) => handleBlur(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
            className="w-full sm:text-sm text-xs bg-background/40 backdrop-blur-sm text-foreground placeholder:text-foreground/60 border-glass-border"
            disabled={disabled}
          />
          {!disabled && opsi.length > 1 && (
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
      {!disabled && (
        <Button
          variant="outline"
          size="sm"
          className="sm:text-sm text-xs hover:text-foreground border-glass-border backdrop-blur-md bg-background/30"
          onClick={addOption}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Option
        </Button>
      )}
    </div>
  );
}
