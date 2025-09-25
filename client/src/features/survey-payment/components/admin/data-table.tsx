"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getColumns } from "./columns"
import { useAdminSurveyPayments } from "../../hooks/useAdminSurveyPayment"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useState } from "react"
import { Pagination } from "@/components/admin/pagination"
import { Separator } from "@/components/ui/separator"

export default function DataTableSurveyPayment() {
  const [page, setPage] = useState(1)
  const limit = 10
  const { isLoggedIn, loading: authLoading } = useAuth()
  const shouldFetch = isLoggedIn && !authLoading

  const { payments = [], meta, isLoading, isError, error } = useAdminSurveyPayments({
    page,
    limit,
    filters: { sort: "-created_at" },
    enabled: shouldFetch,
  })

  const table = useReactTable({
    data: payments,
    columns: getColumns(page, limit),
    getCoreRowModel: getCoreRowModel(),
  })

  if (authLoading) {
    return <p className="p-4 text-center text-muted-foreground">Authenticating...</p>
  }

  if (!isLoggedIn) {
    return null
  }

  if (isLoading) {
    return <p className="p-4 text-center text-muted-foreground">Loading payment data...</p>
  }

  if (isError) {
    return <p className="p-4 text-center text-destructive">Failed to fetch data. {error?.message}</p>
  }

  const totalPages = meta?.total_pages ?? 1

  return (
    <>
      <div
        className="flex-grow rounded-lg border border-glass-border bg-glass-bg bg-background/80 backdrop-blur-md overflow-auto"
        style={{
          borderColor: "var(--glass-border)",
          backdropFilter: "var(--glass-blur)",
        }}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="bg-background hover:bg-background/50" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead className="text-center text-foreground" key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow className="hover:bg-background" key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`align-middle text-center py-1 ${cell.column.columnDef.meta?.className ?? ""}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={getColumns(page, limit).length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No payment data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </>
  )
}
