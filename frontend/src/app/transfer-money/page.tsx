"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(qs ? `/remittance?${qs}` : '/remittance');
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#070a10] flex items-center justify-center text-slate-400 text-sm font-medium">
      Redirecting to Remittance Engine...
    </div>
  );
}

export default function TransferMoneyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070a10] flex items-center justify-center text-slate-400 text-sm font-medium">Loading...</div>}>
      <RedirectContent />
    </Suspense>
  );
}
