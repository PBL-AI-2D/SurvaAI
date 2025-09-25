"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pengguna } from "../../types/types"
import { Button } from "@/components/ui/button"
import { Eye, Pencil } from "lucide-react"
import Link from "next/link"
import { ButtonDeletePengguna } from "../button-delete"

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends unknown, TValue> {
    className?: string
  }
}

export const getColumns = (page: number, limit: number): ColumnDef<Pengguna>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
    meta: {
      className: "w-[40px]",
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "Admin.nama_admin",
    header: "Name",
    cell: ({ row }) => row.original.Admin?.nama_admin ?? "-",
  },
  {
    accessorKey: "Admin.kontak_darurat",
    header: "Emergency Contact",
    cell: ({ row }) => row.original.Admin?.kontak_darurat ?? "-",
  },
  {
    accessorKey: "last_sign_in_at",
    header: "Last Login",
    cell: ({ row }) =>
      row.original.last_sign_in_at
        ? new Date(row.original.last_sign_in_at).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "-",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const pengguna = row.original;
      return (
        <div className="flex items-center justify-center gap-2">
          <Link href={`/admin/manage-admin/detail/${pengguna.id}`}>
            <Button
              variant="outline"
              size="icon"
              className="border-glass-border bg-glass-bg bg-muted text-foreground backdrop-blur-md transition hover:bg-background hover:text-foreground"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/admin/manage-admin/edit/${pengguna.id}`}>
            <Button
              variant="outline"
              size="icon"
              className="border-glass-border bg-glass-bg bg-muted text-foreground backdrop-blur-md transition hover:bg-background hover:text-foreground"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </Link>
          <ButtonDeletePengguna userId={pengguna.id} />
        </div>
      )
    },
    meta: {
      className: "w-[120px] text-center",
    },
  }
]
