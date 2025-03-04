"use client";

import * as React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FC, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getUserByPhone } from "@/lib/user-management";

const formSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

interface UserLoginFormProps {
  onSuccess?: (userId: string) => void;
}

export const UserLoginForm: FC<UserLoginFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({  
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      phone: "",
    },
  });

  const login = async ({ userId, phone }: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const user = await getUserByPhone(phone);
      
      if (!user) {
        toast({
          title: "User not found",
          description: "No user found with this phone number",
          variant: "destructive",
        });
        return;
      }
      
      if (user.userId !== userId) {
        toast({
          title: "Invalid credentials",
          description: "User ID does not match the phone number",
          variant: "destructive",
        });
        return;
      }
      
      // Store user ID in localStorage for persistence
      localStorage.setItem("userId", userId);
      
      toast({
        title: "Success!",
        description: "You have been signed in.",
      });
      
      if (onSuccess) {
        onSuccess(userId);
      } else {
        router.push("/");
      }
    } catch (error) {
      toast({ 
        title: "Error Signing In", 
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(login)} className="space-y-6">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User ID</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Form>
  );
};