"use client";

import * as React from "react";
import { DataTable } from "./data-table";
import { columns, Staff } from "./columns";
import { fetchStaff } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StaffProvider } from "./staff-context";
import { AlertCircle } from "lucide-react";

export default function Page() {
  const [data, setData] = React.useState<Staff[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

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
          setError(result.error || "Failed to load staff.");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred.",
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  React.useEffect(() => {
    loadStaff(1, "");
  }, [loadStaff]);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Staff
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage staff members and their permissions.
          </p>
        </div>

        {loading ? (
          <StaffTableSkeleton />
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <StaffProvider
            refresh={() => loadStaff(pagination.page)}
          >
            <DataTable columns={columns} data={data} />
          </StaffProvider>
        )}
      </div>
    </div>
  );
}

function StaffTableSkeleton() {
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
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-3 items-center gap-4 border-b p-4 last:border-0"
          >
            <Skeleton className="h-4 w-[75%]" />
            <Skeleton className="h-4 w-[60%]" />
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