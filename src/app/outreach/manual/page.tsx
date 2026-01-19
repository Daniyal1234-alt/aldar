"use client";

export const dynamic = 'force-dynamic';
import { useEffect, useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Instagram,
    Copy,
    ExternalLink,
    Check,
    Search,
    Filter,
    MessageCircle,
    RefreshCw,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
    generateInstagramDM,
    generateWhatsAppFollowUp1,
    generateWhatsAppFollowUp2,
    INSTAGRAM_STATUS_OPTIONS,
    getStatusStyle,
    getStatusLabel,
    detectLineFocus,
} from "@/lib/templates";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface InstagramLead {
    id: string;
    campaign_id: string;
    search_term: string | null;
    username: string | null;
    url: string | null;
    fullname: string | null;
    biography: string | null;
    created_at: string;
    status: string;
}

export default function ManualOutreachPage() {
    const [leads, setLeads] = useState<InstagramLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<InstagramLead | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [expandedBio, setExpandedBio] = useState<string | null>(null);

    useEffect(() => {
        fetchLeads();

        // Real-time subscription
        const channel = supabase
            .channel('instagram-leads-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'instgram_leads' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setLeads((prev) => [payload.new as InstagramLead, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setLeads((prev) =>
                            prev.map((lead) =>
                                lead.id === (payload.new as InstagramLead).id ? (payload.new as InstagramLead) : lead
                            )
                        );
                        // Update selected lead if it's the one being updated
                        if (selectedLead && selectedLead.id === (payload.new as InstagramLead).id) {
                            setSelectedLead(payload.new as InstagramLead);
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
            .from('instgram_leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching Instagram leads:", error);
            toast.error("Failed to load Instagram leads");
        } else {
            setLeads(data || []);
        }
        setLoading(false);
    };

    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            const matchesSearch =
                !searchQuery ||
                lead.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.biography?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.search_term?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [leads, searchQuery, statusFilter]);

    const openLeadDialog = (lead: InstagramLead) => {
        setSelectedLead(lead);
        setDialogOpen(true);
    };

    const updateLeadStatus = async (newStatus: string) => {
        if (!selectedLead) return;

        setUpdatingStatus(true);
        const { error } = await supabase
            .from('instgram_leads')
            .update({ status: newStatus })
            .eq('id', selectedLead.id);

        if (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        } else {
            setSelectedLead({ ...selectedLead, status: newStatus });
            setLeads((prev) =>
                prev.map((l) => (l.id === selectedLead.id ? { ...l, status: newStatus } : l))
            );
            toast.success(`Status updated to ${getStatusLabel(newStatus, true)}`);
        }
        setUpdatingStatus(false);
    };

    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedMessage(type);
            toast.success("Message copied to clipboard!");
            setTimeout(() => setCopiedMessage(null), 2000);
        } catch {
            toast.error("Failed to copy message");
        }
    };

    const getInstagramUrl = (lead: InstagramLead): string => {
        if (lead.url) return lead.url;
        if (lead.username) return `https://instagram.com/${lead.username.replace('@', '')}`;
        return '#';
    };

    const getLineType = (lead: InstagramLead) => {
        return detectLineFocus(lead.biography);
    };

    // Stats
    const stats = useMemo(() => {
        const total = leads.length;
        const newCount = leads.filter((l) => l.status === 'new').length;
        const contacted = leads.filter((l) => l.status === 'contacted').length;
        const replied = leads.filter((l) => l.status === 'replied').length;
        const interested = leads.filter((l) => l.status === 'interested').length;
        return { total, newCount, contacted, replied, interested };
    }, [leads]);

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
                                    <Instagram className="h-6 w-6 text-pink-500" />
                                    Manual Outreach
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Instagram leads for manual DM outreach
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
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <Card className="shadow-none border-border">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Leads</p>
                                    <p className="text-2xl font-bold mt-1">{stats.total}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-none border-border">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">New</p>
                                    <p className="text-2xl font-bold mt-1 text-blue-600">{stats.newCount}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-none border-border">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Contacted</p>
                                    <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.contacted}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-none border-border">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Replied</p>
                                    <p className="text-2xl font-bold mt-1 text-green-600">{stats.replied}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-none border-border">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Interested</p>
                                    <p className="text-2xl font-bold mt-1 text-emerald-600">{stats.interested}</p>
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
                                            placeholder="Search by username, name, bio, or search term..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full md:w-[180px]">
                                            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            {INSTAGRAM_STATUS_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Leads Table */}
                        <Card className="shadow-none border-border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">
                                    Instagram Leads
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
                                            ? "No Instagram leads yet. They will appear here when added."
                                            : "No leads match your search/filter criteria."}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Profile</TableHead>
                                                    <TableHead>Biography</TableHead>
                                                    <TableHead>Search Term</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Status</TableHead>
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
                                                                        {lead.fullname || 'Unknown'}
                                                                    </p>
                                                                    <p className="text-xs text-pink-600">
                                                                        @{lead.username?.replace('@', '') || 'unknown'}
                                                                    </p>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="max-w-[250px]">
                                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                                    {lead.biography || '—'}
                                                                </p>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="text-xs font-normal">
                                                                    {lead.search_term || '—'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary" className="text-xs capitalize">
                                                                    {getLineType(lead)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded border ${getStatusStyle(lead.status, true)}`}>
                                                                    {getStatusLabel(lead.status, true)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    openLeadDialog(lead);
                                                                                }}
                                                                            >
                                                                                <MessageCircle className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>View & Copy Message</TooltipContent>
                                                                    </Tooltip>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <a
                                                                                href={getInstagramUrl(lead)}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <ExternalLink className="h-4 w-4" />
                                                                            </a>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Open Instagram</TooltipContent>
                                                                    </Tooltip>
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedLead && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Instagram className="h-5 w-5 text-pink-500" />
                                    {selectedLead.fullname || selectedLead.username || 'Unknown'}
                                </DialogTitle>
                                <DialogDescription>
                                    @{selectedLead.username?.replace('@', '')} • Found via "{selectedLead.search_term}"
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 pt-4">
                                {/* Profile Info */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Profile</h4>
                                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{selectedLead.fullname || 'No name'}</span>
                                            <Badge variant="secondary" className="capitalize">
                                                {getLineType(selectedLead)} focus
                                            </Badge>
                                        </div>
                                        {selectedLead.biography && (
                                            <p className="text-sm text-muted-foreground">
                                                {selectedLead.biography}
                                            </p>
                                        )}
                                        <a
                                            href={getInstagramUrl(selectedLead)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            Open Instagram Profile
                                        </a>
                                    </div>
                                </div>

                                {/* Status Update */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Status</h4>
                                    <div className="flex items-center gap-3">
                                        <Select
                                            value={selectedLead.status}
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
                                                {INSTAGRAM_STATUS_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        <span className={`inline-flex items-center gap-2`}>
                                                            <span className={`h-2 w-2 rounded-full ${opt.color.split(' ')[0]}`} />
                                                            {opt.label}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded border ${getStatusStyle(selectedLead.status, true)}`}>
                                            {getStatusLabel(selectedLead.status, true)}
                                        </span>
                                    </div>
                                </div>

                                {/* Message Templates */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Message Templates</h4>

                                    {/* Initial DM */}
                                    <div className="border rounded-lg">
                                        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                                            <span className="text-sm font-medium">Initial DM</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyToClipboard(
                                                    generateInstagramDM({
                                                        fullname: selectedLead.fullname || undefined,
                                                        username: selectedLead.username || undefined,
                                                        biography: selectedLead.biography || undefined,
                                                    }),
                                                    'initial'
                                                )}
                                            >
                                                {copiedMessage === 'initial' ? (
                                                    <Check className="h-4 w-4 mr-1 text-green-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4 mr-1" />
                                                )}
                                                Copy
                                            </Button>
                                        </div>
                                        <div className="p-3">
                                            <pre className="text-sm whitespace-pre-wrap font-sans text-muted-foreground">
                                                {generateInstagramDM({
                                                    fullname: selectedLead.fullname || undefined,
                                                    username: selectedLead.username || undefined,
                                                    biography: selectedLead.biography || undefined,
                                                })}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Follow-up 1 */}
                                    <div className="border rounded-lg">
                                        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                                            <span className="text-sm font-medium">Follow-up #1</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyToClipboard(
                                                    generateWhatsAppFollowUp1({
                                                        fullname: selectedLead.fullname || undefined,
                                                        username: selectedLead.username || undefined,
                                                    }),
                                                    'followup1'
                                                )}
                                            >
                                                {copiedMessage === 'followup1' ? (
                                                    <Check className="h-4 w-4 mr-1 text-green-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4 mr-1" />
                                                )}
                                                Copy
                                            </Button>
                                        </div>
                                        <div className="p-3">
                                            <pre className="text-sm whitespace-pre-wrap font-sans text-muted-foreground">
                                                {generateWhatsAppFollowUp1({
                                                    fullname: selectedLead.fullname || undefined,
                                                    username: selectedLead.username || undefined,
                                                })}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Follow-up 2 / Break-up */}
                                    <div className="border rounded-lg">
                                        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                                            <span className="text-sm font-medium">Follow-up #2 (Close)</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyToClipboard(
                                                    generateWhatsAppFollowUp2({
                                                        fullname: selectedLead.fullname || undefined,
                                                        username: selectedLead.username || undefined,
                                                    }),
                                                    'followup2'
                                                )}
                                            >
                                                {copiedMessage === 'followup2' ? (
                                                    <Check className="h-4 w-4 mr-1 text-green-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4 mr-1" />
                                                )}
                                                Copy
                                            </Button>
                                        </div>
                                        <div className="p-3">
                                            <pre className="text-sm whitespace-pre-wrap font-sans text-muted-foreground">
                                                {generateWhatsAppFollowUp2({
                                                    fullname: selectedLead.fullname || undefined,
                                                    username: selectedLead.username || undefined,
                                                })}
                                            </pre>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <Button asChild className="flex-1">
                                        <a
                                            href={getInstagramUrl(selectedLead)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Instagram className="h-4 w-4 mr-2" />
                                            Open Instagram
                                        </a>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            copyToClipboard(
                                                generateInstagramDM({
                                                    fullname: selectedLead.fullname || undefined,
                                                    username: selectedLead.username || undefined,
                                                    biography: selectedLead.biography || undefined,
                                                }),
                                                'initial'
                                            );
                                        }}
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Initial Message
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
