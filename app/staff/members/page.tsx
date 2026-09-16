import { checkUserRole } from "@/utils/userRole";
import { PermissionModule } from "@/types/permissions";
import { ShieldAlert } from "lucide-react";
import MembersContent from "./MembersContent";

export default async function StaffMembersPage() {
  const hasRead = await checkUserRole(
    PermissionModule.MEMBERS,
    "read",
  );

  if (!hasRead) {
    return (
      <div className="w-full">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Members
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View gym members and their subscriptions.
            </p>
          </div>

          <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-md border p-8 text-center">
            <div className="rounded-full bg-muted p-3">
              <ShieldAlert className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="max-w-md space-y-1">
              <h2 className="font-semibold">Access Denied</h2>
              <p className="text-sm text-muted-foreground">
                You don&apos;t have permission to view members.
                Contact your administrator if you need access.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasFull = await checkUserRole(
    PermissionModule.MEMBERS,
    "full",
  );

  return <MembersContent hasFull={hasFull} />;
}