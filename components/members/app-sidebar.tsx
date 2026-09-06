import React from "react";
import Link from "next/link";
import { redirect, RedirectType } from "next/navigation";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from "../ui/sidebar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import {
    ChevronDown,
    Dumbbell,
    LogOut,
    Settings,
    User,
    CreditCard,
    Receipt,
    LayoutDashboard,
} from "lucide-react";

import { UserProfile, UserRole } from "@/types";
import { checkUserType } from "@/utils/userRole";
import LogoutInfo from "./LogoutInfo";

const data = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "My Plan",
        url: "/dashboard/plan",
        icon: CreditCard,
    },
    {
        title: "Transactions",
        url: "/dashboard/transactions",
        icon: Receipt,
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
    },
];

const MemberSidebar = async () => {
    const profile: UserProfile | null = await checkUserType([
        UserRole.MEMBER,
    ]);

    if (!profile) {
        return redirect("/login", RedirectType.replace);
    }

    const fullName =
        `${profile.firstName ?? ""} ${profile.lastname ?? ""}`.trim() ||
        "Member";

    return (
        <Sidebar collapsible="icon">
            {/* ───────────────── HEADER ───────────────── */}
            <SidebarHeader className="border-b">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className="
                                    group flex w-full items-center gap-3
                                    rounded-lg px-2 py-2.5
                                    text-left outline-none
                                    transition-colors
                                    hover:bg-sidebar-accent
                                    hover:text-sidebar-accent-foreground
                                    focus-visible:ring-2
                                    focus-visible:ring-sidebar-ring
                                "
                            >
                                {/* Avatar */}
                                {profile.imageUrl ? (
                                    <img
                                        src={profile.imageUrl}
                                        alt={fullName}
                                        className="h-9 w-9 shrink-0 rounded-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="
                                            flex h-9 w-9 shrink-0
                                            items-center justify-center
                                            rounded-full
                                            bg-primary/10
                                            text-primary
                                        "
                                    >
                                        <User className="h-4 w-4" />
                                    </div>
                                )}

                                {/* User information */}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold">
                                        {fullName}
                                    </p>

                                    <p className="truncate text-xs text-muted-foreground">
                                        {profile.email}
                                    </p>
                                </div>

                                <ChevronDown
                                    className="
                                        h-4 w-4 shrink-0
                                        text-muted-foreground
                                        transition-transform
                                        duration-200
                                        group-data-[state=open]:rotate-180
                                    "
                                />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="start"
                                side="bottom"
                                className="w-64"
                            >
                                <DropdownMenuGroup>
                                {/* Profile summary */}
                                    <div className="px-3 py-3">
                                    <div className="flex items-center gap-3">
                                        {profile.imageUrl ? (
                                            <img
                                                src={profile.imageUrl}
                                                alt={fullName}
                                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="
                                                    flex h-10 w-10 shrink-0
                                                    items-center justify-center
                                                    rounded-full
                                                    bg-primary/10
                                                    text-primary
                                                "
                                            >
                                                <User className="h-5 w-5" />
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                {fullName}
                                            </p>

                                            <p className="truncate text-xs text-muted-foreground">
                                                {profile.email}
                                            </p>
                                        </div>
                                    </div>
                                    </div>

                                    <DropdownMenuSeparator />

                                    {/* Profile */}
                                    <DropdownMenuItem>
                                        <Link
                                            href="/dashboard/profile"
                                            className="flex cursor-pointer items-center gap-2"
                                        >
                                            <User className="h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    {/* Settings */}
                                    <DropdownMenuItem>
                                        <Link
                                            href="/dashboard/settings"
                                            className="flex cursor-pointer items-center gap-2"
                                        >
                                            <Settings className="h-4 w-4" />
                                            <span>Settings</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    {/* Logout */}
                                    <LogoutInfo />
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ───────────────── CONTENT ───────────────── */}
            <SidebarContent className="px-2 py-4">
                <SidebarMenu className="gap-1">
                    {data.map((item) => {
                        const Icon = item.icon;

                        return (
                            <SidebarMenuItem key={item.url}>
                                <Link
                                    href={item.url}
                                    className="
                                        group flex h-10 w-full
                                        items-center gap-3
                                        rounded-lg px-3
                                        text-sm font-medium
                                        text-sidebar-foreground/80
                                        outline-none
                                        transition-all duration-200
                                        hover:bg-sidebar-accent
                                        hover:text-sidebar-accent-foreground
                                        focus-visible:ring-2
                                        focus-visible:ring-sidebar-ring
                                    "
                                >
                                    <Icon
                                        className="
                                            h-[18px] w-[18px] shrink-0
                                            transition-transform
                                            duration-200
                                            group-hover:scale-105
                                        "
                                    />

                                    <span className="truncate">
                                        {item.title}
                                    </span>
                                </Link>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            {/* ───────────────── FOOTER ───────────────── */}
            <SidebarFooter className="border-t p-2">
                <div
                    className="
                        flex items-center gap-3
                        rounded-lg
                        bg-sidebar-accent/50
                        px-3 py-2.5
                    "
                >
                    <div
                        className="
                            flex h-8 w-8 shrink-0
                            items-center justify-center
                            rounded-full
                            bg-primary/10
                            text-primary
                        "
                    >
                        <Dumbbell className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                            Member Portal
                        </p>

                        <p className="truncate text-[11px] text-muted-foreground">
                            GymStitch
                        </p>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
};

export default MemberSidebar;
