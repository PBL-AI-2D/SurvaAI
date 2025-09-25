'use client';

import {
  Card,
  CardContent,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Coins } from 'lucide-react';
import { StartSurveyButton } from '@/features/survey-response-submission/components/start-survey-button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatDate } from '@/utils/dateFormat';

interface SurveyCardProps {
  surveiId: string;
  judul: string;
  deskripsi?: string;
  hadiah_poin: string;
  Umum: {
    id: string;
    nama: string;
    [key: string]: any;
  };
  kriteria: Record<string, any>;
  tanggal_mulai: string;
  tanggal_berakhir: string;
}

export function SurveyCard({
  surveiId,
  judul,
  deskripsi,
  hadiah_poin,
  Umum,
  kriteria,
  tanggal_mulai,
  tanggal_berakhir,
}: SurveyCardProps) {
  const { user, isLoggedIn } = useAuth();
  const isOwner = user?.id === Umum?.id;

  const formatNumberArrayToRange = (arr: number[]) => {
    if (arr.length === 0) return '';
    const sorted = [...new Set(arr)].sort((a, b) => a - b);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    return first === last ? `${first}` : `${first}–${last}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card
          className="cursor-pointer overflow-hidden h-[280px] p-0 flex flex-col gap-0 border border-glass-border bg-glass-bg backdrop-blur-xl shadow-lg transition hover:shadow-xl hover:scale-[1.02]"
          style={{
            borderColor: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          <div className="relative flex flex-grow items-center justify-center h-40 overflow-hidden">
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 200, 100, 0.15), rgba(255, 255, 255, 0.03) 60%, transparent 90%)',
              }}
            />
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 30% 30%, rgba(255, 200, 120, 0.1), transparent 80%)',
              }}
            />
            <ClipboardList className="h-24 w-24 text-foreground/80 relative z-10" />
          </div>

          <CardContent
            className="relative text-foreground px-4 py-4 flex flex-col gap-2 flex-grow overflow-hidden"
            style={{
              background: 'var(--glass-background)',
              borderTop: '1px solid var(--glass-border)',
              backdropFilter: 'var(--glass-blur)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background:
                  'linear-gradient(to bottom right, rgba(255, 200, 120, 0.08), rgba(255, 255, 255, 0.02) 50%, transparent 90%)',
              }}
            />
            <div className="relative z-10 flex flex-col gap-2 flex-grow">
              <CardTitle className="text-lg font-semibold leading-snug line-clamp-2 min-h-[3.1rem] break-words">
                {judul}
              </CardTitle>
              <Badge
                variant="outline"
                className="w-fit gap-1 text-xs font-medium text-amber-700 border-amber-300 bg-amber-100"
              >
                <Coins className="w-4 h-4" />
                {parseInt(hadiah_poin, 10).toLocaleString()} points
              </Badge>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-3xl rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-xl px-6 py-8 overflow-hidden"
        style={{
          background: 'var(--glass-background)',
          boxShadow: 'var(--glass-shadow)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(ellipse at top left, rgba(255, 200, 100, 0.06), transparent 70%)',
          }}
        />

        <DialogHeader className="relative z-10 space-y-3">
          <DialogTitle className="text-2xl text-foreground font-bold">
            {judul}
          </DialogTitle>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Created by:</span>{' '}
              <span className="font-semibold">{Umum?.profil_klien?.nama_klien || Umum?.nama || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">Reward:</span>{' '}
              <Badge className="w-fit gap-1 text-xs font-medium text-amber-700 border-amber-300 bg-amber-100 px-2 py-1">
                <Coins className="w-4 h-4" />
                {parseInt(hadiah_poin, 10).toLocaleString()} pts
              </Badge>
            </div>
            <div>
              <span className="font-medium text-foreground">Period:</span>{' '}
              <span className="font-semibold">
                {formatDate(tanggal_mulai)} – {formatDate(tanggal_berakhir)}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="relative z-10 space-y-4 text-sm text-foreground">
          <DialogDescription className="whitespace-pre-line leading-relaxed">
            <span className="font-medium">Description:</span>{' '}
            {deskripsi || '-'}
          </DialogDescription>

          {Object.keys(kriteria).length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Criteria: </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(kriteria).map(([key, value]) => {
                  let displayValue = '';

                  if (Array.isArray(value) && value.every((v) => typeof v === 'number')) {
                    displayValue = formatNumberArrayToRange(value);
                  } else if (Array.isArray(value)) {
                    displayValue = value.join(', ');
                  } else {
                    displayValue = String(value);
                  }

                  return (
                    <Badge
                      key={key}
                      variant="outline"
                      className="bg-secondary-1/10 dark:bg-secondary-1/20 text-muted-foreground border border-secondary-1/30 dark:border-secondary-1/40 backdrop-blur-sm px-3 py-1 text-xs font-medium flex items-start gap-1 break-words max-w-full whitespace-normal"
                    >
                      <ClipboardList className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <div className="capitalize">
                        <span className="font-semibold">{key}:</span>{' '}
                        <span>{displayValue}</span>
                      </div>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 relative z-10">
          <StartSurveyButton
            surveiId={surveiId}
            isOwner={isOwner}
            isLoggedIn={isLoggedIn}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
