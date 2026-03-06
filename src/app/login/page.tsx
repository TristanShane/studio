
"use client";

import { useState, useEffect } from "react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Shield, Swords, Sparkles, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [battleCode, setBattleCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Persistence logic: if already logged in, redirect home
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const authenticatedUser = result.user;

      // Ensure user profile exists
      await setDoc(doc(db, "users", authenticatedUser.uid), {
        id: authenticatedUser.uid,
        name: authenticatedUser.displayName || "Unknown Warrior",
        email: authenticatedUser.email,
        avatarUrl: authenticatedUser.photoURL,
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (battleCode.trim()) {
        await handleJoinRequest(authenticatedUser.uid, authenticatedUser.displayName || authenticatedUser.email || "Warrior");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/operation-not-allowed') {
        setAuthError("Google Sign-In is not enabled in the Firebase Console. Please enable it in Authentication > Sign-in method.");
      } else {
        toast({ variant: "destructive", title: "Login Failed", description: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async (userId: string, userName: string) => {
    const hRef = collection(db, "households");
    const q = query(hRef, where("inviteCode", "==", battleCode.trim().toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      toast({ variant: "destructive", title: "Code Invalid", description: "No household found with that battle code." });
      router.push("/"); 
      return;
    }

    const householdId = snapshot.docs[0].id;
    const reqRef = doc(db, "households", householdId, "joinRequests", userId);
    
    await setDoc(reqRef, {
      userId,
      userName,
      status: "pending",
      requestedAt: new Date().toISOString()
    });

    toast({ title: "Request Sent!", description: "The Guardian must approve your entry into the household." });
    router.push("/");
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Swords className="w-12 h-12 text-primary animate-bounce" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-primary w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
            <Trophy className="text-white w-10 h-10" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-headline font-bold">Chore Battle</CardTitle>
            <CardDescription className="text-base">Gamify your home and reclaim the house!</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest ml-1">Joining a team?</label>
            <div className="relative">
              <Swords className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="ENTER BATTLE CODE" 
                className="pl-10 uppercase font-mono tracking-widest"
                value={battleCode}
                onChange={(e) => setBattleCode(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
            className="w-full h-12 text-lg font-bold bg-white text-black border-2 border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-3" alt="Google" />
            {isLoading ? "Forging Access..." : "Enter with Google"}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center">
          <p className="text-xs text-muted-foreground">
            By entering the battle, you agree to our House Rules.
          </p>
        </CardFooter>
      </Card>
      
      <div className="fixed bottom-10 left-10 opacity-20 hidden lg:block">
        <Shield className="w-32 h-32 text-primary" />
      </div>
      <div className="fixed top-10 right-10 opacity-20 hidden lg:block">
        <Sparkles className="w-32 h-32 text-accent" />
      </div>
    </div>
  );
}
