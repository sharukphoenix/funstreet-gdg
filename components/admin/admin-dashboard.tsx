"use client";

import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { toast } from "../ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { registerUser, rechargeTokens, getUser, getUserByPhone, User } from "@/lib/user-management";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboard() {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [topPlayers, setTopPlayers] = useState<User[]>([]);
  const [registrationData, setRegistrationData] = useState({
    name: "",
    phone: "",
    userId: ""
  });

  const [rechargeData, setRechargeData] = useState({
    phone: "",
    amount: 0
  });

  const [searchedUser, setSearchedUser] = useState<User | null>(null);

  useEffect(() => {
    // Subscribe to active users (users with tokens > 0)
    const usersQuery = query(
      collection(db, "users"),
      orderBy("tokens", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const users: User[] = [];
      snapshot.forEach((doc) => {
        users.push(doc.data() as User);
      });
      setActiveUsers(users);
    });

    return () => unsubscribe();
  }, []);

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerUser(
        registrationData.userId,
        registrationData.name,
        registrationData.phone
      );
      toast({
        title: "Success",
        description: "User registered successfully"
      });
      setRegistrationData({ name: "", phone: "", userId: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register user",
        variant: "destructive"
      });
    }
  };

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await getUserByPhone(rechargeData.phone);
      if (!user) {
        throw new Error("User not found");
      }
      await rechargeTokens(user.userId, rechargeData.amount);
      toast({
        title: "Success",
        description: `Recharged ${rechargeData.amount} tokens for ${user.name}`
      });
      setRechargeData({ phone: "", amount: 0 });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to recharge tokens",
        variant: "destructive"
      });
    }
  };

  const searchUser = async (phone: string) => {
    try {
      const user = await getUserByPhone(phone);
      setSearchedUser(user);
      if (!user) {
        toast({
          title: "Not Found",
          description: "No user found with this phone number",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search user",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="recharge">Recharge System</TabsTrigger>
          <TabsTrigger value="active">Active Users</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Register New User</h2>
            <form onSubmit={handleRegistration} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={registrationData.userId}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, userId: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={registrationData.name}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={registrationData.phone}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit">Register User</Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="recharge">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recharge Tokens</h2>
            <form onSubmit={handleRecharge} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rechargePhone">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="rechargePhone"
                    value={rechargeData.phone}
                    onChange={(e) => {
                      setRechargeData(prev => ({ ...prev, phone: e.target.value }));
                      searchUser(e.target.value);
                    }}
                    required
                  />
                </div>
              </div>
              
              {searchedUser && (
                <div className="p-4 bg-muted rounded-lg">
                  <p>Name: {searchedUser.name}</p>
                  <p>Current Tokens: {searchedUser.tokens}</p>
                  <p>Games Played: {searchedUser.gamesPlayed}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={rechargeData.amount}
                  onChange={(e) => setRechargeData(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <Button type="submit" disabled={!searchedUser}>Recharge Tokens</Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Active Users</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Games Played</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeUsers.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.tokens}</TableCell>
                    <TableCell>{user.gamesPlayed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Top Players</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Games Played</TableHead>
                  <TableHead>Tokens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeUsers.map((user, index) => (
                  <TableRow key={user.userId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.gamesPlayed}</TableCell>
                    <TableCell>{user.tokens}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}