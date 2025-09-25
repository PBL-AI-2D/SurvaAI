'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useExportResponSurvei } from '../hooks/useUserSurveyResponseresult';
import { Download } from 'lucide-react';

interface ExportSurveyButtonProps {
  surveiId: string;
  surveiJudul: string;
}

export const ExportSurveyButton = ({ surveiId, surveiJudul }: ExportSurveyButtonProps) => {
  const { mutate: exportSurvey, isPending } = useExportResponSurvei(surveiId, surveiJudul);

  return (
    <div className="w-full flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="gap-2 px-4 py-2 text-sm font-semibold text-foreground bg-glass-bg border border-glass-border backdrop-blur-md shadow-sm hover:bg-glass-bg/80 transition"
            style={{
              background: 'var(--glass-background)',
              borderColor: 'var(--glass-border)',
              backdropFilter: 'var(--glass-blur)',
            }}
            disabled={isPending}
          >
            <Download className="w-4 h-4" />
            {isPending ? 'Downloading...' : 'Export Survey Responses'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-48 mt-2 rounded-md border border-glass-border bg-glass-bg backdrop-blur-md shadow-md"
          style={{
            background: 'var(--glass-background)',
            borderColor: 'var(--glass-border)',
            backdropFilter: 'var(--glass-blur)',
          }}
        >
          <DropdownMenuItem className="cursor-pointer text-sm" onClick={() => exportSurvey('csv')}>
            CSV (.csv)
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer text-sm" onClick={() => exportSurvey('xlsx')}>
            Excel (.xlsx)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
