'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const [inputValue, setInputValue] = useState(currentPage.toString());

  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(value);
  };

  const handleInputBlur = () => {
    const pageNum = Math.max(1, Math.min(Number(inputValue), totalPages));
    onPageChange(pageNum);
  };

  return (
    <div className="flex justify-center items-center mt-10">
      <div
        className="flex items-center gap-3 px-3 py-1 rounded-xl backdrop-blur-md bg-glass-bg border border-glass-border shadow-md transition text-foreground"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="cursor-pointer p-2 rounded-md hover:bg-secondary/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-16 text-center text-base font-medium border border-glass-border bg-transparent backdrop-blur-md text-foreground placeholder:text-muted-foreground"
          />
          <span className="text-sm text-muted-foreground">/ {totalPages}</span>
        </div>

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="cursor-pointer p-2 rounded-md hover:bg-secondary/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
