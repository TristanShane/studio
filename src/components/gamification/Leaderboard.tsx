
"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Award, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Leaderboard() {
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    const updateFromStorage = () => {
      const savedMembers = localStorage.getItem('household_members');
      if (savedMembers) {
        const parsed = JSON.parse(savedMembers);
        // Sort by points descending
        const sorted = [...parsed].sort((a, b) => (b.points || 0) - (a.points || 0));
        setMembers(sorted);
      }
    };

    updateFromStorage();
    window.addEventListener('storage', updateFromStorage);
    return () => window.removeEventListener('storage', updateFromStorage);
  }, []);

  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground italic">
        No warriors recruited yet. Head to HQ to add your team!
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
          <Trophy className="text-yellow-500 w-6 h-6" />
          Household Rankings
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        {members.map((member, index) => {
          return (
            <div 
              key={member.id} 
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-border shadow-sm transition-transform hover:scale-[1.01]"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 text-lg font-bold text-muted-foreground">
                  {index === 0 ? <Medal className="text-yellow-500 w-6 h-6" /> : 
                   index === 1 ? <Medal className="text-slate-400 w-6 h-6" /> : 
                   index === 2 ? <Medal className="text-amber-600 w-6 h-6" /> : 
                   `#${index + 1}`}
                </div>
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-lg">{member.name}</h4>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px]">
                      <Award className="w-3 h-3 mr-1" /> {(member.achievements || []).length} Badges
                    </Badge>
                    {(member.streak || 0) > 0 && (
                      <span className="flex items-center text-orange-600 text-xs font-bold">
                        <Flame className="w-3 h-3 mr-0.5" /> {member.streak} day streak
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold font-headline text-primary">
                  {(member.points || 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                  XP
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
