'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DevModeRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/devhub/projects');
  }, [router]);
  return <div className="text-center text-white py-20">Redirecting to Dev Mode...</div>;
} 