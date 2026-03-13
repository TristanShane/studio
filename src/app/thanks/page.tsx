
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, Coffee, ExternalLink, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ThanksPage() {
  // REPLACE THIS with your personal PayPal.Me link or email-based link
  // Example: https://www.paypal.me/YourUsername
  const paypalUrl = "https://www.paypal.com/donate"; 

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20 bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <section className="text-center space-y-4">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-10 h-10 text-primary fill-primary" />
          </div>
          <h1 className="text-4xl font-headline font-bold">You're Awesome!</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for being a Guardian of order in your home. We're so glad Chore Battle is helping your household!
          </p>
        </section>

        <Card className="border-2 border-primary/20 shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 text-center p-8">
            <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Fuel the Battle Station
            </CardTitle>
            <CardDescription className="text-base">
              If this app has brought a little magic (and cleanliness) to your home, consider supporting its development.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6 text-center">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chore Battle is built with love to help families turn work into play. Every contribution helps us keep the servers running and forge new legendary features for your warriors.
            </p>
            
            <div className="pt-4">
              <Button asChild size="lg" className="w-full bg-[#0070ba] hover:bg-[#003087] text-white font-bold h-16 text-lg shadow-lg">
                <a 
                  href={paypalUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3"
                >
                  <Coffee className="w-6 h-6" />
                  Tip via PayPal
                  <ExternalLink className="w-4 h-4 opacity-50" />
                </a>
              </Button>
            </div>
            
            <p className="text-[10px] text-muted-foreground italic">
              *A Personal PayPal account works perfectly. You will be redirected to PayPal's secure external site.
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button asChild variant="ghost" className="hover:bg-primary/5">
            <Link href="/household" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Return to Base HQ
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
