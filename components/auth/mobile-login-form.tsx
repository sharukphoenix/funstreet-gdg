'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function MobileLoginForm() {
  const [userId, setUserId] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const savedUserId = localStorage.getItem('funstreetUserId');
    if (savedUserId) {
      setUserId(savedUserId);
      // Auto-focus phone input when user ID is remembered
      const phoneInput = document.getElementById('phone');
      if (phoneInput) phoneInput.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate numeric inputs
      if (!/^\d{4}$/.test(userId) || !/^\d{10}$/.test(phone)) {
        throw new Error('Invalid credentials format');
      }

      // Check Firestore for user match
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists() || userDoc.data()?.phone !== phone) {
        throw new Error('Invalid credentials');
      }

      if (rememberMe) localStorage.setItem('funstreetUserId', userId);
      localStorage.setItem('funstreetSession', Date.now().toString());
      router.push('/user');
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userId">User ID (4 digits)</Label>
          <Input
            id="userId"
            type="number"
            pattern="[0-9]{4}"
            inputMode="numeric"
            value={userId}
            onChange={(e) => setUserId(e.target.value.slice(0, 4))}
            required
            autoFocus
            className="text-center text-xl h-16"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            pattern="[0-9]{10}"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.slice(0, 10))}
            required
            className="text-center text-xl h-16"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="rememberMe"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="rememberMe">Remember Me</Label>
      </div>

      <Button
        type="submit"
        className="w-full h-16 text-xl"
        disabled={loading}
      >
        {loading ? 'Authenticating...' : 'Play Now →'}
      </Button>
    </form>
  );
}