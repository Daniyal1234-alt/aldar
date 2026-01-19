"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            <Sidebar />
            <div className="flex bg-zinc-50/50 dark:bg-zinc-900/50 flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                    <h1 className="text-2xl font-bold font-heading tracking-tight">Settings</h1>

                    <Tabs defaultValue="general" className="w-full max-w-4xl">
                        <TabsList className="grid w-full grid-cols-3 mb-8">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="billing">Billing & Plans</TabsTrigger>
                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        </TabsList>

                        {/* General Tab */}
                        <TabsContent value="general">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>
                                        Update your account profile details and email.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-20 w-20">
                                            <AvatarFallback className="text-lg">AD</AvatarFallback>
                                        </Avatar>
                                        <Button variant="outline">Change Avatar</Button>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" defaultValue="Alex Designer" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" defaultValue="alex@aldar.com" />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t bg-muted/50 px-6 py-4">
                                    <Button>Save Changes</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        {/* Billing Tab */}
                        <TabsContent value="billing">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Current Plan</CardTitle>
                                    <CardDescription>
                                        You are currently on the Pro Plan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5 border-primary/20">
                                        <div className="space-y-0.5">
                                            <div className="font-semibold text-primary">Pro Plan</div>
                                            <div className="text-sm text-muted-foreground">$49/month</div>
                                        </div>
                                        <Button variant="outline" className="border-primary/20 hover:bg-primary/10">Manage Subscription</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Notifications Tab */}
                        <TabsContent value="notifications">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notification Preferences</CardTitle>
                                    <CardDescription>
                                        Choose what you want to be notified about.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between space-x-2">
                                        <Label htmlFor="email-notifs" className="flex flex-col space-y-1">
                                            <span>Email Notifications</span>
                                            <span className="font-normal text-xs text-muted-foreground">Receive daily summaries of new leads.</span>
                                        </Label>
                                        <Switch id="email-notifs" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between space-x-2">
                                        <Label htmlFor="marketing-emails" className="flex flex-col space-y-1">
                                            <span>Marketing Emails</span>
                                            <span className="font-normal text-xs text-muted-foreground">Receive emails about new products, features, and more.</span>
                                        </Label>
                                        <Switch id="marketing-emails" />
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t bg-muted/50 px-6 py-4">
                                    <Button>Save Preferences</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                    </Tabs>

                </main>
            </div>
        </div>
    );
}
