'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function RB2BLoader() {
  const pathname = usePathname();

  useEffect(() => {
    const existing = document.getElementById('rb2b-script');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'rb2b-script';
    script.src = `https://ddwl4m2hdecbv.cloudfront.net/b/${process.env.NEXT_PUBLIC_RB2B_ID}/${process.env.NEXT_PUBLIC_RB2B_ID}.js.gz`;
    script.async = true;
    document.body.appendChild(script);
  }, [pathname]);

  return null;
}
