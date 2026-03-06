"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { Award, Star, Flame, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LeaderboardPage() {
  const [streakMembers, setStreakMembers] = useState<any[]>([]);

  useEffect(() => {
    const updateFromStorage = () => {
      const savedMembers = localStorage.getItem('household_members');
      if (savedMembers) {
        const parsed = JSON.parse(savedMembers);
        // Sort by streak descending and take top 5
        const sorted = [...parsed].sort((a, b) => (b.streak || 0) - (a.streak || 0)).slice(0, 5);
        setStreakMembers(sorted);
      }
    };

    updateFromStorage();
    window.addEventListener('storage', updateFromStorage);
    return () => window.removeEventListener('storage', updateFromStorage);
  }, []);

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section className="text-center space-y-2">
          <h1 className="text-4xl font-headline font-bold text-foreground">House Rankings</h1>
          <p className="text-muted-foreground">Battle of the best! Who will take home this week's trophy?</p>
        </section>

        <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
          <Leaderboard />
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-2xl text-white">
            <h3 className="text-xl font-headline font-bold mb-4 flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-400" />
              Longest Streaks
            </h3>
            <div className="space-y-3">
              {streakMembers.length > 0 ? (
                streakMembers.map((member, idx) => (
                  <div key={member.id} className="flex justify-between items-center py-2 border-b border-white/20 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-70 font-bold w-4">{idx + 1}.</span>
                      <span className="font-medium">{member.name}</span>
                    </div>
                    <span className="font-bold">{member.streak || 0} Days</span>
                  </div>
                ))
              ) : (
                <p className="text-sm opacity-80 italic">No streaks recorded yet. Start your first mission!</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border">
            <h3 className="text-xl font-headline font-bold mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              Top Achievement Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Early Bird</Badge>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Cleaning Machine</Badge>
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">Streak Master</Badge>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Helper Hero</Badge>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
