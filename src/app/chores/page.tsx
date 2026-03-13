"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar, AppNotification } from "@/components/layout/Navbar";
import { ChoreCard, Chore } from "@/components/chores/ChoreCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Users, Target, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { isSameDay, isSameWeek, isSameMonth } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const MISSION_TEMPLATES = [
  { title: "Wash Dishes", description: "Empty dishwasher and fill with new dishes.", points: 30, frequency: "daily", dueDate: "Tonight" },
  { title: "Make Bed", description: "Straighten sheets and arrange pillows.", points: 10, frequency: "daily", dueDate: "Morning" },
  { title: "Wipe Counters", description: "Clean kitchen and dining surfaces.", points: 20, frequency: "daily", dueDate: "Evening" },
  { title: "Take Out Trash", description: "Collect all trash and take to the bin.", points: 50, frequency: "weekly", dueDate: "Wednesday" },
  { title: "Vacuum Room", description: "Vacuum the entire floor area.", points: 100, frequency: "weekly", dueDate: "Weekend" },
  { title: "Mow Lawn", description: "Trim the grass in front and back yards.", points: 300, frequency: "monthly", dueDate: "Next Saturday" },
  { title: "Clean Windows", description: "Wash all main floor windows.", points: 250, frequency: "monthly", dueDate: "End of Month" },
];

export default function ChoresPage() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [activeMemberId, setActiveMemberId] = useState("");
  const [activeMemberName, setActiveMemberName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isNewChoreOpen, setIsNewChoreOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const updateFromStorage = useCallback(() => {
    const savedChores = localStorage.getItem('household_chores');
    const parsedChores: Chore[] = savedChores ? JSON.parse(savedChores) : [];
    
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
      if (active) {
        setActiveMemberId(active.id);
        setActiveMemberName(active.name);
        setIsAdmin(active.role === 'Admin' || active.role === 'Owner');
      }
    }
  }, []);

  useEffect(() => {
    updateFromStorage();
    window.addEventListener('storage', updateFromStorage);
    return () => window.removeEventListener('storage', updateFromStorage);
  }, [updateFromStorage]);

  const syncAndResetRecurringChores = (currentChores: Chore[]) => {
    const now = new Date();
    let hasChanges = false;

    const updated = currentChores.map(chore => {
      if (chore.status === 'pending') return chore;
      if (!chore.lastActionAt) return chore;

      const lastDate = new Date(chore.lastActionAt);
      let shouldReset = false;

      if (chore.frequency === 'daily') shouldReset = !isSameDay(now, lastDate);
      else if (chore.frequency === 'weekly') shouldReset = !isSameWeek(now, lastDate, { weekStartsOn: 1 });
      else if (chore.frequency === 'monthly') shouldReset = !isSameMonth(now, lastDate);

      if (shouldReset) {
        hasChanges = true;
        return { ...chore, status: 'pending' as const, assignedTo: undefined, assignedToId: undefined, lastActionAt: undefined };
      }
      return chore;
    });

    const savedPrize = localStorage.getItem('household_prize');
    if (savedPrize) {
      const p = JSON.parse(savedPrize);
      const lastReset = p.lastResetAt ? new Date(p.lastResetAt) : new Date(0);
      let prizeCycleReset = false;

      if (p.frequency === 'Daily') prizeCycleReset = !isSameDay(now, lastReset);
      if (p.frequency === 'Weekly') prizeCycleReset = !isSameWeek(now, lastReset, { weekStartsOn: 1 });
      if (p.frequency === 'Monthly') prizeCycleReset = !isSameMonth(now, lastReset);

      if (prizeCycleReset) {
        const updatedPrize = { ...p, currentXP: 0, lastResetAt: now.toISOString() };
        localStorage.setItem('household_prize', JSON.stringify(updatedPrize));
        
        const savedMembers = localStorage.getItem('household_members');
        if (savedMembers) {
          const members = JSON.parse(savedMembers);
          const resetMembers = members.map((m: any) => ({ ...m, points: 0 }));
          localStorage.setItem('household_members', JSON.stringify(resetMembers));
        }
        hasChanges = true;
      }
    }

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

  const addToHistory = (chore: Chore) => {
    const savedHistory = localStorage.getItem('household_history');
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    const entry = {
      id: `history-${Date.now()}`,
      title: chore.title,
      points: chore.points,
      userId: activeMemberId,
      userName: activeMemberName,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('household_history', JSON.stringify([...history, entry]));
  };

  const updateMemberStats = (memberId: string, pointDelta: number, isRevoke: boolean = false) => {
    const savedMembers = localStorage.getItem('household_members');
    if (!savedMembers) return;
    
    const members = JSON.parse(savedMembers);
    const today = new Date().toISOString().split('T')[0];

    const updatedMembers = members.map((m: any) => {
      if (m.id === memberId) {
        let newStreak = m.streak || 0;
        let lastDate = m.lastCompletionDate;

        if (!isRevoke) {
          if (m.lastCompletionDate !== today) {
            newStreak += 1;
            lastDate = today;
          }
        } else {
          newStreak = Math.max(0, newStreak - 1);
        }
        
        const newPoints = (m.points || 0) + pointDelta;
        return { ...m, points: newPoints, streak: newStreak, lastCompletionDate: lastDate };
      }
      return m;
    });
    
    localStorage.setItem('household_members', JSON.stringify(updatedMembers));
    updateFromStorage();
    window.dispatchEvent(new Event('storage'));
  };

  const updatePrizeXP = (delta: number) => {
    const savedPrize = localStorage.getItem('household_prize');
    if (savedPrize) {
      const p = JSON.parse(savedPrize);
      const updatedPrize = { ...p, currentXP: Math.max(0, (p.currentXP || 0) + delta) };
      localStorage.setItem('household_prize', JSON.stringify(updatedPrize));
      updateFromStorage();
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleClaim = (id: string) => {
    const chore = chores.find(c => c.id === id);
    const updated = chores.map(c => 
      c.id === id ? { 
        ...c, 
        status: 'claimed' as const, 
        assignedTo: activeMemberName, 
        assignedToId: activeMemberId,
        lastActionAt: new Date().toISOString()
      } : c
    );
    saveChores(updated);
    addNotification(`${activeMemberName} has joined the battle for: ${chore?.title}`, 'claim');
    toast({ title: "Chore Claimed!", description: `You've joined the battle for this mission.` });
  };

  const handleComplete = (id: string) => {
    const chore = chores.find(c => c.id === id);
    if (!chore) return;

    const updated = chores.map(c => c.id === id ? { 
      ...c, 
      status: 'completed' as const,
      lastActionAt: new Date().toISOString()
    } : c);
    
    addToHistory(chore);
    saveChores(updated);
    updateMemberStats(activeMemberId, chore.points);
    updatePrizeXP(chore.points);
    addNotification(`${activeMemberName} completed the mission: ${chore.title}! (+${chore.points} XP)`, 'completion');
    toast({ title: "Victory Recorded!", description: `+${chore.points} XP earned!` });
  };

  const handleRevoke = (id: string) => {
    const chore = chores.find(c => c.id === id);
    if (!chore) return;

    const updated = chores.map(c => 
      c.id === id ? { ...c, status: 'pending' as const, assignedTo: undefined, assignedToId: undefined, lastActionAt: undefined } : c
    );
    saveChores(updated);
    
    const savedHistory = localStorage.getItem('household_history');
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      const lastIndex = [...history].reverse().findIndex((h: any) => h.title === chore.title && h.userId === chore.assignedToId);
      if (lastIndex !== -1) {
        const actualIndex = history.length - 1 - lastIndex;
        history.splice(actualIndex, 1);
        localStorage.setItem('household_history', JSON.stringify(history));
      }
    }

    if (chore.status === 'completed' && chore.assignedToId) {
      updateMemberStats(chore.assignedToId, -chore.points, true);
      updatePrizeXP(-chore.points);
    }
    toast({ variant: "destructive", title: "Mission Revoked", description: "The chore has been returned to the board." });
  };

  const handleDeleteChore = (id: string) => {
    if (!isAdmin) return;
    const updated = chores.filter(c => c.id !== id);
    saveChores(updated);
    toast({ title: "Mission Vanished", description: "The mission has been removed from the board." });
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

    saveChores([...chores, newChore]);
    setIsNewChoreOpen(false);
    setSelectedTemplate("");
    toast({ title: "New Mission Forged!", description: "It's live on the Mission Board." });
  };

  const applyTemplate = (val: string) => {
    const template = MISSION_TEMPLATES.find(t => t.title === val);
    if (template) {
      setSelectedTemplate(val);
    }
  };

  const filteredChores = chores.filter(c => {
    if (activeTab === "pending") return c.status === 'pending';
    if (activeTab === "my-chores") return c.assignedToId === activeMemberId && c.status === 'claimed';
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
              Warrior: <span className="text-primary font-bold">{activeMemberName}</span>
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
                        Set the points and frequency for this household task.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Quick Template</Label>
                        <Select onValueChange={applyTemplate}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a common chore..." />
                          </SelectTrigger>
                          <SelectContent>
                            {MISSION_TEMPLATES.map(t => (
                              <SelectItem key={t.title} value={t.title}>{t.title} ({t.points} XP)</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="title">Mission Name</Label>
                        <Input 
                          id="title" 
                          name="title" 
                          defaultValue={MISSION_TEMPLATES.find(t => t.title === selectedTemplate)?.title || ""} 
                          placeholder="e.g. Empty the Battle Bin" 
                          required 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Mission Intel</Label>
                        <Textarea 
                          id="description" 
                          name="description" 
                          defaultValue={MISSION_TEMPLATES.find(t => t.title === selectedTemplate)?.description || ""} 
                          placeholder="Requirements for victory..." 
                          required 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="points">XP Value</Label>
                          <Input 
                            id="points" 
                            name="points" 
                            type="number" 
                            defaultValue={MISSION_TEMPLATES.find(t => t.title === selectedTemplate)?.points || "50"} 
                            required 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="frequency">Cycle</Label>
                          <Select 
                            name="frequency" 
                            defaultValue={MISSION_TEMPLATES.find(t => t.title === selectedTemplate)?.frequency || "daily"}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="one-time">One-time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">Expires On</Label>
                        <Input 
                          id="dueDate" 
                          name="dueDate" 
                          defaultValue={MISSION_TEMPLATES.find(t => t.title === selectedTemplate)?.dueDate || "Tonight"} 
                          placeholder="e.g. Friday Night" 
                          required 
                        />
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
            <TabsTrigger value="completed">Recent Victories</TabsTrigger>
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
                    onDelete={handleDeleteChore}
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
                   'No missions have been completed in this current session.'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
