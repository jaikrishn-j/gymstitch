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
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Eye,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import { fetchPayments } from "@/app/admin/payment/actions";
import { type Payment } from "@/app/admin/payment/columns";
import { PaymentProvider } from "@/app/admin/payment/payment-context";
import AddPayment from "@/app/admin/payment/AddPayment";
import {
  features,
  type DataTableFeatures,
} from "@/app/admin/payment/data-table-features";

interface PaymentContentProps {
  hasFull: boolean;
}

function PaymentActionsReadonly({
  payment,
}: {
  payment: Payment;
}) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  function handleCopyId() {
    navigator.clipboard.writeText(String(payment.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            />
          }
        >
          <span className="sr-only">Open actions</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyId}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy payment ID"}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setViewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View payment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PaymentDetailsDialog
        payment={payment}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />
    </>
  );
}

function PaymentDetailsDialog({
  payment,
  open,
  onOpenChange,
}: {
  payment: Payment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const statusVariant =
    payment.status === "SUCCESS"
      ? "default"
      : payment.status === "PENDING"
        ? "secondary"
        : "destructive";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            View information for payment #{payment.id}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-md border p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Payment Amount
              </p>
              <p className="text-2xl font-semibold tracking-tight">
                ₹{Number(payment.amount).toLocaleString("en-IN")}
              </p>
            </div>

            <Badge variant={statusVariant}>
              {payment.status}
            </Badge>
          </div>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">
                Payment Information
              </h3>
              <p className="text-sm text-muted-foreground">
                Transaction and membership details.
              </p>
            </div>

            <div className="grid gap-4 rounded-md border p-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">
                  Payment ID
                </Label>
                <p className="break-all font-mono text-xs">
                  {payment.id}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">
                  Plan
                </Label>
                {payment.planName ? (
                  <Badge variant="secondary">
                    {payment.planName}
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    Registration
                  </Badge>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    Payment Method
                  </Label>
                  <p className="text-sm font-medium capitalize">
                    {payment.paymentMethod}
                  </p>
                </div>

                <div className="space-y-1 sm:text-right">
                  <Label className="text-muted-foreground">
                    Date
                  </Label>
                  <p className="text-sm font-medium">
                    {new Date(
                      payment.paidAt,
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">
                Member
              </h3>
              <p className="text-sm text-muted-foreground">
                Account associated with this payment.
              </p>
            </div>

            <div className="rounded-md border p-4">
              <p className="font-medium">{payment.userName}</p>
              <p className="break-all text-sm text-muted-foreground">
                {payment.userEmail}
              </p>
            </div>
          </section>

          {payment.description && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">
                Description
              </Label>
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-sm">{payment.description}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaymentActionsFull({
  payment,
}: {
  payment: Payment;
}) {
  return <PaymentActionsReadonly payment={payment} />;
}

function PaymentUserCell({
  payment,
}: {
  payment: Payment;
}) {
  const initials = payment.userName
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
        <p className="truncate font-medium">
          {payment.userName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {payment.userEmail}
        </p>
      </div>
    </div>
  );
}

function SortableHeader({
  column,
  children,
}: {
  column: {
    toggleSorting: (desc?: boolean) => void;
    getIsSorted: () => false | "asc" | "desc";
  };
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      className="-ml-2 h-8 px-2"
      onClick={() =>
        column.toggleSorting(column.getIsSorted() === "asc")
      }
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

function StatusBadge({
  status,
}: {
  status: Payment["status"];
}) {
  const variant =
    status === "SUCCESS"
      ? "default"
      : status === "PENDING"
        ? "secondary"
        : "destructive";

  return (
    <Badge variant={variant} className="font-normal">
      {status}
    </Badge>
  );
}

function PlanBadge({
  planName,
}: {
  planName: Payment["planName"];
}) {
  return planName ? (
    <Badge variant="secondary" className="font-normal">
      {planName}
    </Badge>
  ) : (
    <Badge variant="outline">Registration</Badge>
  );
}

function useReadonlyColumns(): ColumnDef<
  DataTableFeatures,
  Payment
>[] {
  return React.useMemo(
    () => [
      {
        id: "userName",
        header: ({ column }) => (
          <SortableHeader column={column}>
            User
          </SortableHeader>
        ),
        accessorFn: (row) => row.userName,
        cell: ({ row }) => (
          <PaymentUserCell payment={row.original} />
        ),
      } as ColumnDef<DataTableFeatures, Payment>,

      {
        id: "amount",
        header: ({ column }) => (
          <SortableHeader column={column}>
            Amount
          </SortableHeader>
        ),
        accessorFn: (row) => row.amount,
        cell: ({ row }) => (
          <span className="font-medium">
            ₹
            {Number(row.original.amount).toLocaleString(
              "en-IN",
            )}
          </span>
        ),
      } as ColumnDef<DataTableFeatures, Payment>,

      {
        id: "planName",
        header: "Plan",
        accessorFn: (row) => row.planName ?? "",
        cell: ({ row }) => (
          <PlanBadge planName={row.original.planName} />
        ),
      } as ColumnDef<DataTableFeatures, Payment>,

      {
        id: "paymentMethod",
        header: ({ column }) => (
          <SortableHeader column={column}>
            Method
          </SortableHeader>
        ),
        accessorFn: (row) => row.paymentMethod,
        cell: ({ row }) => (
          <span className="text-muted-foreground capitalize">
            {row.original.paymentMethod}
          </span>
        ),
      } as ColumnDef<DataTableFeatures, Payment>,

      {
        id: "status",
        header: "Status",
        accessorFn: (row) => row.status,
        cell: ({ row }) => (
          <StatusBadge status={row.original.status} />
        ),
      } as ColumnDef<DataTableFeatures, Payment>,

      {
        id: "paidAt",
        header: ({ column }) => (
          <SortableHeader column={column}>
            Date
          </SortableHeader>
        ),
        accessorFn: (row) => row.paidAt,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {new Date(
              row.original.paidAt,
            ).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        ),
      } as ColumnDef<DataTableFeatures, Payment>,

      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <PaymentActionsReadonly
              payment={row.original}
            />
          </div>
        ),
      } as ColumnDef<DataTableFeatures, Payment>,
    ],
    [],
  );
}

function useFullColumns(): ColumnDef<
  DataTableFeatures,
  Payment
>[] {
  return React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) =>
              row.toggleSelected(!!value)
            }
            aria-label={`Select payment ${row.original.id}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      } as ColumnDef<DataTableFeatures, Payment>,

      {
        id: "userName",
        header: ({ column }) => (
          <SortableHeader column={column}>
            User
          </SortableHeader>
        ),
        accessorFn: (row) => row.userName,
        cell: ({ row }) => (
          <PaymentUserCell payment={row.original} />
        ),
      } as ColumnDef<DataTableFeatures, Payment>,

      {
        id: "amount",
        header: ({ column }) => (
          <SortableHeader column={column}>
            Amount
          </SortableHeader>
        ),
        accessorFn: (row) => row.amount,
        cell: ({ row }) => (
          <span className="font-medium">
            ₹
            {Number(row.original.amount).toLocaleString(
              "en-IN",
            )}
          </span>
        ),
      } as ColumnDef<DataTableFeatures, Payment>,

      {
        id: "planName",
        header: "Plan",
        accessorFn: (row) => row.planName ?? "",
        cell: ({ row }) => (
          <PlanBadge planName={row.original.planName} />
        ),
      } as ColumnDef<DataTableFeatures, Payment>,

      {
        id: "paymentMethod",
        header: ({ column }) => (
          <SortableHeader column={column}>
            Method
          </SortableHeader>
        ),
        accessorFn: (row) => row.paymentMethod,
        cell: ({ row }) => (
          <span className="text-muted-foreground capitalize">
            {row.original.paymentMethod}
          </span>
        ),
      } as ColumnDef<DataTableFeatures, Payment>,

      {
        id: "status",
        header: "Status",
        accessorFn: (row) => row.status,
        cell: ({ row }) => (
          <StatusBadge status={row.original.status} />
        ),
      } as ColumnDef<DataTableFeatures, Payment>,

      {
        id: "paidAt",
        header: ({ column }) => (
          <SortableHeader column={column}>
            Date
          </SortableHeader>
        ),
        accessorFn: (row) => row.paidAt,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {new Date(
              row.original.paidAt,
            ).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        ),
      } as ColumnDef<DataTableFeatures, Payment>,

      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <PaymentActionsFull
              payment={row.original}
            />
          </div>
        ),
      } as ColumnDef<DataTableFeatures, Payment>,
    ],
    [],
  );
}

function PaymentDataTable({
  columns,
  data,
  hasFull,
}: {
  columns: ColumnDef<DataTableFeatures, Payment>[];
  data: Payment[];
  hasFull: boolean;
}) {
  const [sorting, setSorting] =
    React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] =
    React.useState<PaginationState>({
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search payments..."
            value={
              (table
                .getColumn("userName")
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(event) => {
              table
                .getColumn("userName")
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
                  className="gap-2"
                />
              }
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">
                Columns
              </span>
            </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                Toggle columns
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !==
                      "undefined" &&
                    column.getCanHide(),
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

        {hasFull && <AddPayment />}
      </div>

      <div className="overflow-hidden rounded-md border">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(
                (headerGroup) => (
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
                ),
              )}
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
                          No payments found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try changing your search or add a
                          new payment.
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {hasFull && selectedRows > 0
            ? `${selectedRows} of ${filteredRows} row(s) selected`
            : `${filteredRows} payment${
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
              table.setPageIndex(
                table.getPageCount() - 1,
              )
            }
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
}

function PaymentTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-full max-w-sm" />

        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <div className="grid grid-cols-6 gap-4 border-b p-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>

        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-6 gap-4 border-b p-4 last:border-0"
          >
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
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

export default function PaymentContent({
  hasFull,
}: PaymentContentProps) {
  const [data, setData] = React.useState<Payment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(
    null,
  );

  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const readonlyColumns = useReadonlyColumns();
  const fullColumns = useFullColumns();
  const columns = hasFull
    ? fullColumns
    : readonlyColumns;

  const loadPayments = React.useCallback(
    async (page = 1, search = "") => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchPayments({
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
          setError(
            result.error || "Failed to load payments",
          );
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred",
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  React.useEffect(() => {
    loadPayments(1, "");
  }, [loadPayments]);

  const content = (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Payments
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {hasFull
              ? "Manage payments and record new transactions."
              : "View payments and transaction records."}
          </p>
        </div>

        {loading ? (
          <PaymentTableSkeleton />
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>
              Unable to load payments
            </AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        ) : (
          <PaymentDataTable
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
      <PaymentProvider
        refresh={() => loadPayments(pagination.page)}
      >
        {content}
      </PaymentProvider>
    );
  }

  return content;
}