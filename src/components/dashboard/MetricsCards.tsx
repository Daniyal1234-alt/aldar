"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle2, Phone, DollarSign } from "lucide-react";

const metrics = [
    {
        title: "Total Leads Found",
        value: "1,248",
        icon: Users,
        detail: "+12% from last search",
        color: "text-blue-600",
    },
    {
        title: "Verified Emails",
        value: "892",
        icon: CheckCircle2,
        detail: "71.5% validity rate",
        color: "text-emerald-600",
    },
    {
        title: "WhatsApp Numbers",
        value: "654",
        icon: Phone,
        detail: "52% have WA",
        color: "text-green-600",
    },
    {
        title: "Est. Outreach Cost",
        value: "$42.50",
        icon: DollarSign,
        detail: "$0.05 per contact",
        color: "text-purple-600",
    },
];

export function MetricsCards() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
                <Card key={metric.title} className="hover:shadow-lg transition-all duration-200 border-border/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {metric.title}
                        </CardTitle>
                        <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {metric.detail}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
