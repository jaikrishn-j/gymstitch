// permission.ts
export enum PermissionModule {
  MEMBERS = "members",
  STAFF = "staff",
  PAYMENTS = "payments",
}

export type PermissionLevel = "read" | "full" | null;

export const PERMISSION_MODULES = [
  {
    key: PermissionModule.MEMBERS,
    label: "Members",
    description: "Access to view and manage member profiles",
  },
  {
    key: PermissionModule.STAFF,
    label: "Staff",
    description: "Access to manage staff members and roles",
  },
  {
    key: PermissionModule.PAYMENTS,
    label: "Payments",
    description: "Access to financial records and transactions",
  },
] as const;