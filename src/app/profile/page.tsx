"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Award, Star, Flame, Camera } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-3xl border border-border shadow-sm">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-xl">
              <AvatarImage src="https://picsum.photos/seed/alex/200/200" />
              <AvatarFallback>AJ</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white cursor-pointer hover:bg-primary/90 transition-colors">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          <div className="text-center md:text-left space-y-2 flex-1">
            <h1 className="text-4xl font-headline font-bold">Alex Johnson</h1>
            <p className="text-muted-foreground">Master Cleaner • Level 15</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="bg-primary/10 px-4 py-2 rounded-xl flex items-center gap-2">
                <Star className="text-primary w-5 h-5 fill-primary" />
                <span className="font-bold">1,240 XP</span>
              </div>
              <div className="bg-orange-100 px-4 py-2 rounded-xl flex items-center gap-2">
                <Flame className="text-orange-600 w-5 h-5" />
                <span className="font-bold text-orange-600">12 Day Streak</span>
              </div>
            </div>
          </div>
          <Button className="bg-primary hover:bg-primary/90 hidden md:block">Edit Profile</Button>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Achievements & Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-4 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer">
                      <Award className={`w-8 h-8 ${i % 2 === 0 ? 'text-primary' : 'text-accent'}`} />
                    </div>
                    <span className="text-[10px] font-bold text-center">Badge {i}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-2 opacity-30">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-4 border-white grayscale">
                    <Award className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <span className="text-[10px] font-bold text-center">Locked</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value="alex.j@example.com" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notifications">Notification Frequency</Label>
                <select id="notifications" className="w-full h-10 px-3 rounded-md border bg-white text-sm">
                  <option>All activity</option>
                  <option>Only my chores</option>
                  <option>Never</option>
                </select>
              </div>
              <Button variant="outline" className="w-full">Change Password</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}