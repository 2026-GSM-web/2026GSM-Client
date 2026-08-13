'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Pledge {
  id: string;
  title: string;
  color: string;
  done: boolean;
  completedAt?: string;
}

// 학생회 인원 아바타용 - members 페이지의 실제 인원과 동일한 이름 목록
const MEMBER_NAMES = [
  '한의준', '박채은', '김준수',
  '정윤서', '이다원', '정연돈', '임서하', '이찬진', '최형지',
  '정수진', '이시우', '이진서', '김민욱', '양은준', '김승우',
  '김민선', '송건호',
];

function isValidPledges(data: unknown): data is Pledge[] {
  return Array.isArray(data) && data.every((p) => p && typeof p.done === 'boolean');
}

const defaultPledges: Pledge[] = [
  { id: 'p1', title: 'AI 프로 지원', color: '#3b82f6', done: false },
  { id: 'p2', title: '전공 동아리 활성화', color: '#10b981', done: false },
  { id: 'p3', title: '교내 대회 개최', color: '#f59e0b', done: false },
  { id: 'p4', title: '지필평가 금요일로 변경', color: '#8b5cf6', done: false },
];

export default function MainPage() {
  const [pledges, setPledges] = useState<Pledge[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('sc_pledges');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (isValidPledges(parsed)) return parsed;
    }
    localStorage.setItem('sc_pledges', JSON.stringify(defaultPledges));
    return defaultPledges;
  });

  const [ddayText, setDdayText] = useState<string>('');

  useEffect(() => {
    const handleStorageChange = () => {
      const savedPledges = localStorage.getItem('sc_pledges');
      if (savedPledges) {
        const parsed = JSON.parse(savedPledges);
        if (isValidPledges(parsed)) setPledges(parsed);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const launchDate = new Date('2026-07-16T00:00:00');
    const updateDday = () => {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfLaunch = new Date(launchDate.getFullYear(), launchDate.getMonth(), launchDate.getDate());
      const diffDays = Math.floor((startOfToday.getTime() - startOfLaunch.getTime()) / (1000 * 60 * 60 * 24));
      setDdayText(diffDays >= 0 ? `D+${diffDays}` : `D-${Math.abs(diffDays)}`);
    };

    updateDday();
    const interval = setInterval(updateDday, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const doneCount = pledges.filter((p) => p.done).length;
  const avgPercent = pledges.length > 0 ? Math.round((doneCount / pledges.length) * 100) : 0;

  const visibleMembers = MEMBER_NAMES.slice(0, 4);
  const remainingMembers = MEMBER_NAMES.length - visibleMembers.length;

  return (
    <main className="max-w-5xl mx-auto px-6">
      {/* 히어로 - D-day */}
      <section className="relative pt-20 pb-16 text-center overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 w-[520px] h-[420px] rounded-full blur-3xl opacity-40 dark:opacity-30"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        />
        <div className="relative">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-[0.2em] uppercase">
            2026 Student Council
          </span>
          <h1 className="text-2xl font-bold mt-3">학생회 D-day</h1>
          <p className="font-[family-name:var(--font-nanumsquareneo)] text-7xl sm:text-8xl font-black mt-6 tabular-nums text-[#1e2a22] dark:text-white">{ddayText}</p>
          <p className="text-sm opacity-60 mt-6 max-w-md mx-auto leading-relaxed">
            학생회 남은 임기 동안 약속드린 공약을 완수하기 위해 최선을 다하겠습니다.
          </p>
        </div>
      </section>

      {/* 대시보드 카드 그리드 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
        {/* 정책 이행률 - 게이지바(전체 %)는 유지하고, 공약 하나가 이행될 때마다 1/N만큼 채워짐.
            개별 공약은 퍼센트가 아니라 이행함/미이행(참/거짓)으로만 표시 - 전체 %가 어떤 공약들로 채워졌는지 아래 상세 목록으로 보여줌 */}
        <div className="md:col-span-2 p-6 border border-black/10 dark:border-white/10 rounded-2xl bg-white/40 dark:bg-white/5 transition-all duration-200 hover:shadow-lg hover:border-blue-600/30 dark:hover:border-blue-400/30">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase">Policy Progress</span>
          <h2 className="text-base font-bold mt-1">정책 이행률</h2>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-2xl font-black tabular-nums">{avgPercent}%</span>
            <span className="text-xs opacity-50">{doneCount} / {pledges.length} 완료</span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${avgPercent}%` }}
            />
          </div>

          {/* 상세 항목 - 어떤 공약이 이행됐는지/안됐는지만 표시 */}
          <div className="mt-5 pt-4 border-t border-black/10 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {pledges.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-black/30 dark:bg-white/30" />
                  <span className="text-sm truncate">{p.title}</span>
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    p.done
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-black/5 dark:bg-white/10 opacity-50'
                  }`}
                >
                  {p.done ? '이행함' : '미이행'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 학생회 인원 */}
        <Link
          href="/members"
          className="p-6 border border-black/10 dark:border-white/10 rounded-2xl bg-white/40 dark:bg-white/5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:border-blue-600/40 dark:hover:border-blue-400/40"
        >
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase">Members</span>
          <h2 className="text-base font-bold mt-1">학생회 인원</h2>
          <div className="flex items-baseline gap-1 mt-4">
            <span className="text-4xl font-black tabular-nums">{MEMBER_NAMES.length}</span>
            <span className="text-sm opacity-50">명</span>
          </div>
          <div className="flex items-center mt-4">
            {visibleMembers.map((name, idx) => (
              <span
                key={name}
                style={{ marginLeft: idx === 0 ? 0 : '-8px', zIndex: visibleMembers.length - idx }}
                className="relative w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 border-2 border-white dark:border-black flex items-center justify-center text-xs font-bold"
              >
                {name[0]}
              </span>
            ))}
            {remainingMembers > 0 && (
              <span
                style={{ marginLeft: '-8px' }}
                className="relative w-8 h-8 rounded-full bg-blue-600 text-white border-2 border-white dark:border-black flex items-center justify-center text-[10px] font-bold"
              >
                +{remainingMembers}
              </span>
            )}
          </div>
        </Link>

        {/* 정책 제안하러가기 */}
        <Link
          href="/policies/create"
          className="p-6 border border-black/10 dark:border-white/10 rounded-2xl bg-white/40 dark:bg-white/5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:border-blue-600/40 dark:hover:border-blue-400/40 flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase">Propose</span>
            <h2 className="text-base font-bold mt-1">정책 제안하기</h2>
            <p className="text-sm opacity-60 mt-3 leading-relaxed">
              학생회에 바라는 정책이나 개선 사항을 자유롭게 제안해 주세요.
            </p>
          </div>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-4 inline-flex items-center gap-1">
            제안하러 가기 →
          </span>
        </Link>
      </section>
    </main>
  );
}
