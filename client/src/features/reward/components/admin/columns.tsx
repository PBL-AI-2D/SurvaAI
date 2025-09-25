"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Hadiah } from "../../types/types";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { ButtonDeleteHadiah } from "./button-delete-hadiah";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue> {
    className?: string;
  }
}

export const getColumns = (page: number, limit: number): ColumnDef<Hadiah>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
    meta: {
      className: "w-[40px]",
    },
  },
  {
    accessorKey: "nama",
    header: "Reward Name",
  },
  {
    accessorKey: "stok",
    header: "Stock",
    cell: ({ row }) => `${row.original.stok} pcs`,
    meta: {
      className: "text-center",
    },
  },
  {
    accessorKey: "harga_poin",
    header: "Point Price",
    cell: ({ row }) => `${parseInt(row.original.harga_poin, 10).toLocaleString()} pts`,
    meta: {
      className: "text-center",
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleString("id-ID"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const hadiah = row.original;
      return (
        <div className="flex items-center justify-center gap-2">
          <Link href={`/admin/manage-reward/detail/${hadiah.id}`}>
            <Button
              variant="outline"
              size="icon"
              className="border-glass-border bg-glass-bg bg-muted text-foreground backdrop-blur-md transition hover:bg-background hover:text-foreground"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/admin/manage-reward/edit/${hadiah.id}`}>
            <Button
              variant="outline"
              size="icon"
              className="border-glass-border bg-glass-bg bg-muted text-foreground backdrop-blur-md transition hover:bg-background hover:text-foreground"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </Link>
          <ButtonDeleteHadiah hadiahId={hadiah.id} />
        </div>
      );
    },
    meta: {
      className: "w-[120px] text-center",
    },
  },
];
