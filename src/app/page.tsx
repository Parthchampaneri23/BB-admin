'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          router.replace('/dashboard');
        } else {
          router.replace('/login');
        }
      } catch {
        router.replace('/login');
      }
    }

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#071324] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#0069f7] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
