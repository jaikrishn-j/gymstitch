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
    LayoutDashboard,
    Users,
    CreditCard,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../ui/collapsible";

import { UserProfile } from "@/types";

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
        title: "Payments",
        icon: CreditCard,
        items: [
            {
                title: "Payments",
                url: "/staff/payment",
            },
            {
                title: "Plans",
                url: "/staff/plans",
            },
        ],
    },
];

const Staffsidebar = async ({
    profile,
}: {
    profile: UserProfile;
}) => {
    if (!profile) {
        return redirect("/login", RedirectType.replace);
    }

    const fullName =
        `${profile.firstName ?? ""} ${profile.lastname ?? ""}`.trim() ||
        "Staff";

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="border-r"
        >
            {/* ───────────────── BRAND ───────────────── */}

            <SidebarHeader className="px-3 pb-3 pt-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link
                            href="/staff"
                            className="
                                group
                                flex h-14 items-center gap-3
                                rounded-xl
                                px-2.5
                                transition-colors
                                hover:bg-sidebar-accent
                            "
                        >
                            <div
                                className="
                                    flex h-9 w-9 shrink-0
                                    items-center justify-center
                                    rounded-xl
                                    bg-primary
                                    text-primary-foreground
                                    shadow-sm
                                "
                            >
                                <Dumbbell className="h-[18px] w-[18px]" />
                            </div>

                            <div className="min-w-0 flex-1 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                                <div className="flex items-center gap-1.5">
                                    <span className="truncate text-[15px] font-bold tracking-tight">
                                        Gym Stitch
                                    </span>

                                    <Sparkles className="h-3 w-3 shrink-0 text-muted-foreground" />
                                </div>

                                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                                    Staff workspace
                                </p>
                            </div>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ───────────────── NAVIGATION ───────────────── */}

            <SidebarContent className="px-3">
                <div className="mb-3 px-2 pt-2 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Workspace
                    </p>
                </div>

                <SidebarMenu className="gap-2">
                    {data.map((group) => {
                        const GroupIcon = group.icon;

                        return (
                            <Collapsible
                                key={group.title}
                                defaultOpen
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger
                                        render={
                                            <SidebarMenuButton
                                                tooltip={group.title}
                                                className="
                                                    h-10
                                                    rounded-xl
                                                    px-2
                                                    font-medium
                                                    transition-colors
                                                    hover:bg-sidebar-accent
                                                    data-[state=open]:bg-sidebar-accent/70
                                                "
                                            />
                                        }
                                    >
                                        <span
                                            className="
                                                flex h-7 w-7 shrink-0
                                                items-center justify-center
                                                rounded-lg
                                                bg-muted
                                                text-muted-foreground
                                                transition-colors
                                                group-data-[state=open]/collapsible:bg-background
                                                group-data-[state=open]/collapsible:text-foreground
                                            "
                                        >
                                            <GroupIcon className="h-[15px] w-[15px]" />
                                        </span>

                                        <span className="truncate">
                                            {group.title}
                                        </span>

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

                                    <CollapsibleContent>
                                        <SidebarMenuSub
                                            className="
                                                ml-3.5
                                                mt-1
                                                border-l
                                                border-border/70
                                                px-2
                                            "
                                        >
                                            {group.items.map((item) => (
                                                <SidebarMenuSubItem
                                                    key={item.url}
                                                >
                                                    <SidebarMenuSubButton
                                                        render={
                                                            <Link
                                                                href={item.url}
                                                            />
                                                        }
                                                        className="
                                                            h-9
                                                            rounded-lg
                                                            text-sm
                                                            text-muted-foreground
                                                            transition-colors
                                                            hover:bg-sidebar-accent
                                                            hover:text-foreground
                                                        "
                                                    >
                                                        <span className="truncate">
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

            {/* ───────────────── STAFF STATUS ───────────────── */}

            <SidebarFooter className="px-3 pb-3">
                <div
                    className="
                        rounded-xl
                        bg-muted/60
                        p-2
                        group-data-[collapsible=icon]/sidebar-wrapper:bg-transparent
                        group-data-[collapsible=icon]/sidebar-wrapper:p-0
                    "
                >
                    <div
                        className="
                            flex items-center gap-3
                            rounded-lg
                            bg-background
                            px-2.5 py-2.5
                            shadow-sm
                            ring-1 ring-border/60
                            group-data-[collapsible=icon]/sidebar-wrapper:justify-center
                            group-data-[collapsible=icon]/sidebar-wrapper:px-0
                        "
                    >
                        <div
                            className="
                                flex h-8 w-8 shrink-0
                                items-center justify-center
                                rounded-full
                                bg-muted
                                ring-1 ring-border
                            "
                        >
                            {profile.imageUrl ? (
                                <img
                                    src={profile.imageUrl}
                                    alt={fullName}
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            ) : (
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                            <p className="truncate text-xs font-semibold">
                                {fullName}
                            </p>

                            <p className="truncate text-[11px] text-muted-foreground">
                                Staff member
                            </p>
                        </div>

                        <div
                            className="
                                h-1.5 w-1.5 shrink-0
                                rounded-full
                                bg-emerald-500
                                group-data-[collapsible=icon]/sidebar-wrapper:hidden
                            "
                        />
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
};

export default Staffsidebar;
