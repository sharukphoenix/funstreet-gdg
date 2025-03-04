'use client';

import { useEffect, useState } from 'react';
import { User, processGameEntry } from '@/lib/user-management';
import { Scanner } from "@yudiel/react-qr-scanner";
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
// import MobileTransactionHistory from '@/components/user/mobile-transaction-history';

export default function MobileUserDashboard({ userId }: { userId: string }) {
  const [userData, setUserData] = useState<User | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const { toast } = useToast();

  // Real-time user data listener
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
      if (doc.exists()) {
        setUserData(doc.data() as User);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const handleScanSuccess = async (gameId: string) => {
    try {
      const { gameId: parsedGameId, tokenCost } = JSON.parse(gameId);
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('User not found');
      }

      const userData = userSnap.data();
      if (userData.tokens < tokenCost) {
        throw new Error('Insufficient tokens');
      }

      await updateDoc(userRef, {
        tokens: userData.tokens - tokenCost,
        gamesPlayed: (userData.gamesPlayed || 0) + 1,
      });

      toast({
        title: 'Game Started!',
        description: `Deducted ${tokenCost} tokens for ${parsedGameId}`,
      });
    } catch (error) {
      toast({
        title: 'Scan Error',
        description: error instanceof Error ? error.message : 'Invalid QR code',
        variant: 'destructive',
      });
    } finally {
      setShowScanner(false);
    }
  };

  if (!userData) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4 space-y-4">
      {/* Header Section */}
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <h1 className="text-2xl font-bold">👋 Welcome, {userData.name}!</h1>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm">Tokens</p>
            <p className="text-xl font-bold">{userData.tokens}</p>
          </div>
          <div className="text-center">
            <p className="text-sm">Games</p>
            <p className="text-xl font-bold">{userData.gamesPlayed}</p>
          </div>
          <div className="text-center">
            <p className="text-sm">Points</p>
            <p className="text-xl font-bold">{userData.points}</p>
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner Section */}
      {showScanner ? (
        <div className="fixed inset-0 bg-background z-50">
          <Scanner
            onScan={(result) => result && handleScanSuccess(result)}
            onError={(error) => console.error(error)}
            styles={{ 
              video: { 
                width: '100%', 
                height: '100%',
                objectFit: 'cover'
              } 
            }}
          />
          <Button
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2"
            onClick={() => setShowScanner(false)}
          >
            Close Scanner
          </Button>
        </div>
      ) : (
        <Button
          size="lg"
          className="w-full h-16 text-lg"
          onClick={() => setShowScanner(true)}
        >
          🎯 Play Game
        </Button>
      )}

      {/* Transaction History
      <MobileTransactionHistory userId={userId} /> */}
    </div>
  );
}