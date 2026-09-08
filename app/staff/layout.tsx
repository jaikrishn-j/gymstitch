import Adminsidebar from "@/components/admin/Adminsidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { UserProfile, UserRole } from "@/types";
import { checkUserType } from "@/utils/userRole";

import {
    Bell,
    ChevronDown,
    Settings,
    User,
} from "lucide-react";

import Link from "next/link";
import React from "react";
import LogoutInfo from "@/components/members/LogoutInfo";
import { DynamicBreadcrumb } from "@/components/admin/BreadCrumbManager";
import { ModeToggle } from "@/components/ThemeToggle";
import Staffsidebar from "@/components/staff/Staffsidebar";

type Props = {
    children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
    const user: UserProfile | null = await checkUserType([
        UserRole.STAFF,
        UserRole.ADMIN,
    ]);

    if (!user) return null;

    const firstName = user.firstName ?? "";
    const lastName = user.lastname ?? "";

    const fullName =
        `${firstName} ${lastName}`.trim() || user.role;

    const email = user.email;
    const imageUrl = user.imageUrl;

    return (
        <SidebarProvider>
            <Staffsidebar profile={user}/>

            <SidebarInset>
                <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
                    <div className="flex min-w-0 items-center gap-2">
                        <SidebarTrigger className="-ml-1 shrink-0" />

                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />

                        <DynamicBreadcrumb />
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <Link
                            href="/staff/notifications"
                            aria-label="Notifications"
                            className="relative flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted"
                        >
                            <Bell className="h-5 w-5" />

                            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
                        </Link>

                        <ModeToggle />

                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className="flex items-center gap-2 rounded-md px-2 py-1.5 outline-none transition-colors hover:bg-muted"
                            >
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={fullName}
                                        className="h-8 w-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}

                                <div className="hidden text-left md:block">
                                    <p className="max-w-32 truncate text-sm font-medium">
                                        {fullName}
                                    </p>

                                    <p className="max-w-40 truncate text-xs text-muted-foreground">
                                        {email}
                                    </p>
                                </div>

                                <ChevronDown className="hidden h-4 w-4 md:block" />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-64">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex items-center gap-3">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={fullName}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                    <User className="h-5 w-5" />
                                                </div>
                                            )}

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {fullName}
                                                </p>

                                                <p className="truncate text-xs text-muted-foreground">
                                                    {email}
                                                </p>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem >
                                    <Link
                                        href="/staff/profile"
                                        className="flex cursor-pointer items-center gap-2"
                                    >
                                        <User className="h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem >
                                    <Link
                                        href="/staff/settings"
                                        className="flex cursor-pointer items-center gap-2"
                                    >
                                        <Settings className="h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem>
                                    <LogoutInfo />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Layout;