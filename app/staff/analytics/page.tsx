import { checkUserRole } from "@/utils/userRole";
import { PermissionModule } from "@/types/permissions";
import { ShieldAlert } from "lucide-react";
import AnalyticsContent from "@/components/dashboard/analytics-content";

export default async function StaffAnalyticsPage() {
  const hasRead = await checkUserRole(PermissionModule.MEMBERS, "read");

  if (!hasRead) {
    return (
      <div className="w-full">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-background p-12 shadow-sm">
            <div className="rounded-full bg-destructive/10 p-4">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold">Access Denied</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                You don&apos;t have permission to view analytics. Contact your administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AnalyticsContent basePath="/staff" />;
}
