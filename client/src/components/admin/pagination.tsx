'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const [inputValue, setInputValue] = useState(page.toString());

  useEffect(() => {
    setInputValue(page.toString());
  }, [page]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setInputValue(value);
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(1, Math.min(parsed, totalPages));
      onPageChange(clamped);
    } else {
      setInputValue(page.toString());
    }
  };

  const handlePrevious = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  return (
    <div className="flex justify-between items-center gap-3 rounded-xl backdrop-blur-md transition text-muted-foreground">
      <p className="text-sm">
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </p>

      <div className="flex items-center gap-4">
        <Button
          onClick={handlePrevious}
          className="cursor-pointer w-8 h-8 rounded-md bg-muted-foreground text-background hover:bg-foreground/50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={page === 1}
        >
          <ChevronLeft size={20} />
        </Button>

        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-12 h-8 text-center font-medium border border-glass-border bg-muted-foreground text-foreground placeholder:text-background/50"
            style={{
              background: 'var(--glass-background)',
            }}
          />
          <span className="text-sm text-muted-foreground">/ {totalPages}</span>
        </div>

        <Button
          onClick={handleNext}
          className="cursor-pointer w-8 h-8 rounded-md bg-muted-foreground text-background hover:bg-foreground/50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={page === totalPages}
        >
          <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
}
