"use client"

import * as React from "react"

import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type RowData,
  type SortingState,
  useTable,
} from "@tanstack/react-table"

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SlidersHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  features,
  type DataTableFeatures,
} from "./data-table-features"
import AddMember from "./AddMember"

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
}

export function DataTable<TData extends RowData>({
  columns,
  data,
}: DataTableProps<TData>) {
  const [sorting, setSorting] =
    React.useState<SortingState>([])

  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([])

  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})

  const [rowSelection, setRowSelection] =
    React.useState({})

  const [pagination, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    })

  const table = useTable({
    features,

    data,
    columns,

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  const selectedRows =
    table.getFilteredSelectedRowModel().rows.length

  const filteredRows =
    table.getFilteredRowModel().rows.length

  return (
    <div className="w-full space-y-4">

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-muted-foreground
            "
          />

          <Input
            placeholder="Search members..."
            value={
              (table
                .getColumn("name")
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(event) => {
              table
                .getColumn("name")
                ?.setFilterValue(event.target.value)

              setPagination((previous) => ({
                ...previous,
                pageIndex: 0,
              }))
            }}
            className="pl-9"
          />
        </div>

        {/* Toolbar actions */}
        <div className="flex items-center gap-2">

          {selectedRows > 0 && (
            <span className="hidden text-sm text-muted-foreground sm:block">
              {selectedRows} selected
            </span>
          )}

          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                />
              }
            >
              <SlidersHorizontal className="h-4 w-4" />

              <span className="hidden sm:inline">
                Columns
              </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  Toggle columns
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                      className="capitalize"
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <AddMember />
        </div>
      </div>

      {/* Table */}
      <div
        className="
          overflow-hidden
          rounded-xl
          border
          bg-background
          shadow-sm
        "
      >
        <div className="w-full overflow-x-auto">
          <Table>

            {/* Header */}
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : (
                            <table.FlexRender
                              header={header}
                            />
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            {/* Body */}
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (

                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={
                      row.getIsSelected()
                        ? "selected"
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="whitespace-nowrap"
                      >
                        <table.FlexRender
                          cell={cell}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))

              ) : (

                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-40 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">

                      <div className="rounded-full bg-muted p-3">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div>
                        <p className="font-medium">
                          No members found
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Try changing your search.
                        </p>
                      </div>

                    </div>
                  </TableCell>
                </TableRow>

              )}
            </TableBody>

          </Table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Selection / count */}
        <p className="text-sm text-muted-foreground">
          {selectedRows > 0
            ? `${selectedRows} of ${filteredRows} row(s) selected`
            : `${filteredRows} member${
                filteredRows === 1 ? "" : "s"
              }`}
        </p>

        {/* Pagination */}
        <div className="flex items-center gap-2">

          <span className="text-sm text-muted-foreground">
            Page{" "}
            <span className="font-medium text-foreground">
              {pagination.pageIndex + 1}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {table.getPageCount()}
            </span>
          </span>

          {/* First */}
          <Button
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 sm:flex"
            onClick={() =>
              table.setPageIndex(0)
            }
            disabled={
              !table.getCanPreviousPage()
            }
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              table.previousPage()
            }
            disabled={
              !table.getCanPreviousPage()
            }
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Next */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              table.nextPage()
            }
            disabled={
              !table.getCanNextPage()
            }
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last */}
          <Button
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 sm:flex"
            onClick={() =>
              table.setPageIndex(
                table.getPageCount() - 1
              )
            }
            disabled={
              !table.getCanNextPage()
            }
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>

        </div>
      </div>

    </div>
  )
}
