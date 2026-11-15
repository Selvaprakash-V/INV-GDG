'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function TopProgressIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger on route change or initial page load/reload
    setVisible(true);
    setProgress(20);

    const timer1 = setTimeout(() => {
      setProgress(65);
    }, 100);

    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 280);

    const timer3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 550);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname, searchParams]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[3px] overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          transitionProperty: 'width, opacity',
          transitionDuration: progress === 100 ? '200ms, 300ms' : '200ms, 0ms',
        }}
      />
    </div>
  );
}

export default function NavigationLoader() {
  return (
    <Suspense fallback={null}>
      <TopProgressIndicator />
    </Suspense>
  );
}
