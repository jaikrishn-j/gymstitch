"use client";

import { usePathname } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

export function DynamicBreadcrumb() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean); // e.g. ["admin", "analytics"]

    return (
        <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>

                {segments.slice(1).map((segment, index, arr) => {
                    const isLast = index === arr.length - 1;
                    const href = `/admin/${arr.slice(0, index + 1).join("/")}`;
                    const formattedLabel = segment.charAt(0).toUpperCase() + segment.slice(1);

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{formattedLabel}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href}>{formattedLabel}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}