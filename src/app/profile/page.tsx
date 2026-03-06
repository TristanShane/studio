"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Award, Star, Flame, Camera, Shield, Zap, Leaf, Heart, Sparkles, Wand2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const WARRIOR_TITLES = [
  "Dust Dragon Slayer",
  "Dishwashing Druid",
  "Vacuum Valkyrie",
  "Laundry Legend",
  "Kitchen Knight",
  "Pantry Paladin",
  "Laundry Warlock",
  "Master of Mops",
  "The Great Organizer"
];

const WARRIOR_PATHS = [
  { id: 'member-1', name: 'Shield Guardian', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'member-2', name: 'Fire Warrior', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { id: 'member-3', name: 'Nature Scout', icon: Leaf, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  { id: 'member-pink', name: 'Heart Healer', icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
];

export default function ProfilePage() {
  const [activeMember, setActiveMember] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const updateFromStorage = () => {
      const activeId = localStorage.getItem('activeMemberId');
      const savedMembers = localStorage.getItem('household_members');
      if (activeId && savedMembers) {
        const members = JSON.parse(savedMembers);
        const found = members.find((m: any) => m.id === activeId);
        if (found) setActiveMember(found);
      }
    };

    updateFromStorage();
    window.addEventListener('storage', updateFromStorage);
    return () => window.removeEventListener('storage', updateFromStorage);
  }, []);

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newName = formData.get('name') as string;
    const newTitle = formData.get('title') as string;
    const newPath = formData.get('path') as string;

    const savedMembers = localStorage.getItem('household_members');
    if (!savedMembers || !activeMember) return;

    const members = JSON.parse(savedMembers);
    const updatedMembers = members.map((m: any) => {
      if (m.id === activeMember.id) {
        return {
          ...m,
          name: newName,
          type: newTitle,
          theme: newPath
        };
      }
      return m;
    });

    localStorage.setItem('household_members', JSON.stringify(updatedMembers));
    // Trigger theme change immediately
    document.documentElement.setAttribute('data-theme', newPath);
    window.dispatchEvent(new Event('storage'));
    setIsEditOpen(false);
    toast({ 
      title: "Profile Ascended!", 
      description: `You are now known as the ${newTitle}.` 
    });
  };

  if (!activeMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Sparkles className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-3xl border border-border shadow-sm">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-xl">
              <AvatarImage src={activeMember.avatar} />
              <AvatarFallback>{activeMember.name[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          <div className="text-center md:text-left space-y-2 flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-4xl font-headline font-bold">{activeMember.name}</h1>
              <span className="bg-primary/10 text-primary text-xs font-bold uppercase px-2 py-1 rounded-full w-fit mx-auto md:mx-0">
                Level {(activeMember.achievements || []).length + 1}
              </span>
            </div>
            <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2">
              <Wand2 className="w-4 h-4 text-accent" />
              {activeMember.type || "Awaiting Title"}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="bg-primary/10 px-4 py-2 rounded-xl flex items-center gap-2 border border-primary/20 shadow-sm">
                <Star className="text-primary w-5 h-5 fill-primary" />
                <span className="font-bold">{(activeMember.points || 0).toLocaleString()} XP</span>
              </div>
              <div className="bg-orange-100 px-4 py-2 rounded-xl flex items-center gap-2 border border-orange-200 shadow-sm">
                <Flame className="text-orange-600 w-5 h-5" />
                <span className="font-bold text-orange-600">{activeMember.streak || 0} Day Streak</span>
              </div>
            </div>
          </div>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
                Edit Warrior Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <form onSubmit={handleUpdateProfile}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-headline">Customize Your Warrior</DialogTitle>
                  <DialogDescription>
                    Change your path, theme, and legendary title.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Warrior Name</Label>
                    <Input id="name" name="name" defaultValue={activeMember.name} required />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="title">Earned Title</Label>
                    <Select name="title" defaultValue={activeMember.type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick your title..." />
                      </SelectTrigger>
                      <SelectContent>
                        {WARRIOR_TITLES.map(title => (
                          <SelectItem key={title} value={title}>{title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-widest">The Path You Follow</Label>
                    <input type="hidden" name="path" id="edit-path-input" defaultValue={activeMember.theme || 'member-1'} />
                    <div className="grid grid-cols-2 gap-3">
                      {WARRIOR_PATHS.map(path => (
                        <Button 
                          key={path.id}
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            (document.getElementById('edit-path-input') as HTMLInputElement).value = path.id;
                            // Visual feedback
                            document.querySelectorAll('.path-btn').forEach(b => b.classList.remove('ring-2', 'ring-primary'));
                            document.getElementById(`path-${path.id}`)?.classList.add('ring-2', 'ring-primary');
                          }}
                          id={`path-${path.id}`}
                          className={`path-btn h-16 flex flex-col gap-1 ${path.bg} ${path.border} hover:${path.bg} transition-all ${activeMember.theme === path.id ? 'ring-2 ring-primary' : ''}`}
                        >
                          <path.icon className={`w-5 h-5 ${path.color}`} />
                          <span className={`text-[10px] font-bold ${path.color}`}>{path.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full bg-primary font-bold">Ascend Profile</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-accent/5 border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <Award className="w-6 h-6 text-accent" />
                Quest Badges
              </CardTitle>
              <CardDescription>Legendary marks earned through household service.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {(activeMember.achievements || []).map((achievement: string, i: number) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center border-4 border-white shadow-md hover:scale-110 transition-transform cursor-pointer relative group">
                      <Sparkles className="w-8 h-8 text-accent" />
                      <div className="absolute -top-12 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {achievement.replace('-', ' ').toUpperCase()}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-center capitalize">{achievement.replace('-', ' ')}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-2 opacity-30">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-4 border-white grayscale">
                    <Award className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <span className="text-[10px] font-bold text-center">Next Quest</span>
                </div>
              </div>
              {(activeMember.achievements || []).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground italic">No badges earned yet. Complete missions to unlock!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Magical Stats
              </CardTitle>
              <CardDescription>Your performance in the Great Household Battle.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-muted-foreground uppercase text-xs">Battle Prowess</span>
                  <span className="font-bold text-primary">{(activeMember.points || 0) % 1000} / 1000 XP to next rank</span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${(activeMember.points || 0) % 1000 / 10}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-center">
                  <p className="text-2xl font-bold">{activeMember.streak || 0}</p>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Day Streak</p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-center">
                  <p className="text-2xl font-bold">{(activeMember.achievements || []).length}</p>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Rare Badges</p>
                </div>
              </div>

              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5 font-bold">
                View Full Victory Log
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
