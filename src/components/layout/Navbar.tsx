"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Trophy, Users, User, Bell, ChevronDown, UserCheck, Shield, Zap, Leaf } from "lucide-react";
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
import { useState, useEffect } from "react";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Chores", href: "/chores", icon: List },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Household", href: "/household", icon: Users },
];

const HOUSEHOLD_MEMBERS = [
  { id: "member-1", name: "Alex (Admin)", avatar: "https://picsum.photos/seed/alex/100/100", role: "admin", icon: Shield },
  { id: "member-2", name: "Sam", avatar: "https://picsum.photos/seed/sam/100/100", role: "warrior", icon: Zap },
  { id: "member-3", name: "Jordan", avatar: "https://picsum.photos/seed/jordan/100/100", role: "warrior", icon: Leaf },
];

export function Navbar() {
  const pathname = usePathname();
  const [activeMember, setActiveMember] = useState(HOUSEHOLD_MEMBERS[0]);

  useEffect(() => {
    const saved = localStorage.getItem('activeMemberId');
    if (saved) {
      const found = HOUSEHOLD_MEMBERS.find(m => m.id === saved);
      if (found) {
        setActiveMember(found);
        document.documentElement.setAttribute('data-theme', found.id);
      }
    } else {
      document.documentElement.setAttribute('data-theme', 'member-1');
    }
  }, []);

  const handleSwitchMember = (member: typeof HOUSEHOLD_MEMBERS[0]) => {
    setActiveMember(member);
    localStorage.setItem('activeMemberId', member.id);
    document.documentElement.setAttribute('data-theme', member.id);
    window.dispatchEvent(new Event('storage'));
  };

  const MemberIcon = activeMember.icon;

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
            <DropdownMenuContent align="start" className="w-56 p-2">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Select Your Warrior</DropdownMenuLabel>
              {HOUSEHOLD_MEMBERS.map((m) => {
                const Icon = m.icon;
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
          <Button variant="ghost" size="icon" className="relative hover:bg-primary/5">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-1 rounded-full">
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarImage src="https://picsum.photos/seed/user1/200/200" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Parent Controls</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer w-full">
                  <User className="w-4 h-4" /> My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Logout Battle Station</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}