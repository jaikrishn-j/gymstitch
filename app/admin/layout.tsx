import Adminsidebar from "@/components/admin/Adminsidebar";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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

import { UserRole } from "@/types";
import { redirectByRole } from "@/utils/userRole";

import { auth, clerkClient } from "@clerk/nextjs/server";

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
import { Metadata } from "next";


export const metadata: Metadata = {
    title: {
        template: "%s | Admin Dashboard",
        default: "Admin Dashboard"
    },
    description: "Admin control panel"
}


type Props = {
    children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
    /*
     * redirectByRole() verifies authentication and role.
     */
    const profile = await redirectByRole("/admin", [UserRole.ADMIN]);

    /*
     * Clerk is used here only for the information
     * displayed in the topbar.
     */
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const firstName = user.firstName ?? "";
    const lastName = user.lastName ?? "";

    const fullName =
        `${firstName} ${lastName}`.trim() ||
        user.username ||
        "Admin";

    const email =
        user.emailAddresses[0]?.emailAddress ?? "";

    const imageUrl = user.imageUrl;

    return (
        <SidebarProvider>
            {/* SIDEBAR */}
            <Adminsidebar />

            <SidebarInset>

                {/* ───────────────── TOPBAR ───────────────── */}
                <header
                    className="
                        sticky top-0 z-40
                        flex h-16 shrink-0
                        items-center justify-between
                        border-b bg-background
                        px-4
                    "
                >

                    {/* LEFT SIDE */}
                    <div className="flex min-w-0 items-center gap-2">

                        {/* Sidebar toggle */}
                        <SidebarTrigger className="-ml-1 shrink-0" />

                        <Separator
                            orientation="vertical"
                            className="
                                mr-2
                                data-[orientation=vertical]:h-4
                            "
                        />

                        <DynamicBreadcrumb />
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex shrink-0 items-center gap-2">

                        {/* ───────── NOTIFICATIONS ───────── */}
                        <Link
                            href="/admin/notifications"
                            aria-label="Notifications"
                            className="
                                relative
                                flex h-9 w-9
                                items-center justify-center
                                rounded-md
                                transition-colors
                                hover:bg-muted
                            "
                        >
                            <Bell className="h-5 w-5" />

                            {/* Notification indicator */}
                            <span
                                className="
                                    absolute right-1.5 top-1.5
                                    h-2 w-2
                                    rounded-full
                                    bg-destructive
                                "
                            />
                        </Link>

                        <ModeToggle />

                        {/* ───────── PROFILE DROPDOWN ───────── */}
                        <DropdownMenu>

                            <DropdownMenuTrigger
                                className="
                                    flex items-center gap-2
                                    rounded-md
                                    px-2 py-1.5
                                    outline-none
                                    transition-colors
                                    hover:bg-muted
                                "
                            >

                                {/* Avatar */}
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={fullName}
                                        className="
                                            h-8 w-8
                                            rounded-full
                                            object-cover
                                        "
                                    />
                                ) : (
                                    <div
                                        className="
                                            flex h-8 w-8
                                            items-center justify-center
                                            rounded-full
                                            bg-muted
                                        "
                                    >
                                        <User className="h-4 w-4" />
                                    </div>
                                )}

                                {/* User information */}
                                <div className="hidden text-left md:block">

                                    <p
                                        className="
                                            max-w-32
                                            truncate
                                            text-sm
                                            font-medium
                                        "
                                    >
                                        {fullName}
                                    </p>

                                    <p
                                        className="
                                            max-w-40
                                            truncate
                                            text-xs
                                            text-muted-foreground
                                        "
                                    >
                                        {email}
                                    </p>

                                </div>

                                {/* Dropdown arrow */}
                                <ChevronDown
                                    className="
                                        hidden
                                        h-4 w-4
                                        md:block
                                    "
                                />

                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                className="w-64"
                            >

                                {/* USER INFORMATION */}
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="font-normal">

                                        <div className="flex items-center gap-3">

                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={fullName}
                                                    className="
                                                        h-10 w-10
                                                        rounded-full
                                                        object-cover
                                                    "
                                                />
                                            ) : (
                                                <div
                                                    className="
                                                        flex h-10 w-10
                                                        items-center justify-center
                                                        rounded-full
                                                        bg-muted
                                                    "
                                                >
                                                    <User className="h-5 w-5" />
                                                </div>
                                            )}

                                            <div className="min-w-0">

                                                <p
                                                    className="
                                                        truncate
                                                        text-sm
                                                        font-medium
                                                    "
                                                >
                                                    {fullName}
                                                </p>

                                                <p
                                                    className="
                                                        truncate
                                                        text-xs
                                                        text-muted-foreground
                                                    "
                                                >
                                                    {email}
                                                </p>

                                            </div>

                                        </div>

                                    </DropdownMenuLabel>
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />

                                {/* PROFILE */}
                                <DropdownMenuItem>
                                    <Link
                                        href="/admin/profile"
                                        className="
                                            flex
                                            cursor-pointer
                                            items-center
                                            gap-2
                                        "
                                    >
                                        <User className="h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>

                                {/* SETTINGS */}
                                <DropdownMenuItem>
                                    <Link
                                        href="/admin/settings"
                                        className="
                                            flex
                                            cursor-pointer
                                            items-center
                                            gap-2
                                        "
                                    >
                                        <Settings className="h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* LOGOUT */}
                                <DropdownMenuItem>
                                    <LogoutInfo />
                                </DropdownMenuItem>

                            </DropdownMenuContent>

                        </DropdownMenu>

                    </div>

                </header>

                {/* ───────────────── PAGE CONTENT ───────────────── */}
                <main className="flex-1">
                    {children}
                </main>

            </SidebarInset>
        </SidebarProvider>
    );
};

export default Layout;
