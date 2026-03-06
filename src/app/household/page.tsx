"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, UserPlus, Copy, LogOut, Settings, Swords, Zap, Leaf, Heart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useState } from "react";

const MEMBERS = [
  { name: "Alex Johnson", role: "Owner", avatar: "https://picsum.photos/seed/alex/100/100", email: "alex@example.com", type: 'Guardian' },
  { name: "Sam Smith", role: "Admin", avatar: "https://picsum.photos/seed/sam/100/100", type: 'Fire Warrior' },
  { name: "Jordan Lee", role: "Member", avatar: "https://picsum.photos/seed/jordan/100/100", type: 'Nature Scout' },
];

export default function HouseholdPage() {
  const [isAddWarriorOpen, setIsAddWarriorOpen] = useState(false);
  
  const copyInviteCode = () => {
    navigator.clipboard.writeText("BATTLE-2024-CHORE");
    toast({
      title: "Invite Code Copied!",
      description: "Send this code to other adults or older warriors.",
    });
  };

  const handleRecruit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddWarriorOpen(false);
    toast({
      title: "New Warrior Recruited!",
      description: "Welcome to the household battle station.",
    });
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold">House HQ: The Avengers</h1>
            <p className="text-muted-foreground">Manage your team of warriors and guardians.</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isAddWarriorOpen} onOpenChange={setIsAddWarriorOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 font-bold">
                  <Swords className="w-4 h-4 mr-2" /> Recruit Warrior
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleRecruit}>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline">New Warrior Profile</DialogTitle>
                    <DialogDescription>
                      Add a kid or family member to this tablet. No email required!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                      <Label htmlFor="warrior-name">Warrior Name</Label>
                      <Input id="warrior-name" placeholder="e.g. Captain Cleanup" required className="bg-muted/50" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Choose Your Path (Theme)</Label>
                      <div className="grid grid-cols-4 gap-2">
                        <Button type="button" variant="outline" className="h-16 flex flex-col gap-1 border-2 border-orange-200 bg-orange-50 hover:bg-orange-100">
                          <Zap className="w-4 h-4 text-orange-600" />
                          <span className="text-[10px] font-bold">Fire</span>
                        </Button>
                        <Button type="button" variant="outline" className="h-16 flex flex-col gap-1 border-2 border-green-200 bg-green-50 hover:bg-green-100">
                          <Leaf className="w-4 h-4 text-green-600" />
                          <span className="text-[10px] font-bold">Nature</span>
                        </Button>
                        <Button type="button" variant="outline" className="h-16 flex flex-col gap-1 border-2 border-blue-200 bg-blue-50 hover:bg-blue-100">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px] font-bold">Shield</span>
                        </Button>
                        <Button type="button" variant="outline" className="h-16 flex flex-col gap-1 border-2 border-pink-200 bg-pink-50 hover:bg-pink-100">
                          <Heart className="w-4 h-4 text-pink-600" />
                          <span className="text-[10px] font-bold">Love</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full bg-primary font-bold">Summon Warrior!</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="text-xl">Battle Roster</CardTitle>
                <CardDescription>Warriors sharing this tablet HQ.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {MEMBERS.map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-lg">{member.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 uppercase font-bold tracking-tighter">
                          {member.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${
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
                <CardTitle className="text-xl text-destructive">Abandon Station</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">Leave Household</p>
                    <p className="text-xs text-muted-foreground">This device will lose access to this House HQ.</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <LogOut className="w-4 h-4 mr-2" /> Leave
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">Invite Online Warriors</CardTitle>
                <CardDescription>Connect other tablets or phones.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-code">Battle Secret Code</Label>
                  <div className="flex gap-2">
                    <Input id="invite-code" value="BATTLE-2024" readOnly className="bg-white font-mono" />
                    <Button variant="outline" size="icon" onClick={copyInviteCode}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/5">
                  <UserPlus className="w-4 h-4 mr-2" /> Invite Guardian
                </Button>
              </CardContent>
            </Card>

            <div className="p-6 bg-white border rounded-2xl space-y-4 shadow-sm">
              <h3 className="font-bold flex items-center gap-2 text-primary">
                <Shield className="w-5 h-5" />
                Battle Rules
              </h3>
              <ul className="text-xs space-y-3 text-muted-foreground">
                <li className="flex gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">1</div>
                  <span>Guardians can approve missions and create new ones.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">2</div>
                  <span>Warriors switch profiles in the top bar to claim missions.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">3</div>
                  <span>Points are shared globally but streaks are individual.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}