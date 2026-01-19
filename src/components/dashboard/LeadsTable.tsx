"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, MessageCircle, Instagram, MapPin, Globe, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const leads = [
    {
        id: 1,
        name: "Urban Rebels",
        logo: "/brands/urban.png",
        initials: "UR",
        verified: true,
        source: "instagram",
        email: "contact@urbanrebels...",
        phone: "+971 50 123 ....",
        status: "New",
    },
    {
        id: 2,
        name: "Modest Co.",
        logo: "/brands/modest.png",
        initials: "MC",
        verified: true,
        source: "google_maps",
        email: "info@modestco.ae",
        phone: "+971 55 987 ....",
        status: "Contacted",
    },
    {
        id: 3,
        name: "Street Vibe",
        logo: "/brands/vibe.png",
        initials: "SV",
        verified: false,
        source: "web_search",
        email: "hello@streetvibe.com",
        phone: "+971 52 456 ....",
        status: "Replied",
    },
    {
        id: 4,
        name: "Luxe Abayas",
        logo: "/brands/luxe.png",
        initials: "LA",
        verified: true,
        source: "instagram",
        email: "sales@luxeabayas...",
        phone: "+971 50 789 ....",
        status: "New",
    },
    {
        id: 5,
        name: "Denim District",
        logo: "/brands/denim.png",
        initials: "DD",
        verified: true,
        source: "google_maps",
        email: "hi@denimdistrict...",
        phone: "+971 58 234 ....",
        status: "New",
    },
];

export function LeadsTable() {
    const getSourceIcon = (source: string) => {
        switch (source) {
            case "instagram": return <Instagram className="h-4 w-4 text-pink-500" />;
            case "google_maps": return <MapPin className="h-4 w-4 text-blue-500" />;
            case "web_search": return <Globe className="h-4 w-4 text-green-500" />;
            default: return <Globe className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "New": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
            case "Contacted": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
            case "Replied": return "bg-green-100 text-green-800 hover:bg-green-100";
            default: return "bg-gray-100 text-gray-800 hover:bg-gray-100";
        }
    };

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
                                            <AvatarImage src={lead.logo} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">{lead.initials}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-heading font-semibold text-foreground/90">{lead.name}</span>
                                            {lead.verified && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 fill-blue-500/10" />}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-full bg-background border shadow-sm">
                                        {getSourceIcon(lead.source)}
                                    </div>
                                    <span className="text-xs text-muted-foreground capitalize">{lead.source.replace('_', ' ')}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="h-3 w-3" /> {lead.email}
                                    </span>
                                    <span className="flex items-center gap-1.5 mt-0.5">
                                        <MessageCircle className="h-3 w-3" /> {lead.phone}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={cn("border-0 font-medium", getStatusColor(lead.status))}>
                                    {lead.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600 hover:border-blue-200">
                                        <Mail className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:border-green-200">
                                        <MessageCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
