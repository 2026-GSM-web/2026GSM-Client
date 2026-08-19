'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // 홈 화면 맨 위(히어로 사진 위)에 있을 때는 헤더가 사진과 이어지도록 투명하게,
  // 스크롤하면 흰색(라이트 모드) 또는 네이비(다크 모드)로 전환
  const [overHero, setOverHero] = useState(false);

  useEffect(() => {
    // ESLint react-hooks/set-state-in-effect 경고를 회피하기 위해 한 스텝 지연
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (pathname !== '/') {
      // ESLint react-hooks/set-state-in-effect 경고를 회피하기 위해 한 스텝 지연
      const timer = setTimeout(() => setOverHero(false), 0);
      return () => clearTimeout(timer);
    }

    const onScroll = () => setOverHero(window.scrollY < 80);
    const timer = setTimeout(onScroll, 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // Next.js Link의 해시 이동이 같은 페이지 안에서는 한 번에 스크롤되지 않는
  // 경우가 있어, 홈에 있을 때는 직접 스크롤 처리
  const handleOrgchartClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/') return;
    e.preventDefault();
    document.getElementById('orgchart')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.pushState(null, '', '/#orgchart');
  };

  // 스크롤해서 히어로를 벗어났고, 라이트 모드일 때만 흰 바탕(+어두운 글씨)
  const lightHeader = !overHero && mounted && !isDark;

  // 평소엔 배경 없이 텍스트만, 마우스를 올리면 배경이 나타남
  const linkClass = `px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition whitespace-nowrap ${
    lightHeader
      ? 'text-navy/80 hover:text-navy hover:bg-navy/10'
      : 'text-white/90 hover:text-white hover:bg-white/15'
  }`;

  return (
    <header
      className={`relative sticky top-0 z-50 transition-colors duration-300 ${
        overHero ? '' : lightHeader ? 'bg-white border-b border-black/10 shadow-sm' : 'navy-surface'
      }`}
      style={
        overHero
          ? {
              backgroundImage: "url('/images/hero-school.webp')",
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              backgroundAttachment: 'fixed',
            }
          : undefined
      }
    >
      {/* 히어로 사진 위 헤더 - 사진 위에 바로 글씨가 얹히면 안 읽혀서 단색 톤을
          깔아줌. app/page.tsx 히어로 섹션의 오버레이(bg-[#33618a]/85,
          dark:bg-[#0a121c]/92)와 색·투명도를 정확히 맞춰서 경계선이 보이지 않게 함 */}
      {overHero && (
        <div className={`absolute inset-0 ${isDark ? 'bg-[#0a121c]/92' : 'bg-[#33618a]/85'}`} />
      )}
      <div className="relative max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className={`font-bold text-base sm:text-lg tracking-tight shrink-0 whitespace-nowrap ${
            lightHeader ? 'text-navy' : 'text-white'
          }`}
        >
          GSM 학생회
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          <Link href="/" className={linkClass}>
            홈
          </Link>
          <Link href="/#orgchart" className={linkClass} onClick={handleOrgchartClick}>
            조직도
          </Link>
          <Link
            href="/admin"
            className={`${linkClass} ${pathname === '/admin' ? 'font-bold' : ''} ${
              pathname === '/admin' && !lightHeader ? 'text-white' : ''
            }`}
          >
            관리자
          </Link>

          {/* 다크모드 토글 */}
          <button
            onClick={toggleTheme}
            aria-label="다크모드 토글"
            type="button"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition shrink-0 ${
              lightHeader
                ? 'text-navy/80 hover:text-navy hover:bg-navy/10'
                : 'text-white/90 hover:text-white hover:bg-white/15'
            }`}
          >
            {mounted && isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
              </svg>
            )}
          </button>

          <Link
            href="/policies/create"
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              lightHeader ? 'navy-surface text-white hover:brightness-110' : 'bg-white text-navy hover:bg-white/90'
            }`}
          >
            건의하기
          </Link>
        </nav>
      </div>
    </header>
  );
}
