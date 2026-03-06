
"use client";

import { useState } from "react";
import { Check, Clock, Shield, Star, AlertCircle, User, RotateCcw } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Chore {
  id: string;
  title: string;
  description: string;
  points: number;
  dueDate: string;
  status: 'pending' | 'claimed' | 'completed' | 'overdue';
  assignedTo?: string;
  assignedToId?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'one-time';
}

interface ChoreCardProps {
  chore: Chore;
  activeMemberName: string;
  onClaim?: (id: string) => void;
  onComplete?: (id: string) => void;
  onRevoke?: (id: string) => void;
  isAdmin?: boolean;
}

export function ChoreCard({ chore, activeMemberName, onClaim, onComplete, onRevoke, isAdmin }: ChoreCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleComplete = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onComplete?.(chore.id);
    }, 600);
  };

  const getStatusColor = (status: Chore['status']) => {
    switch (status) {
      case 'pending': return 'bg-muted text-muted-foreground';
      case 'claimed': return 'bg-accent/10 text-accent border-accent/20';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'overdue': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isAssignedToMe = chore.assignedTo === activeMemberName;

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md border-2",
      isAnimating && "celebrate-animation scale-105 shadow-xl border-accent",
      chore.status === 'overdue' && "border-destructive/30 grayscale-[0.5]"
    )}>
      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider font-bold px-1.5 py-0", getStatusColor(chore.status))}>
            {chore.status}
          </Badge>
          <div className="flex items-center gap-1 text-primary font-bold">
            <Star className="w-4 h-4 fill-primary" />
            <span>{chore.points} XP</span>
          </div>
        </div>
        <h3 className="font-headline font-bold text-lg leading-tight">{chore.title}</h3>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {chore.description}
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Due: {chore.dueDate}
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {chore.frequency}
            </div>
          </div>
          {chore.assignedTo && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight text-primary bg-primary/5 w-fit px-2 py-0.5 rounded-md">
              <User className="w-3 h-3" />
              {chore.status === 'completed' ? `Mastered by ${chore.assignedTo}` : `Claimed by ${chore.assignedTo}`}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/5 border-t flex gap-2">
        {chore.status === 'pending' && (
          <Button 
            className="w-full bg-primary hover:bg-primary/90" 
            size="sm"
            onClick={() => onClaim?.(chore.id)}
          >
            Claim Mission
          </Button>
        )}
        {chore.status === 'claimed' && isAssignedToMe && (
          <Button 
            className="w-full bg-accent hover:bg-accent/90" 
            size="sm"
            onClick={handleComplete}
          >
            Mark Complete
          </Button>
        )}
        {chore.status === 'claimed' && !isAssignedToMe && (
          <Button variant="outline" className="w-full cursor-not-allowed opacity-50" size="sm" disabled>
            Busy with {chore.assignedTo}
          </Button>
        )}
        {chore.status === 'overdue' && (
          <div className="flex items-center justify-center w-full gap-2 text-destructive text-xs font-bold py-1">
            <AlertCircle className="w-4 h-4" /> Mission Failed (Expired)
          </div>
        )}
        {chore.status === 'completed' && isAdmin && (
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full flex items-center justify-center gap-2"
            onClick={() => onRevoke?.(chore.id)}
          >
            <RotateCcw className="w-4 h-4" /> Revoke Mission
          </Button>
        )}
        {chore.status === 'completed' && !isAdmin && (
          <div className="w-full flex items-center justify-center gap-2 text-green-600 text-xs font-bold py-1">
            <Check className="w-4 h-4" /> Victory Recorded
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
