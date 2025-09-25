'use client';

import { Input } from "@/components/ui/input";

interface Option {
  value: string;
  label: string;
}

interface ProfileFormFieldProps {
  label: string;
  id: string;
  value: string;
  onChange?: (id: string, value: string) => void;
  type?: 'text' | 'date' | 'select';
  options?: Option[];
  readOnly?: boolean;
  isEditing?: boolean;
}

export function ProfileFormField({
  label,
  id,
  value,
  onChange,
  type = 'text',
  options = [],
  readOnly = false,
  isEditing = false,
}: ProfileFormFieldProps) {
  const isReadOnly = readOnly || !isEditing;

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
      <label htmlFor={id} className="w-full md:w-40 font-medium text-sm text-foreground">
        {label}
      </label>

      <div className="hidden md:block text-foreground">:</div>

      <div className="w-full">
        {type === 'select' ? (
          <select
            id={id}
            name={id}
            value={value}
            onChange={(e) => onChange?.(id, e.target.value)}
            disabled={isReadOnly}
            autoComplete="off"
            className={`w-full h-10 px-3 rounded-md bg-transparent backdrop-blur-md border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
          >
            <option disabled value="" className="bg-background text-foreground">
              Select {label.toLowerCase()}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <Input
            id={id}
            type={type}
            value={value || '-'}
            onChange={(e) => onChange?.(id, e.target.value)}
            readOnly={isReadOnly}
            autoComplete="off"
            className="w-full h-9 rounded-md bg-background/50 dark:bg-neutral-800/40 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        )}
      </div>
    </div>
  );
}
