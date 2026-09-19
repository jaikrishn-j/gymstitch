import MemberSidebar from "@/components/members/app-sidebar";
import { DynamicBreadcrumb } from "@/components/admin/BreadCrumbManager";
import { ModeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

import { UserProfile, UserRole } from "@/types";
import { redirectByRole } from "@/utils/userRole";

import { Bell, Dumbbell, ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { UserButton } from "@clerk/nextjs";

type Props = {
    children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
    // All roles are allowed through the gate so `redirectByRole` can dispatch
    // admins/staff to their own dashboards instead of rejecting them.
    const profile = await redirectByRole("", [
        UserRole.MEMBER,
        UserRole.ADMIN,
        UserRole.STAFF,
    ]);

    return (
        <SidebarProvider>
            <MemberSidebar profile={profile ?? null} />

            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 transition-[height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex min-w-0 items-center gap-2">
                        {/* Faded '| >' subtle mobile sidebar trigger using standard shadcn SidebarTrigger */}
                        <SidebarTrigger className="h-auto w-auto p-0 hover:bg-transparent focus-visible:ring-0 sm:hidden">
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground/40 transition-colors hover:text-foreground">
                                <span className="font-mono text-sm leading-none opacity-60">|</span>
                                <ChevronRight className="h-3 w-3" />
                            </span>
                        </SidebarTrigger>

                        {/* Gymstitch Branding (Visible on desktop & mobile) */}
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 font-bold text-base tracking-tight hover:opacity-80 transition-opacity"
                        >
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Dumbbell className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-foreground">
                                Gymstitch
                            </span>
                        </Link>

                        <Separator
                            orientation="vertical"
                            className="mx-1 h-4"
                        />

                        {/* Dynamic Breadcrumbs */}
                        <div className="min-w-0 flex-1 items-center">
                            <DynamicBreadcrumb />
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Link
                            href="/dashboard/notifications"
                            aria-label="Notifications"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <Bell className="h-4 w-4" />
                            <span className="sr-only">Notifications</span>
                        </Link>

                        <ModeToggle />

                        <Separator
                            orientation="vertical"
                            className="mx-1 h-5"
                        />

                        {/* Gymstitch Right-hand Identity Logo (Replaces standard user icon) */}
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