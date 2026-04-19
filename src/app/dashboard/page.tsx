"use client";

export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Target, CheckCircle2, ThumbsUp, ThumbsDown, Minus, HelpCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";

interface DashboardMetrics {
    totalCampaigns: number;
    activeCampaigns: number;
    totalLeads: number;
    interestedLeads: number;
    notInterestedLeads: number;
    neutralLeads: number;
    questionLeads: number;
    leadsBySource: { name: string; value: number }[];
    leadsByDay: { day: string; leads: number }[];
}

const COLORS = ['#FF6B35', '#E8B99F', '#1a1a1a', '#666666'];

export default function DashboardOverviewPage() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalLeads: 0,
        interestedLeads: 0,
        notInterestedLeads: 0,
        neutralLeads: 0,
        questionLeads: 0,
        leadsBySource: [],
        leadsByDay: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);

        try {
            // Fetch campaigns
            const { data: campaigns, error: campaignsError } = await supabase
                .from('campaigns')
                .select('*');

            if (campaignsError) throw campaignsError;

            // Fetch leads
            const { data: leads, error: leadsError } = await supabase
                .from('leads')
                .select('*');

            if (leadsError) throw leadsError;

            // Calculate metrics
            const totalCampaigns = campaigns?.length || 0;
            const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
            const totalLeads = leads?.length || 0;
            const interestedLeads = leads?.filter(l => l.reply_intent === 'interested').length || 0;
            const notInterestedLeads = leads?.filter(l => l.reply_intent === 'not_interested').length || 0;
            const neutralLeads = leads?.filter(l => l.reply_intent === 'neutral').length || 0;
            const questionLeads = leads?.filter(l => l.reply_intent === 'question').length || 0;

            // Leads by source
            const sourceCount: Record<string, number> = {};
            leads?.forEach(lead => {
                const source = lead.lead_source || 'unknown';
                sourceCount[source] = (sourceCount[source] || 0) + 1;
            });
            const leadsBySource = Object.entries(sourceCount).map(([name, value]) => ({ name, value }));

            // Leads by day (last 7 days)
            const last7Days: { day: string; leads: number }[] = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = date.toISOString().split('T')[0];
                const count = leads?.filter(l => l.created_at.startsWith(dateStr)).length || 0;
                last7Days.push({ day: dayStr, leads: count });
            }

            setMetrics({
                totalCampaigns,
                activeCampaigns,
                totalLeads,
                interestedLeads,
                notInterestedLeads,
                neutralLeads,
                questionLeads,
                leadsBySource,
                leadsByDay: last7Days
            });

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const kpiCards = [
        { title: "Total Campaigns", value: metrics.totalCampaigns, icon: Target, color: "text-primary" },
        { title: "Active Campaigns", value: metrics.activeCampaigns, icon: CheckCircle2, color: "text-green-600" },
        { title: "Total Leads", value: metrics.totalLeads, icon: Users, color: "text-blue-600" },
    ];

    return (
        <div className="flex h-screen bg-zinc-50/50 dark:bg-zinc-900 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 space-y-6">

                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold font-heading">Dashboard</h1>
                        <div className="text-sm text-muted-foreground">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            {/* KPI Cards */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {kpiCards.map((kpi) => (
                                    <Card key={kpi.title} className="shadow-none border-border rounded-xl hover:shadow-md transition-shadow">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                {kpi.title}
                                            </CardTitle>
                                            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold">{kpi.value}</div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Reply Intent Breakdown */}
                            <div className="grid gap-4 md:grid-cols-4">
                                <Card className="shadow-none border-border rounded-xl">
                                    <CardContent className="p-6 text-center">
                                        <ThumbsUp className="h-5 w-5 text-green-600 mx-auto mb-2" />
                                        <div className="text-4xl font-bold text-green-600">{metrics.interestedLeads}</div>
                                        <div className="text-sm text-muted-foreground mt-1">Interested</div>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-none border-border rounded-xl">
                                    <CardContent className="p-6 text-center">
                                        <ThumbsDown className="h-5 w-5 text-red-600 mx-auto mb-2" />
                                        <div className="text-4xl font-bold text-red-600">{metrics.notInterestedLeads}</div>
                                        <div className="text-sm text-muted-foreground mt-1">Not Interested</div>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-none border-border rounded-xl">
                                    <CardContent className="p-6 text-center">
                                        <Minus className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
                                        <div className="text-4xl font-bold text-yellow-600">{metrics.neutralLeads}</div>
                                        <div className="text-sm text-muted-foreground mt-1">Neutral</div>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-none border-border rounded-xl">
                                    <CardContent className="p-6 text-center">
                                        <HelpCircle className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                                        <div className="text-4xl font-bold text-blue-600">{metrics.questionLeads}</div>
                                        <div className="text-sm text-muted-foreground mt-1">Question</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* Leads Over Time Chart */}
                                <Card className="lg:col-span-2 shadow-none border-border rounded-xl">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Leads This Week</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[250px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={metrics.leadsByDay} barSize={24}>
                                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} allowDecimals={false} />
                                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                                    <Bar dataKey="leads" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Leads by Source Pie Chart */}
                                <Card className="shadow-none border-border rounded-xl">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Leads by Source</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {metrics.leadsBySource.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground text-sm">
                                                No leads data yet.
                                            </div>
                                        ) : (
                                            <>
                                                <div className="h-[180px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={metrics.leadsBySource}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={50}
                                                                outerRadius={70}
                                                                paddingAngle={3}
                                                                dataKey="value"
                                                                stroke="none"
                                                            >
                                                                {metrics.leadsBySource.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs">
                                                    {metrics.leadsBySource.map((item, index) => (
                                                        <div key={item.name} className="flex items-center gap-1">
                                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                            <span className="capitalize">{item.name} ({item.value})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                            </div>
                        </>
                    )}

                </main>
            </div>
        </div>
    );
}
