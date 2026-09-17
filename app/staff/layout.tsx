import Adminsidebar from "@/components/admin/Adminsidebar";
import Staffsidebar from "@/components/staff/Staffsidebar";
import { DynamicBreadcrumb } from "@/components/admin/BreadCrumbManager";
import { ModeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";

import { UserProfile, UserRole } from "@/types";
import { checkUserType } from "@/utils/userRole";

import { Bell } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
  const user: UserProfile | null = await checkUserType([
    UserRole.STAFF,
    UserRole.ADMIN,
  ]);

  if (!user) return null;

  return (
    <SidebarProvider>
      <Staffsidebar profile={user} />

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center border-b bg-background px-4">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger />

            <Separator
              orientation="vertical"
              className="mx-1 h-4"
            />

            <div className="hidden min-w-0 items-center sm:flex">
              <DynamicBreadcrumb />
            </div>

            <div className="flex items-center sm:hidden">
              <span className="text-sm font-medium">Staff</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/staff/notifications"
              aria-label="Notifications"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Link>

            <ModeToggle />

            <Separator
              orientation="vertical"
              className="mx-2 h-6"
            />

            <UserButton />
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;