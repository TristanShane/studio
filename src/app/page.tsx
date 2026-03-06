
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChoreCard, Chore } from "@/components/chores/ChoreCard";
import { Flame, Star, Trophy, Target, Users, ChevronRight, Gift, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [chores, setChores] = useState<Chore[]>([]);
  const [activeMember, setActiveMember] = useState<any>(null);
  const [prize, setPrize] = useState({ title: "Pizza Night", frequency: "Weekly" });
  const [hasHousehold, setHasHousehold] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!user) return;

    const checkHousehold = async () => {
      const q = query(collection(db, "households"), where("members", "array-contains", user.uid));
      const snapshot = await getDocs(q);
      setHasHousehold(!snapshot.empty);
    };

    checkHousehold();

    const updateFromStorage = () => {
      const savedChores = localStorage.getItem('household_chores');
      if (savedChores) setChores(JSON.parse(savedChores));

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
    return () => window.removeEventListener('storage', updateFromStorage);
  }, [user, db]);

  const handleCreateHousehold = async () => {
    if (!user) return;
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await addDoc(collection(db, "households"), {
      name: `${user.displayName}'s Base`,
      ownerId: user.uid,
      inviteCode,
      members: [user.uid],
      createdAt: serverTimestamp()
    });
    setHasHousehold(true);
  };

  const handleComplete = (id: string) => {
    const chore = chores.find(c => c.id === id);
    if (!chore || !activeMember) return;

    const updated = chores.map(c => c.id === id ? { ...c, status: 'completed' as const } : c);
    localStorage.setItem('household_chores', JSON.stringify(updated));

    const savedMembers = localStorage.getItem('household_members');
    if (savedMembers) {
      const members = JSON.parse(savedMembers);
      const updatedMembers = members.map((m: any) => {
        if (m.id === activeMember.id) {
          return {
            ...m,
            points: (m.points || 0) + chore.points,
            streak: (m.streak || 0) + 1
          };
        }
        return m;
      });
      localStorage.setItem('household_members', JSON.stringify(updatedMembers));
    }

    window.dispatchEvent(new Event('storage'));
  };

  if (isUserLoading || hasHousehold === null) {
    return <div className="min-h-screen flex items-center justify-center font-bold">Scanning Battle Status...</div>;
  }

  if (!hasHousehold) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-6">
          <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold">Base Not Found</h1>
            <p className="text-muted-foreground">You are not part of a household yet. Would you like to build your own battle station?</p>
          </div>
          <Button onClick={handleCreateHousehold} size="lg" className="w-full bg-primary font-bold">
            Forge New Household HQ
          </Button>
        </div>
      </div>
    );
  }

  const activeMissions = chores.filter(c => c.status === 'claimed' && c.assignedToId === activeMember?.id);
  const choresTodayCount = chores.filter(c => c.status === 'completed' && c.assignedToId === activeMember?.id).length;

  const stats = [
    { label: "Current XP", value: (activeMember?.points || 0).toLocaleString(), icon: Star, color: "bg-primary" },
    { label: "Active Streak", value: `${activeMember?.streak || 0} Days`, icon: Flame, color: "bg-orange-500" },
    { label: "Victories Today", value: choresTodayCount, icon: Trophy, color: "bg-accent" },
  ];

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

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-headline font-bold">Your Active Missions</h2>
            <Link href="/chores" className="text-primary text-sm font-bold flex items-center hover:underline">
              View Board <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-border shadow-sm">
                <p className="text-muted-foreground">You haven't claimed any missions yet. Defend your home!</p>
                <Button variant="link" asChild>
                  <Link href="/chores">Open Mission Board</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-headline font-bold">Household Activity</h3>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-6">
              {chores.filter(c => c.status === 'completed').reverse().slice(0, 3).map((chore) => (
                <div key={chore.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      <span className="font-bold">{chore.assignedTo}</span> completed <span className="text-primary font-bold">{chore.title}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Just now • +{chore.points} XP earned</p>
                  </div>
                </div>
              ))}
              {chores.filter(c => c.status === 'completed').length === 0 && (
                <p className="text-center py-8 text-sm text-muted-foreground italic">No victories reported today... yet.</p>
              )}
            </div>
          </section>

          <section className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex flex-col justify-center shadow-inner">
            <div className="text-center space-y-2">
              <div className="relative inline-block">
                <Gift className="w-12 h-12 text-primary mx-auto mb-2" />
                <Badge className="absolute -top-1 -right-4 bg-accent text-white border-none text-[10px] uppercase font-bold">{prize.frequency}</Badge>
              </div>
              <h3 className="text-xl font-headline font-bold">Battle Treasure: {prize.title}</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">The top warrior of the {prize.frequency.toLowerCase()} battle claims this reward!</p>
              <div className="pt-4 flex justify-center gap-2">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 h-8 text-xs font-bold" asChild>
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
