"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Mail, Phone, Globe, Building2, MessageSquare, Calendar, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Campaign {
    id: number;
    created_at: string;
    campaign_name: string;
    target_niche: string | null;
    sources: string[] | null;
    regions: string[] | null;
    keywords: string[] | null;
    quantity: number;
    status: string;
}

interface Lead {
    id: string;
    created_at: string;
    campaign_id: number;
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
    raw_data: any;
}

// Helper to format source names nicely
const formatSourceName = (source: string | null): string => {
    if (!source) return 'Unknown';
    const sourceMap: Record<string, string> = {
        'instagram': 'Instagram',
        'google_maps': 'Google Maps',
        'web_search': 'Web Search',
        'maps': 'Google Maps',
        'insta': 'Instagram',
    };
    return sourceMap[source.toLowerCase()] || source.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export default function CampaignDetailPage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        if (campaignId) {
            fetchCampaignAndLeads();
        }
    }, [campaignId]);

    const fetchCampaignAndLeads = async () => {
        setLoading(true);

        const { data: campaignData, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaignId)
            .single();

        if (campaignError) {
            console.error("Error fetching campaign:", campaignError);
            toast.error("Failed to load campaign.");
            setLoading(false);
            return;
        }
        setCampaign(campaignData);

        const { data: leadsData, error: leadsError } = await supabase
            .from('leads')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: false });

        if (leadsError) {
            console.error("Error fetching leads:", leadsError);
            toast.error("Failed to load leads.");
        } else {
            setLeads(leadsData || []);
        }
        setLoading(false);
    };

    const openLeadDetail = (lead: Lead) => {
        setSelectedLead(lead);
        setSheetOpen(true);
    };

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'contacted': return 'bg-yellow-100 text-yellow-800';
            case 'replied': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatStatus = (status: string | null): string => {
        if (!status) return 'New';
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            <Sidebar />
            <div className="flex bg-zinc-50/50 dark:bg-zinc-900/50 flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                    <Button variant="ghost" onClick={() => router.push('/campaigns')} className="mb-2">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
                    </Button>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                        </div>
                    ) : campaign ? (
                        <>
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl">{campaign.campaign_name}</CardTitle>
                                            <CardDescription>{campaign.target_niche}</CardDescription>
                                        </div>
                                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                                            {campaign.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Regions</p>
                                            <p className="font-medium">{campaign.regions?.join(', ') || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Sources</p>
                                            <p className="font-medium">{campaign.sources?.map(s => formatSourceName(s)).join(', ') || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Quantity</p>
                                            <p className="font-medium">{campaign.quantity}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Created</p>
                                            <p className="font-medium">{new Date(campaign.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Leads ({leads.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {leads.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No leads found for this campaign yet.
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Company</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Source</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {leads.map((lead) => (
                                                    <TableRow
                                                        key={lead.id}
                                                        className="cursor-pointer hover:bg-muted/50"
                                                        onClick={() => openLeadDetail(lead)}
                                                    >
                                                        <TableCell className="font-medium">{lead.full_name || 'Unknown'}</TableCell>
                                                        <TableCell>{lead.company_name || '-'}</TableCell>
                                                        <TableCell className="text-muted-foreground">{lead.email || '-'}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{formatSourceName(lead.lead_source)}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={getStatusColor(lead.outreach_status)}>
                                                                {formatStatus(lead.outreach_status)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="sm">View</Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            Campaign not found.
                        </div>
                    )}

                </main>
            </div>

            {/* Lead Detail Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
                    <div className="p-6 pb-4 border-b bg-muted/30">
                        <SheetHeader>
                            <SheetTitle className="text-2xl font-bold">{selectedLead?.full_name || 'Lead Details'}</SheetTitle>
                            <SheetDescription className="text-base">{selectedLead?.company_name || 'No company'}</SheetDescription>
                        </SheetHeader>
                    </div>

                    {selectedLead && (
                        <div className="p-6 space-y-8">

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Contact Information</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 p-3 bg-muted/40 rounded-lg">
                                        <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <span className="text-sm font-medium">{selectedLead.email || 'No email'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 p-3 bg-muted/40 rounded-lg">
                                        <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <span className="text-sm font-medium">{selectedLead.phone || 'No phone'}</span>
                                    </div>
                                    {selectedLead.website && (
                                        <div className="flex items-center gap-4 p-3 bg-muted/40 rounded-lg">
                                            <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
                                            <a href={selectedLead.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline truncate">
                                                {selectedLead.website}
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4 p-3 bg-muted/40 rounded-lg">
                                        <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <span className="text-sm font-medium">{selectedLead.company_name || 'No company'}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Status & Source */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status & Source</h4>
                                <div className="flex flex-wrap gap-3">
                                    <Badge className={`${getStatusColor(selectedLead.outreach_status)} text-sm px-3 py-1`}>
                                        {formatStatus(selectedLead.outreach_status)}
                                    </Badge>
                                    <Badge variant="outline" className="text-sm px-3 py-1">
                                        {formatSourceName(selectedLead.lead_source)}
                                    </Badge>
                                    {selectedLead.reply_intent && (
                                        <Badge variant="secondary" className="text-sm px-3 py-1">{selectedLead.reply_intent}</Badge>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Context */}
                            {selectedLead.context && (
                                <>
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Context / Notes</h4>
                                        <div className="flex items-start gap-4 p-4 bg-muted/40 rounded-lg">
                                            <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                            <p className="text-sm leading-relaxed">{selectedLead.context}</p>
                                        </div>
                                    </div>
                                    <Separator />
                                </>
                            )}

                            {/* Timeline */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Timeline</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 p-3 bg-muted/40 rounded-lg">
                                        <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Created</p>
                                            <p className="text-sm font-medium">{new Date(selectedLead.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {selectedLead.last_follow_up_at && (
                                        <div className="flex items-center gap-4 p-3 bg-muted/40 rounded-lg">
                                            <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Last Follow-up</p>
                                                <p className="text-sm font-medium">{new Date(selectedLead.last_follow_up_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedLead.next_follow_up_at && (
                                        <div className="flex items-center gap-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                                            <Clock className="h-5 w-5 text-primary shrink-0" />
                                            <div>
                                                <p className="text-xs text-primary">Next Follow-up</p>
                                                <p className="text-sm font-medium">{new Date(selectedLead.next_follow_up_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
