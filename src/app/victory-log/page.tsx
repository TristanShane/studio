
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
  CheckCircle2,
  Calendar
} from "lucide-react";
import { format, isSameDay, isSameWeek, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";

export default function VictoryLogPage() {
  const [activeMember, setActiveMember] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [prizeCycle, setPrizeCycle] = useState<string>("Weekly");

  useEffect(() => {
    const updateFromStorage = () => {
      const activeId = localStorage.getItem('activeMemberId');
      const savedMembers = localStorage.getItem('household_members');
      const savedHistory = localStorage.getItem('household_history');
      const savedPrize = localStorage.getItem('household_prize');

      if (activeId && savedMembers) {
        const members = JSON.parse(savedMembers);
        const found = members.find((m: any) => m.id === activeId);
        if (found) setActiveMember(found);
      }

      if (savedHistory) setHistory(JSON.parse(savedHistory));
      if (savedPrize) setPrizeCycle(JSON.parse(savedPrize).frequency);
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

  // Filter history based on active user and prize cycle
  const now = new Date();
  const filteredHistory = history.filter(h => {
    const eventDate = new Date(h.timestamp);
    if (prizeCycle === 'Daily') return h.userId === activeMember.id && isSameDay(now, eventDate);
    if (prizeCycle === 'Weekly') return h.userId === activeMember.id && isSameWeek(now, eventDate, { weekStartsOn: 1 });
    if (prizeCycle === 'Monthly') return h.userId === activeMember.id && isSameMonth(now, eventDate);
    return h.userId === activeMember.id;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Also include profile events (Title/Path changes)
  const profileEvents = (activeMember.history || []).map((h: any) => ({
    type: h.type === 'title_change' ? 'ascension' : 'path_shift',
    title: h.type === 'title_change' ? 'New Legendary Title' : 'Path Shifted',
    description: `${h.oldValue} ➔ ${h.newValue}`,
    timestamp: h.timestamp,
    icon: h.type === 'title_change' ? Trophy : Sparkles,
    color: h.type === 'title_change' ? 'text-yellow-600' : 'text-primary',
    bg: h.type === 'title_change' ? 'bg-yellow-50' : 'bg-primary/5'
  }));

  const unifiedHistory = [
    ...filteredHistory.map(v => ({
      type: 'victory',
      title: v.title,
      description: `Completed the mission for ${v.points} XP`,
      timestamp: v.timestamp,
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-50'
    })),
    ...profileEvents
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getPathIcon = (path: string) => {
    switch (path) {
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
              <h1 className="text-4xl font-headline font-bold">{activeMember.name}'s Chronicles</h1>
              <p className="text-muted-foreground flex items-center gap-2 font-medium">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Current Status: <span className="text-primary font-bold">{activeMember.type}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center bg-muted/30 px-6 py-3 rounded-2xl border">
              <p className="text-2xl font-bold text-primary">{(activeMember.points || 0).toLocaleString()}</p>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Lifetime XP</p>
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
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Timeline of Legend
                  </CardTitle>
                  <Badge variant="secondary" className="bg-white/80 border text-[10px] uppercase font-bold tracking-tighter">
                    <Calendar className="w-3 h-3 mr-1" /> Cycle: {prizeCycle}
                  </Badge>
                </div>
                <CardDescription>Records for the current {prizeCycle.toLowerCase()} reward quest.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px] p-6">
                  {unifiedHistory.length > 0 ? (
                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                      {unifiedHistory.map((event, idx) => (
                        <div key={idx} className="relative flex items-center group">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-white shadow-sm shrink-0 z-10">
                            <event.icon className={cn("w-5 h-5", event.color)} />
                          </div>
                          <div className="ml-6 p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow flex-1">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                              <div className="font-bold text-slate-900">{event.title}</div>
                              <time className="text-[10px] font-bold text-slate-400 uppercase">
                                {format(new Date(event.timestamp), "MMM d, h:mm a")}
                              </time>
                            </div>
                            <div className="text-slate-500 text-sm">{event.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 opacity-50">
                      <History className="w-12 h-12 mx-auto mb-4" />
                      <p className="italic">The archives are empty for this {prizeCycle.toLowerCase()} cycle.</p>
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
                  Hall of Fame
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
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary p-6 rounded-3xl text-white shadow-lg">
              <h3 className="text-lg font-headline font-bold mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-300" /> Warrior's Creed</h3>
              <p className="text-sm opacity-90 leading-relaxed italic">
                "Victory is not a one-time event, but a continuous cycle of service. Every mission recorded is a step toward household mastery."
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
