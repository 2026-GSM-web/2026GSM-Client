'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function Header() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // ESLint react-hooks/set-state-in-effect 경고를 회피하기 위해 한 스텝 지연
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <header className="border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          GSM 학생회
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            홈
          </Link>
          <Link
            href="/policies"
            className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            정책
          </Link>
          <Link
            href="/members"
            className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            학생회 인원
          </Link>
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            관리자
          </Link>

          {/* 다크모드 토글 버튼 */}
          <button
            onClick={toggleTheme}
            aria-label="다크모드 토글"
            type="button"
            className="ml-1 p-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition text-base leading-none"
          >
            {mounted && isDark ? '☀️' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  );
}