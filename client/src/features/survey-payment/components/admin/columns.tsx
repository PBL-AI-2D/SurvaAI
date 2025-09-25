"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AdminSurveyPayment } from "../../types/types"
import {
  Eye,
  BadgeCheck,
  Clock,
  XCircle,
  TimerOff,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ButtonDeleteSurveyPayment } from "./button-delete"
import { JSX } from "react"

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends unknown, TValue> {
    className?: string
  }
}

const paymentStatusConfig: Record<
  AdminSurveyPayment["status"],
  { label: string; icon: JSX.Element; colorClass: string }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="w-3.5 h-3.5" />,
    colorClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-300 border border-yellow-500/20",
  },
  paid: {
    label: "Paid",
    icon: <BadgeCheck className="w-3.5 h-3.5" />,
    colorClass: "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
  },
  failed: {
    label: "Failed",
    icon: <XCircle className="w-3.5 h-3.5" />,
    colorClass: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  },
  expired: {
    label: "Expired",
    icon: <TimerOff className="w-3.5 h-3.5" />,
    colorClass: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border border-zinc-500/20",
  },
}

export const getColumns = (page: number, limit: number): ColumnDef<AdminSurveyPayment>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
    meta: {
      className: "w-[40px]",
    },
  },
  {
    accessorKey: "judul_survei",
    header: "Survey Title",
    cell: ({ row }) => {
      const judul = row.original.Survei?.judul
      return (
        <span className={!judul ? "italic text-muted-foreground" : ""}>
          {judul || "[Deleted Survey]"}
        </span>
      )
    },
  },
  {
    accessorKey: "email_klien",
    header: "Client Email",
    cell: ({ row }) => {
      const email = row.original.Umum?.Pengguna?.email
      return (
        <span className={!email ? "italic text-muted-foreground" : ""}>
          {email || "[Deleted User]"}
        </span>
      )
    },
  },
  {
    accessorKey: "jumlah_tagihan",
    header: "Invoice",
    cell: ({ row }) =>
      `Rp ${Number(row.original.jumlah_tagihan).toLocaleString("id-ID")}`,
    meta: {
      className: "text-right",
    },
  },
  {
    accessorKey: "jumlah_dibayar",
    header: "Paid",
    cell: ({ row }) =>
      `Rp ${Number(row.original.jumlah_dibayar).toLocaleString("id-ID")}`,
    meta: {
      className: "text-right",
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const config = paymentStatusConfig[status]

      if (!config) return "-"

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
      className: "text-center",
    },
  },
  {
    accessorKey: "metode_pembayaran",
    header: "Method",
    cell: ({ row }) => row.original.metode_pembayaran || "-",
    meta: {
      className: "text-center",
    },
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "medium",
      }),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const payment = row.original
      return (
        <div className="flex items-center justify-center gap-2">
          <Link href={`/admin/manage-payment/detail/${payment.id}`}>
            <Button
              variant="outline"
              size="icon"
              className="border-glass-border bg-glass-bg bg-muted text-foreground backdrop-blur-md transition hover:bg-background hover:text-foreground"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <ButtonDeleteSurveyPayment paymentId={payment.id} />
        </div>
      )
    },
    meta: {
      className: "w-[120px] text-center",
    },
  },
]
