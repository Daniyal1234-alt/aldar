"use client";

export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Pause, Eye, Loader2 } from "lucide-react";
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

export default function CampaignsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching campaigns:", error);
            toast.error("Failed to load campaigns.");
        } else {
            setCampaigns(data || []);
        }
        setLoading(false);
    };

    const toggleStatus = async (campaign: Campaign) => {
        const newStatus = campaign.status === 'active' ? 'paused' : 'active';
        setTogglingId(campaign.id);

        const { error } = await supabase
            .from('campaigns')
            .update({ status: newStatus })
            .eq('id', campaign.id);

        if (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status.");
        } else {
            setCampaigns(prev => prev.map(c =>
                c.id === campaign.id ? { ...c, status: newStatus } : c
            ));
            toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'}.`);
        }
        setTogglingId(null);
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            <Sidebar />
            <div className="flex bg-zinc-50/50 dark:bg-zinc-900/50 flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold font-heading tracking-tight">Outreach Campaigns</h1>
                            <p className="text-sm text-muted-foreground">Manage your lead generation campaigns.</p>
                        </div>
                        <Button
                            onClick={() => router.push('/search')}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            <Plus className="mr-2 h-4 w-4" /> New Campaign
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>All Campaigns</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : campaigns.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No campaigns found. Create one to get started.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Campaign Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Regions</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {campaigns.map((campaign) => (
                                            <TableRow key={campaign.id}>
                                                <TableCell className="font-medium">{campaign.campaign_name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={campaign.status === "active" ? "default" : campaign.status === "paused" ? "secondary" : "outline"}>
                                                        {campaign.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {campaign.regions?.slice(0, 2).join(', ')}{campaign.regions && campaign.regions.length > 2 ? '...' : ''}
                                                </TableCell>
                                                <TableCell>{campaign.quantity}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(campaign.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => toggleStatus(campaign)}
                                                            disabled={togglingId === campaign.id}
                                                        >
                                                            {togglingId === campaign.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : campaign.status === "active" ? (
                                                                <Pause className="h-4 w-4" />
                                                            ) : (
                                                                <Play className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => router.push(`/campaigns/${campaign.id}`)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                </main>
            </div>
        </div>
    );
}
