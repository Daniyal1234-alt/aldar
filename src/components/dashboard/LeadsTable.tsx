"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, MessageCircle, Instagram, MapPin, Globe, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Lead {
    id: string;
    full_name: string | null;
    company_name: string | null;
    email: string | null;
    emails?: string[];
    phone: string | null;
    website: string | null;
    outreach_status: string | null;
    source: string | null;
    created_at: string;
}

export function LeadsTable() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeads();

        // Realtime subscription for live updates
        const channel = supabase
            .channel('leads-table-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'leads' },
                () => {
                    fetchLeads();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error("Error fetching leads:", error);
        } else {
            setLeads(data || []);
        }
        setLoading(false);
    };

    const getDisplayName = (lead: Lead): string => {
        return lead.company_name || lead.full_name || '—';
    };

    const getInitials = (lead: Lead): string => {
        const name = getDisplayName(lead);
        return name
            .split(' ')
            .map(w => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getEmail = (lead: Lead): string => {
        if (lead.emails && Array.isArray(lead.emails) && lead.emails.length > 0) {
            return lead.emails[0];
        }
        return lead.email || '—';
    };

    const getSourceIcon = (source: string | null) => {
        switch (source) {
            case "instagram": return <Instagram className="h-4 w-4 text-pink-500" />;
            case "google_maps": return <MapPin className="h-4 w-4 text-blue-500" />;
            case "web_search": return <Globe className="h-4 w-4 text-green-500" />;
            default: return <Globe className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case "new": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
            case "contacted": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
            case "replied": return "bg-green-100 text-green-800 hover:bg-green-100";
            default: return "bg-gray-100 text-gray-800 hover:bg-gray-100";
        }
    };

    const formatStatus = (status: string | null): string => {
        if (!status) return "New";
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    if (loading) {
        return (
            <div className="rounded-md border border-border bg-card shadow-sm p-8 text-center text-muted-foreground">
                Loading recent leads...
            </div>
        );
    }

    if (leads.length === 0) {
        return (
            <div className="rounded-md border border-border bg-card shadow-sm p-8 text-center text-muted-foreground">
                No leads found yet. Start a campaign to generate leads.
            </div>
        );
    }

    return (
        <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-[300px]">Brand Info</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Contact Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leads.map((lead) => (
                        <TableRow
                            key={lead.id}
                            className={cn(
                                "group hover:bg-muted/30 transition-colors",
                                lead.source === 'instagram' && "bg-pink-50/30 hover:bg-pink-50/50"
                            )}
                        >
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "relative rounded-full p-0.5",
                                        lead.source === 'instagram' && "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                                    )}>
                                        <Avatar className="h-9 w-9 border-2 border-background">
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">{getInitials(lead)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-heading font-semibold text-foreground/90">{getDisplayName(lead)}</span>
                                            {lead.email && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 fill-blue-500/10" />}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-full bg-background border shadow-sm">
                                        {getSourceIcon(lead.source)}
                                    </div>
                                    <span className="text-xs text-muted-foreground capitalize">{(lead.source || 'unknown').replace('_', ' ')}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="h-3 w-3" /> {getEmail(lead)}
                                    </span>
                                    <span className="flex items-center gap-1.5 mt-0.5">
                                        <MessageCircle className="h-3 w-3" /> {lead.phone || '—'}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={cn("border-0 font-medium", getStatusColor(lead.outreach_status))}>
                                    {formatStatus(lead.outreach_status)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {getEmail(lead) !== '—' && (
                                        <a href={`mailto:${getEmail(lead)}`}>
                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600 hover:border-blue-200">
                                                <Mail className="h-4 w-4" />
                                            </Button>
                                        </a>
                                    )}
                                    {lead.phone && (
                                        <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:border-green-200">
                                                <MessageCircle className="h-4 w-4" />
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
