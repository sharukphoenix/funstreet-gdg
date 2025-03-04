"use client";

import AdminDashboard from "@/components/admin/admin-dashboard";
import { useSigninCheck } from "reactfire";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { status, data: signInCheckResult } = useSigninCheck();
  const router = useRouter();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!signInCheckResult.signedIn) {
    router.push("/login");
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <AdminDashboard />
    </div>
  );
}