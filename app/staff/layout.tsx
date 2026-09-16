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
import { UserButton } from "@clerk/nextjs";

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
                <div className="flex h-14 items-center border-b bg-background px-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />

                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                        />

                        <div className="text-sm font-medium">
                            Admin
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <Link
                            href="/admin/notifications"
                            className="
                                flex h-9 w-9 items-center justify-center
                                rounded-md
                                text-muted-foreground
                                transition-colors
                                hover:bg-accent
                                hover:text-foreground
                            "
                        >
                            <Bell className="h-4 w-4" />
                        </Link>

                        <ModeToggle />

                        <Separator
                            orientation="vertical"
                            className="mx-1 h-6"
                        />

                        <UserButton />
                    </div>
                </div>

                <main className="flex-1">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Layout;