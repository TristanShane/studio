"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, UserPlus, Copy, LogOut, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MEMBERS = [
  { name: "Alex Johnson", role: "Owner", avatar: "https://picsum.photos/seed/alex/100/100", email: "alex@example.com" },
  { name: "Sam Smith", role: "Admin", avatar: "https://picsum.photos/seed/sam/100/100", email: "sam@example.com" },
  { name: "Jordan Lee", role: "Member", avatar: "https://picsum.photos/seed/jordan/100/100", email: "jordan@example.com" },
];

export default function HouseholdPage() {
  const copyInviteCode = () => {
    navigator.clipboard.writeText("BATTLE-2024-CHORE");
    toast({
      title: "Invite Code Copied!",
      description: "Send this code to your household members.",
    });
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold">Household: The Avengers</h1>
            <p className="text-muted-foreground">Manage your team and invite new warriors.</p>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Household Members</CardTitle>
                <CardDescription>All members who are part of this chore battle.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {MEMBERS.map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-xl">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        member.role === 'Owner' ? 'bg-primary text-white' : 
                        member.role === 'Admin' ? 'bg-accent text-white' : 
                        'bg-muted text-muted-foreground'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-xl text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">Leave Household</p>
                    <p className="text-xs text-muted-foreground">You will lose all your points and history in this house.</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <LogOut className="w-4 h-4 mr-2" /> Leave
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Invite Others</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-code">Household Code</Label>
                  <div className="flex gap-2">
                    <Input id="invite-code" value="BATTLE-2024" readOnly className="bg-white" />
                    <Button variant="outline" size="icon" onClick={copyInviteCode}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <UserPlus className="w-4 h-4 mr-2" /> Invite by Email
                </Button>
              </CardContent>
            </Card>

            <div className="p-6 bg-white border rounded-2xl space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Permissions
              </h3>
              <ul className="text-xs space-y-2 text-muted-foreground list-disc pl-4">
                <li>Owners can delete households</li>
                <li>Admins can approve chores</li>
                <li>Members can claim and complete chores</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}