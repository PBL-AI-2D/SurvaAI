'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Survei } from '../../types/types'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, CheckCircle, Trash2, AlertCircle, Ban, FilePenLine, Hourglass } from 'lucide-react'
import Link from 'next/link'
import { ButtonDeleteSurvey } from './button-delete'
import React, { JSX } from 'react'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends unknown, TValue> {
    className?: string
  }
}

const statusConfig: Record<
  Survei['status'],
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
}

export const getColumns = (page: number, limit: number): ColumnDef<Survei>[] => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
    meta: {
      className: 'w-[40px]',
    },
  },
  {
    accessorKey: 'judul',
    header: 'Title',
  },
  {
    accessorKey: 'Umum.Pengguna.email',
    header: 'Client Email',
    cell: ({ row }) => {
      const email = row.original.Umum?.Pengguna?.email;
      return (
        <span className={!email ? "italic text-muted-foreground" : ""}>
          {email || "[Deleted User]"}
        </span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      const config = statusConfig[status]

      if (!config) return '-'

      return (
        <div
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${config.colorClass}`}
        >
          {config.icon}
          {config.label}
        </div>
      )
    },
    meta: {
      className: 'text-center',
    },
  },
  {
    accessorKey: 'tanggal_mulai',
    header: 'Start Date',
    cell: ({ row }) =>
      new Date(row.original.tanggal_mulai).toLocaleDateString('id-ID'),
  },
  {
    accessorKey: 'tanggal_berakhir',
    header: 'End Date',
    cell: ({ row }) =>
      new Date(row.original.tanggal_berakhir).toLocaleDateString('id-ID'),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const survei = row.original
      return (
        <div className="flex items-center justify-center gap-2">
          <Link href={`/admin/manage-survey/detail/${survei.id}`}>
            <Button
              variant="outline"
              size="icon"
              className="border-glass-border bg-glass-bg bg-muted text-foreground backdrop-blur-md transition hover:bg-background hover:text-foreground"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/admin/manage-survey/edit/${survei.id}`}>
            <Button
              variant="outline"
              size="icon"
              className="border-glass-border bg-glass-bg bg-muted text-foreground backdrop-blur-md transition hover:bg-background hover:text-foreground"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </Link>
          <ButtonDeleteSurvey surveyId={survei.id} />
        </div>
      )
    },
    meta: {
      className: 'w-[120px] text-center',
    },
  },
]
