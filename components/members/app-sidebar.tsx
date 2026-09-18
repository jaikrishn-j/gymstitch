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
    CreditCard,
    Dumbbell,
    LayoutDashboard,
    Receipt,
    Settings,
    Sparkles,
    User,
} from "lucide-react";

import { UserProfile, UserRole } from "@/types";
import { checkUserType } from "@/utils/userRole";
import LogoutInfo from "./LogoutInfo";

const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "My Plan", url: "/dashboard/plan", icon: CreditCard },
    { title: "Transactions", url: "/dashboard/transactions", icon: Receipt },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const MemberSidebar = async () => {
    const profile: UserProfile | null = await checkUserType([UserRole.MEMBER]);

    if (!profile) {
        redirect("/login", RedirectType.replace);
    }

    const fullName =
        `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
        "Member";

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-r">
            {/* BRAND HEADER */}
            {/* BRAND HEADER */}
            <SidebarHeader className="px-3 pb-3 pt-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="
                                group
                                flex h-16 items-center gap-3
                                rounded-xl
                                px-3
                                py-2
                                transition-colors
                                hover:bg-sidebar-accent
                            "
                        >
                            <Link href="/dashboard" className="flex items-center gap-3">
                                <div
                                    className="
                                        relative
                                        flex h-10 w-10 shrink-0
                                        items-center justify-center
                                        rounded-xl
                                        bg-primary
                                        text-primary-foreground
                                        shadow-sm
                                    "
                                >
                                    <Dumbbell className="h-5 w-5" />
                                </div>

                                <div className="min-w-0 flex-1 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                                    <div className="flex items-center gap-1.5">
                                        <span className="truncate text-[15px] font-bold leading-tight tracking-tight">
                                            Gym Stitch
                                        </span>
                                        <Sparkles className="h-3 w-3 shrink-0 text-muted-foreground" />
                                    </div>
                                    <p className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
                                        Member Portal
                                    </p>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* NAVIGATION */}
            <SidebarContent className="px-3">
                <div className="mb-3 px-2 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Workspace
                    </p>
                </div>

                <SidebarMenu className="gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <SidebarMenuItem key={item.url}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    className="h-10 rounded-xl px-2.5 font-medium hover:bg-sidebar-accent"
                                >
                                    <Link
                                        href={item.url}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                            <Icon className="h-[15px] w-[15px]" />
                                        </span>
                                        <span className="truncate">
                                            {item.title}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            {/* PROFILE FOOTER */}
            <SidebarFooter className="px-3 pb-3">
                <div className="rounded-xl bg-muted/60 p-1.5 group-data-[collapsible=icon]/sidebar-wrapper:bg-transparent group-data-[collapsible=icon]/sidebar-wrapper:p-0">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    {/* NOTE: single element, no nested button */}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className="
                                            group flex w-full cursor-pointer items-center gap-3
                                            rounded-lg bg-background
                                            px-2.5 py-2
                                            text-left
                                            shadow-sm ring-1 ring-border/60
                                            outline-none transition-colors
                                            hover:bg-sidebar-accent
                                            focus-visible:ring-2 focus-visible:ring-sidebar-ring
                                            data-[state=open]:bg-sidebar-accent
                                            group-data-[collapsible=icon]/sidebar-wrapper:justify-center
                                            group-data-[collapsible=icon]/sidebar-wrapper:px-0
                                        "
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border">
                                            {profile.imageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={profile.imageUrl}
                                                    alt={fullName}
                                                    className="h-8 w-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                                            <p className="truncate text-xs font-semibold">
                                                {fullName}
                                            </p>
                                            <p className="truncate text-[11px] text-muted-foreground">
                                                {profile.email}
                                            </p>
                                        </div>

                                        <ChevronDown
                                            className="
                                                h-4 w-4 shrink-0 text-muted-foreground
                                                transition-transform duration-200
                                                group-data-[state=open]:rotate-180
                                                group-data-[collapsible=icon]/sidebar-wrapper:hidden
                                            "
                                        />
                                    </div>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    align="end"
                                    side="top"
                                    className="w-60"
                                >
                                    <DropdownMenuGroup>
                                        <div className="px-3 py-2.5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border">
                                                    {profile.imageUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={profile.imageUrl}
                                                            alt={fullName}
                                                            className="h-9 w-9 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-semibold">
                                                        {fullName}
                                                    </p>
                                                    <p className="truncate text-[11px] text-muted-foreground">
                                                        {profile.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/dashboard/profile"
                                                className="flex cursor-pointer items-center gap-2"
                                            >
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span>Profile</span>
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/dashboard/settings"
                                                className="flex cursor-pointer items-center gap-2"
                                            >
                                                <Settings className="h-4 w-4 text-muted-foreground" />
                                                <span>Settings</span>
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem className="p-0 focus:bg-transparent">
                                            <LogoutInfo />
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
};

export default MemberSidebar;