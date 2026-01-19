"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Search,
    Send,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    BarChart3,
    Instagram,
    Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Lead Search", href: "/search", icon: Search },
    { name: "Campaigns", href: "/campaigns", icon: Send },
    { name: "Manual Outreach", href: "/outreach/manual", icon: Instagram },
    { name: "Automated Outreach", href: "/outreach/automated", icon: Mail },
    { name: "Outreach Stats", href: "/outreach", icon: BarChart3 },
    { name: "CRM", href: "/crm", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "relative flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out h-screen sticky top-0",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex items-center justify-between p-4 h-16 border-b border-sidebar-border">
                {!isCollapsed && (
                    <span className="text-xl font-bold font-heading tracking-tight text-primary">
                        Aldar
                    </span>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn("h-8 w-8", isCollapsed && "mx-auto")}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 gap-1 flex flex-col px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                                isActive
                                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                isCollapsed && "justify-center px-2"
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-sidebar-border">
                <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                    <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src="/avatar-placeholder.png" />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">Alex Designer</p>
                            <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
