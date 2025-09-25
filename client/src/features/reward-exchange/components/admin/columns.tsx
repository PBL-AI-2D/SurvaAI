"use client";

import { ColumnDef } from "@tanstack/react-table";
import { RewardExchange } from "../../types/types";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { ButtonDeleteRewardExchange } from "./button-delete-reward-exchange";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue> {
    className?: string;
  }
}

export const getColumns = (page: number, limit: number): ColumnDef<RewardExchange>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
    meta: {
      className: "w-[40px]",
    },
  },
  {
    accessorKey: "Umum.nama",
    header: "User Name",
    cell: ({ row }) => {
      const nama = row.original.Umum?.nama
      return (
        <span className={!nama ? "italic text-muted-foreground" : ""}>
          {nama || "[Deleted User]"}
        </span>
      )
    },
  },
  {
    accessorKey: "total_poin",
    header: "Total Points",
    cell: ({ row }) => `${row.original.total_poin} pts`,
  },
  {
    accessorKey: "keterangan",
    header: "Notes",
    cell: ({ row }) => row.original.keterangan || "-",
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
      const exchange = row.original;
      return (
        <div className="flex items-center justify-center gap-2">
          <Link href={`/admin/manage-exchange/detail/${exchange.id}`}>
            <Button
              variant="outline"
              size="icon"
              className="border-glass-border bg-glass-bg bg-muted text-foreground backdrop-blur-md transition hover:bg-background hover:text-foreground"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <ButtonDeleteRewardExchange rewardExchangeId={exchange.id} />
        </div>
      );
    },
    meta: {
      className: "w-[120px] text-center",
    },
  },
];
