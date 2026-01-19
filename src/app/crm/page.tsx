"use client";

export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { supabase } from "@/lib/supabase";
import { Mail, Instagram, ExternalLink, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface Lead {
    id: string;
    created_at: string;
    full_name: string | null;
    company_name: string | null;
    email: string | null;
    emails?: string[];
    website: string | null;
    outreach_status: string | null;
    context: string | null;
}

const statusStyles: Record<string, string> = {
    new: "bg-zinc-100 text-zinc-700 border-zinc-200",
    contacted: "bg-amber-50 text-amber-700 border-amber-200",
    replied: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function CRMPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchLeads();

        // Realtime subscription
        const channel = supabase
            .channel('leads-realtime')
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
                    } else if (payload.eventType === 'DELETE') {
                        setLeads((prev) => prev.filter((lead) => lead.id !== payload.old.id));
                    }
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
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching leads:", error);
        } else {
            setLeads(data || []);
        }
        setLoading(false);
    };

    // Parse emails - handle both single email field and emails array
    const getEmails = (lead: Lead): string[] => {
        if (lead.emails && Array.isArray(lead.emails)) {
            return lead.emails;
        }
        if (lead.email) {
            return [lead.email];
        }
        return [];
    };

    const isInstagram = (url: string | null): boolean => {
        return url ? url.includes('instagram.com') : false;
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <TooltipProvider delayDuration={200}>
            <div className="flex h-screen bg-[#FAFAFA] overflow-hidden font-sans">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto">

                        {/* Header */}
                        <div className="border-b border-zinc-200 bg-white px-8 py-6">
                            <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Live Leads</h1>
                            <p className="text-sm text-zinc-500 mt-1">Real-time view of all incoming leads</p>
                        </div>

                        {/* Table Header */}
                        <div className="sticky top-0 z-10 bg-[#FAFAFA] border-b border-zinc-200">
                            <div className="grid grid-cols-12 gap-4 px-8 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                <div className="col-span-3">Contact</div>
                                <div className="col-span-2">Company</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-3">Context</div>
                                <div className="col-span-2 text-right">Actions</div>
                            </div>
                        </div>

                        {/* Leads List */}
                        <div className="px-8">
                            {loading ? (
                                <div className="py-16 text-center text-zinc-400">
                                    Loading leads...
                                </div>
                            ) : leads.length === 0 ? (
                                <div className="py-16 text-center text-zinc-400">
                                    No leads yet. They will appear here in real-time.
                                </div>
                            ) : (
                                <LayoutGroup>
                                    <AnimatePresence mode="popLayout">
                                        {leads.map((lead) => {
                                            const emails = getEmails(lead);
                                            const isExpanded = expandedId === lead.id;

                                            return (
                                                <motion.div
                                                    key={lead.id}
                                                    layout
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                                    className="border-b border-zinc-100 bg-white hover:bg-zinc-50/50 transition-colors duration-100"
                                                >
                                                    <div className="grid grid-cols-12 gap-4 py-5 items-start">

                                                        {/* Contact */}
                                                        <div className="col-span-3 pl-0">
                                                            <p className="text-sm font-medium text-zinc-900 leading-tight">
                                                                {lead.full_name || 'Unknown'}
                                                            </p>
                                                            {emails.length > 0 && (
                                                                <p className="text-xs text-zinc-500 mt-0.5 truncate">
                                                                    {emails[0]}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Company */}
                                                        <div className="col-span-2">
                                                            <p className="text-sm text-zinc-600 truncate">
                                                                {lead.company_name || '—'}
                                                            </p>
                                                        </div>

                                                        {/* Status */}
                                                        <div className="col-span-2">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded border ${statusStyles[lead.outreach_status || 'new']}`}>
                                                                {lead.outreach_status?.charAt(0).toUpperCase() + (lead.outreach_status?.slice(1) || '') || 'New'}
                                                            </span>
                                                        </div>

                                                        {/* Context */}
                                                        <div className="col-span-3">
                                                            {lead.context ? (
                                                                <div>
                                                                    <p className={`text-sm text-zinc-600 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                                                                        {lead.context}
                                                                    </p>
                                                                    {lead.context.length > 100 && (
                                                                        <button
                                                                            onClick={() => toggleExpand(lead.id)}
                                                                            className="text-xs text-zinc-400 hover:text-zinc-600 mt-1 flex items-center gap-0.5 transition-colors"
                                                                        >
                                                                            {isExpanded ? (
                                                                                <>Show less <ChevronUp className="h-3 w-3" /></>
                                                                            ) : (
                                                                                <>Show more <ChevronDown className="h-3 w-3" /></>
                                                                            )}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-zinc-400">—</span>
                                                            )}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="col-span-2 flex justify-end gap-1">

                                                            {/* Email buttons - one per email in array */}
                                                            {emails.map((email, idx) => (
                                                                <Tooltip key={idx}>
                                                                    <TooltipTrigger asChild>
                                                                        <a
                                                                            href={`mailto:${email}`}
                                                                            className="inline-flex items-center justify-center h-8 w-8 rounded border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 transition-all duration-75"
                                                                        >
                                                                            <Mail className="h-4 w-4" />
                                                                        </a>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="text-xs">
                                                                        {email}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            ))}

                                                            {/* Instagram button */}
                                                            {lead.website && isInstagram(lead.website) && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <a
                                                                            href={lead.website}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center justify-center h-8 w-8 rounded border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 transition-all duration-75"
                                                                        >
                                                                            <Instagram className="h-4 w-4" />
                                                                        </a>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="text-xs">
                                                                        View Instagram
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}

                                                            {/* External link for non-Instagram websites */}
                                                            {lead.website && !isInstagram(lead.website) && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <a
                                                                            href={lead.website}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center justify-center h-8 w-8 rounded border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 transition-all duration-75"
                                                                        >
                                                                            <ExternalLink className="h-4 w-4" />
                                                                        </a>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="text-xs">
                                                                        Visit website
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}

                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </LayoutGroup>
                            )}
                        </div>

                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
