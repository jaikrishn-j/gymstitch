"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import { type DataTableFeatures } from "./data-table-features"
import { StaffActions } from "./StaffActions"

export type StaffPermission =
  | string
  | {
      id?: string
      name: string
    }

export type Staff = {
  id: string
  name: string
  email: string
  permission: StaffPermission[]
}

const columnHelper = createColumnHelper<DataTableFeatures, Staff>()

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
      const name = row.original.name

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
              {row.original.id}
            </p>
          </div>
        </div>
      )
    },
  }),

  columnHelper.accessor("email", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-2 h-8 px-2"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),

    filterFn: "includesString",

    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.email}
      </span>
    ),
  }),

  columnHelper.accessor("permission", {
    header: "Permissions",

    cell: ({ row }) => {
      const permissions = row.original.permission ?? []

      if (permissions.length === 0) {
        return (
          <Badge variant="outline">
            No permissions
          </Badge>
        )
      }

      return (
        <div className="flex max-w-[320px] flex-wrap gap-1.5">
          {permissions.slice(0, 3).map((permission, index) => {
            const label =
              typeof permission === "string"
                ? permission
                : permission.name

            return (
              <Badge
                key={`${label}-${index}`}
                variant="secondary"
                className="font-normal"
              >
                {label}
              </Badge>
            )
          })}

          {permissions.length > 3 && (
            <Badge variant="outline">
              +{permissions.length - 3}
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
      const staff = row.original

      return (
        <div className="flex justify-end">
          <StaffActions staff={staff} />
        </div>
      )
    },
  }),
])