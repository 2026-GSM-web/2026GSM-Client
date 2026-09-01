'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/auth-provider';
import { startDataGsmLogin } from '@/lib/auth';

export default function Header() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const { status } = useAuth();
  const [mounted, setMounted] = useState(false);
  // 홈에서만 헤더가 히어로 위에 겹쳐 뜨고(fixed) 최상단에서는 투명하다.
  // 그 외 페이지에서는 흐름을 차지하는 일반 헤더(sticky)를 쓴다.
  const overHero = pathname === '/';
  // 페이지 최상단 근처(scrollY < 80)인지 여부 - 스크롤을 내리면 홈 헤더에 배경을
  // 깔고(글씨 색도 뒤집고) 좌측 'GSM 학생회' 로고를 숨긴다
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    // ESLint react-hooks/set-state-in-effect 경고를 회피하기 위해 한 스텝 지연
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 80);
    // ESLint react-hooks/set-state-in-effect 경고를 회피하기 위해 한 스텝 지연
    const timer = setTimeout(onScroll, 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

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

  // 헤더가 완전히 투명한 상태: 홈이면서 페이지 최상단일 때만(히어로가 그대로 비침).
  // 그 외에는 뒤 배경이 밝을 수 있어 배경을 깔고 글씨 색을 뒤집는다.
  const transparentHeader = overHero && atTop;

  // 밝은 배경(프로스트 흰색) + 어두운 글씨 - 라이트 모드에서 투명 상태가 아닐 때
  const lightHeader = !transparentHeader && mounted && !isDark;

  // 투명 상태가 아니면 건의하기 버튼도 흰색 대신 채워진 네이비로
  const scrolled = !transparentHeader && mounted;

  // 평소엔 배경 없이 텍스트만, 마우스를 올리면 배경이 나타남
  const linkClass = `px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition whitespace-nowrap ${
    lightHeader
      ? 'text-navy/80 hover:text-navy hover:bg-navy/10'
      : 'text-white/90 hover:text-white hover:bg-white/15'
  }`;

  return (
    <header
      className={`${overHero ? 'fixed inset-x-0 top-0' : 'sticky top-0'} z-50 transition-colors duration-300 ${
        transparentHeader
          ? 'bg-transparent'
          : lightHeader
            ? 'bg-white/85 backdrop-blur-md border-b border-black/10 shadow-sm'
            : 'navy-surface'
      }`}
    >
      <div className="relative max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          aria-hidden={!atTop}
          tabIndex={atTop ? undefined : -1}
          className={`font-bold text-base sm:text-lg tracking-tight shrink-0 whitespace-nowrap transition-opacity duration-300 ${
            lightHeader ? 'text-navy' : 'text-white'
          } ${atTop ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
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

          {/* 로그인 - /api/auth/me 확인이 끝난(mounted + loading 아님) 뒤에만 노출해
              깜빡임을 막음. 개인 기기 전제라 로그아웃은 두지 않음(토큰 만료로 자연 정리) */}
          {mounted && status === 'guest' && (
            <button
              type="button"
              onClick={() => startDataGsmLogin(pathname || '/')}
              className={linkClass}
            >
              로그인
            </button>
          )}

          <Link
            href="/policies/create"
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              scrolled
                ? 'bg-navy text-white dark:bg-[#1d4e74] dark:text-white hover:brightness-110'
                : 'bg-white text-navy dark:text-[#171b23] hover:bg-white/90'
            }`}
          >
            건의하기
          </Link>
        </nav>
      </div>
    </header>
  );
}
