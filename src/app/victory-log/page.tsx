
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  Trophy, 
  Award, 
  Star, 
  Flame, 
  Shield, 
  Zap, 
  Leaf, 
  Heart, 
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function VictoryLogPage() {
  const [activeMember, setActiveMember] = useState<any>(null);
  const [chores, setChores] = useState<any[]>([]);

  useEffect(() => {
    const updateFromStorage = () => {
      const activeId = localStorage.getItem('activeMemberId');
      const savedMembers = localStorage.getItem('household_members');
      const savedChores = localStorage.getItem('household_chores');

      if (activeId && savedMembers) {
        const members = JSON.parse(savedMembers);
        const found = members.find((m: any) => m.id === activeId);
        if (found) setActiveMember(found);
      }

      if (savedChores) {
        setChores(JSON.parse(savedChores));
      }
    };

    updateFromStorage();
    window.addEventListener('storage', updateFromStorage);
    return () => window.removeEventListener('storage', updateFromStorage);
  }, []);

  if (!activeMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Sparkles className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  const myVictories = chores.filter(c => c.status === 'completed' && c.assignedToId === activeMember.id);
  
  // Combine all history events
  const unifiedHistory = [
    ...myVictories.map(v => ({
      type: 'victory',
      title: v.title,
      description: `Completed the mission for ${v.points} XP`,
      timestamp: v.lastActionAt || new Date().toISOString(),
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-50'
    })),
    ...(activeMember.history || []).map((h: any) => ({
      type: h.type === 'title_change' ? 'ascension' : 'path_shift',
      title: h.type === 'title_change' ? 'New Legendary Title' : 'Path Alignment Shifted',
      description: `${h.oldValue} ➔ ${h.newValue}`,
      timestamp: h.timestamp,
      icon: h.type === 'title_change' ? Trophy : Sparkles,
      color: h.type === 'title_change' ? 'text-yellow-600' : 'text-primary',
      bg: h.type === 'title_change' ? 'bg-yellow-50' : 'bg-primary/5'
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getPathIcon = (path: string) => {
    switch (path) {
      case 'member-1': return Shield;
      case 'member-2': return Zap;
      case 'member-3': return Leaf;
      case 'member-pink': return Heart;
      default: return Shield;
    }
  };

  const PathIcon = getPathIcon(activeMember.theme);

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20 bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-3xl border shadow-sm">
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              <PathIcon className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-headline font-bold">The Chronicles of {activeMember.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2 font-medium">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Current Status: <span className="text-primary font-bold">{activeMember.type}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center bg-muted/30 px-6 py-3 rounded-2xl border">
              <p className="text-2xl font-bold text-primary">{(activeMember.points || 0).toLocaleString()}</p>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Total XP</p>
            </div>
            <div className="text-center bg-orange-50 px-6 py-3 rounded-2xl border border-orange-100">
              <p className="text-2xl font-bold text-orange-600">{activeMember.streak || 0}</p>
              <p className="text-[10px] font-bold uppercase text-orange-600">Day Streak</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Timeline of Legend
                </CardTitle>
                <CardDescription>Your complete history of victories and growth.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px] p-6">
                  {unifiedHistory.length > 0 ? (
                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                      {unifiedHistory.map((event, idx) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <event.icon className={cn("w-5 h-5", event.color)} />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                              <div className="font-bold text-slate-900">{event.title}</div>
                              <time className="text-xs font-medium text-slate-400">
                                {format(new Date(event.timestamp), "MMM d, h:mm a")}
                              </time>
                            </div>
                            <div className="text-slate-500 text-sm">{event.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <History className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                      <p className="text-muted-foreground italic">No chronicles recorded yet. Start your first mission!</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-accent/5 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent" />
                  Achievement Gallery
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {(activeMember.achievements || []).map((achievement: string, i: number) => (
                    <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-muted/20 border border-dashed border-muted-foreground/20">
                      <Sparkles className="w-8 h-8 text-accent mb-2" />
                      <span className="text-[10px] font-bold text-center capitalize">{achievement.replace('-', ' ')}</span>
                    </div>
                  ))}
                  {(activeMember.achievements || []).length === 0 && (
                    <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                      No badges earned yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary p-6 rounded-3xl text-white shadow-lg shadow-primary/20">
              <h3 className="text-lg font-headline font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-300" />
                Warrior's Creed
              </h3>
              <p className="text-sm opacity-90 leading-relaxed italic">
                "A warrior does not clean because they must, but because the Base deserves order. Every dish washed is a strike against chaos."
              </p>
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                  <span>Battle Rank</span>
                  <span>{Math.floor((activeMember.points || 0) / 1000) + 1}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
