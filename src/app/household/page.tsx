
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
  History,
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

const PRE_POPULATED_PRIZES = [
  "Pizza Night",
  "Movie Night",
  "Extra Screen Time (30m)",
  "Choose Dessert",
  "New Toy/Game",
  "Ice Cream Outing",
  "Stay Up Late Pass"
];

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

    let unsubscribeRequests: (() => void) | null = null;

    const hQuery = query(collection(db, "households"), where("members", "array-contains", user.uid));
    const unsubscribeHousehold = onSnapshot(hQuery, (snapshot) => {
      if (!snapshot.empty) {
        const hDoc = snapshot.docs[0];
        const hData = { id: hDoc.id, ...hDoc.data() };
        setHousehold(hData);
        
        if (hData.ownerId === user.uid) {
          const reqQuery = collection(db, "households", hDoc.id, "joinRequests");
          if (unsubscribeRequests) unsubscribeRequests();
          unsubscribeRequests = onSnapshot(reqQuery, (reqSnapshot) => {
            setJoinRequests(reqSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
          });
        }
      }
    });

    const syncState = () => {
      const savedMembers = localStorage.getItem('household_members');
      if (savedMembers) setMembers(JSON.parse(savedMembers));
      const aid = localStorage.getItem('activeMemberId');
      setActiveMemberId(aid);
      
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
      if (unsubscribeRequests) unsubscribeRequests();
      window.removeEventListener('storage', syncState);
    };
  }, [user, db]);

  const activeMember = members.find(m => m.id === activeMemberId);
  const isOwner = household?.ownerId === user?.uid && activeMember?.role === 'Owner';
  const isAdmin = activeMember?.role === 'Admin' || activeMember?.role === 'Owner';

  const handleApprove = async (request: any) => {
    if (!household || !isAdmin) return;
    const hRef = doc(db, "households", household.id);
    await updateDoc(hRef, {
      members: arrayUnion(request.userId)
    });

    const reqRef = doc(db, "households", household.id, "joinRequests", request.userId);
    await deleteDoc(reqRef);
    
    toast({ title: "Warrior Approved!", description: `${request.userName} is now part of the base.` });
  };

  const copyInviteCode = () => {
    if (!household) return;
    navigator.clipboard.writeText(household.inviteCode);
    toast({ title: "Battle Code Copied!", description: "Send this to warriors you want to recruit." });
  };

  const handlePromoteToAdmin = (memberId: string) => {
    if (!isOwner) return;
    const updatedMembers = members.map(m => 
      m.id === memberId ? { ...m, role: 'Admin' } : m
    );
    setMembers(updatedMembers);
    localStorage.setItem('household_members', JSON.stringify(updatedMembers));
    window.dispatchEvent(new Event('storage'));
    toast({ title: "Rank Promoted!", description: "New Admin authorized for base management." });
  };

  const handleDeleteHousehold = async () => {
    if (!isOwner || !household) return;
    setIsDeleting(true);
    const hRef = doc(db, "households", household.id);
    deleteDoc(hRef).then(() => {
      localStorage.clear();
      window.dispatchEvent(new Event('storage'));
      router.push("/login");
      toast({ title: "Base Decommissioned", description: "The household and all associated data have been deleted." });
    }).catch(err => {
      console.error(err);
      toast({ variant: "destructive", title: "Action Denied", description: "Only the Household Guardian can perform this action." });
    }).finally(() => setIsDeleting(false));
  };

  const handleRecruit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('warrior-name') as string;
    const theme = formData.get('warrior-path') as string || 'member-1';

    const newMember = {
      id: `member-${Date.now()}`,
      name: name,
      role: "Warrior",
      avatar: `https://picsum.photos/seed/${name.toLowerCase()}/100/100`,
      type: theme === 'member-2' ? 'Fire Warrior' : theme === 'member-3' ? 'Nature Scout' : theme === 'member-pink' ? 'Heart Healer' : 'Shield Guardian',
      theme: theme,
      points: 0,
      streak: 0,
      achievements: [],
      lastCompletionDate: null
    };

    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    localStorage.setItem('household_members', JSON.stringify(updatedMembers));
    window.dispatchEvent(new Event('storage'));
    setIsAddWarriorOpen(false);
    toast({ title: "New Warrior Recruited!", description: `${name} has joined the roster.` });
  };

  const handleUpdatePrize = () => {
    if (!isAdmin) return;
    const prizeData = { 
      title: prizeTitle, 
      frequency: prizeFrequency, 
      xpGoal: Number(xpGoal), 
      currentXP: currentXP 
    };
    localStorage.setItem('household_prize', JSON.stringify(prizeData));
    window.dispatchEvent(new Event('storage'));
    toast({ title: "Prize Updated!", description: "The battle goal has been refreshed." });
  };

  const simulateNewDay = () => {
    if (!isOwner) return;
    const savedChores = localStorage.getItem('household_chores');
    if (!savedChores) return;
    
    const chores = JSON.parse(savedChores);
    // Move all lastActionAt dates back by 25 hours to ensure reset logic triggers
    const dayAgo = new Date(Date.now() - (25 * 60 * 60 * 1000)).toISOString();
    
    const updatedChores = chores.map((c: any) => {
      if (c.lastActionAt) {
        return { ...c, lastActionAt: dayAgo };
      }
      return c;
    });

    localStorage.setItem('household_chores', JSON.stringify(updatedChores));
    window.dispatchEvent(new Event('storage'));
    toast({ title: "Time Warp Complete!", description: "24 hours have passed in the Battle Station." });
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20 bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold">Base HQ: {household?.name || "Loading..."}</h1>
            <p className="text-muted-foreground">Manage your team and household rewards.</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isAddWarriorOpen} onOpenChange={setIsAddWarriorOpen}>
              <DialogTrigger asChild>
                <Button disabled={!isAdmin} className="bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
                  <Swords className="w-4 h-4 mr-2" /> Recruit Warrior
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleRecruit}>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline">New Warrior Profile</DialogTitle>
                    <DialogDescription>Add a profile to this tablet for your family.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                      <Label htmlFor="warrior-name">Warrior Name</Label>
                      <Input id="warrior-name" name="warrior-name" placeholder="e.g. Captain Cleanup" required />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase">Choose Path</Label>
                      <input type="hidden" name="warrior-path" id="warrior-path-input" value="member-1" />
                      <div className="grid grid-cols-4 gap-2">
                        <Button type="button" variant="outline" onClick={() => (document.getElementById('warrior-path-input') as HTMLInputElement).value = 'member-2'} className="h-16 flex flex-col gap-1 border-2 border-orange-200 bg-orange-50 hover:bg-orange-100"><Zap className="w-4 h-4 text-orange-600" /><span className="text-[10px] font-bold">Fire</span></Button>
                        <Button type="button" variant="outline" onClick={() => (document.getElementById('warrior-path-input') as HTMLInputElement).value = 'member-3'} className="h-16 flex flex-col gap-1 border-2 border-green-200 bg-green-50 hover:bg-green-100"><Leaf className="w-4 h-4 text-green-600" /><span className="text-[10px] font-bold">Nature</span></Button>
                        <Button type="button" variant="outline" onClick={() => (document.getElementById('warrior-path-input') as HTMLInputElement).value = 'member-1'} className="h-16 flex flex-col gap-1 border-2 border-blue-200 bg-blue-50 hover:bg-blue-100"><Shield className="w-4 h-4 text-blue-600" /><span className="text-[10px] font-bold">Shield</span></Button>
                        <Button type="button" variant="outline" onClick={() => (document.getElementById('warrior-path-input') as HTMLInputElement).value = 'member-pink'} className="h-16 flex flex-col gap-1 border-2 border-pink-200 bg-pink-50 hover:bg-pink-100"><Heart className="w-4 h-4 text-pink-600" /><span className="text-[10px] font-bold">Love</span></Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter><Button type="submit" className="w-full bg-primary font-bold">Summon Warrior!</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {joinRequests.length > 0 && isAdmin && (
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" /> Pending Recruits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {joinRequests.map(req => (
                    <div key={req.id} className="flex items-center justify-between bg-white p-3 rounded-xl border">
                      <div className="flex items-center gap-3">
                        <Avatar><AvatarFallback>{req.userName[0]}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-bold">{req.userName}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Requesting Access</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(req)} className="bg-green-600 hover:bg-green-700 h-8"><Check className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-destructive h-8"><X className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="text-xl">Battle Roster</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-lg">{member.name}</p>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">{member.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOwner && member.id !== user?.uid && member.role !== 'Admin' && (
                        <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold" onClick={() => handlePromoteToAdmin(member.id)}>
                          <UserCog className="w-3 h-3 mr-1" /> Make Admin
                        </Button>
                      )}
                      <Badge className={member.role === 'Owner' ? 'bg-primary' : member.role === 'Admin' ? 'bg-accent' : 'bg-muted text-muted-foreground'}>
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-accent/5 border-b">
                <CardTitle className="text-xl flex items-center gap-2"><Trophy className="w-5 h-5 text-accent" /> Prize Command Center</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold">Reward Type</Label>
                    <Select value={prizeTitle} onValueChange={setPrizeTitle} disabled={!isAdmin}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{PRE_POPULATED_PRIZES.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Cycle</Label>
                    <Select value={prizeFrequency} onValueChange={setPrizeFrequency} disabled={!isAdmin}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Daily">Daily Reward</SelectItem><SelectItem value="Weekly">Weekly Grand Prize</SelectItem><SelectItem value="Monthly">Monthly Mega Reward</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2"><Target className="w-3 h-3" /> XP Goal to Unlock</Label>
                    <Input 
                      type="number" 
                      value={xpGoal} 
                      onChange={(e) => setXpGoal(Number(e.target.value))} 
                      disabled={!isAdmin}
                      placeholder="e.g. 1000"
                    />
                    <p className="text-[10px] text-muted-foreground italic">Household currently at {currentXP} XP / {xpGoal} XP</p>
                  </div>
                </div>
                {!isAdmin && (
                  <p className="text-[10px] text-muted-foreground italic text-center p-2 bg-muted/20 rounded-lg">
                    Active warrior ({activeMember?.name}) is a Warrior. Only Guardians or Admins can forge new prizes.
                  </p>
                )}
                <Button onClick={handleUpdatePrize} disabled={!isAdmin} className="w-full bg-accent hover:bg-accent/90 font-bold">Update Prize Quest</Button>
              </CardContent>
            </Card>

            {isOwner && (
              <div className="pt-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="w-full font-bold border-primary text-primary hover:bg-primary/5">
                    <Link href="/thanks">
                      <Sparkles className="w-4 h-4 mr-2 text-yellow-500" /> Support the Developer
                    </Link>
                  </Button>
                  
                  <Button variant="outline" onClick={simulateNewDay} className="w-full font-bold border-orange-500 text-orange-600 hover:bg-orange-50">
                    <Clock className="w-4 h-4 mr-2" /> Simulate New Day (Debug)
                  </Button>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full font-bold shadow-lg shadow-destructive/20"><Trash2 className="w-4 h-4 mr-2" /> Decommission Household Base</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Total Data Wipe Requested</AlertDialogTitle>
                      <AlertDialogDescription>All warrior rosters, achievements, XP, and history will be permanently deleted. This action is final and can only be performed by the primary Household Guardian (Owner).</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Base</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteHousehold} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                        {isDeleting ? "Wiping Base..." : "Destroy Base"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-white border-none shadow-sm">
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-lg">Recruit Warriors</CardTitle>
                <CardDescription>Share this code to add more devices.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Base Secret Code</Label>
                  <div className="flex gap-2">
                    <Input value={household?.inviteCode || "..."} readOnly className="bg-muted/20 text-center font-mono tracking-widest" />
                    <Button variant="outline" size="icon" onClick={copyInviteCode}><Copy className="w-4 h-4" /></Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">New warriors must enter this code at login.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
