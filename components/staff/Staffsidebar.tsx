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
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "../ui/sidebar";

import {
    ChevronDown,
    Dumbbell,
    User,
    Settings,
    LayoutDashboard,
    BarChart3,
    Users,
    UserCog,
    CreditCard,
    Receipt,
    ShieldCheck,
    Building2,
} from "lucide-react";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../ui/collapsible";

import { UserProfile, UserRole } from "@/types";
import { checkUserType } from "@/utils/userRole";
import LogoutInfo from "../members/LogoutInfo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

const data = [
    {
        title: "Home",
        icon: LayoutDashboard,
        items: [
            {
                title: "Dashboard",
                url: "/staff",
            },
            {
                title: "Analytics",
                url: "/staff/analytics",
            },
        ],
    },

    {
        title: "Users",
        icon: Users,
        items: [
            {
                title: "Members",
                url: "/staff/members",
            },
            {
                title: "Staff",
                url: "/staff/staff",
            },
        ],
    },

    {
        title: "Payment",
        icon: CreditCard,
        items: [
            {
                title: "Payment",
                url: "/staff/payment",
            },
            {
                title: "Plans",
                url: "/staff/plans",
            },
        ],
    },

];

const Staffsidebar = async ({profile}:{profile:UserProfile}) => {

    if (!profile) {
        return redirect("/login", RedirectType.replace);
    }

    const fullName =
        `${profile.firstName ?? ""} ${profile.lastname ?? ""}`.trim() ||
        "Staff";

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
                                        className="
                                            h-9 w-9 shrink-0
                                            rounded-full object-cover
                                        "
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
                                                    className="
                                                        h-10 w-10 shrink-0
                                                        rounded-full object-cover
                                                    "
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
                                            href="/staff/profile"
                                            className="
                                                flex cursor-pointer
                                                items-center gap-2
                                            "
                                        >
                                            <User className="h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    {/* Settings */}
                                    <DropdownMenuItem>
                                        <Link
                                            href="/staff/settings"
                                            className="
                                                flex cursor-pointer
                                                items-center gap-2
                                            "
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

                    {data.map((group) => {
                        const GroupIcon = group.icon;

                        return (
                            <Collapsible
                                key={group.title}
                                defaultOpen
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>

                                    {/* Group */}
                                    <CollapsibleTrigger
                                        render={
                                            <SidebarMenuButton
                                                tooltip={group.title}
                                                className="
                                                    h-10
                                                    rounded-lg
                                                    font-medium
                                                    transition-all
                                                    duration-200
                                                    hover:bg-sidebar-accent
                                                    hover:text-sidebar-accent-foreground
                                                "
                                            />
                                        }
                                    >
                                        <GroupIcon className="h-[18px] w-[18px]" />

                                        <span className="truncate">
                                            {group.title}
                                        </span>

                                        {/* Expand / Collapse arrow */}
                                        <ChevronDown
                                            className="
                                                ml-auto
                                                h-4 w-4
                                                shrink-0
                                                text-muted-foreground
                                                transition-transform
                                                duration-200
                                                group-data-[state=open]/collapsible:rotate-180
                                            "
                                        />
                                    </CollapsibleTrigger>

                                    {/* Sub items */}
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="ml-3.5 border-l px-2">

                                            {group.items.map((item) => (
                                                <SidebarMenuSubItem
                                                    key={item.url}
                                                >
                                                    <SidebarMenuSubButton
                                                        render={
                                                            <Link href={item.url} />
                                                        }
                                                        className="
                                                            h-9
                                                            rounded-lg
                                                            text-sidebar-foreground/75
                                                            transition-all
                                                            duration-200
                                                            hover:bg-sidebar-accent
                                                            hover:text-sidebar-accent-foreground
                                                        "
                                                    >
                                                        <span>
                                                            {item.title}
                                                        </span>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}

                                        </SidebarMenuSub>
                                    </CollapsibleContent>

                                </SidebarMenuItem>
                            </Collapsible>
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
                            Staff Portal
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

export default Staffsidebar;
