
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ChoreCard, Chore } from "@/components/chores/ChoreCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Users, Calendar, Target, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const INITIAL_CHORES: Chore[] = [
  { id: "1", title: "Wash Dishes", description: "Empty the dishwasher and fill with dirty dishes.", points: 30, dueDate: "Today", status: 'pending', frequency: 'daily' },
  { id: "2", title: "Mop Floors", description: "Mop the kitchen and hallway floors.", points: 100, dueDate: "Saturday", status: 'pending', frequency: 'weekly' },
  { id: "3", title: "Take Out Trash", description: "Empty all trash cans and take them to the curb.", points: 40, dueDate: "Wednesday", status: 'claimed', assignedTo: "Sam", frequency: 'weekly' },
  { id: "4", title: "Laundry", description: "Wash, dry, and fold two loads of laundry.", points: 120, dueDate: "Tomorrow", status: 'claimed', assignedTo: "Jordan", frequency: 'weekly' },
  { id: "5", title: "Water Plants", description: "Water all indoor plants and the garden.", points: 20, dueDate: "Daily", status: 'completed', assignedTo: "Alex (Admin)", frequency: 'daily' },
];

export default function ChoresPage() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [activeMemberName, setActiveMemberName] = useState("Alex (Admin)");
  const [activeMemberId, setActiveMemberId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isNewChoreOpen, setIsNewChoreOpen] = useState(false);

  useEffect(() => {
    const updateFromStorage = () => {
      const savedChores = localStorage.getItem('household_chores');
      if (savedChores) {
        setChores(JSON.parse(savedChores));
      } else {
        localStorage.setItem('household_chores', JSON.stringify(INITIAL_CHORES));
        setChores(INITIAL_CHORES);
      }

      const savedMembers = localStorage.getItem('household_members');
      const savedId = localStorage.getItem('activeMemberId');
      if (savedMembers && savedId) {
        const members = JSON.parse(savedMembers);
        const active = members.find((m: any) => m.id === savedId);
        if (active) {
          setActiveMemberName(active.name);
          setActiveMemberId(active.id);
          setIsAdmin(active.role?.toLowerCase() === 'admin' || active.role?.toLowerCase() === 'owner');
        }
      }
    };

    updateFromStorage();
    window.addEventListener('storage', updateFromStorage);
    return () => window.removeEventListener('storage', updateFromStorage);
  }, []);

  const handleClaim = (id: string) => {
    const updated = chores.map(c => 
      c.id === id ? { ...c, status: 'claimed' as const, assignedTo: activeMemberName } : c
    );
    saveChores(updated);
    toast({
      title: "Chore Claimed!",
      description: `You've joined the battle for this mission.`,
    });
  };

  const handleComplete = (id: string) => {
    const updated = chores.map(c => c.id === id ? { ...c, status: 'completed' as const } : c);
    saveChores(updated);
    toast({
      title: "Victory Recorded!",
      description: "Mission complete! Check the Victory Log.",
    });
  };

  const handleRevoke = (id: string) => {
    const updated = chores.map(c => 
      c.id === id ? { ...c, status: 'pending' as const, assignedTo: undefined } : c
    );
    saveChores(updated);
    toast({
      variant: "destructive",
      title: "Mission Revoked",
      description: "The chore has been returned to the board for review.",
    });
  };

  const saveChores = (updated: Chore[]) => {
    setChores(updated);
    localStorage.setItem('household_chores', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddChore = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newChore: Chore = {
      id: `chore-${Date.now()}`,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      points: Number(formData.get('points')),
      dueDate: formData.get('dueDate') as string,
      frequency: formData.get('frequency') as any || 'one-time',
      status: 'pending'
    };

    const updated = [...chores, newChore];
    saveChores(updated);
    setIsNewChoreOpen(false);
    toast({
      title: "New Mission Forged!",
      description: "It's live on the Mission Board.",
    });
  };

  const filteredChores = chores.filter(c => {
    if (activeTab === "pending") return c.status === 'pending';
    if (activeTab === "my-chores") return c.assignedTo === activeMemberName && c.status === 'claimed';
    if (activeTab === "completed") return c.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Mission Board</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Users className="w-3 h-3" />
              Battle Station: <span className="text-primary font-bold">{activeMemberName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Find missions..." className="pl-10 bg-white" />
            </div>
            {isAdmin && (
              <Dialog open={isNewChoreOpen} onOpenChange={setIsNewChoreOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> Forge Mission
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <form onSubmit={handleAddChore}>
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-headline">Forge New Mission</DialogTitle>
                      <DialogDescription>
                        Set the points and deadline for this household task.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Mission Name</Label>
                        <Input id="title" name="title" placeholder="e.g. Empty the Battle Bin" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Mission Intel</Label>
                        <Textarea id="description" name="description" placeholder="Requirements for victory..." required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="points">XP Value</Label>
                          <Input id="points" name="points" type="number" defaultValue="50" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="frequency">Cycle</Label>
                          <Select name="frequency" defaultValue="daily">
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="one-time">One-time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">Expires On (e.g. "Friday Night")</Label>
                        <Input id="dueDate" name="dueDate" placeholder="Today, Tomorrow, Saturday..." required />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full">Release to Board</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </section>

        <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 md:w-auto mb-8 bg-white border">
            <TabsTrigger value="pending">Open Board</TabsTrigger>
            <TabsTrigger value="my-chores">My Missions</TabsTrigger>
            <TabsTrigger value="completed">Victory Log</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredChores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChores.map((chore) => (
                  <ChoreCard 
                    key={chore.id} 
                    chore={chore} 
                    activeMemberName={activeMemberName}
                    onClaim={handleClaim}
                    onComplete={handleComplete}
                    onRevoke={handleRevoke}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-1">Board is Clear!</h3>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                  {activeTab === 'pending' ? 'All missions have been claimed or finished.' : 
                   activeTab === 'my-chores' ? 'You have no active missions. Claim one from the board!' :
                   'No victories have been recorded yet.'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
