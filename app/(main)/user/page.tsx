"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserDashboard from "@/components/user/user-dashboard";

export default function UserPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in by retrieving userId from localStorage
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      router.push("/login");
      return;
    }
    setUserId(storedUserId);
  }, [router]);

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <UserDashboard userId={userId} />
    </div>
  );
}