
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, UserPlus, Copy, LogOut, Settings, Swords, Zap, Leaf, Heart, Trophy, Gift, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, query, where, getDocs, doc, setDoc, updateDoc, arrayUnion, onSnapshot, deleteDoc } from "firebase/firestore";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

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
  const [members, setMembers] = useState<any[]>([]);
  const [household, setHousehold] = useState<any>(null);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [prizeTitle, setPrizeTitle] = useState("Pizza Night");
  const [prizeFrequency, setPrizeFrequency] = useState("Weekly");
  const [isAddWarriorOpen, setIsAddWarriorOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch household data
    const q = query(collection(db, "households"), where("members", "array-contains", user.uid));
    const unsubscribeHousehold = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const hDoc = snapshot.docs[0];
        setHousehold({ id: hDoc.id, ...hDoc.data() });
        
        // Fetch join requests if owner
        if (hDoc.data().ownerId === user.uid) {
          const reqQuery = collection(db, "households", hDoc.id, "joinRequests");
          onSnapshot(reqQuery, (reqSnapshot) => {
            setJoinRequests(reqSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
          });
        }
      }
    });

    const savedMembers = localStorage.getItem('household_members');
    if (savedMembers) setMembers(JSON.parse(savedMembers));

    const savedPrize = localStorage.getItem('household_prize');
    if (savedPrize) {
      const parsed = JSON.parse(savedPrize);
      setPrizeTitle(parsed.title);
      setPrizeFrequency(parsed.frequency);
    }

    return () => unsubscribeHousehold();
  }, [user, db]);

  const copyInviteCode = () => {
    if (!household) return;
    navigator.clipboard.writeText(household.inviteCode);
    toast({ title: "Battle Code Copied!", description: "Send this to warriors you want to recruit." });
  };

  const handleApprove = async (request: any) => {
    if (!household) return;
    try {
      // Add to household members
      await updateDoc(doc(db, "households", household.id), {
        members: arrayUnion(request.userId)
      });
      // Delete request
      await deleteDoc(doc(db, "households", household.id, "joinRequests", request.userId));
      toast({ title: "Warrior Approved!", description: `${request.userName} is now part of the base.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Approval Failed", description: e.message });
    }
  };

  const handleRecruit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('warrior-name') as string;
    const theme = formData.get('warrior-path') as string || 'member-1';

    const newMember = {
      id: `member-${Date.now()}`,
      name: name,
      role: "Warrior",
      avatar: `https://picsum.photos/seed/${name.toLowerCase()}/100/100`,
      type: theme === 'member-2' ? 'Fire Warrior' : theme === 'member-3' ? 'Nature Scout' : 'Shield Guardian',
      theme: theme
    };

    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    localStorage.setItem('household_members', JSON.stringify(updatedMembers));
    window.dispatchEvent(new Event('storage'));
    setIsAddWarriorOpen(false);
    toast({ title: "New Warrior Recruited!", description: `${name} has joined the battle station!` });
  };

  const handleUpdatePrize = () => {
    const prizeData = { title: prizeTitle, frequency: prizeFrequency };
    localStorage.setItem('household_prize', JSON.stringify(prizeData));
    window.dispatchEvent(new Event('storage'));
    toast({ title: "Prize Updated!", description: `Goal updated for the household.` });
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20 bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold">Base HQ: {household?.name || "The Avengers"}</h1>
            <p className="text-muted-foreground">Manage your team and set battle rewards.</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isAddWarriorOpen} onOpenChange={setIsAddWarriorOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
                  <Swords className="w-4 h-4 mr-2" /> Recruit Warrior
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleRecruit}>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline">New Warrior Profile</DialogTitle>
                    <DialogDescription>Add a profile to this tablet for quick switching.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                      <Label htmlFor="warrior-name">Warrior Name</Label>
                      <Input id="warrior-name" name="warrior-name" placeholder="e.g. Captain Cleanup" required className="bg-muted/50" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase">Choose Path</Label>
                      <input type="hidden" name="warrior-path" id="warrior-path-input" value="member-1" />
                      <div className="grid grid-cols-4 gap-2">
                        <Button type="button" variant="outline" onClick={() => (document.getElementById('warrior-path-input') as HTMLInputElement).value = 'member-2'} className="h-16 flex flex-col gap-1 border-2 border-orange-200 bg-orange-50 hover:bg-orange-100"><Zap className="w-4 h-4 text-orange-600" /><span className="text-[10px] font-bold">Fire</span></Button>
                        <Button type="button" variant="outline" onClick={() => (document.getElementById('warrior-path-input') as HTMLInputElement).value = 'member-3'} className="h-16 flex flex-col gap-1 border-2 border-green-200 bg-green-50 hover:bg-green-100"><Leaf className="w-4 h-4 text-green-600" /><span className="text-[10px] font-bold">Nature</span></Button>
                        <Button type="button" variant="outline" onClick={() => (document.getElementById('warrior-path-input') as HTMLInputElement).value = 'member-1'} className="h-16 flex flex-col gap-1 border-2 border-blue-200 bg-blue-50 hover:bg-blue-100"><Shield className="w-4 h-4 text-blue-600" /><span className="text-[10px] font-bold">Shield</span></Button>
                        <Button type="button" variant="outline" onClick={() => (document.getElementById('warrior-path-input') as HTMLInputElement).value = 'member-1'} className="h-16 flex flex-col gap-1 border-2 border-pink-200 bg-pink-50 hover:bg-pink-100"><Heart className="w-4 h-4 text-pink-600" /><span className="text-[10px] font-bold">Love</span></Button>
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
            {joinRequests.length > 0 && (
              <Card className="border-2 border-primary/20 bg-primary/5 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" /> Incoming Recruits
                  </CardTitle>
                  <CardDescription>New warriors are requesting to join your household base.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {joinRequests.map(req => (
                    <div key={req.id} className="flex items-center justify-between bg-white p-3 rounded-xl border">
                      <div className="flex items-center gap-3">
                        <Avatar><AvatarFallback>{req.userName[0]}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-bold">{req.userName}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Waiting for access</p>
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
                <CardDescription>Members sharing this Household base.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-lg">{member.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 uppercase font-bold tracking-tighter">
                          {member.type}
                        </p>
                      </div>
                    </div>
                    <Badge className={member.role === 'Owner' ? 'bg-primary' : 'bg-muted text-muted-foreground'}>{member.role}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-accent/5 border-b">
                <div className="flex items-center gap-2"><Trophy className="w-5 h-5 text-accent" /><CardTitle className="text-xl">Prize Command Center</CardTitle></div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold">Prize Frequency</Label>
                    <Select value={prizeFrequency} onValueChange={setPrizeFrequency}>
                      <SelectTrigger className="bg-muted/30"><SelectValue placeholder="Select Frequency" /></SelectTrigger>
                      <SelectContent><SelectItem value="Daily">Daily Reward</SelectItem><SelectItem value="Weekly">Weekly Grand Prize</SelectItem><SelectItem value="Monthly">Monthly Mega Reward</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Select Reward Type</Label>
                    <Select value={prizeTitle} onValueChange={setPrizeTitle}>
                      <SelectTrigger className="bg-muted/30"><SelectValue placeholder="Select Reward" /></SelectTrigger>
                      <SelectContent>{PRE_POPULATED_PRIZES.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Custom Reward</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Custom prize..." value={prizeTitle} onChange={(e) => setPrizeTitle(e.target.value)} className="bg-muted/30" />
                    <Button onClick={handleUpdatePrize} className="bg-accent hover:bg-accent/90 font-bold">Update Prize</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="text-lg">Invite Warriors</CardTitle>
                <CardDescription>Share your battle code with other devices.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Household Secret Code</Label>
                  <div className="flex gap-2">
                    <Input value={household?.inviteCode || "GENERATING..."} readOnly className="bg-muted/20 font-mono tracking-widest text-center" />
                    <Button variant="outline" size="icon" onClick={copyInviteCode}><Copy className="w-4 h-4" /></Button>
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground mt-2">New warriors must enter this code at login.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
