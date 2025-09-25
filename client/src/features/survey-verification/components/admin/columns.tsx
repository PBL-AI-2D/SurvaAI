"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Survei } from "@/features/survey/types/types"
import { Button } from "@/components/ui/button"
import { SquareChartGantt } from "lucide-react"
import Link from "next/link"

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends unknown, TValue> {
    className?: string
  }
}

export const getColumns = (page: number, limit: number): ColumnDef<Survei>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
    meta: {
      className: "w-[40px]",
    },
  },
  {
    accessorKey: "judul",
    header: "Title",
  },
  {
    accessorKey: "Umum.Pengguna.email",
    header: "Client Email",
    cell: ({ row }) => {
      const email = row.original.Umum?.Pengguna?.email;
      return (
        <span className={!email ? "italic text-muted-foreground" : ""}>
          {email || "[Deleted User]"}
        </span>
      )
    },
  },
  {
    accessorKey: "tanggal_mulai",
    header: "Start Date",
    cell: ({ row }) =>
      new Date(row.original.tanggal_mulai).toLocaleDateString("id-ID"),
  },
  {
    accessorKey: "tanggal_berakhir",
    header: "End Date",
    cell: ({ row }) =>
      new Date(row.original.tanggal_berakhir).toLocaleDateString("id-ID"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const survei = row.original
      return (
        <div className="flex items-center justify-center gap-2">
          <Link href={`/admin/manage-verification/review/${survei.id}`}>
            <Button
              size="sm"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border border-glass-border bg-glass-bg bg-muted-foreground text-background backdrop-blur-md hover:bg-foreground/50 transition hover:text-background"
            >
              <SquareChartGantt className="w-3.5 h-3.5" />
              Review
            </Button>
          </Link>
        </div>
      )
    },
    meta: {
      className: "w-[80px] text-center",
    },
  },
]
