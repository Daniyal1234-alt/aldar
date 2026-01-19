"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
    { name: "Instagram", value: 40, color: "#E1306C" },
    { name: "Google Maps", value: 30, color: "#4285F4" },
    { name: "Web Search", value: 30, color: "#0F9D58" },
];

export function LeadSourceChart() {
    return (
        <Card className="col-span-1 h-full shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Lead Source Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#000', fontWeight: 500 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span>{item.name} ({item.value}%)</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
