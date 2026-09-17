import React from "react";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";

import { NotificationContent } from "@/components/notifications/notification-content";
import { redirectByRole } from "@/utils/userRole";
import { UserRole } from "@/types";

export default async function AdminNotificationsPage() {
  const user = await redirectByRole("/admin/notifications", [UserRole.ADMIN]);
  if (!user) redirect("/login");

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
              Manage member payment requests.
            </p>
          </div>
        </div>

        <NotificationContent isAdmin={true} hasFull={true} />
      </div>
    </main>
  );
}
