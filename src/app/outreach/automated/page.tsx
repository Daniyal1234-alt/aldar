"use client";

import { useEffect, useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Loader2,
    Mail,
    Copy,
    ExternalLink,
    Check,
    Search,
    Filter,
    RefreshCw,
    Globe,
    MapPin,
    TrendingUp,
    Clock,
    Send,
    Users,
    MessageSquare,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
    generateInitialEmail,
    generateFollowUpEmail,
    EMAIL_STATUS_OPTIONS,
    getStatusStyle,
    getStatusLabel,
    detectLineFocus,
    LineType,
} from "@/lib/templates";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

interface Lead {
    id: string;
    created_at: string;
    campaign_id: number | null;
    full_name: string | null;
    email: string | null;
    company_name: string | null;
    phone: string | null;
    website: string | null;
    context: string | null;
    lead_source: string | null;
    outreach_status: string | null;
    reply_intent: string | null;
    last_follow_up_at: string | null;
    next_follow_up_at: string | null;
    raw_data: Record<string, unknown> | null;
    gender: string | null;
    attempts: number;
}

const INTENT_COLORS: Record<string, string> = {
    interested: '#10B981',
    maybe: '#F59E0B',
    not_interested: '#EF4444',
    unknown: '#6B7280',
};

export default function AutomatedOutreachPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sourceFilter, setSourceFilter] = useState<string>("all");
    const [activeEmailTab, setActiveEmailTab] = useState<string>("initial");

    useEffect(() => {
        fetchLeads();

        // Real-time subscription
        const channel = supabase
            .channel('leads-automated-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'leads' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setLeads((prev) => [payload.new as Lead, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setLeads((prev) =>
                            prev.map((lead) =>
                                lead.id === (payload.new as Lead).id ? (payload.new as Lead) : lead
                            )
                        );
                        if (selectedLead && selectedLead.id === (payload.new as Lead).id) {
                            setSelectedLead(payload.new as Lead);
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setLeads((prev) => prev.filter((lead) => lead.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedLead]);

    const fetchLeads = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching leads:", error);
            toast.error("Failed to load leads");
        } else {
            setLeads(data || []);
        }
        setLoading(false);
    };

    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            const matchesSearch =
                !searchQuery ||
                lead.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.context?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "all" || lead.outreach_status === statusFilter;
            const matchesSource = sourceFilter === "all" || lead.lead_source === sourceFilter;

            return matchesSearch && matchesStatus && matchesSource;
        });
    }, [leads, searchQuery, statusFilter, sourceFilter]);

    const openLeadDialog = (lead: Lead) => {
        setSelectedLead(lead);
        setDialogOpen(true);
        setActiveEmailTab("initial");
    };

    const updateLeadStatus = async (newStatus: string) => {
        if (!selectedLead) return;

        setUpdatingStatus(true);
        const updateData: Partial<Lead> = { outreach_status: newStatus };

        // Set follow-up dates based on status
        if (newStatus === 'contacted') {
            updateData.last_follow_up_at = new Date().toISOString();
            updateData.next_follow_up_at = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days
        } else if (newStatus === 'follow_up_1') {
            updateData.last_follow_up_at = new Date().toISOString();
            updateData.next_follow_up_at = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(); // 4 days
        } else if (newStatus === 'follow_up_2') {
            updateData.last_follow_up_at = new Date().toISOString();
            updateData.next_follow_up_at = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 days
        }

        const { error } = await supabase
            .from('leads')
            .update(updateData)
            .eq('id', selectedLead.id);

        if (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        } else {
            const updatedLead = { ...selectedLead, ...updateData };
            setSelectedLead(updatedLead);
            setLeads((prev) =>
                prev.map((l) => (l.id === selectedLead.id ? updatedLead : l))
            );
            toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
        }
        setUpdatingStatus(false);
    };

    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedMessage(type);
            toast.success("Copied to clipboard!");
            setTimeout(() => setCopiedMessage(null), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    const getLineType = (lead: Lead): LineType => {
        return detectLineFocus(lead.context || lead.company_name);
    };

    const formatSource = (source: string | null): string => {
        if (!source) return 'Unknown';
        return source.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    // Stats
    const stats = useMemo(() => {
        const total = leads.length;
        const newCount = leads.filter((l) => l.outreach_status === 'new' || !l.outreach_status).length;
        const contacted = leads.filter((l) => ['contacted', 'follow_up_1', 'follow_up_2', 'break_up'].includes(l.outreach_status || '')).length;
        const replied = leads.filter((l) => l.outreach_status === 'replied').length;
        const interested = leads.filter((l) => l.reply_intent === 'interested' || l.outreach_status === 'interested').length;
        const responseRate = contacted > 0 ? Math.round((replied / contacted) * 100) : 0;

        // Intent breakdown
        const intentCounts = {
            interested: leads.filter((l) => l.reply_intent === 'interested').length,
            maybe: leads.filter((l) => l.reply_intent === 'maybe').length,
            not_interested: leads.filter((l) => l.reply_intent === 'not_interested').length,
            unknown: leads.filter((l) => !l.reply_intent || l.reply_intent === 'unknown').length,
        };

        // Leads by source
        const sourceCounts = leads.reduce((acc, lead) => {
            const src = lead.lead_source || 'unknown';
            acc[src] = (acc[src] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return { total, newCount, contacted, replied, interested, responseRate, intentCounts, sourceCounts };
    }, [leads]);

    const intentChartData = Object.entries(stats.intentCounts)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
            name: name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
            value,
            color: INTENT_COLORS[name] || '#6B7280',
        }));

    return (
        <TooltipProvider delayDuration={200}>
            <div className="flex h-screen bg-zinc-50/50 dark:bg-zinc-900 overflow-hidden font-sans">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold font-heading tracking-tight flex items-center gap-2">
                                    <Mail className="h-6 w-6 text-primary" />
                                    Automated Outreach
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Email leads from Google Maps & Web search
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchLeads}
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            <Card className="shadow-none border-border">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                                    </div>
                                    <p className="text-2xl font-bold mt-1">{stats.total}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-none border-border">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-500" />
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">New</p>
                                    </div>
                                    <p className="text-2xl font-bold mt-1 text-blue-600">{stats.newCount}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-none border-border">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Send className="h-4 w-4 text-yellow-500" />
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Contacted</p>
                                    </div>
                                    <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.contacted}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-none border-border">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-green-500" />
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Replied</p>
                                    </div>
                                    <p className="text-2xl font-bold mt-1 text-green-600">{stats.replied}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-none border-border">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Interested</p>
                                    </div>
                                    <p className="text-2xl font-bold mt-1 text-emerald-600">{stats.interested}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-none border-border">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Response</p>
                                    </div>
                                    <p className="text-2xl font-bold mt-1">{stats.responseRate}%</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Insights Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Intent Breakdown */}
                            <Card className="shadow-none border-border">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Reply Intent</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {intentChartData.length === 0 ? (
                                        <div className="py-8 text-center text-muted-foreground text-sm">
                                            No reply data yet
                                        </div>
                                    ) : (
                                        <div className="h-[180px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={intentChartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={40}
                                                        outerRadius={70}
                                                        paddingAngle={3}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {intentChartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                                        {intentChartData.map((item) => (
                                            <div key={item.name} className="flex items-center gap-1.5 text-xs">
                                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span>{item.name}</span>
                                                <span className="text-muted-foreground">({item.value})</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Leads by Source */}
                            <Card className="shadow-none border-border lg:col-span-2">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Leads by Source</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={Object.entries(stats.sourceCounts).map(([name, value]) => ({
                                                    name: formatSource(name),
                                                    value,
                                                }))}
                                                layout="vertical"
                                            >
                                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                                <XAxis type="number" allowDecimals={false} />
                                                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                                                <RechartsTooltip />
                                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filters */}
                        <Card className="shadow-none border-border">
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by name, company, email..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full md:w-[180px]">
                                            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            {EMAIL_STATUS_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                                        <SelectTrigger className="w-full md:w-[180px]">
                                            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <SelectValue placeholder="Source" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Sources</SelectItem>
                                            <SelectItem value="google_maps">Google Maps</SelectItem>
                                            <SelectItem value="web_search">Web Search</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Leads Table */}
                        <Card className="shadow-none border-border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">
                                    Email Leads
                                    <span className="text-sm font-normal text-muted-foreground ml-2">
                                        ({filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'})
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center py-16">
                                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                                    </div>
                                ) : filteredLeads.length === 0 ? (
                                    <div className="text-center py-16 text-muted-foreground">
                                        {leads.length === 0
                                            ? "No email leads yet. They will appear here when added."
                                            : "No leads match your search/filter criteria."}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Contact</TableHead>
                                                    <TableHead>Company</TableHead>
                                                    <TableHead>Source</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Intent</TableHead>
                                                    <TableHead>Follow-up</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <AnimatePresence mode="popLayout">
                                                    {filteredLeads.map((lead) => (
                                                        <motion.tr
                                                            key={lead.id}
                                                            layout
                                                            initial={{ opacity: 0, y: -5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 5 }}
                                                            className="group hover:bg-muted/50 cursor-pointer transition-colors"
                                                            onClick={() => openLeadDialog(lead)}
                                                        >
                                                            <TableCell>
                                                                <div>
                                                                    <p className="font-medium text-sm">
                                                                        {lead.full_name || 'Unknown'}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                                                        {lead.email || '—'}
                                                                    </p>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <p className="text-sm truncate max-w-[150px]">
                                                                    {lead.company_name || '—'}
                                                                </p>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="text-xs font-normal">
                                                                    {lead.lead_source === 'google_maps' && <MapPin className="h-3 w-3 mr-1" />}
                                                                    {lead.lead_source === 'web_search' && <Globe className="h-3 w-3 mr-1" />}
                                                                    {formatSource(lead.lead_source)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded border ${getStatusStyle(lead.outreach_status)}`}>
                                                                    {getStatusLabel(lead.outreach_status)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                {lead.reply_intent ? (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="text-xs capitalize"
                                                                        style={{
                                                                            backgroundColor: `${INTENT_COLORS[lead.reply_intent] || INTENT_COLORS.unknown}20`,
                                                                            color: INTENT_COLORS[lead.reply_intent] || INTENT_COLORS.unknown,
                                                                        }}
                                                                    >
                                                                        {lead.reply_intent.replace('_', ' ')}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground">—</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {lead.next_follow_up_at ? (
                                                                    <div className="text-xs">
                                                                        <p className="text-muted-foreground">Next:</p>
                                                                        <p>{new Date(lead.next_follow_up_at).toLocaleDateString()}</p>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground">—</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                                    {lead.email && (
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <a
                                                                                    href={`mailto:${lead.email}`}
                                                                                    className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    <Mail className="h-4 w-4" />
                                                                                </a>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>Send Email</TooltipContent>
                                                                        </Tooltip>
                                                                    )}
                                                                    {lead.website && (
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <a
                                                                                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    <ExternalLink className="h-4 w-4" />
                                                                                </a>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>Visit Website</TooltipContent>
                                                                        </Tooltip>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </motion.tr>
                                                    ))}
                                                </AnimatePresence>
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </main>
                </div>
            </div>

            {/* Lead Detail Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    {selectedLead && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-primary" />
                                    {selectedLead.company_name || selectedLead.full_name || 'Lead Details'}
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedLead.full_name && `${selectedLead.full_name} • `}
                                    {selectedLead.email || 'No email'}
                                    {selectedLead.lead_source && ` • ${formatSource(selectedLead.lead_source)}`}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 pt-4">
                                {/* Lead Info Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Contact</p>
                                        <p className="text-sm font-medium">{selectedLead.full_name || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Company</p>
                                        <p className="text-sm font-medium">{selectedLead.company_name || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                                        <p className="text-sm">{selectedLead.email || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p>
                                        <p className="text-sm">{selectedLead.phone || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Website</p>
                                        {selectedLead.website ? (
                                            <a
                                                href={selectedLead.website.startsWith('http') ? selectedLead.website : `https://${selectedLead.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline"
                                            >
                                                {selectedLead.website}
                                            </a>
                                        ) : (
                                            <p className="text-sm">—</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Line Focus</p>
                                        <Badge variant="secondary" className="capitalize">
                                            {getLineType(selectedLead)}
                                        </Badge>
                                    </div>
                                </div>

                                {selectedLead.context && (
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Context</p>
                                        <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedLead.context}</p>
                                    </div>
                                )}

                                {/* Status Update */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Status</h4>
                                    <div className="flex items-center gap-3">
                                        <Select
                                            value={selectedLead.outreach_status || 'new'}
                                            onValueChange={updateLeadStatus}
                                            disabled={updatingStatus}
                                        >
                                            <SelectTrigger className="w-[200px]">
                                                {updatingStatus ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <SelectValue />
                                                )}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {EMAIL_STATUS_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        <span className="flex items-center gap-2">
                                                            <span className={`h-2 w-2 rounded-full ${opt.color.split(' ')[0]}`} />
                                                            {opt.label}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded border ${getStatusStyle(selectedLead.outreach_status)}`}>
                                            {getStatusLabel(selectedLead.outreach_status)}
                                        </span>
                                        {selectedLead.attempts > 1 && (
                                            <Badge variant="outline">
                                                {selectedLead.attempts} attempts
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Email Templates */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Email Templates</h4>

                                    <Tabs value={activeEmailTab} onValueChange={setActiveEmailTab}>
                                        <TabsList className="grid w-full grid-cols-4">
                                            <TabsTrigger value="initial">Initial</TabsTrigger>
                                            <TabsTrigger value="followup1">Follow-up 1</TabsTrigger>
                                            <TabsTrigger value="followup2">Follow-up 2</TabsTrigger>
                                            <TabsTrigger value="breakup">Break-up</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="initial" className="mt-4">
                                            <EmailTemplateCard
                                                lead={selectedLead}
                                                template={generateInitialEmail({
                                                    contact_first_name: selectedLead.full_name || undefined,
                                                    business_name: selectedLead.company_name || undefined,
                                                    product_focus: selectedLead.context || undefined,
                                                }, getLineType(selectedLead))}
                                                copiedMessage={copiedMessage}
                                                onCopy={(text, type) => copyToClipboard(text, type)}
                                            />
                                        </TabsContent>

                                        <TabsContent value="followup1" className="mt-4">
                                            <EmailTemplateCard
                                                lead={selectedLead}
                                                template={generateFollowUpEmail({
                                                    contact_first_name: selectedLead.full_name || undefined,
                                                    business_name: selectedLead.company_name || undefined,
                                                }, 1)}
                                                copiedMessage={copiedMessage}
                                                onCopy={(text, type) => copyToClipboard(text, type)}
                                            />
                                        </TabsContent>

                                        <TabsContent value="followup2" className="mt-4">
                                            <EmailTemplateCard
                                                lead={selectedLead}
                                                template={generateFollowUpEmail({
                                                    contact_first_name: selectedLead.full_name || undefined,
                                                    business_name: selectedLead.company_name || undefined,
                                                }, 2)}
                                                copiedMessage={copiedMessage}
                                                onCopy={(text, type) => copyToClipboard(text, type)}
                                            />
                                        </TabsContent>

                                        <TabsContent value="breakup" className="mt-4">
                                            <EmailTemplateCard
                                                lead={selectedLead}
                                                template={generateFollowUpEmail({
                                                    contact_first_name: selectedLead.full_name || undefined,
                                                    business_name: selectedLead.company_name || undefined,
                                                }, 3)}
                                                copiedMessage={copiedMessage}
                                                onCopy={(text, type) => copyToClipboard(text, type)}
                                            />
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    {selectedLead.email && (
                                        <Button asChild className="flex-1">
                                            <a href={`mailto:${selectedLead.email}`}>
                                                <Mail className="h-4 w-4 mr-2" />
                                                Compose Email
                                            </a>
                                        </Button>
                                    )}
                                    {selectedLead.website && (
                                        <Button variant="outline" asChild className="flex-1">
                                            <a
                                                href={selectedLead.website.startsWith('http') ? selectedLead.website : `https://${selectedLead.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Visit Website
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}

// Email Template Card Component
interface EmailTemplateCardProps {
    lead: Lead;
    template: { subjectOptions: string[]; body: string };
    copiedMessage: string | null;
    onCopy: (text: string, type: string) => void;
}

function EmailTemplateCard({ lead, template, copiedMessage, onCopy }: EmailTemplateCardProps) {
    return (
        <div className="space-y-4">
            {/* Subject Options */}
            <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Subject Line Options</p>
                {template.subjectOptions.map((subject, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <span className="text-sm">{subject}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCopy(subject, `subject-${idx}`)}
                        >
                            {copiedMessage === `subject-${idx}` ? (
                                <Check className="h-3 w-3 text-green-600" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                        </Button>
                    </div>
                ))}
            </div>

            {/* Body */}
            <div className="border rounded-lg">
                <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                    <span className="text-sm font-medium">Email Body</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCopy(template.body, 'body')}
                    >
                        {copiedMessage === 'body' ? (
                            <Check className="h-4 w-4 mr-1 text-green-600" />
                        ) : (
                            <Copy className="h-4 w-4 mr-1" />
                        )}
                        Copy
                    </Button>
                </div>
                <div className="p-3">
                    <pre className="text-sm whitespace-pre-wrap font-sans text-muted-foreground">
                        {template.body}
                    </pre>
                </div>
            </div>
        </div>
    );
}
