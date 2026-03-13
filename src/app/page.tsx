
"use client";

import { useState, useEffect } from "react";
import { Navbar, AppNotification } from "@/components/layout/Navbar";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChoreCard, Chore } from "@/components/chores/ChoreCard";
import { Flame, Star, Trophy, Target, Users, ChevronRight, Gift, Swords, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { collection, query, where, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { isSameDay, isSameWeek, isSameMonth } from "date-fns";

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [chores, setChores] = useState<Chore[]>([]);
  const [activeMember, setActiveMember] = useState<any>(null);
  const [prize, setPrize] = useState({ title: "Pizza Night", frequency: "Weekly", xpGoal: 1000, currentXP: 0 });
  const [hasHousehold, setHasHousehold] = useState<boolean | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPendingRequest, setIsPendingRequest] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!user) return;

    setIsPendingRequest(localStorage.getItem('pending_join_request') === 'true');

    const q = query(collection(db, "households"), where("members", "array-contains", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setHasHousehold(true);
        setIsPendingRequest(false);
        localStorage.removeItem('pending_join_request');
        
        const hDoc = snapshot.docs[0];
        const hData = hDoc.data();
        const isActuallyOwner = hData.ownerId === user.uid;
        
        const savedMembers = localStorage.getItem('household_members');
        const members = savedMembers ? JSON.parse(savedMembers) : [];
        const savedActiveId = localStorage.getItem('activeMemberId');

        if (!savedActiveId || members.length === 0) {
          const profile = {
            id: user.uid,
            name: user.displayName || (isActuallyOwner ? "Guardian" : "Warrior"),
            role: isActuallyOwner ? "Owner" : "Warrior",
            avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
            type: isActuallyOwner ? 'Shield Guardian' : 'Warrior Recruit',
            theme: 'member-1',
            points: 0,
            streak: 0,
            lastCompletionDate: null
          };
          localStorage.setItem('activeMemberId', user.uid);
          localStorage.setItem('household_members', JSON.stringify([profile]));
          setActiveMember(profile);
          window.dispatchEvent(new Event('storage'));
        } else {
          const active = members.find((m: any) => m.id === savedActiveId);
          if (active) setActiveMember(active);
        }
      } else {
        setHasHousehold(false);
      }
    });

    const updateFromStorage = () => {
      const savedChores = localStorage.getItem('household_chores');
      const parsedChores: Chore[] = savedChores ? JSON.parse(savedChores) : [];
      
      // Run recurring reset logic
      const { updatedChores, hasChanges } = syncAndResetRecurringChores(parsedChores);
      if (hasChanges) {
        localStorage.setItem('household_chores', JSON.stringify(updatedChores));
        setChores(updatedChores);
      } else {
        setChores(parsedChores);
      }

      const savedMembers = localStorage.getItem('household_members');
      const activeId = localStorage.getItem('activeMemberId');
      if (savedMembers && activeId) {
        const members = JSON.parse(savedMembers);
        const active = members.find((m: any) => m.id === activeId);
        if (active) setActiveMember(active);
      }

      const savedPrize = localStorage.getItem('household_prize');
      if (savedPrize) setPrize(JSON.parse(savedPrize));
    };

    updateFromStorage();
    window.addEventListener('storage', updateFromStorage);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', updateFromStorage);
    };
  }, [user, db]);

  const syncAndResetRecurringChores = (currentChores: Chore[]) => {
    const now = new Date();
    let hasChanges = false;

    const updated = currentChores.map(chore => {
      if (chore.status === 'pending') return chore;
      if (!chore.lastActionAt) return chore;

      const lastDate = new Date(chore.lastActionAt);
      let shouldReset = false;

      if (chore.frequency === 'daily') {
        shouldReset = !isSameDay(now, lastDate);
      } else if (chore.frequency === 'weekly') {
        shouldReset = !isSameWeek(now, lastDate, { weekStartsOn: 1 });
      } else if (chore.frequency === 'monthly') {
        shouldReset = !isSameMonth(now, lastDate);
      }

      if (shouldReset) {
        hasChanges = true;
        return {
          ...chore,
          status: 'pending' as const,
          assignedTo: undefined,
          assignedToId: undefined,
          lastActionAt: undefined
        };
      }
      return chore;
    });

    return { updatedChores: updated, hasChanges };
  };

  const addNotification = (message: string, type: AppNotification['type']) => {
    const saved = localStorage.getItem('household_notifications');
    const notifications: AppNotification[] = saved ? JSON.parse(saved) : [];
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      type
    };
    localStorage.setItem('household_notifications', JSON.stringify([...notifications, newNotif]));
    window.dispatchEvent(new Event('storage'));
  };

  const handleCreateHousehold = async () => {
    if (!user) return;
    setIsCreating(true);
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const hRef = collection(db, "households");
    
    addDoc(hRef, {
      name: `${user.displayName || 'Warrior'}'s Base`,
      ownerId: user.uid,
      inviteCode,
      members: [user.uid],
      createdAt: serverTimestamp()
    })
    .then(() => {
      const ownerProfile = {
        id: user.uid,
        name: user.displayName || "Guardian",
        role: "Owner",
        avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
        type: 'Shield Guardian',
        theme: 'member-1',
        points: 0,
        streak: 0,
        lastCompletionDate: null
      };
      localStorage.setItem('activeMemberId', user.uid);
      localStorage.setItem('household_members', JSON.stringify([ownerProfile]));
      localStorage.setItem('household_chores', JSON.stringify([]));
      localStorage.setItem('household_notifications', JSON.stringify([]));
      localStorage.setItem('household_prize', JSON.stringify({ title: "Pizza Night", frequency: "Weekly", xpGoal: 1000, currentXP: 0 }));
      
      setHasHousehold(true);
      setActiveMember(ownerProfile);
      window.dispatchEvent(new Event('storage'));
      toast({ title: "Base Forged!", description: "Welcome to your new HQ, Guardian." });
    })
    .finally(() => {
      setIsCreating(false);
    });
  };

  const saveChores = (updated: Chore[]) => {
    setChores(updated);
    localStorage.setItem('household_chores', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleClaim = (id: string) => {
    const chore = chores.find(c => c.id === id);
    if (!chore || !activeMember) return;
    const updated = chores.map(c => 
      c.id === id ? { 
        ...c, 
        status: 'claimed' as const, 
        assignedTo: activeMember.name, 
        assignedToId: activeMember.id,
        lastActionAt: new Date().toISOString()
      } : c
    );
    saveChores(updated);
    addNotification(`${activeMember.name} has joined the battle for: ${chore.title}`, 'claim');
    toast({ title: "Mission Claimed!", description: `You've joined the battle for this mission.` });
  };

  const handleComplete = (id: string) => {
    const chore = chores.find(c => c.id === id);
    if (!chore || !activeMember) return;

    const updated = chores.map(c => c.id === id ? { 
      ...c, 
      status: 'completed' as const,
      lastActionAt: new Date().toISOString()
    } : c);
    saveChores(updated);

    const savedMembers = localStorage.getItem('household_members');
    if (savedMembers) {
      const members = JSON.parse(savedMembers);
      const today = new Date().toISOString().split('T')[0];
      
      const updatedMembers = members.map((m: any) => {
        if (m.id === activeMember.id) {
          const hasAlreadyCompletedToday = m.lastCompletionDate === today;
          return {
            ...m,
            points: (m.points || 0) + chore.points,
            streak: hasAlreadyCompletedToday ? m.streak : (m.streak || 0) + 1,
            lastCompletionDate: today
          };
        }
        return m;
      });
      localStorage.setItem('household_members', JSON.stringify(updatedMembers));
    }

    const savedPrize = localStorage.getItem('household_prize');
    if (savedPrize) {
      const p = JSON.parse(savedPrize);
      const updatedPrize = { ...p, currentXP: (p.currentXP || 0) + chore.points };
      localStorage.setItem('household_prize', JSON.stringify(updatedPrize));
      setPrize(updatedPrize);
    }

    addNotification(`${activeMember.name} completed the mission: ${chore.title}! (+${chore.points} XP)`, 'completion');
    window.dispatchEvent(new Event('storage'));
    toast({ title: "Victory Recorded!", description: `+${chore.points} XP earned!` });
  };

  if (isUserLoading || hasHousehold === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Swords className="w-12 h-12 text-primary animate-bounce" />
        <h2 className="text-xl font-headline font-bold">Scanning Battle Status...</h2>
      </div>
    );
  }

  if (!hasHousehold) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-md w-full text-center space-y-8 bg-white p-8 rounded-3xl shadow-xl border-2 border-primary/10">
          {isPendingRequest ? (
            <>
              <div className="bg-accent/10 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-12 h-12 text-accent" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-headline font-bold">Access Pending</h1>
                <p className="text-muted-foreground">Your request to join the household has been sent. The Guardian must approve you from their Base HQ.</p>
              </div>
              <Button variant="outline" onClick={() => {
                localStorage.removeItem('pending_join_request');
                setIsPendingRequest(false);
              }} className="w-full">
                Cancel Request & Start Over
              </Button>
            </>
          ) : (
            <>
              <div className="bg-primary/10 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto rotate-3 shadow-inner">
                <Users className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-headline font-bold">Base Not Found</h1>
                <p className="text-muted-foreground">You are not part of a household yet. Would you like to build your own battle station?</p>
              </div>
              <Button 
                onClick={handleCreateHousehold} 
                size="lg" 
                disabled={isCreating}
                className="w-full h-14 bg-primary hover:bg-primary/90 font-bold text-lg shadow-lg shadow-primary/20"
              >
                {isCreating ? "Constructing HQ..." : "Forge New Household HQ"}
              </Button>
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-4">Entering an existing base? Logout and use a Battle Code.</p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login">Return to Login</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const activeMissions = chores.filter(c => c.status === 'claimed' && c.assignedToId === activeMember?.id);
  const openMissions = chores.filter(c => c.status === 'pending');
  const choresTodayCount = chores.filter(c => c.status === 'completed' && c.assignedToId === activeMember?.id && isSameDay(new Date(), new Date(c.lastActionAt || 0))).length;

  const stats = [
    { label: "Current XP", value: (activeMember?.points || 0).toLocaleString(), icon: Star, color: "bg-primary" },
    { label: "Active Streak", value: `${activeMember?.streak || 0} Days`, icon: Flame, color: "bg-orange-500" },
    { label: "Victories Today", value: choresTodayCount, icon: Trophy, color: "bg-accent" },
  ];

  const prizeProgress = Math.min((prize.currentXP / (prize.xpGoal || 1000)) * 100, 100);
  const isPrizeUnlocked = prize.currentXP >= (prize.xpGoal || 1000);

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20 transition-colors duration-500">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Warrior HQ</h1>
            <p className="text-muted-foreground">Currently playing as <span className="text-primary font-bold">{activeMember?.name || "Selecting..."}</span></p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="w-full md:w-auto bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Link href="/chores">
                <Target className="w-4 h-4 mr-2" /> Mission Board
              </Link>
            </Button>
          </div>
        </section>

        <section>
          <Card className={`border-2 overflow-hidden transition-all ${isPrizeUnlocked ? 'border-yellow-400 bg-yellow-50 shadow-yellow-100 shadow-xl' : 'border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5'}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center gap-2 text-xl font-headline">
                  <Gift className={`w-6 h-6 ${isPrizeUnlocked ? 'text-yellow-600' : 'text-primary'}`} />
                  Battle Reward: <span className={isPrizeUnlocked ? 'text-yellow-700' : 'text-primary'}>{prize.title}</span>
                </CardTitle>
                <Badge variant={isPrizeUnlocked ? 'default' : 'outline'} className={isPrizeUnlocked ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-white/50'}>
                  {isPrizeUnlocked ? 'UNLOCKED' : `${prize.frequency} Quest`}
                </Badge>
              </div>
              <CardDescription className="flex justify-between text-xs font-bold uppercase mt-1">
                <span>Household Progress</span>
                <span>{prize.currentXP.toLocaleString()} / {(prize.xpGoal || 1000).toLocaleString()} XP</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={prizeProgress} className={`h-3 ${isPrizeUnlocked ? 'bg-yellow-200 [&>div]:bg-yellow-500' : ''}`} />
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                {isPrizeUnlocked ? (
                  <Sparkles className="w-4 h-4 text-yellow-600 animate-pulse" />
                ) : (
                  <Clock className="w-4 h-4 text-accent" />
                )}
                {isPrizeUnlocked ? 'VICTORY! The reward has been earned by the household!' : 'Complete missions to earn this reward for the family!'}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                <Swords className="w-5 h-5 text-primary" /> Your Active Missions
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {activeMissions.length > 0 ? (
                activeMissions.map(chore => (
                  <ChoreCard 
                    key={chore.id} 
                    chore={chore} 
                    activeMemberName={activeMember?.name || ""}
                    onComplete={handleComplete}
                  />
                ))
              ) : (
                <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-border shadow-sm">
                  <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-lg">No Missions Claimed</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-4">You have no active tasks. Claim one from the open board!</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" /> Open Mission Board
              </h2>
              <Link href="/chores" className="text-primary text-sm font-bold flex items-center hover:underline">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {openMissions.length > 0 ? (
                openMissions.slice(0, 3).map(chore => (
                  <ChoreCard 
                    key={chore.id} 
                    chore={chore} 
                    activeMemberName={activeMember?.name || ""}
                    onClaim={handleClaim}
                  />
                ))
              ) : (
                <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-border shadow-sm">
                  <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-lg">Board Is Clear!</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">All current missions have been assigned.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
