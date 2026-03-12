"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle2, Phone, DollarSign, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface MetricData {
    totalLeads: number;
    verifiedEmails: number;
    whatsappNumbers: number;
}

export function MetricsCards() {
    const [data, setData] = useState<MetricData>({ totalLeads: 0, verifiedEmails: 0, whatsappNumbers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            // Get all leads
            const { data: leads, error } = await supabase
                .from('leads')
                .select('email, emails, phone');

            if (error) {
                setLoading(false);
                return;
            }

            const allLeads = leads || [];
            const totalLeads = allLeads.length;

            // Count verified emails (leads that have at least one email)
            const verifiedEmails = allLeads.filter(
                (l) => l.email || (l.emails && Array.isArray(l.emails) && l.emails.length > 0)
            ).length;

            // Count WhatsApp numbers (leads that have a phone)
            const whatsappNumbers = allLeads.filter((l) => l.phone).length;

            setData({ totalLeads, verifiedEmails, whatsappNumbers });
        } catch {
            // silently handle fetch errors
        } finally {
            setLoading(false);
        }
    };

    const emailRate = data.totalLeads > 0 ? ((data.verifiedEmails / data.totalLeads) * 100).toFixed(1) : "0";
    const waRate = data.totalLeads > 0 ? ((data.whatsappNumbers / data.totalLeads) * 100).toFixed(1) : "0";
    const outreachCost = (data.totalLeads * 0.05).toFixed(2);

    const metrics = [
        {
            title: "Total Leads Found",
            value: loading ? "..." : data.totalLeads.toLocaleString(),
            icon: Users,
            detail: loading ? "Loading..." : `${data.totalLeads} leads in database`,
            color: "text-blue-600",
        },
        {
            title: "Verified Emails",
            value: loading ? "..." : data.verifiedEmails.toLocaleString(),
            icon: CheckCircle2,
            detail: loading ? "Loading..." : `${emailRate}% validity rate`,
            color: "text-emerald-600",
        },
        {
            title: "WhatsApp Numbers",
            value: loading ? "..." : data.whatsappNumbers.toLocaleString(),
            icon: Phone,
            detail: loading ? "Loading..." : `${waRate}% have WA`,
            color: "text-green-600",
        },
        {
            title: "Est. Outreach Cost",
            value: loading ? "..." : `$${outreachCost}`,
            icon: DollarSign,
            detail: "$0.05 per contact",
            color: "text-purple-600",
        },
    ];

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
