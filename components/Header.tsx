'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { href: '/', label: '홈' },
  { href: '/policies', label: '정책' },
  { href: '/members', label: '학생회 인원' },
  { href: '/admin', label: '관리자' },
];

export default function Header() {
  const pathname = usePathname();
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
    <header className="border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          GSM 학생회
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg transition ${
                  active
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* 다크모드 토글 스위치 */}
          <button
            onClick={toggleTheme}
            aria-label="다크모드 토글"
            type="button"
            className={`ml-2 relative w-11 h-6 rounded-full transition-colors shrink-0 ${
              mounted && isDark ? 'bg-blue-600' : 'bg-black/15 dark:bg-white/15'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] transition-transform ${
                mounted && isDark ? 'translate-x-5' : 'translate-x-0'
              }`}
            >
              {mounted && isDark ? '🌙' : '☀️'}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
