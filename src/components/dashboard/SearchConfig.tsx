"use client";

import { useState } from "react";
import { Search, MapPin, Globe, Instagram, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const platforms = [
    { value: "google_maps", label: "Google Maps", icon: MapPin },
    { value: "instagram", label: "Instagram", icon: Instagram },
    { value: "web_search", label: "Web Search", icon: Globe },
];

const countries = [
    "United States", "United Kingdom", "Canada", "Australia",
    "Germany", "France", "United Arab Emirates", "Saudi Arabia",
    "Singapore", "Japan", "India", "Brazil"
].sort();

export function SearchConfig() {
    const [loading, setLoading] = useState(false);
    const [openPlatform, setOpenPlatform] = useState(false);
    const [openCountry, setOpenCountry] = useState(false);

    // Form State
    const [campaignName, setCampaignName] = useState("");
    const [niches, setNiches] = useState("");
    const [keywords, setKeywords] = useState("");
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"]);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [quantity, setQuantity] = useState([50]);

    const togglePlatform = (value: string) => {
        setSelectedPlatforms((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value]
        );
    };

    const toggleCountry = (value: string) => {
        setSelectedCountries((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value]
        );
    };

    const handleGenerate = async () => {
        if (!campaignName || !niches || !keywords || selectedPlatforms.length === 0 || selectedCountries.length === 0) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);

        const keywordsArray = keywords.split(',').map(s => s.trim()).filter(Boolean);

        try {
            // 1. Insert into Supabase
            const { data: campaign, error } = await supabase
                .from('campaigns')
                .insert({
                    campaign_name: campaignName,
                    target_niche: niches,
                    sources: selectedPlatforms,
                    regions: selectedCountries,
                    keywords: keywordsArray,
                    quantity: quantity[0],
                    status: 'active'
                })
                .select()
                .single();

            if (error) {
                console.error("Supabase error:", error);
                toast.error("Failed to save campaign to database.");
                setLoading(false);
                return;
            }

            // 2. Call n8n webhook with campaign data (including ID from Supabase)
            const payload = {
                campaignId: campaign.id,
                campaignName,
                niches: niches.split(',').map(s => s.trim()).filter(Boolean),
                keywords: keywordsArray,
                platforms: selectedPlatforms,
                countries: selectedCountries,
                quantity: quantity[0]
            };

            const response = await fetch("https://n8n.al-dar.com/webhook-test/3295f12d-70aa-484f-9f8c-9c3d3002861c", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success("Campaign created and search started!");
            } else {
                toast.warning("Campaign saved, but webhook failed. Check n8n.");
            }
        } catch (error) {
            toast.error("An error occurred. Please check your connection.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6 space-y-6">

                {/* Row 1: Campaign Name & Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Campaign Name</label>
                        <Input
                            placeholder="e.g. Summer Outreach 2026"
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-4 pt-1">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium text-muted-foreground">Quantity Limit</label>
                            <span className="text-sm font-bold text-primary">{quantity[0]}</span>
                        </div>
                        <Slider
                            defaultValue={[50]}
                            max={500}
                            step={10}
                            onValueChange={setQuantity}
                            className="py-1"
                        />
                    </div>
                </div>

                {/* Row 2: Regions & Platforms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Regions Multi-Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Target Regions (Multiple)</label>
                        <Popover open={openCountry} onOpenChange={setOpenCountry}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCountry}
                                    className="w-full justify-between h-10 px-3 bg-background"
                                >
                                    <div className="flex gap-1 truncate w-[90%] overflow-hidden">
                                        {selectedCountries.length > 0 ? (
                                            selectedCountries.map((val) => (
                                                <Badge key={val} variant="secondary" className="mr-1 rounded-sm px-1 font-normal h-5">{val}</Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground">Select countries...</span>
                                        )}
                                    </div>
                                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search country..." />
                                    <CommandList>
                                        <CommandEmpty>No country found.</CommandEmpty>
                                        <CommandGroup className="max-h-[200px] overflow-auto">
                                            {countries.map((country) => (
                                                <CommandItem
                                                    key={country}
                                                    value={country}
                                                    onSelect={() => toggleCountry(country)}
                                                >
                                                    <div className={cn(
                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                        selectedCountries.includes(country)
                                                            ? "bg-primary text-primary-foreground"
                                                            : "opacity-50 [&_svg]:invisible"
                                                    )}>
                                                        <Check className="h-3 w-3" />
                                                    </div>
                                                    {country}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Platform Multi-Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Data Sources (Multiple)</label>
                        <Popover open={openPlatform} onOpenChange={setOpenPlatform}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openPlatform}
                                    className="w-full justify-between h-10 px-3 bg-background"
                                >
                                    <div className="flex gap-1 truncate w-[90%]">
                                        {selectedPlatforms.length > 0 ? (
                                            selectedPlatforms.map((val) => {
                                                const platform = platforms.find((p) => p.value === val);
                                                return platform ? <Badge variant="secondary" key={val} className="mr-1 rounded-sm px-1 font-normal h-5">{platform.label}</Badge> : null;
                                            })
                                        ) : (
                                            <span className="text-muted-foreground">Select sources...</span>
                                        )}
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                                <Command>
                                    <CommandList>
                                        <CommandGroup>
                                            {platforms.map((platform) => (
                                                <CommandItem
                                                    key={platform.value}
                                                    value={platform.value}
                                                    onSelect={() => togglePlatform(platform.value)}
                                                >
                                                    <div className={cn(
                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                        selectedPlatforms.includes(platform.value)
                                                            ? "bg-primary text-primary-foreground"
                                                            : "opacity-50 [&_svg]:invisible"
                                                    )}>
                                                        <Check className="h-3 w-3" />
                                                    </div>
                                                    <platform.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    {platform.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Row 3: Niches & Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Target Niches (Comma separated)</label>
                        <Textarea
                            placeholder="Full service marketing agencies, SEO specialists, Web design studios..."
                            className="resize-none min-h-[80px]"
                            value={niches}
                            onChange={(e) => setNiches(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Keywords (Comma separated)</label>
                        <Textarea
                            placeholder="CEO, Founder, Marketing Director, Owner..."
                            className="resize-none min-h-[80px]"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div>
                    <Button
                        size="lg"
                        className="w-full h-12 shadow-lg shadow-orange-500/20 bg-primary hover:bg-primary/90 text-white font-bold text-lg"
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Start Lead Generation"}
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
}
