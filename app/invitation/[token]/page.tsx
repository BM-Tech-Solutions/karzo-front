'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function InvitationRedirect() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  useEffect(() => {
    if (token) {
      console.log('Redirecting from /invitation/[token] to /apply/[token]');
      router.push(`/apply/${token}`);
    }
  }, [token, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p>Please wait while we redirect you to the application form.</p>
      </div>
    </div>
  );
}
