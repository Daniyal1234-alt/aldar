"use client";

import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

export function Header() {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 bg-background">
            <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold font-heading tracking-tight leading-none">
                        Lead Generation Control
                    </h1>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Lead Search</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <Bell className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button size="sm" className="h-9 gap-1 font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4" />
                    <span>New Search</span>
                </Button>
            </div>
        </header>
    );
}
