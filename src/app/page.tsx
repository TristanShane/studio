
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChoreCard, Chore } from "@/components/chores/ChoreCard";
import { Flame, Star, Trophy, Plus, ChevronRight, Gift, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const MOCK_STATS = [
  { label: "Current Points", value: "1,240", icon: Star, color: "bg-primary" },
  { label: "Active Streak", value: "12 Days", icon: Flame, color: "bg-orange-500", trend: "+2 today" },
  { label: "Chores Today", value: "3/5", icon: Trophy, color: "bg-accent" },
];

const INITIAL_CHORES: Chore[] = [
  { id: "1", title: "Wash Dishes", description: "Empty the dishwasher and fill with dirty dishes.", points: 30, dueDate: "Today", status: 'pending', frequency: 'daily' },
  { id: "2", title: "Mop Floors", description: "Mop the kitchen and hallway floors.", points: 100, dueDate: "Every Saturday", status: 'pending', frequency: 'weekly' },
  { id: "3", title: "Take Out Trash", description: "Empty all trash cans and take them to the curb.", points: 40, dueDate: "Wednesday Night", status: 'claimed', assignedTo: "Sam", frequency: 'weekly' },
  { id: "4", title: "Laundry", description: "Wash, dry, and fold two loads of laundry.", points: 120, dueDate: "Tomorrow", status: 'claimed', assignedTo: "Jordan", frequency: 'weekly' },
  { id: "5", title: "Water Plants", description: "Water all indoor plants and the garden.", points: 20, dueDate: "Daily", status: 'completed', assignedTo: "Alex", frequency: 'daily' },
];

export default function Dashboard() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [activeMemberName, setActiveMemberName] = useState("Alex Johnson");
  const [prize, setPrize] = useState({ title: "Pizza Night", frequency: "Weekly" });

  useEffect(() => {
    const updateFromStorage = () => {
      // Get chores
      const savedChores = localStorage.getItem('household_chores');
      if (savedChores) {
        setChores(JSON.parse(savedChores));
      } else {
        localStorage.setItem('household_chores', JSON.stringify(INITIAL_CHORES));
        setChores(INITIAL_CHORES);
      }

      // Get current active member
      const savedMembers = localStorage.getItem('household_members');
      const activeId = localStorage.getItem('activeMemberId');
      if (savedMembers && activeId) {
        const members = JSON.parse(savedMembers);
        const active = members.find((m: any) => m.id === activeId);
        if (active) setActiveMemberName(active.name);
      }

      // Get household prize
      const savedPrize = localStorage.getItem('household_prize');
      if (savedPrize) {
        setPrize(JSON.parse(savedPrize));
      }
    };

    updateFromStorage();
    window.addEventListener('storage', updateFromStorage);
    return () => window.removeEventListener('storage', updateFromStorage);
  }, []);

  const handleComplete = (id: string) => {
    const updated = chores.map(c => c.id === id ? { ...c, status: 'completed' as const } : c);
    setChores(updated);
    localStorage.setItem('household_chores', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const activeMissions = chores.filter(c => c.status === 'claimed' && c.assignedTo === activeMemberName);

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Warrior HQ</h1>
            <p className="text-muted-foreground">Currently playing as <span className="text-primary font-bold">{activeMemberName}</span></p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="w-full md:w-auto bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Link href="/chores">
                <Target className="w-4 h-4 mr-2" /> Mission Board
              </Link>
            </Button>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_STATS.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </section>

        {/* Chores Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-headline font-bold">Your Active Missions</h2>
            <Link href="/chores" className="text-primary text-sm font-bold flex items-center hover:underline">
              View all board <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeMissions.length > 0 ? (
              activeMissions.map(chore => (
                <ChoreCard 
                  key={chore.id} 
                  chore={chore} 
                  activeMemberName={activeMemberName}
                  onComplete={handleComplete}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-border">
                <p className="text-muted-foreground">You haven't claimed any missions yet. Defend your home!</p>
                <Button variant="link" asChild>
                  <Link href="/chores">Open Mission Board</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Recent Activity / Mini Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white p-6 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-headline font-bold">Household Feed</h3>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-6">
              {chores.filter(c => c.status === 'completed').slice(0, 3).map((chore, i) => (
                <div key={chore.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      <span className="font-bold">{chore.assignedTo}</span> completed <span className="text-primary font-bold">{chore.title}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Just now • +{chore.points} points earned</p>
                  </div>
                </div>
              ))}
              {chores.filter(c => c.status === 'completed').length === 0 && (
                <p className="text-center py-8 text-sm text-muted-foreground italic">No victories reported today... yet.</p>
              )}
            </div>
          </section>

          <section className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex flex-col justify-center">
            <div className="text-center space-y-2">
              <div className="relative inline-block">
                <Gift className="w-12 h-12 text-primary mx-auto mb-2" />
                <Badge className="absolute -top-1 -right-4 bg-accent text-white border-none text-[10px]">{prize.frequency}</Badge>
              </div>
              <h3 className="text-xl font-headline font-bold">Battle Treasure: {prize.title}</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">The top warrior of the {prize.frequency.toLowerCase()} battle claims this reward!</p>
              <div className="pt-4 flex justify-center gap-2">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 h-8 text-xs" asChild>
                  <Link href="/household">Change Goal</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
