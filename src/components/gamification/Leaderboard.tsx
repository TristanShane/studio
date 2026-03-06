"use client";

import { Trophy, Medal, Award, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const MOCK_LEADERBOARD = [
  { id: "1", name: "Alex Johnson", points: 1250, streak: 12, avatar: "https://picsum.photos/seed/alex/100/100", badges: 5 },
  { id: "2", name: "Sam Smith", points: 1100, streak: 7, avatar: "https://picsum.photos/seed/sam/100/100", badges: 3 },
  { id: "3", name: "Jordan Lee", points: 950, streak: 5, avatar: "https://picsum.photos/seed/jordan/100/100", badges: 4 },
  { id: "4", name: "Taylor Reed", points: 820, streak: 0, avatar: "https://picsum.photos/seed/taylor/100/100", badges: 2 },
];

export function Leaderboard() {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
          <Trophy className="text-yellow-500 w-6 h-6" />
          Household Rankings
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        {MOCK_LEADERBOARD.map((member, index) => {
          const isTopThree = index < 3;
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
                      <Award className="w-3 h-3 mr-1" /> {member.badges} Badges
                    </Badge>
                    {member.streak > 0 && (
                      <span className="flex items-center text-orange-600 text-xs font-bold">
                        <Flame className="w-3 h-3 mr-0.5" /> {member.streak} day streak
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold font-headline text-primary">
                  {member.points.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                  Points
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}