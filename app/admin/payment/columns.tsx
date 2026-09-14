"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import { type DataTableFeatures } from "./data-table-features"
import { PaymentActions } from "./PaymentActions"

export type Payment = {
  id: number
  clerkId: string
  planId: number | null
  amount: string
  paidAt: Date
  paymentMethod: string
  status: string
  description: string | null
  createdAt: Date
  planName: string | null
  userName: string
  userEmail: string
  userPhone: string
}

const columnHelper = createColumnHelper<DataTableFeatures, Payment>()

export const columns = columnHelper.columns([
  columnHelper.display({
    id: "select",

    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => {
          table.toggleAllPageRowsSelected(!!value)
        }}
        aria-label="Select all rows"
      />
    ),

    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          row.toggleSelected(!!value)
        }}
        aria-label={`Select payment ${row.original.id}`}
      />
    ),

    enableSorting: false,
    enableHiding: false,
  }),

  columnHelper.accessor("userName", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-2 h-8 px-2"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        User
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),

    cell: ({ row }) => {
      const name = row.original.userName

      const initials = name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()

      return (
        <div className="flex min-w-[180px] items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate font-medium">
              {name}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {row.original.userEmail}
            </p>
          </div>
        </div>
      )
    },
  }),

  columnHelper.accessor("amount", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-2 h-8 px-2"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Amount
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),

    cell: ({ row }) => (
      <span className="font-medium">
        ₹{Number(row.original.amount).toLocaleString("en-IN")}
      </span>
    ),
  }),

  columnHelper.accessor("planName", {
    header: "Plan",

    cell: ({ row }) => {
      const planName = row.original.planName

      if (!planName) {
        return (
          <Badge variant="outline">
            Registration
          </Badge>
        )
      }

      return (
        <Badge variant="secondary" className="font-normal">
          {planName}
        </Badge>
      )
    },
  }),

  columnHelper.accessor("paymentMethod", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-2 h-8 px-2"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Method
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),

    cell: ({ row }) => (
      <span className="text-muted-foreground capitalize">
        {row.original.paymentMethod}
      </span>
    ),
  }),

  columnHelper.accessor("status", {
    header: "Status",

    cell: ({ row }) => {
      const status = row.original.status
      const variant =
        status === "SUCCESS"
          ? "default"
          : status === "PENDING"
            ? "secondary"
            : "destructive"

      return (
        <Badge variant={variant} className="font-normal">
          {status}
        </Badge>
      )
    },
  }),

  columnHelper.accessor("paidAt", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-2 h-8 px-2"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),

    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.original.paidAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </span>
    ),
  }),

  columnHelper.display({
    id: "actions",
    enableHiding: false,

    cell: ({ row }) => {
      const payment = row.original

      return (
        <div className="flex justify-end">
          <PaymentActions payment={payment} />
        </div>
      )
    },
  }),
])
