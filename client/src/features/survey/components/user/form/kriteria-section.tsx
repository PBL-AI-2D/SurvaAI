'use client';

import { useEffect, useRef, useState } from 'react';
import { isEqual } from 'lodash';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormGroup } from '@/components/umum/form/form-group';
import { Plus, X } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface Kriteria {
  region?: string[];
  status?: string[];
  usia?: number[];
  jenis_kelamin?: string;
}

interface KriteriaSectionProps {
  kriteria: Kriteria;
  onChange: (updated: Kriteria) => void;
  disabled?: boolean;
}

export function KriteriaSection({ kriteria, onChange, disabled = false }: KriteriaSectionProps) {
  const [region, setRegion] = useState<string[]>(kriteria.region || []);
  const [regionInput, setRegionInput] = useState('');

  const [status, setStatus] = useState<string[]>(kriteria.status || []);
  const [statusInput, setStatusInput] = useState('');

  const [ageMin, setAgeMin] = useState<number | undefined>(kriteria.usia?.[0]);
  const [ageMax, setAgeMax] = useState<number | undefined>(kriteria.usia?.[kriteria.usia.length - 1]);
  const [jenis_kelamin, setJenisKelamin] = useState<string | undefined>(kriteria.jenis_kelamin);

  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    let usia: number[] | undefined = undefined;
    const hasMin = typeof ageMin === 'number';
    const hasMax = typeof ageMax === 'number';

    if (hasMin || hasMax) {
      const min = hasMin ? ageMin! : 1;
      const max = hasMax ? ageMax! : 100;
      if (min <= max) {
        usia = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      }
    }

    const next: Kriteria = {
      region: region.length > 0 ? region : undefined,
      status: status.length > 0 ? status : undefined,
      usia,
      jenis_kelamin,
    };

    if (!isEqual(next, kriteria)) {
      onChange(next);
    }
  }, [region, status, ageMin, ageMax, jenis_kelamin]);

  const handleAdd = (
    value: string,
    setter: (val: string[]) => void,
    current: string[],
    reset: () => void
  ) => {
    const trimmed = value.trim();
    if (!trimmed || current.includes(trimmed)) return;
    setter([...current, trimmed]);
    reset();
  };

  const handleRemove = (
    index: number,
    setter: (val: string[]) => void,
    current: string[]
  ) => {
    setter(current.filter((_, i) => i !== index));
  };

  const handleAgeInput = (value: string, setter: (n: number | undefined) => void) => {
    const number = parseInt(value, 10);
    if (value === '') setter(undefined);
    else if (!isNaN(number) && number >= 1 && number <= 100) setter(number);
  };

  return (
    <fieldset className="grid md:grid-cols-2 grid-cols-1 gap-5">
      <FormGroup label="Region" htmlFor="region-input">
        <div className="flex gap-2">
          <Input
            id="region-input"
            value={regionInput}
            onChange={(e) => setRegionInput(e.target.value)}
            className="w-full sm:text-sm text-xs bg-background/40 backdrop-blur-sm"
            placeholder="Add region"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            className="hover:opacity-80 backdrop-blur-sm bg-background/50 border border-glass-border text-foreground"
            onClick={() =>
              handleAdd(regionInput, setRegion, region, () => setRegionInput(''))
            }
            disabled={disabled}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {region.map((item, index) => (
            <span
              key={index}
              className="bg-background/30 backdrop-blur-md text-foreground border border-glass-border rounded px-2 py-1 sm:text-sm text-xs flex items-center"
            >
              {item}
              {!disabled && (
                <button
                  type="button"
                  className="cursor-pointer ml-2 text-red-500"
                  onClick={() => handleRemove(index, setRegion, region)}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </span>
          ))}
        </div>
      </FormGroup>

      <FormGroup label="Background Status" htmlFor="status-input">
        <div className="flex gap-2">
          <Input
            id="status-input"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
            className="w-full sm:text-sm text-xs bg-background/40 backdrop-blur-sm"
            placeholder="Add status"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            className="hover:opacity-80 backdrop-blur-sm bg-background/50 border border-glass-border text-foreground"
            onClick={() =>
              handleAdd(statusInput, setStatus, status, () => setStatusInput(''))
            }
            disabled={disabled}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {status.map((item, index) => (
            <span
              key={index}
              className="bg-background/30 backdrop-blur-md text-foreground border border-glass-border rounded px-2 py-1 sm:text-sm text-xs flex items-center"
            >
              {item}
              {!disabled && (
                <button
                  type="button"
                  className="cursor-pointer ml-2 text-red-500"
                  onClick={() => handleRemove(index, setStatus, status)}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </span>
          ))}
        </div>
      </FormGroup>

      <FormGroup label="Age Range" htmlFor="age-min">
        <div className="flex gap-4 items-center">
          <Input
            id="age-min"
            type="number"
            placeholder="Min"
            className="w-full sm:text-sm text-xs bg-background/40 backdrop-blur-sm"
            min={1}
            max={100}
            value={ageMin ?? ''}
            onChange={(e) => handleAgeInput(e.target.value, setAgeMin)}
            disabled={disabled}
          />
          <span className="text-xl">–</span>
          <Input
            type="number"
            placeholder="Max"
            className="w-full sm:text-sm text-xs bg-background/40 backdrop-blur-sm"
            min={1}
            max={100}
            value={ageMax ?? ''}
            onChange={(e) => handleAgeInput(e.target.value, setAgeMax)}
            disabled={disabled}
          />
        </div>
        {ageMin && ageMax && ageMin > ageMax && (
          <p className="text-sm text-red-500 mt-1">
            Minimum age must not be greater than maximum age.
          </p>
        )}
      </FormGroup>

      <FormGroup label="Gender" htmlFor="jenis_kelamin">
        <Select
          value={jenis_kelamin ?? 'all'}
          onValueChange={(val) => setJenisKelamin(val === 'all' ? undefined : val)}
          disabled={disabled}
        >
          <SelectTrigger
            id="jenis_kelamin"
            className="w-full bg-background/40 border border-glass-border backdrop-blur-sm text-foreground"
          >
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="laki laki">Male</SelectItem>
            <SelectItem value="perempuan">Female</SelectItem>
          </SelectContent>
        </Select>
      </FormGroup>
    </fieldset>
  );
}
