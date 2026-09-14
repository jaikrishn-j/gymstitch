"use client";

import * as React from "react";
import { DataTable } from "./data-table";
import { columns, Member } from "./columns";
import { fetchMembers } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberProvider } from "./member-context";

export default function Page() {
  const [data, setData] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadMembers = React.useCallback(async (page = 1, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMembers({ page, limit: pagination.limit, search });
      if (result.success && result.data) {
        setData(result.data);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        setError(result.error || "Failed to load members");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  React.useEffect(() => {
    loadMembers(1, "");
  }, [loadMembers]);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage gym members and their subscriptions.
          </p>
        </div>

        {loading && (
          <div className="space-y-4">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-full max-w-sm" /> {/* Search bar */}
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" /> {/* Columns button */}
                <Skeleton className="h-10 w-24" /> {/* Add member button */}
              </div>
            </div>

            {/* Table header skeleton */}
            <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 gap-4 border-b p-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>

              {/* Table row skeletons */}
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 border-b p-4 last:border-0"
                >
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>

            {/* Pagination skeleton */}
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
        )}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          <MemberProvider refresh={() => loadMembers(pagination.page)}>
            <DataTable columns={columns} data={data} />
          </MemberProvider>
        )}

        {/* Simple pagination controls (optional, since DataTable has its own) */}
        <div className="mt-4 flex items-center justify-between">
          <span>
            Total: {pagination.total} members
          </span>
          <div className="space-x-2">
            <button
              onClick={() => loadMembers(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button
              onClick={() => loadMembers(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}