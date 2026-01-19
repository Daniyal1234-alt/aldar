"use client";

export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Users, Mail, MessageSquare, TrendingUp, Send } from "lucide-react";
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
    Cell,
    Legend
} from "recharts";

interface Lead {
    id: string;
    created_at: string;
    campaign_id: number;
    full_name: string | null;
    email: string | null;
    company_name: string | null;
    outreach_status: string | null;
    lead_source: string | null;
}

interface Campaign {
    id: number;
    campaign_name: string;
}

interface OutreachMetrics {
    totalLeads: number;
    newLeads: number;
    contactedLeads: number;
    repliedLeads: number;
    responseRate: number;
    statusBreakdown: { name: string; value: number; color: string }[];
    outreachByDay: { day: string; new: number; contacted: number; replied: number }[];
    campaignPerformance: { name: string; total: number; contacted: number; replied: number; rate: number }[];
    recentActivity: (Lead & { campaign_name: string })[];
}

const STATUS_COLORS = {
    new: '#3B82F6',
    contacted: '#F59E0B',
    replied: '#10B981'
};

const formatStatus = (status: string | null): string => {
    if (!status) return 'New';
    return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusColor = (status: string | null) => {
    switch (status) {
        case 'new': return 'bg-blue-100 text-blue-800';
        case 'contacted': return 'bg-yellow-100 text-yellow-800';
        case 'replied': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function OutreachPage() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<OutreachMetrics>({
        totalLeads: 0,
        newLeads: 0,
        contactedLeads: 0,
        repliedLeads: 0,
        responseRate: 0,
        statusBreakdown: [],
        outreachByDay: [],
        campaignPerformance: [],
        recentActivity: []
    });

    useEffect(() => {
        fetchOutreachData();
    }, []);

    const fetchOutreachData = async () => {
        setLoading(true);

        try {
            // Fetch all leads
            const { data: leads, error: leadsError } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (leadsError) throw leadsError;

            // Fetch all campaigns
            const { data: campaigns, error: campaignsError } = await supabase
                .from('campaigns')
                .select('id, campaign_name');

            if (campaignsError) throw campaignsError;

            const campaignMap = new Map<number, string>();
            campaigns?.forEach(c => campaignMap.set(c.id, c.campaign_name));

            // Calculate basic metrics
            const totalLeads = leads?.length || 0;
            const newLeads = leads?.filter(l => l.outreach_status === 'new' || !l.outreach_status).length || 0;
            const contactedLeads = leads?.filter(l => l.outreach_status === 'contacted').length || 0;
            const repliedLeads = leads?.filter(l => l.outreach_status === 'replied').length || 0;
            const responseRate = contactedLeads > 0 ? Math.round((repliedLeads / contactedLeads) * 100) : 0;

            // Status breakdown for pie chart
            const statusBreakdown = [
                { name: 'New', value: newLeads, color: STATUS_COLORS.new },
                { name: 'Contacted', value: contactedLeads, color: STATUS_COLORS.contacted },
                { name: 'Replied', value: repliedLeads, color: STATUS_COLORS.replied }
            ].filter(s => s.value > 0);

            // Outreach by day (last 7 days)
            const outreachByDay: { day: string; new: number; contacted: number; replied: number }[] = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = date.toISOString().split('T')[0];

                const dayLeads = leads?.filter(l => l.created_at.startsWith(dateStr)) || [];
                outreachByDay.push({
                    day: dayStr,
                    new: dayLeads.filter(l => l.outreach_status === 'new' || !l.outreach_status).length,
                    contacted: dayLeads.filter(l => l.outreach_status === 'contacted').length,
                    replied: dayLeads.filter(l => l.outreach_status === 'replied').length
                });
            }

            // Campaign performance
            const campaignStats = new Map<number, { total: number; contacted: number; replied: number }>();
            leads?.forEach(lead => {
                const cid = lead.campaign_id;
                if (!campaignStats.has(cid)) {
                    campaignStats.set(cid, { total: 0, contacted: 0, replied: 0 });
                }
                const stats = campaignStats.get(cid)!;
                stats.total++;
                if (lead.outreach_status === 'contacted') stats.contacted++;
                if (lead.outreach_status === 'replied') stats.replied++;
            });

            const campaignPerformance = Array.from(campaignStats.entries())
                .map(([id, stats]) => ({
                    name: campaignMap.get(id) || `Campaign ${id}`,
                    total: stats.total,
                    contacted: stats.contacted,
                    replied: stats.replied,
                    rate: stats.contacted > 0 ? Math.round((stats.replied / stats.contacted) * 100) : 0
                }))
                .sort((a, b) => b.rate - a.rate)
                .slice(0, 5);

            // Recent activity (last 10 leads)
            const recentActivity = (leads?.slice(0, 10) || []).map(lead => ({
                ...lead,
                campaign_name: campaignMap.get(lead.campaign_id) || 'Unknown Campaign'
            }));

            setMetrics({
                totalLeads,
                newLeads,
                contactedLeads,
                repliedLeads,
                responseRate,
                statusBreakdown,
                outreachByDay,
                campaignPerformance,
                recentActivity
            });

        } catch (error) {
            console.error("Error fetching outreach data:", error);
        } finally {
            setLoading(false);
        }
    };

    const kpiCards = [
        { title: "Total Leads", value: metrics.totalLeads, icon: Users, color: "text-primary", bgColor: "bg-primary/10" },
        { title: "Contacted", value: metrics.contactedLeads, icon: Mail, color: "text-yellow-600", bgColor: "bg-yellow-50" },
        { title: "Replied", value: metrics.repliedLeads, icon: MessageSquare, color: "text-green-600", bgColor: "bg-green-50" },
        { title: "Response Rate", value: `${metrics.responseRate}%`, icon: TrendingUp, color: "text-blue-600", bgColor: "bg-blue-50" },
    ];

    return (
        <div className="flex h-screen bg-zinc-50/50 dark:bg-zinc-900 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 space-y-6">

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold font-heading tracking-tight">Outreach Statistics</h1>
                            <p className="text-sm text-muted-foreground">Track your outreach performance and engagement metrics</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                            <Send className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
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
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                                                    <p className="text-3xl font-bold mt-1">{kpi.value}</p>
                                                </div>
                                                <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                                                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* Outreach Trend Chart */}
                                <Card className="lg:col-span-2 shadow-none border-border rounded-xl">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Outreach Activity (Last 7 Days)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[280px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={metrics.outreachByDay} barGap={2}>
                                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} allowDecimals={false} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="new" name="New" fill={STATUS_COLORS.new} radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="contacted" name="Contacted" fill={STATUS_COLORS.contacted} radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="replied" name="Replied" fill={STATUS_COLORS.replied} radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Status Breakdown Pie Chart */}
                                <Card className="shadow-none border-border rounded-xl">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Status Breakdown</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {metrics.statusBreakdown.length === 0 ? (
                                            <div className="text-center py-12 text-muted-foreground text-sm">
                                                No outreach data yet.
                                            </div>
                                        ) : (
                                            <>
                                                <div className="h-[200px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={metrics.statusBreakdown}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={55}
                                                                outerRadius={80}
                                                                paddingAngle={3}
                                                                dataKey="value"
                                                                stroke="none"
                                                            >
                                                                {metrics.statusBreakdown.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs">
                                                    {metrics.statusBreakdown.map((item) => (
                                                        <div key={item.name} className="flex items-center gap-2">
                                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                            <span className="font-medium">{item.name}</span>
                                                            <span className="text-muted-foreground">({item.value})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                            </div>

                            {/* Campaign Performance & Recent Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Campaign Performance */}
                                <Card className="shadow-none border-border rounded-xl">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Top Performing Campaigns</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {metrics.campaignPerformance.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground text-sm">
                                                No campaign data yet.
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {metrics.campaignPerformance.map((campaign, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">{campaign.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {campaign.total} leads • {campaign.contacted} contacted • {campaign.replied} replied
                                                            </p>
                                                        </div>
                                                        <div className="ml-4 flex items-center gap-2">
                                                            <div className="text-right">
                                                                <p className={`text-lg font-bold ${campaign.rate >= 50 ? 'text-green-600' : campaign.rate >= 25 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                                                                    {campaign.rate}%
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">response</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Recent Activity */}
                                <Card className="shadow-none border-border rounded-xl">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Recent Outreach Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {metrics.recentActivity.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground text-sm">
                                                No recent activity.
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Lead</TableHead>
                                                        <TableHead>Campaign</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {metrics.recentActivity.map((lead) => (
                                                        <TableRow key={lead.id}>
                                                            <TableCell>
                                                                <div>
                                                                    <p className="font-medium text-sm">{lead.full_name || 'Unknown'}</p>
                                                                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{lead.email || '-'}</p>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                                                                {lead.campaign_name}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={getStatusColor(lead.outreach_status)}>
                                                                    {formatStatus(lead.outreach_status)}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
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
