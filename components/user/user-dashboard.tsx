"use client";

import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { getUser, User } from "@/lib/user-management";
import { useSigninCheck } from "reactfire";
import { useRouter } from "next/navigation";

export default function UserDashboard({ userId }: { userId: string }) {
  const [userData, setUserData] = useState<User | null>(null);
  const { status, data: signInCheckResult } = useSigninCheck();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUser(userId);
        setUserData(user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  if (status === "loading" || !userData) {
    return <div>Loading...</div>;
  }

  if (!signInCheckResult.signedIn) {
    router.push("/login");
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid gap-6">
        {/* Welcome Message */}
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-2">Welcome, {userData.name}!</h1>
          <p className="text-muted-foreground">Player ID: {userData.userId}</p>
        </Card>

        {/* Token Balance */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Token Balance</h2>
          <div className="text-3xl font-bold">{userData.tokens} 🪙</div>
        </Card>

        {/* Game History */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Game History</h2>
          <div className="space-y-2">
            <p>Total Games Played: {userData.gamesPlayed}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}