"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/sign-in-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "reactfire";

export default function AdminLoginPage() {
  const { data: user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/admin");
    }
  }, [user, router]);

  return (
    <div className="grow flex flex-col items-center justify-center">
      <section className="w-[32rem] space-y-4">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
          Admin Login
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Administrator Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignInForm onShowSignUp={() => {}} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}