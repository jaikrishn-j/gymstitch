"use client";

import * as React from "react";
import { DataTable } from "./data-table";
import { columns, Plan } from "./columns";
import { fetchPlans } from "./action";
import { Skeleton } from "@/components/ui/skeleton";
import { PlansProvider } from "./plans-context";

export default function Page() {
  const [data, setData] = React.useState<Plan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadPlans = React.useCallback(
    async (page = 1, search = "") => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchPlans({ page, limit: pagination.limit, search });
        if (result.success && result.data) {
          setData(result.data);
          if (result.pagination) {
            setPagination(result.pagination);
          }
        } else {
          setError(result.error || "Failed to load plans");
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
    loadPlans(1, "");
  }, [loadPlans]);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage membership plans, pricing, and features.
          </p>
        </div>

        {loading ? (
          <PlansTableSkeleton />
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <PlansProvider refresh={() => loadPlans(pagination.page)}>
            <DataTable columns={columns} data={data} />
            {/* Server pagination controls */}
            <div className="mt-4 flex items-center justify-between">
              <span>Total: {pagination.total} plans</span>
              <div className="space-x-2">
                <button
                  onClick={() => loadPlans(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => loadPlans(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </PlansProvider>
        )}
      </div>
    </div>
  );
}

function PlansTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
        <div className="grid grid-cols-6 gap-4 border-b p-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-6 gap-4 border-b p-4 last:border-0"
          >
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
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
