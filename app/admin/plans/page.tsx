"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";

import { DataTable } from "./data-table";
import { columns, Plan } from "./columns";
import { fetchPlans } from "./action";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
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
        const result = await fetchPlans({
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
          setError(result.error || "Failed to load plans.");
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  React.useEffect(() => {
    loadPlans(1, "");
  }, [loadPlans]);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Plans
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage membership plans, pricing, and features.
          </p>
        </div>

        {loading ? (
          <PlansTableSkeleton />
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <PlansProvider
            refresh={() => loadPlans(pagination.page)}
          >
            <DataTable columns={columns} data={data} />

            <div className="mt-4 flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">
                Total: {pagination.total} plans
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    loadPlans(pagination.page - 1)
                  }
                  disabled={pagination.page <= 1}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="whitespace-nowrap text-muted-foreground">
                  Page {pagination.page} of{" "}
                  {Math.max(pagination.totalPages, 1)}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    loadPlans(pagination.page + 1)
                  }
                  disabled={
                    pagination.page >= pagination.totalPages
                  }
                  className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full sm:w-[280px]" />

        <div className="flex gap-2">
          <Skeleton className="h-10 w-[90px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <div className="border-b bg-muted/50 p-4">
          <div className="grid grid-cols-6 gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-6 items-center gap-4 border-b p-4 last:border-0"
          >
            <Skeleton className="h-4 w-[75%]" />
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />

        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}