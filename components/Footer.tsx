'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // 관리자 페이지는 백오피스 성격이라 공개용 푸터를 보여주지 않음
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="navy-surface text-white">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <span className="font-bold text-base">GSM 학생회</span>
          <p className="text-sm text-white/60 mt-2">학생의 목소리를, 변화로 증명하겠습니다.</p>
        </div>

        <p className="text-xs text-white/40">© {new Date().getFullYear()} GSM 학생회. All rights reserved.</p>
      </div>
    </footer>
  );
}
