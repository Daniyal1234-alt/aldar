"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Box, BarChart3, Users, Target } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">

      {/* Simple Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center">
              <Box className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold font-heading">Aldarr</span>
          </div>
          <Link href="/dashboard">
            <Button className="font-medium px-5 bg-primary text-white hover:bg-primary/90 rounded-lg h-9">
              Enter Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Centered Hero */}
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">

            {/* Icon */}
            <div className="mb-8 inline-flex items-center justify-center h-20 w-20 bg-primary/10 rounded-2xl border border-primary/20">
              <Box className="h-10 w-10 text-primary" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight mb-4">
              Aldarr Lead Management
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
              Your internal platform for lead generation, campaign management, and sales pipeline tracking.
            </p>

            {/* CTA */}
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-lg px-8 h-12 text-base shadow-lg shadow-primary/20">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            {/* Quick Features */}
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="h-10 w-10 mx-auto mb-2 bg-muted rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium">Lead Search</p>
              </div>
              <div className="text-center">
                <div className="h-10 w-10 mx-auto mb-2 bg-muted rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium">Campaigns</p>
              </div>
              <div className="text-center">
                <div className="h-10 w-10 mx-auto mb-2 bg-muted rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium">CRM</p>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border/40 py-4">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © 2026 Aldarr. Internal use only.
        </div>
      </footer>
    </div>
  );
}
