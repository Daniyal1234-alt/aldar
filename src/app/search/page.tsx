"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SearchConfig } from "@/components/dashboard/SearchConfig";
import { LeadSourceChart } from "@/components/dashboard/LeadSourceChart";
import { LeadsTable } from "@/components/dashboard/LeadsTable";

export default function LeadSearchPage() {
    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            <Sidebar />
            <div className="flex bg-zinc-50/50 dark:bg-zinc-900/50 flex-1 flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold font-heading tracking-tight">Lead Search</h1>
                    </div>

                    {/* Top Section: Search Configuration */}
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SearchConfig />
                    </section>

                    {/* Middle Section: Chart */}
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                        <LeadSourceChart />
                    </section>

                    {/* Bottom Section: Leads Results Table */}
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold font-heading">Recent Leads Found</h2>
                        </div>
                        <LeadsTable />
                    </section>

                </main>
            </div>
        </div>
    );
}
