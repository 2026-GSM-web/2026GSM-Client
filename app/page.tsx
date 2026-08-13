'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Pledge {
  id: string;
  title: string;
  percent: number;
  color: string;
  history: { date: string; reason: string; delta: number }[];
}

export default function MainPage() {
  const [pledges, setPledges] = useState<Pledge[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('sc_pledges');
    if (saved) return JSON.parse(saved);

    const defaultPledges: Pledge[] = [
      { id: 'p1', title: 'AI 프로 지원', percent: 0, color: '#3b82f6', history: [] },
      { id: 'p2', title: '전공 동아리 활성화', percent: 0, color: '#10b981', history: [] },
      { id: 'p3', title: '교내 대회 개최', percent: 0, color: '#f59e0b', history: [] },
      { id: 'p4', title: '지필평가 금요일로 변경', percent: 0, color: '#8b5cf6', history: [] },
    ];
    localStorage.setItem('sc_pledges', JSON.stringify(defaultPledges));
    return defaultPledges;
  });

  const [ddayText, setDdayText] = useState<string>('');

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sc_pledges');
      if (saved) setPledges(JSON.parse(saved));
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

  const avgPercent = pledges.length > 0
    ? Math.min(100, Math.round(pledges.reduce((acc, cur) => acc + cur.percent, 0) / pledges.length))
    : 0;

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <section className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-end pb-12 border-b border-black/10 dark:border-white/10">
        <div className="space-y-6">
          <h1 className="text-5xl font-extrabold leading-tight">학생과 함께,<br />약속을 지키는 학생회</h1>
          <p className="text-base opacity-75 max-w-lg">공약의 진행 상황을 투명하게 공개하고, 모든 학생의 목소리가 정책이 되는 과정을 함께 만들어갑니다.</p>
          <div className="flex gap-3">
            {/* 👇 다크모드 분기 클래스(dark:bg-white dark:text-black)를 제거하고 주황색(amber-600) 스타일로 고정했습니다. */}
            <a 
              href="#pledges-section" 
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-sm transition"
            >
              공약 이행률 보기 →
            </a>
            <Link href="/policies/create" className="px-5 py-2.5 border border-black/20 dark:border-white/20 rounded-lg text-sm hover:bg-black/5 dark:hover:bg-white/5 transition">
              정책 제안하기
            </Link>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs tracking-widest opacity-60 block uppercase">학생회 출범</span>
          <span className="text-7xl font-black text-amber-600 leading-none min-h-[72px] block">{ddayText}</span>
        </div>
      </section>

      <section id="pledges-section" className="py-16">
        <span className="text-xs font-bold text-amber-600 tracking-wider">TRANSPARENCY</span>
        <h2 className="text-2xl font-bold mt-1">공약 이행률</h2>

        <div className="mt-8 p-8 border border-black/10 dark:border-white/10 rounded-xl bg-black/5 dark:bg-white/5 space-y-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black">{avgPercent}</span>
            <span className="text-xl opacity-60">%</span>
            <span className="text-xs opacity-50 ml-2">평균 공약 이행률</span>
          </div>

          {/* 공약별 진행도 프로그레스 바 */}
          <div className="flex h-8 w-full bg-black/10 dark:bg-white/10 rounded-md overflow-hidden">
            {pledges.map((p) => (
              <div 
                key={p.id} 
                style={{ width: `${p.percent / pledges.length}%`, backgroundColor: p.color }} 
                className="h-full transition-all duration-300" 
                title={`${p.title}: ${p.percent}%`} 
              />
            ))}
          </div>

          {/* 공약 카드 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pledges.map((p) => {
              const lastHistory = p.history[p.history.length - 1];
              return (
                <div key={p.id} className="p-4 border border-black/10 dark:border-white/10 rounded-lg space-y-2 bg-black/5 dark:bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-bold text-sm">{p.title}</span>
                  </div>
                  <div className="text-xs opacity-60">
                    <span className="font-semibold text-black dark:text-white">{p.percent}%</span>
                    {lastHistory ? ` · 최근 ${lastHistory.date}` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}