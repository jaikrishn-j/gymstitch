"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Copy,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { fetchStaff } from "@/app/admin/staff/actions";
import {
  Staff,
} from "@/app/admin/staff/columns";
import { StaffProvider } from "@/app/admin/staff/staff-context";
import AddStaff from "@/app/admin/staff/AddStaff";
import {
  features,
  type DataTableFeatures,
} from "@/app/admin/staff/data-table-features";

interface StaffContentProps {
  hasFull: boolean;
}

function StaffActionsReadonly({ staff }: { staff: Staff }) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  function handleCopyId() {
    navigator.clipboard.writeText(staff.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="h-8 w-8" />
          }
        >
          <span className="sr-only">Open actions</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={handleCopyId}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy staff ID"}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setViewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View staff
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

       <Dialog open={viewOpen} onOpenChange={setViewOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Staff Details</DialogTitle>
          <DialogDescription>
            View information for {staff.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Staff */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Staff Member</p>
            <p className="text-2xl font-bold tracking-tight">{staff.name}</p>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Account Information</h3>
              <p className="text-sm text-muted-foreground">
                Staff account details
              </p>
            </div>

            <div className="grid gap-4 rounded-lg border p-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Email Address</Label>
                <p className="text-sm font-medium break-all">{staff.email}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">User ID</Label>
                <div className="rounded-md bg-muted px-3 py-2">
                  <p className="font-mono text-xs break-all">{staff.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Permissions</h3>
              <p className="text-sm text-muted-foreground">
                Access granted to this staff member
              </p>
            </div>

            <div className="rounded-lg border p-4">
              {staff.permission.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {staff.permission.map((p, i) => (
                    <Badge key={i} variant="secondary">
                      {typeof p === "string" ? p : p.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-muted-foreground">
                    No permissions assigned
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setViewOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

function StaffActionsFull({ staff }: { staff: Staff }) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  function handleCopyId() {
    navigator.clipboard.writeText(staff.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="h-8 w-8" />
          }
        >
          <span className="sr-only">Open actions</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={handleCopyId}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy staff ID"}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setViewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View staff
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

       <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Staff Details</DialogTitle>
            <DialogDescription>
              View information for {staff.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Staff */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Staff Member</p>
              <p className="text-2xl font-bold tracking-tight">{staff.name}</p>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Account Information</h3>
                <p className="text-sm text-muted-foreground">
                  Staff account details
                </p>
              </div>

              <div className="grid gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Email Address</Label>
                  <p className="text-sm font-medium break-all">{staff.email}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">User ID</Label>
                  <div className="rounded-md bg-muted px-3 py-2">
                    <p className="font-mono text-xs break-all">{staff.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Permissions</h3>
                <p className="text-sm text-muted-foreground">
                  Access granted to this staff member
                </p>
              </div>

              <div className="rounded-lg border p-4">
                {staff.permission.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {staff.permission.map((p, i) => (
                      <Badge key={i} variant="secondary">
                        {typeof p === "string" ? p : p.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <p className="text-sm text-muted-foreground">
                      No permissions assigned
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function useReadonlyColumns(): ColumnDef<DataTableFeatures, Staff>[] {
  return React.useMemo(
    () => [
      {
        id: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-2 h-8 px-2"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        accessorFn: (row) => row.name,
        cell: ({ row }) => {
          const name = row.original.name;
          const initials = name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div className="flex min-w-[180px] items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {row.original.id}
                </p>
              </div>
            </div>
          );
        },
      } as ColumnDef<DataTableFeatures, Staff>,
      {
        id: "email",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-2 h-8 px-2"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        accessorFn: (row) => row.email,
        filterFn: "includesString",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.email}
          </span>
        ),
      } as ColumnDef<DataTableFeatures, Staff>,
      {
        id: "permission",
        header: "Permissions",
        accessorFn: (row) => row.permission,
        cell: ({ row }) => {
          const permissions = row.original.permission ?? [];
          if (permissions.length === 0) {
            return <Badge variant="outline">No permissions</Badge>;
          }
          return (
            <div className="flex max-w-[320px] flex-wrap gap-1.5">
              {permissions.slice(0, 3).map((permission, index) => {
                const label =
                  typeof permission === "string"
                    ? permission
                    : permission.name;
                return (
                  <Badge
                    key={`${label}-${index}`}
                    variant="secondary"
                    className="font-normal"
                  >
                    {label}
                  </Badge>
                );
              })}
              {permissions.length > 3 && (
                <Badge variant="outline">
                  +{permissions.length - 3}
                </Badge>
              )}
            </div>
          );
        },
      } as ColumnDef<DataTableFeatures, Staff>,
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const staff = row.original;
          return (
            <div className="flex justify-end">
              <StaffActionsReadonly staff={staff} />
            </div>
          );
        },
      } as ColumnDef<DataTableFeatures, Staff>,
    ],
    []
  );
}

function useFullColumns(): ColumnDef<DataTableFeatures, Staff>[] {
  return React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
            }}
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
            }}
            aria-label={`Select ${row.original.name}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      } as ColumnDef<DataTableFeatures, Staff>,
      {
        id: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-2 h-8 px-2"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        accessorFn: (row) => row.name,
        cell: ({ row }) => {
          const name = row.original.name;
          const initials = name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div className="flex min-w-[180px] items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {row.original.id}
                </p>
              </div>
            </div>
          );
        },
      } as ColumnDef<DataTableFeatures, Staff>,
      {
        id: "email",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-2 h-8 px-2"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        accessorFn: (row) => row.email,
        filterFn: "includesString",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.email}
          </span>
        ),
      } as ColumnDef<DataTableFeatures, Staff>,
      {
        id: "permission",
        header: "Permissions",
        accessorFn: (row) => row.permission,
        cell: ({ row }) => {
          const permissions = row.original.permission ?? [];
          if (permissions.length === 0) {
            return <Badge variant="outline">No permissions</Badge>;
          }
          return (
            <div className="flex max-w-[320px] flex-wrap gap-1.5">
              {permissions.slice(0, 3).map((permission, index) => {
                const label =
                  typeof permission === "string"
                    ? permission
                    : permission.name;
                return (
                  <Badge
                    key={`${label}-${index}`}
                    variant="secondary"
                    className="font-normal"
                  >
                    {label}
                  </Badge>
                );
              })}
              {permissions.length > 3 && (
                <Badge variant="outline">
                  +{permissions.length - 3}
                </Badge>
              )}
            </div>
          );
        },
      } as ColumnDef<DataTableFeatures, Staff>,
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const staff = row.original;
          return (
            <div className="flex justify-end">
              <StaffActionsFull staff={staff} />
            </div>
          );
        },
      } as ColumnDef<DataTableFeatures, Staff>,
    ],
    []
  );
}

function StaffDataTable({
  columns,
  data,
  hasFull,
}: {
  columns: ColumnDef<DataTableFeatures, Staff>[];
  data: Staff[];
  hasFull: boolean;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

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
  });

  const selectedRows =
    table.getFilteredSelectedRowModel().rows.length;
  const filteredRows =
    table.getFilteredRowModel().rows.length;

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            value={
              (table
                .getColumn("name")
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(event) => {
              table
                .getColumn("name")
                ?.setFilterValue(event.target.value);
              setPagination((previous) => ({
                ...previous,
                pageIndex: 0,
              }));
            }}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {hasFull && selectedRows > 0 && (
            <span className="hidden text-sm text-muted-foreground sm:block">
              {selectedRows} selected
            </span>
          )}

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
              <span className="hidden sm:inline">Columns</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
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

          {hasFull && <AddStaff />}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
        <div className="w-full overflow-x-auto">
          <Table>
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
                        <table.FlexRender cell={cell} />
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
                          No staff found
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
        <p className="text-sm text-muted-foreground">
          {hasFull && selectedRows > 0
            ? `${selectedRows} of ${filteredRows} row(s) selected`
            : `${filteredRows} staff member${
                filteredRows === 1 ? "" : "s"
              }`}
        </p>

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

          <Button
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 sm:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 sm:flex"
            onClick={() =>
              table.setPageIndex(table.getPageCount() - 1)
            }
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function StaffTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
        <div className="grid grid-cols-4 gap-4 border-b p-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>

        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-4 gap-4 border-b p-4 last:border-0"
          >
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

export default function StaffContent({ hasFull }: StaffContentProps) {
  const [data, setData] = React.useState<Staff[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const readonlyColumns = useReadonlyColumns();
  const fullColumns = useFullColumns();
  const columns = hasFull ? fullColumns : readonlyColumns;

  const loadStaff = React.useCallback(
    async (page = 1, search = "") => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchStaff({
          page,
          limit: pagination.limit,
          search,
        });
        if (result.success && result.data) {
          setData(result.data);
          if (result.pagination) {
            setPagination(result.pagination);
          }
        } else {
          setError(result.error || "Failed to load staff");
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit]
  );

  React.useEffect(() => {
    loadStaff(1, "");
  }, [loadStaff]);

  const content = (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Staff
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFull
              ? "Manage staff members and their permissions."
              : "View staff members and their permissions."}
          </p>
        </div>

        {loading ? (
          <StaffTableSkeleton />
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <StaffDataTable
            columns={columns}
            data={data}
            hasFull={hasFull}
          />
        )}
      </div>
    </div>
  );

  if (hasFull) {
    return (
      <StaffProvider refresh={() => loadStaff(pagination.page)}>
        {content}
      </StaffProvider>
    );
  }

  return content;
}
