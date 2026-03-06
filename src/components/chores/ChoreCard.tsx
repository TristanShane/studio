"use client";

import { useState } from "react";
import { Check, Clock, Shield, Star, AlertCircle } from "lucide-react";
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
  frequency: 'daily' | 'weekly' | 'one-time';
}

interface ChoreCardProps {
  chore: Chore;
  onClaim?: (id: string) => void;
  onComplete?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isAdmin?: boolean;
}

export function ChoreCard({ chore, onClaim, onComplete, onApprove, onReject, isAdmin }: ChoreCardProps) {
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

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md border-2",
      isAnimating && "celebrate-animation scale-105 shadow-xl border-accent"
    )}>
      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider font-bold px-1.5 py-0", getStatusColor(chore.status))}>
            {chore.status}
          </Badge>
          <div className="flex items-center gap-1 text-primary font-bold">
            <Star className="w-4 h-4 fill-primary" />
            <span>{chore.points}</span>
          </div>
        </div>
        <h3 className="font-headline font-bold text-lg leading-tight">{chore.title}</h3>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {chore.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {chore.dueDate}
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {chore.frequency}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/5 border-t flex gap-2">
        {chore.status === 'pending' && (
          <Button 
            className="w-full bg-primary hover:bg-primary/90" 
            size="sm"
            onClick={() => onClaim?.(chore.id)}
          >
            Claim Chore
          </Button>
        )}
        {chore.status === 'claimed' && (
          <Button 
            className="w-full bg-accent hover:bg-accent/90" 
            size="sm"
            onClick={handleComplete}
          >
            Mark Complete
          </Button>
        )}
        {chore.status === 'completed' && isAdmin && (
          <div className="grid grid-cols-2 w-full gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:bg-destructive/5"
              onClick={() => onReject?.(chore.id)}
            >
              Reject
            </Button>
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onApprove?.(chore.id)}
            >
              Approve
            </Button>
          </div>
        )}
        {chore.status === 'completed' && !isAdmin && (
          <Button variant="outline" className="w-full cursor-not-allowed opacity-70" size="sm" disabled>
            Awaiting Approval
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}