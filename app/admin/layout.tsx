import Adminsidebar from "@/components/admin/Adminsidebar";
import { NotificationBadge } from "@/components/notifications/notification-badge";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserProfile, UserRole } from "@/types";
import { redirectByRole } from "@/utils/userRole";
import { Bell } from "lucide-react";
import Link from "next/link";
import React from "react";
import { DynamicBreadcrumb } from "@/components/admin/BreadCrumbManager";
import { ModeToggle } from "@/components/ThemeToggle";
import { Metadata } from "next";
import { UserButton } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin Dashboard",
    default: "Admin Dashboard",
  },
  description: "Admin control panel",
};

type Props = {
  children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
  const user: UserProfile | void = await redirectByRole(
    "/admin",
    [UserRole.ADMIN],
  );

  if (!user) return null;

  return (
    <SidebarProvider>
      <Adminsidebar profile={user} />

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
              <span className="text-sm font-medium">Admin</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <ButtonLink
              href="/admin/notifications"
              label="Notifications"
            >
              <span className="relative">
                <Bell className="h-4 w-4" />
                <NotificationBadge />
              </span>
            </ButtonLink>

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

function ButtonLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
      <span className="sr-only">{label}</span>
    </Link>
  );
}

export default Layout;