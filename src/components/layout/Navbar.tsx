
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Trophy, Users, User, Bell, ChevronDown, UserCheck } from "lucide-react";
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

// Mock members for the shared tablet experience
const HOUSEHOLD_MEMBERS = [
  { id: "member-1", name: "Alex (Admin)", avatar: "https://picsum.photos/seed/alex/100/100", role: "admin" },
  { id: "member-2", name: "Sam", avatar: "https://picsum.photos/seed/sam/100/100", role: "warrior" },
  { id: "member-3", name: "Jordan", avatar: "https://picsum.photos/seed/jordan/100/100", role: "warrior" },
];

export function Navbar() {
  const pathname = usePathname();
  const [activeMember, setActiveMember] = useState(HOUSEHOLD_MEMBERS[0]);

  useEffect(() => {
    const saved = localStorage.getItem('activeMemberId');
    if (saved) {
      const found = HOUSEHOLD_MEMBERS.find(m => m.id === saved);
      if (found) setActiveMember(found);
    }
  }, []);

  const handleSwitchMember = (member: typeof HOUSEHOLD_MEMBERS[0]) => {
    setActiveMember(member);
    localStorage.setItem('activeMemberId', member.id);
    window.dispatchEvent(new Event('storage')); // Notify other components
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border md:top-0 md:bottom-auto md:border-b md:border-t-0 py-2 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-headline text-xl font-bold text-primary mr-4">Chore Battle</span>
          </div>
          
          {/* Tablet Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-secondary/50 border-primary/20">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={activeMember.avatar} />
                  <AvatarFallback>{activeMember.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-bold">{activeMember.name}</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Switch Warrior</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {HOUSEHOLD_MEMBERS.map((m) => (
                <DropdownMenuItem key={m.id} onClick={() => handleSwitchMember(m)} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={m.avatar} />
                    <AvatarFallback>{m.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className={cn("text-sm", activeMember.id === m.id && "font-bold text-primary")}>
                    {m.name}
                  </span>
                  {activeMember.id === m.id && <UserCheck className="w-4 h-4 ml-auto text-primary" />}
                </DropdownMenuItem>
              ))}
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
                  "flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 rounded-lg transition-colors",
                  isActive 
                    ? "text-primary bg-primary/10 font-medium" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs md:text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-1 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://picsum.photos/seed/user1/200/200" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Household Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer w-full">
                  <User className="w-4 h-4" /> My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
