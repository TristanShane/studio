"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ChoreCard, Chore } from "@/components/chores/ChoreCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INITIAL_CHORES: Chore[] = [
  { id: "1", title: "Wash Dishes", description: "Empty the dishwasher and fill with dirty dishes.", points: 30, dueDate: "Today", status: 'pending', frequency: 'daily' },
  { id: "2", title: "Mop Floors", description: "Mop the kitchen and hallway floors.", points: 100, dueDate: "Every Saturday", status: 'pending', frequency: 'weekly' },
  { id: "3", title: "Take Out Trash", description: "Empty all trash cans and take them to the curb.", points: 40, dueDate: "Wednesday Night", status: 'claimed', assignedTo: "Alex", frequency: 'weekly' },
  { id: "4", title: "Laundry", description: "Wash, dry, and fold two loads of laundry.", points: 120, dueDate: "Tomorrow", status: 'claimed', assignedTo: "Sam", frequency: 'weekly' },
  { id: "5", title: "Water Plants", description: "Water all indoor plants and the garden.", points: 20, dueDate: "Daily", status: 'completed', assignedTo: "Alex", frequency: 'daily' },
];

export default function ChoresPage() {
  const [chores, setChores] = useState<Chore[]>(INITIAL_CHORES);
  const [activeTab, setActiveTab] = useState("all");

  const handleClaim = (id: string) => {
    setChores(prev => prev.map(c => c.id === id ? { ...c, status: 'claimed', assignedTo: "Alex" } : c));
  };

  const handleComplete = (id: string) => {
    setChores(prev => prev.map(c => c.id === id ? { ...c, status: 'completed' } : c));
  };

  const filteredChores = chores.filter(c => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return c.status === 'pending';
    if (activeTab === "my-chores") return c.assignedTo === "Alex" && c.status === 'claimed';
    if (activeTab === "completed") return c.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-headline font-bold text-foreground">Mission Board</h1>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search missions..." className="pl-10 bg-white" />
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </section>

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 md:w-auto mb-8 bg-white border">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Open</TabsTrigger>
            <TabsTrigger value="my-chores">My Chores</TabsTrigger>
            <TabsTrigger value="completed">Done</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredChores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChores.map((chore) => (
                  <ChoreCard 
                    key={chore.id} 
                    chore={chore} 
                    onClaim={handleClaim}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border">
                <p className="text-muted-foreground">No chores found in this category.</p>
                <Button variant="link" className="text-primary font-bold mt-2">
                  Add a new mission
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}