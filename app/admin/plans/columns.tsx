"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import { type DataTableFeatures } from "./data-table-features"
import { PlanActions } from "./PlanActions"

export type Plan = {
  id: number
  name: string
  descriptions: string | null
  amount: string
  offerPrice: string | null
  includedFeatures: string[]
  isAvailable: boolean
  durationInDays: number
  createdAt: Date
  updatedAt: Date
}

const columnHelper = createColumnHelper<DataTableFeatures, Plan>()

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
        aria-label={`Select ${row.original.name}`}
      />
    ),

    enableSorting: false,
    enableHiding: false,
  }),

  columnHelper.accessor("name", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-2 h-8 px-2"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),

    cell: ({ row }) => {
      return (
        <div className="min-w-[180px]">
          <p className="truncate font-medium">
            {row.original.name}
          </p>
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
        Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),

    cell: ({ row }) => (
      <span className="font-medium">
        ₹{Number(row.original.amount).toLocaleString("en-IN")}
      </span>
    ),
  }),

  columnHelper.accessor("offerPrice", {
    header: "Offer Price",

    cell: ({ row }) => {
      const offerPrice = row.original.offerPrice
      if (!offerPrice) {
        return <span className="text-muted-foreground">-</span>
      }
      return (
        <span className="text-green-600 font-medium">
          ₹{Number(offerPrice).toLocaleString("en-IN")}
        </span>
      )
    },
  }),

  columnHelper.accessor("durationInDays", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-2 h-8 px-2"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Duration
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),

    cell: ({ row }) => (
      <span>{row.original.durationInDays} days</span>
    ),
  }),

  columnHelper.accessor("isAvailable", {
    header: "Status",

    cell: ({ row }) => {
      const isAvailable = row.original.isAvailable
      return (
        <Badge variant={isAvailable ? "default" : "secondary"}>
          {isAvailable ? "Active" : "Inactive"}
        </Badge>
      )
    },
  }),

  columnHelper.accessor("includedFeatures", {
    header: "Features",

    cell: ({ row }) => {
      const features = row.original.includedFeatures ?? []

      if (features.length === 0) {
        return (
          <Badge variant="outline">
            No features
          </Badge>
        )
      }

      return (
        <div className="flex max-w-[320px] flex-wrap gap-1.5">
          {features.slice(0, 3).map((feature, index) => (
            <Badge
              key={`${feature}-${index}`}
              variant="secondary"
              className="font-normal"
            >
              {feature}
            </Badge>
          ))}

          {features.length > 3 && (
            <Badge variant="outline">
              +{features.length - 3}
            </Badge>
          )}
        </div>
      )
    },
  }),

  columnHelper.display({
    id: "actions",
    enableHiding: false,

    cell: ({ row }) => {
      const plan = row.original

      return (
        <div className="flex justify-end">
          <PlanActions plan={plan} />
        </div>
      )
    },
  }),
])
