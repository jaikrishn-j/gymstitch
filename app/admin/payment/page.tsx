"use client";

import * as React from "react";
import { DataTable } from "./data-table";
import { columns, Payment } from "./columns";
import { fetchPayments } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentProvider } from "./payment-context";

export default function Page() {
  const [data, setData] = React.useState<Payment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadPayments = React.useCallback(
    async (page = 1, search = "") => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchPayments({ page, limit: pagination.limit, search });
        if (result.success && result.data) {
          setData(result.data);
          if (result.pagination) {
            setPagination(result.pagination);
          }
        } else {
          setError(result.error || "Failed to load payments");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit]
  );

  React.useEffect(() => {
    loadPayments(1, "");
  }, [loadPayments]);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage payments and record new transactions.
          </p>
        </div>

        {loading ? (
          <PaymentTableSkeleton />
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <PaymentProvider refresh={() => loadPayments(pagination.page)}>
            <DataTable columns={columns} data={data} />
          </PaymentProvider>
        )}
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
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
        <div className="grid grid-cols-6 gap-4 border-b p-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
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
