"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  AlertCircle,
  Eye,
  Calendar,
  CreditCard,
  FileText,
  ArrowRight,
  ReceiptText,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Transaction } from "../actions";

function statusIcon(status: string) {
  switch (status) {
    case "SUCCESS":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "PENDING":
      return <Clock className="h-4 w-4 text-amber-500" />;
    case "FAILED":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "REFUNDED":
      return <RefreshCw className="h-4 w-4 text-blue-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  }
}

function statusVariant(status: string) {
  switch (status) {
    case "SUCCESS":
      return "default" as const;
    case "PENDING":
      return "secondary" as const;
    case "FAILED":
      return "destructive" as const;
    case "REFUNDED":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium ${mono ? "font-mono text-xs" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [open, setOpen] = useState(false);

  function handleRowClick(tx: Transaction) {
    setSelected(tx);
    setOpen(true);
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
          <ReceiptText className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No transactions found</p>
        <p className="text-xs text-muted-foreground mt-1">
          You haven&apos;t made any payments yet.
        </p>
      </div>
    );
  }

  const formattedDate = selected
    ? new Date(selected.paidAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const formattedTime = selected
    ? new Date(selected.paidAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const formattedCreated = selected
    ? new Date(selected.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]">
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow
                key={tx.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(tx)}
              >
                <TableCell className="text-sm">
                  {new Date(tx.paidAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {tx.planName ?? "Custom Plan"}
                </TableCell>
                <TableCell className="text-sm font-semibold">
                  ₹{Number(tx.amount).toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground capitalize">
                  {tx.paymentMethod}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(tx.status)} className="text-xs">
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(tx);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Transaction Details
            </DialogTitle>
            <DialogDescription>
              Reference ID: #{selected?.id}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {/* Amount & Status */}
              <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Amount Paid</p>
                  <p className="text-2xl font-bold tracking-tight">
                    ₹{Number(selected.amount).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {statusIcon(selected.status)}
                  <Badge
                    variant={statusVariant(selected.status)}
                    className="text-xs"
                  >
                    {selected.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Plan Info */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Plan Information
                </p>
                <DetailRow
                  icon={FileText}
                  label="Plan Name"
                  value={selected.planName ?? "Custom / Registration"}
                />
                {selected.planDurationDays && (
                  <DetailRow
                    icon={Calendar}
                    label="Duration"
                    value={`${selected.planDurationDays} days`}
                  />
                )}
              </div>

              <Separator />

              {/* Payment Info */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Payment Information
                </p>
                <DetailRow
                  icon={CreditCard}
                  label="Payment Method"
                  value={selected.paymentMethod}
                />
                {selected.paymentGateway && (
                  <DetailRow
                    icon={ArrowRight}
                    label="Payment Gateway"
                    value={selected.paymentGateway}
                  />
                )}
                {selected.gatewayPaymentId && (
                  <DetailRow
                    icon={FileText}
                    label="Gateway Payment ID"
                    value={selected.gatewayPaymentId}
                    mono
                  />
                )}
                {selected.gatewayOrderId && (
                  <DetailRow
                    icon={FileText}
                    label="Gateway Order ID"
                    value={selected.gatewayOrderId}
                    mono
                  />
                )}
              </div>

              <Separator />

              {/* Dates */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Dates
                </p>
                <DetailRow
                  icon={Calendar}
                  label="Payment Date"
                  value={`${formattedDate} at ${formattedTime}`}
                />
                <DetailRow
                  icon={Clock}
                  label="Record Created"
                  value={formattedCreated}
                />
              </div>

              {/* Description */}
              {selected.description && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Note
                    </p>
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-sm text-muted-foreground">
                        {selected.description}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" size="sm" />}>
              Close
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
