"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, List, Trophy, Users, User, Bell, ChevronDown, UserCheck, Shield, Zap, Leaf, Heart, LogOut, Trash2, CheckCircle2, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { formatDistanceToNow } from "date-fns";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Chores", href: "/chores", icon: List },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Household", href: "/household", icon: Users },
];

const DEFAULT_MEMBERS = [
  { id: "member-1", name: "Alex (Admin)", avatar: "https://picsum.photos/seed/alex/100/100", role: "admin", icon: Shield, theme: 'member-1' },
];

export interface AppNotification {
  id: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'completion' | 'claim' | 'system';
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const [activeMember, setActiveMember] = useState(DEFAULT_MEMBERS[0]);
  const [members, setMembers] = useState(DEFAULT_MEMBERS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const updateFromStorage = () => {
      // Load all members
      const savedMembers = localStorage.getItem('household_members');
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      }

      // Load active member
      const savedActiveId = localStorage.getItem('activeMemberId');
      const currentList = savedMembers ? JSON.parse(savedMembers) : DEFAULT_MEMBERS;
      
      if (savedActiveId) {
        const found = currentList.find((m: any) => m.id === savedActiveId);
        if (found) {
          setActiveMember(found);
          document.documentElement.setAttribute('data-theme', found.theme || found.id);
        }
      }

      // Load notifications
      const savedNotifications = localStorage.getItem('household_notifications');
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
        setHasUnread(parsed.some((n: AppNotification) => !n.isRead));
      }
    };

    updateFromStorage();
    window.addEventListener('storage', updateFromStorage);
    return () => window.removeEventListener('storage', updateFromStorage);
  }, []);

  const handleSwitchMember = (member: any) => {
    setActiveMember(member);
    localStorage.setItem('activeMemberId', member.id);
    document.documentElement.setAttribute('data-theme', member.theme || member.id);
    window.dispatchEvent(new Event('storage'));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('activeMemberId');
      localStorage.removeItem('household_members');
      localStorage.removeItem('household_chores');
      localStorage.removeItem('household_prize');
      localStorage.removeItem('household_notifications');
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    setHasUnread(false);
    localStorage.setItem('household_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setHasUnread(false);
    localStorage.setItem('household_notifications', JSON.stringify([]));
    window.dispatchEvent(new Event('storage'));
  };

  const getMemberIcon = (member: any) => {
    if (member.theme === 'member-2') return Zap;
    if (member.theme === 'member-3') return Leaf;
    if (member.theme === 'member-pink') return Heart;
    return Shield;
  };

  const MemberIcon = getMemberIcon(activeMember);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border md:top-0 md:bottom-auto md:border-b md:border-t-0 py-2 px-4 md:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg transition-colors duration-500">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-headline text-xl font-bold text-primary mr-4 transition-colors duration-500">Chore Battle</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-secondary/50 border-primary/20 hover:bg-secondary/80">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={activeMember.avatar} />
                  <AvatarFallback>{activeMember.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] uppercase font-bold text-primary flex items-center gap-1">
                    <MemberIcon className="w-2 h-2" />
                    {activeMember.role}
                  </span>
                  <span className="text-xs font-bold">{activeMember.name}</span>
                </div>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-2 max-h-[80vh] overflow-y-auto">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Select Your Warrior</DropdownMenuLabel>
              {members.map((m: any) => {
                const Icon = getMemberIcon(m);
                return (
                  <DropdownMenuItem key={m.id} onClick={() => handleSwitchMember(m)} className={cn(
                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all",
                    activeMember.id === m.id ? "bg-primary/10" : "hover:bg-muted"
                  )}>
                    <div className="relative">
                      <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                        <AvatarImage src={m.avatar} />
                        <AvatarFallback>{m.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5 border border-white">
                        <Icon className="w-2 h-2" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-sm font-bold", activeMember.id === m.id && "text-primary")}>{m.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{m.role}</p>
                    </div>
                    {activeMember.id === m.id && <UserCheck className="w-4 h-4 text-primary" />}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem asChild>
                <Link href="/household" className="flex items-center gap-2 text-primary font-bold text-xs p-2">
                  <Users className="w-3 h-3" /> Manage Household
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-1 justify-around md:justify-center md:gap-8 lg:gap-12">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 rounded-lg transition-all",
                  isActive 
                    ? "text-primary bg-primary/10 font-bold" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] md:text-sm font-headline uppercase tracking-wider md:capitalize">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Popover onOpenChange={(open) => { if (open && hasUnread) markAllAsRead(); }}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/5">
                <Bell className="w-5 h-5" />
                {hasUnread && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border border-white"></span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h4 className="font-bold text-sm">Notifications</h4>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold text-muted-foreground hover:text-destructive" onClick={clearNotifications}>
                  <Trash2 className="w-3 h-3 mr-1" /> Clear
                </Button>
              </div>
              <ScrollArea className="h-72">
                {notifications.length > 0 ? (
                  <div className="divide-y">
                    {[...notifications].reverse().map((n) => (
                      <div key={n.id} className={cn("p-4 flex gap-3 transition-colors", !n.isRead && "bg-primary/5")}>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          n.type === 'completion' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                        )}>
                          {n.type === 'completion' ? <CheckCircle2 className="w-4 h-4" /> : <Swords className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs leading-tight font-medium">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <Bell className="w-8 h-8 text-muted-foreground mx-auto opacity-20" />
                    <p className="text-xs text-muted-foreground italic">No recent activity.</p>
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-1 rounded-full">
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarImage src={activeMember.avatar} />
                  <AvatarFallback>{activeMember.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Warrior Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer w-full">
                  <User className="w-4 h-4" /> My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Logout Battle Station
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}