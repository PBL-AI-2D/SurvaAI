'use client';

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Survei, SurveiStatus } from '../../types/types';
import { useRouter } from 'next/navigation';
import {
  FilePenLine,
  Hourglass,
  CheckCircle,
  AlertCircle,
  Ban,
  Trash2,
  Coins,
} from 'lucide-react';
import clsx from 'clsx';
import { JSX } from 'react';
import { formatDateTime } from '@/utils/dateFormat';

interface UserSurveyCardProps {
  surveys: Survei;
}

const statusConfig: Record<
  SurveiStatus,
  { label: string; icon: JSX.Element; colorClass: string }
> = {
  draft: {
    label: 'Draft',
    icon: <FilePenLine className="w-3.5 h-3.5" />,
    colorClass: 'bg-muted/40 text-muted-foreground border border-border',
  },
  under_review: {
    label: 'Under Review',
    icon: <Hourglass className="w-3.5 h-3.5" />,
    colorClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  },
  payment_pending: {
    label: 'Payment Pending',
    icon: <Hourglass className="w-3.5 h-3.5" />,
    colorClass: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-300 border border-yellow-500/20',
  },
  published: {
    label: 'Published',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    colorClass: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
  },
  closed: {
    label: 'Closed',
    icon: <Ban className="w-3.5 h-3.5" />,
    colorClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
  },
  archived: {
    label: 'Archived',
    icon: <Trash2 className="w-3.5 h-3.5" />,
    colorClass: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border border-zinc-500/20',
  },
  rejected: {
    label: 'Rejected',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    colorClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  },
};

const redirectByStatus = (status: SurveiStatus, id: string) => {
  const viewOnly: SurveiStatus[] = ['published', 'closed', 'archived'];
  return viewOnly.includes(status)
    ? `/manage-survey/overview/${id}`
    : `/manage-survey/edit/${id}`;
};

export const UserSurveyCard = ({ surveys }: UserSurveyCardProps) => {
  const router = useRouter();
  const redirectUrl = redirectByStatus(surveys.status, surveys.id);
  const status = statusConfig[surveys.status];

  const handleClick = () => {
    router.push(redirectUrl);
  };

  return (
    <Card
      onClick={handleClick}
      className={clsx(
        'relative cursor-pointer overflow-hidden flex flex-col p-0 gap-0 h-[240px] border backdrop-blur-xl transition hover:shadow-xl hover:scale-[1.01]',
        'bg-glass-bg border-glass-border text-foreground'
      )}
      style={{
        borderColor: 'var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      <CardContent className="px-4 py-3 flex flex-col gap-2 flex-grow bg-background/40 backdrop-blur-sm">
        <CardTitle className="text-xl font-bold leading-snug line-clamp-2 min-h-[2.8rem] break-words">
          {surveys.judul}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground sm:line-clamp-3 line-clamp-2">
          {surveys.deskripsi || '-'}
        </CardDescription>
        <p className="text-[0.75rem] text-muted-foreground mt-auto italic">
          Last updated:{' '} <span className="not-italic">{formatDateTime(surveys.updated_at)}</span>
        </p>
        <div className="flex sm:flex-row flex-col justify-between sm:items-center sm:gap-0 gap-1">
          <Badge
            variant="outline"
            className={clsx(
              'px-2 py-0.5 text-xs font-medium rounded-md backdrop-blur-sm flex items-center gap-1',
              status.colorClass
            )}
          >
            {status.icon}
            {status.label}
          </Badge>
          <Badge
            variant="outline"
            className="w-fit gap-1 text-xs font-medium text-amber-700 border-amber-300 bg-amber-100"
          >
            <Coins className="w-4 h-4" />
            {parseInt(surveys.hadiah_poin, 10).toLocaleString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
