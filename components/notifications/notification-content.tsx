"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Mail,
  Phone,
  Receipt,
  Trash2,
  User,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ProcessPaymentModal } from "./process-payment-modal";

export interface PaymentRequest {
  id: number;
  clerkId: string;
  planId: number | null;
  amount: string;
  planDurationDays: number | null;
  description: string | null;
  status: string;
  handledByClerkId: string | null;
  handledAt: Date | null;
  adminNote: string | null;
  isRead: boolean;
  paymentId: number | null;
  createdAt: Date;
  updatedAt: Date;
  planName: string | null;
  planAmount: string | null;
  planOfferPrice: string | null;
  planDurationInDays: number | null;
  userName: string;
  userEmail: string;
  userPhone: string;
}

interface NotificationContentProps {
  isAdmin: boolean;
  hasFull: boolean;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }
> = {
  PENDING: {
    label: "Pending",
    variant: "secondary",
    icon: Clock,
  },
  ACCEPTED: {
    label: "Accepted",
    variant: "default",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Rejected",
    variant: "destructive",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "outline",
    icon: Trash2,
  },
};

type FilterStatus = "all" | "unread" | "PENDING" | "ACCEPTED" | "REJECTED";

export function NotificationContent({
  isAdmin,
  hasFull,
}: NotificationContentProps) {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [processingRequest, setProcessingRequest] =
    useState<PaymentRequest | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === "unread") params.set("unread", "true");
      else if (
        filter === "PENDING" ||
        filter === "ACCEPTED" ||
        filter === "REJECTED"
      )
        params.set("status", filter);

      const res = await fetch(
        `/api/payment-requests/admin?${params.toString()}`
      );
      const data = await res.json();

      if (data.success) {
        setRequests(data.data);
      } else {
        toast.error(data.error || "Failed to load notifications");
      }
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleMarkAsRead = useCallback(
    async (requestId: number) => {
      if (!hasFull) return;
      try {
        const res = await fetch("/api/payment-requests/admin", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: requestId, isRead: true }),
        });
        const data = await res.json();
        if (data.success) {
          setRequests((prev) =>
            prev.map((r) =>
              r.id === requestId ? { ...r, isRead: true } : r
            )
          );
        }
      } catch {
        toast.error("Failed to mark as read");
      }
    },
    [hasFull]
  );

  const handleStatusChange = useCallback(
    async (requestId: number, newStatus: string) => {
      if (!hasFull) return;
      try {
        const res = await fetch("/api/payment-requests/admin", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: requestId,
            status: newStatus,
            isRead: true,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setRequests((prev) =>
            prev.map((r) =>
              r.id === requestId
                ? { ...r, status: newStatus, isRead: true }
                : r
            )
          );
          toast.success(`Request ${newStatus.toLowerCase()}`);
        } else {
          toast.error(data.error || "Failed to update status");
        }
      } catch {
        toast.error("Failed to update status");
      }
    },
    [hasFull]
  );

  const unreadCount = requests.filter((r) => !r.isRead).length;
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  const filteredRequests = requests.filter((r) => {
    if (filter === "all") return true;
    if (filter === "unread") return !r.isRead;
    return r.status === filter;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-muted/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Total Requests
              </p>
              <p className="text-sm font-semibold">{requests.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Pending
              </p>
              <p className="text-sm font-semibold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background">
              <AlertCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Unread
              </p>
              <p className="text-sm font-semibold">{unreadCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {(
          [
            { key: "all", label: "All" },
            { key: "unread", label: `Unread (${unreadCount})` },
            { key: "PENDING", label: "Pending" },
            { key: "ACCEPTED", label: "Accepted" },
            { key: "REJECTED", label: "Rejected" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Request List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filter === "all"
                ? "No payment requests yet."
                : `No ${filter.toLowerCase()} requests.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => {
            const statusCfg =
              STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusCfg.icon;

            return (
              <Card
                key={req.id}
                className={`transition-colors ${
                  !req.isRead
                    ? "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                    : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: User Info & Request Details */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        <User className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium truncate">
                            {req.userName}
                          </p>
                          <Badge variant={statusCfg.variant} className="gap-1 text-[10px]">
                            <StatusIcon className="h-3 w-3" />
                            {statusCfg.label}
                          </Badge>
                          {!req.isRead && hasFull && (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-blue-300 text-blue-600"
                            >
                              New
                            </Badge>
                          )}
                        </div>

                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {req.userEmail}
                          </span>
                          {req.userPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {req.userPhone}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-3 text-xs flex-wrap">
                          <span className="font-medium">
                            {req.planName || "Unknown Plan"}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-semibold">
                            ₹{Number(req.amount).toLocaleString("en-IN")}
                          </span>
                          {req.planDurationInDays && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">
                                {req.planDurationInDays} days
                              </span>
                            </>
                          )}
                        </div>

                        {req.description && (
                          <p className="mt-2 text-xs text-muted-foreground italic">
                            &quot;{req.description}&quot;
                          </p>
                        )}

                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatDate(req.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Status Change Dropdown — only for hasFull */}
                      {hasFull && req.status === "PENDING" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                            Status
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(req.id, "ACCEPTED")
                              }
                              className="text-emerald-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Accept
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(req.id, "REJECTED")
                              }
                              className="text-destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(req.id, "CANCELLED")
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      {/* Mark as Read — only for hasFull and unread */}
                      {hasFull && !req.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(req.id)}
                        >
                          Mark read
                        </Button>
                      )}

                      {/* Proceed with Payment — only for PENDING + hasFull */}
                      {hasFull && req.status === "PENDING" && (
                        <Button
                          size="sm"
                          onClick={() => setProcessingRequest(req)}
                          className="gap-1.5"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Proceed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Process Payment Modal */}
      {processingRequest && (
        <ProcessPaymentModal
          open={!!processingRequest}
          onOpenChange={(open) => {
            if (!open) setProcessingRequest(null);
          }}
          request={processingRequest}
          isAdmin={isAdmin}
          onPaymentComplete={() => {
            setProcessingRequest(null);
            loadRequests();
          }}
        />
      )}
    </div>
  );
}
