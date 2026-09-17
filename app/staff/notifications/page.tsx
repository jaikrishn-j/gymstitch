import React from "react";
import { Bell, ShieldAlert } from "lucide-react";

import { NotificationContent } from "@/components/notifications/notification-content";
import { checkUserRole } from "@/utils/userRole";
import { PermissionModule } from "@/types/permissions";

export default async function StaffNotificationsPage() {
  const hasRead = await checkUserRole(PermissionModule.MEMBERS, "read");

  if (!hasRead) {
    return (
      <main className="w-full min-h-screen bg-background pb-12">
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 border-b pb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Notifications
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Member payment requests.
              </p>
            </div>
          </div>

          <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-md border p-8 text-center">
            <div className="rounded-full bg-muted p-3">
              <ShieldAlert className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="max-w-md space-y-1">
              <h2 className="font-semibold">Access Denied</h2>
              <p className="text-sm text-muted-foreground">
                You don&apos;t have permission to view notifications.
                Contact your administrator if you need access.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const hasFull = await checkUserRole(PermissionModule.MEMBERS, "full");

  return (
    <main className="w-full min-h-screen bg-background pb-12">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3 border-b pb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Notifications
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Member payment requests.
            </p>
          </div>
        </div>

        <NotificationContent isAdmin={false} hasFull={hasFull} />
      </div>
    </main>
  );
}
