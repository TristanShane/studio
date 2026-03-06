"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChoreCard, Chore } from "@/components/chores/ChoreCard";
import { Flame, Star, Trophy, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const MOCK_STATS = [
  { label: "Current Points", value: "1,240", icon: Star, color: "bg-primary" },
  { label: "Active Streak", value: "12 Days", icon: Flame, color: "bg-orange-500", trend: "+2 today" },
  { label: "Chores Today", value: "3/5", icon: Trophy, color: "bg-accent" },
];

const MOCK_CHORES: Chore[] = [
  { 
    id: "1", 
    title: "Deep Clean Kitchen", 
    description: "Wipe down all surfaces, clean the oven, and mop the floor.", 
    points: 150, 
    dueDate: "Today, 6 PM", 
    status: 'claimed', 
    assignedTo: "Alex", 
    frequency: 'weekly' 
  },
  { 
    id: "2", 
    title: "Mow the Lawn", 
    description: "Cut grass in both front and back yards. Edge the walkway.", 
    points: 200, 
    dueDate: "Tomorrow", 
    status: 'pending', 
    frequency: 'weekly' 
  },
  { 
    id: "3", 
    title: "Vacuum Living Room", 
    description: "Vacuum thoroughly including under the sofa cushions.", 
    points: 50, 
    dueDate: "Today, 4 PM", 
    status: 'completed', 
    assignedTo: "Alex", 
    frequency: 'daily' 
  },
];

export default function Dashboard() {
  const [chores, setChores] = useState<Chore[]>(MOCK_CHORES);

  const handleComplete = (id: string) => {
    setChores(prev => prev.map(c => c.id === id ? { ...c, status: 'completed' } : c));
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Welcome back, Alex!</h1>
            <p className="text-muted-foreground">You're currently in <span className="text-primary font-bold">1st place</span> this week. Keep it up!</p>
          </div>
          <Button className="w-full md:w-auto bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> Create Chore
          </Button>
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
            <h2 className="text-xl font-headline font-bold">Today's Missions</h2>
            <Link href="/chores" className="text-primary text-sm font-bold flex items-center hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chores.filter(c => c.status !== 'completed').map(chore => (
              <ChoreCard 
                key={chore.id} 
                chore={chore} 
                onComplete={handleComplete}
              />
            ))}
          </div>
        </section>

        {/* Recent Activity / Mini Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white p-6 rounded-2xl border border-border">
            <h3 className="text-lg font-headline font-bold mb-4">Household Feed</h3>
            <div className="space-y-6">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      <span className="font-bold">Sam Smith</span> completed <span className="text-primary font-bold">Take out trash</span>
                    </p>
                    <p className="text-xs text-muted-foreground">2 hours ago • +30 points</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex flex-col justify-center">
            <div className="text-center space-y-2">
              <Trophy className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-xl font-headline font-bold">Weekly Prize: Pizza Night</h3>
              <p className="text-sm text-muted-foreground">The winner of this week's battle gets to choose the household dinner on Friday!</p>
              <div className="pt-4">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  View Rewards
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}