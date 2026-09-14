"use client";

import * as React from "react";
import { fetchPlans } from "@/app/admin/plans/action";
import { Plan } from "@/app/admin/plans/columns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export default function StaffPlansPage() {
  const [data, setData] = React.useState<Plan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadPlans = React.useCallback(
    async (page = 1, searchQuery = "") => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchPlans({ page, limit: pagination.limit, search: searchQuery });
        if (result.success && result.data) {
          setData(result.data);
          if (result.pagination) {
            setPagination(result.pagination);
          }
        } else {
          setError(result.error || "Failed to load plans");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit]
  );

  React.useEffect(() => {
    loadPlans(1, "");
  }, [loadPlans]);

  const handleSearch = (value: string) => {
    setSearch(value);
    loadPlans(1, value);
  };

  const handlePageChange = (newPage: number) => {
    loadPlans(newPage, search);
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View available membership plans and pricing.
          </p>
        </div>

        {loading ? (
          <PlansTableSkeleton />
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="w-full space-y-4">
            {/* Search */}
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search plans..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Name</TableHead>
                      <TableHead className="whitespace-nowrap">Price</TableHead>
                      <TableHead className="whitespace-nowrap">Offer Price</TableHead>
                      <TableHead className="whitespace-nowrap">Duration</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Features</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.length > 0 ? (
                      data.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="min-w-[180px]">
                              <p className="truncate font-medium">{plan.name}</p>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className="font-medium">
                              ₹{Number(plan.amount).toLocaleString("en-IN")}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {plan.offerPrice ? (
                              <span className="text-green-600 font-medium">
                                ₹{Number(plan.offerPrice).toLocaleString("en-IN")}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {plan.durationInDays} days
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant={plan.isAvailable ? "default" : "secondary"}>
                              {plan.isAvailable ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {(!plan.includedFeatures || plan.includedFeatures.length === 0) ? (
                              <Badge variant="outline">No features</Badge>
                            ) : (
                              <div className="flex max-w-[320px] flex-wrap gap-1.5">
                                {plan.includedFeatures.slice(0, 3).map((feature, index) => (
                                  <Badge
                                    key={`${feature}-${index}`}
                                    variant="secondary"
                                    className="font-normal"
                                  >
                                    {feature}
                                  </Badge>
                                ))}
                                {plan.includedFeatures.length > 3 && (
                                  <Badge variant="outline">
                                    +{plan.includedFeatures.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-40 text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="rounded-full bg-muted p-3">
                              <Search className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">No plans found</p>
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
                {pagination.total} plan{pagination.total === 1 ? "" : "s"} total
              </p>

              {/* Pagination */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page{" "}
                  <span className="font-medium text-foreground">{pagination.page}</span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">{pagination.totalPages}</span>
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  className="hidden h-8 w-8 sm:flex"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page <= 1}
                  aria-label="First page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="hidden h-8 w-8 sm:flex"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.page >= pagination.totalPages}
                  aria-label="Last page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
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
