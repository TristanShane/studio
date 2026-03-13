"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  UserPlus, 
  Copy, 
  Swords, 
  Zap, 
  Leaf, 
  Heart, 
  Trophy, 
  Target,
  Check, 
  X, 
  Trash2, 
  UserCog,
  Sparkles,
  Clock
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { 
  collection, 
  query, 
  where, 
  doc, 
  updateDoc, 
  arrayUnion, 
  onSnapshot, 
  deleteDoc
} from "firebase/firestore";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PRE_POPULATED_PRIZES = ["Pizza Night", "Movie Night", "Extra Screen Time (30m)", "Choose Dessert", "New Toy/Game", "Ice Cream Outing", "Stay Up Late Pass"];

export default function HouseholdPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [household, setHousehold] = useState<any>(null);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [prizeTitle, setPrizeTitle] = useState("Pizza Night");
  const [prizeFrequency, setPrizeFrequency] = useState("Weekly");
  const [xpGoal, setXpGoal] = useState(1000);
  const [currentXP, setCurrentXP] = useState(0);
  const [isAddWarriorOpen, setIsAddWarriorOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const hQuery = query(collection(db, "households"), where("members", "array-contains", user.uid));
    const unsubscribeHousehold = onSnapshot(hQuery, (snapshot) => {
      if (!snapshot.empty) {
        const hDoc = snapshot.docs[0];
        setHousehold({ id: hDoc.id, ...hDoc.data() });
      }
    });

    const syncState = () => {
      const savedMembers = localStorage.getItem('household_members');
      if (savedMembers) setMembers(JSON.parse(savedMembers));
      setActiveMemberId(localStorage.getItem('activeMemberId'));
      
      const savedPrize = localStorage.getItem('household_prize');
      if (savedPrize) {
        const parsed = JSON.parse(savedPrize);
        setPrizeTitle(parsed.title);
        setPrizeFrequency(parsed.frequency);
        setXpGoal(parsed.xpGoal || 1000);
        setCurrentXP(parsed.currentXP || 0);
      }
    };

    syncState();
    window.addEventListener('storage', syncState);
    return () => {
      unsubscribeHousehold();
      window.removeEventListener('storage', syncState);
    };
  }, [user, db]);

  const activeMember = members.find(m => m.id === activeMemberId);
  const isOwner = household?.ownerId === user?.uid && activeMember?.role === 'Owner';
  const isAdmin = activeMember?.role === 'Admin' || activeMember?.role === 'Owner';

  const handleApprove = async (request: any) => {
    if (!household || !isAdmin) return;
    await updateDoc(doc(db, "households", household.id), { members: arrayUnion(request.userId) });
    await deleteDoc(doc(db, "households", household.id, "joinRequests", request.userId));
    toast({ title: "Warrior Approved!", description: `${request.userName} is now part of the base.` });
  };

  const copyInviteCode = () => {
    if (!household) return;
    navigator.clipboard.writeText(household.inviteCode);
    toast({ title: "Battle Code Copied!", description: "Send this to warriors you want to recruit." });
  };

  const handlePromoteToAdmin = (memberId: string) => {
    if (!isOwner) return;
    const updated = members.map(m => m.id === memberId ? { ...m, role: 'Admin' } : m);
    setMembers(updated);
    localStorage.setItem('household_members', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteHousehold = async () => {
    if (!isOwner || !household) return;
    setIsDeleting(true);
    deleteDoc(doc(db, "households", household.id)).then(() => {
      localStorage.clear();
      router.push("/login");
      toast({ title: "Base Decommissioned" });
    }).finally(() => setIsDeleting(false));
  };

  const handleRecruit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('warrior-name') as string;
    const theme = formData.get('warrior-path') as string || 'member-1';
    const newMember = {
      id: `member-${Date.now()}`,
      name,
      role: "Warrior",
      avatar: `https://picsum.photos/seed/${name.toLowerCase()}/100/100`,
      type: 'Shield Guardian',
      theme,
      points: 0,
      streak: 0,
      achievements: [],
      lastCompletionDate: null,
      history: []
    };
    const updated = [...members, newMember];
    setMembers(updated);
    localStorage.setItem('household_members', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setIsAddWarriorOpen(false);
  };

  const handleUpdatePrize = () => {
    const prizeData = { title: prizeTitle, frequency: prizeFrequency, xpGoal: Number(xpGoal), currentXP, lastResetAt: new Date().toISOString() };
    localStorage.setItem('household_prize', JSON.stringify(prizeData));
    window.dispatchEvent(new Event('storage'));
    toast({ title: "Prize Quest Updated!" });
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20 bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div><h1 className="text-3xl font-headline font-bold">Base HQ: {household?.name}</h1><p className="text-muted-foreground">Manage your team and household rewards.</p></div>
          <Dialog open={isAddWarriorOpen} onOpenChange={setIsAddWarriorOpen}>
            <DialogTrigger asChild><Button disabled={!isAdmin} className="bg-primary shadow-lg"><Swords className="w-4 h-4 mr-2" /> Recruit Warrior</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleRecruit}>
                <DialogHeader><DialogTitle>New Warrior Profile</DialogTitle></DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="grid gap-2"><Label>Warrior Name</Label><Input name="warrior-name" required /></div>
                  <div className="grid gap-2"><Label className="text-xs font-bold uppercase">Path</Label><input type="hidden" name="warrior-path" id="p-in" value="member-1" /><div className="grid grid-cols-4 gap-2">
                    <Button type="button" variant="outline" onClick={() => (document.getElementById('p-in') as any).value = 'member-2'} className="h-16 flex flex-col border-orange-200 bg-orange-50"><Zap className="w-4 h-4 text-orange-600" /></Button>
                    <Button type="button" variant="outline" onClick={() => (document.getElementById('p-in') as any).value = 'member-3'} className="h-16 flex flex-col border-green-200 bg-green-50"><Leaf className="w-4 h-4 text-green-600" /></Button>
                    <Button type="button" variant="outline" onClick={() => (document.getElementById('p-in') as any).value = 'member-1'} className="h-16 flex flex-col border-blue-200 bg-blue-50"><Shield className="w-4 h-4 text-blue-600" /></Button>
                    <Button type="button" variant="outline" onClick={() => (document.getElementById('p-in') as any).value = 'member-pink'} className="h-16 flex flex-col border-pink-200 bg-pink-50"><Heart className="w-4 h-4 text-pink-600" /></Button>
                  </div></div>
                </div>
                <DialogFooter><Button type="submit" className="w-full">Summon Warrior!</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white"><CardHeader><CardTitle>Battle Roster</CardTitle></CardHeader><CardContent className="p-0">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between p-4 border-b last:border-0">
                  <div className="flex items-center gap-4"><Avatar><AvatarImage src={m.avatar} /><AvatarFallback>{m.name[0]}</AvatarFallback></Avatar><div><p className="font-bold">{m.name}</p><p className="text-[10px] text-muted-foreground font-bold">{m.role}</p></div></div>
                  {isOwner && m.id !== user?.uid && m.role !== 'Admin' && <Button variant="outline" size="sm" onClick={() => handlePromoteToAdmin(m.id)}>Make Admin</Button>}
                </div>
              ))}
            </CardContent></Card>

            <Card className="bg-white"><CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5" /> Prize Command Center</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Reward Type</Label><Select value={prizeTitle} onValueChange={setPrizeTitle} disabled={!isAdmin}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRE_POPULATED_PRIZES.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Cycle</Label><Select value={prizeFrequency} onValueChange={setPrizeFrequency} disabled={!isAdmin}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Daily">Daily</SelectItem><SelectItem value="Weekly">Weekly</SelectItem><SelectItem value="Monthly">Monthly</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>XP Goal</Label><Input type="number" value={xpGoal} onChange={(e) => setXpGoal(Number(e.target.value))} disabled={!isAdmin} /></div>
                </div>
                <Button onClick={handleUpdatePrize} disabled={!isAdmin} className="w-full bg-accent hover:bg-accent/90">Update Prize Quest</Button>
              </CardContent>
            </Card>

            {isOwner && (
              <div className="pt-8 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Button asChild variant="outline" className="border-primary text-primary w-full"><Link href="/thanks"><Sparkles className="w-4 h-4 mr-2" /> Support Tristan</Link></Button>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="destructive" className="w-full font-bold shadow-lg"><Trash2 className="w-4 h-4 mr-2" /> Decommission Household Base</Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Total Data Wipe Requested</AlertDialogTitle><AlertDialogDescription>This action is final and can only be performed by the Household Guardian.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Keep Base</AlertDialogCancel><AlertDialogAction onClick={handleDeleteHousehold} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>Destroy Base</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
          <Card className="bg-white h-fit"><CardHeader><CardTitle>Invite Warriors</CardTitle></CardHeader><CardContent className="space-y-4">
            <Label className="text-xs font-bold uppercase">Secret Code</Label>
            <div className="flex gap-2"><Input value={household?.inviteCode || "..."} readOnly className="font-mono bg-muted/20" /><Button variant="outline" size="icon" onClick={copyInviteCode}><Copy className="w-4 h-4" /></Button></div>
          </CardContent></Card>
        </div>
      </main>
    </div>
  );
}
