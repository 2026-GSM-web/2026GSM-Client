'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type PledgeStatus = '진행 중' | '시범 운영 중' | '완료';

interface Pledge {
  id: string;
  title: string;
  subStatus: string;
  status: PledgeStatus;
}

const STATUS_VALUES: PledgeStatus[] = ['진행 중', '시범 운영 중', '완료'];

// localStorage에 예전 방식(done boolean 기반)의 데이터가 남아있을 수 있어
// status 값을 갖춘 유효한 형태인지 확인 후, 아니면 기본값으로 대체
function isValidPledges(data: unknown): data is Pledge[] {
  return (
    Array.isArray(data) &&
    data.every((p) => p && typeof p.title === 'string' && STATUS_VALUES.includes(p.status))
  );
}

const defaultPledges: Pledge[] = [
  { id: 'p1', title: 'AI 프로 지원', subStatus: '', status: '진행 중' },
  { id: 'p2', title: '전공 동아리 활성화', subStatus: '', status: '진행 중' },
  { id: 'p3', title: '교내 대회 개최', subStatus: '', status: '진행 중' },
  { id: 'p4', title: '지필평가 금요일로 변경', subStatus: '', status: '진행 중' },
];

// 학생회 조직 - 실제 명단
const PRESIDENT = { role: '학생회장', name: '한의준' };
const VICE_PRESIDENTS = [
  { role: '부회장', name: '박채은' },
  { role: '부회장', name: '김준수' },
];
const DEPARTMENTS = [
  { dept: '복지부', head: '정윤서', sub: '이다원' },
  { dept: '전공부', head: '정연돈', sub: '임서하' },
  { dept: '행기부', head: '이찬진', sub: '최형지' },
  { dept: '정통부', head: '정수진', sub: '이시우' },
  { dept: '문체부', head: '이진서', sub: '김민욱' },
  { dept: '생안부', head: '양은준', sub: '김승우' },
  { dept: '방송부', head: '김민선', sub: '송건호' },
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

  const [progressPercent, setProgressPercent] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('sc_progress_percent');
    const parsed = saved ? Number(saved) : 0;
    return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 0;
  });

  const [updatedAt] = useState(() => {
    if (typeof window === 'undefined') return '';
    const now = new Date();
    return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // 학생회 출범일(2026.07.16) 기준 D-day
  const [ddayText] = useState(() => {
    if (typeof window === 'undefined') return '';
    const launchDate = new Date('2026-07-16T00:00:00');
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfLaunch = new Date(launchDate.getFullYear(), launchDate.getMonth(), launchDate.getDate());
    const diffDays = Math.floor(
      (startOfToday.getTime() - startOfLaunch.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= 0 ? `D+${diffDays}` : `D-${Math.abs(diffDays)}`;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const savedPledges = localStorage.getItem('sc_pledges');
      if (savedPledges) {
        const parsed = JSON.parse(savedPledges);
        if (isValidPledges(parsed)) setPledges(parsed);
      }

      const savedPercent = localStorage.getItem('sc_progress_percent');
      if (savedPercent !== null) {
        const parsedPercent = Number(savedPercent);
        if (Number.isFinite(parsedPercent)) {
          setProgressPercent(Math.min(100, Math.max(0, parsedPercent)));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 스크롤 트리거 애니메이션 - clip-path가 없는 .reveal 섹션만 관찰하고,
  // 뷰포트에 들어오면 .is-revealed를 붙이고 벗어나면 다시 뗌(unobserve하지
  // 않음) - 위로 올렸다가 다시 내려도 매번 다시 재생되게 함. 안쪽의
  // .reveal-heading/.reveal-item은 CSS 자식 선택자로 연쇄 반응해서 같이
  // 드러남 - clip-path로 스스로를 가리는 요소를 직접 관찰 대상으로 삼으면
  // "화면에 들어옴" 판정 자체가 나지 않아 영영 숨어있게 됨(공약 목록이
  // 통째로 사라져 보이던 원인). 스크롤 위치를 매 프레임 추적해서 clip-path를
  // 계속 다시 계산하던 이전 방식도, 사용자가 정확한 스크롤 구간 안에서
  // 멈추지 않으면 중간에 잘린 채로 멈춰버리는 문제가 있었음
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-revealed', entry.isIntersecting);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const completedCount = pledges.filter((p) => p.status === '완료').length;

  return (
    <main>
      {/* 히어로 */}
      <section className="relative flex items-center min-h-screen overflow-hidden">
        {/* background-attachment: fixed로 헤더와 같은 뷰포트 기준 좌표를 써서
            스크롤 전(헤더가 사진 위에 있을 때) 이음새 없이 이어지게 함 */}
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: "url('/images/hero-school.webp')",
            backgroundPosition: 'center top',
            backgroundAttachment: 'fixed',
            animation: 'hero-zoom 20s ease-out forwards',
          }}
        />
        {/* 다크모드에서는 사진이 밝은 대낮 그대로라 페이지 톤과 붕 떠보여서,
            오버레이를 더 어둡고 진하게 깔아 나머지 다크 배경과 자연스럽게 이어지게 함 */}
        <div className="absolute inset-0 bg-[#33618a]/85 dark:bg-[#0a121c]/92" />
        <div className="relative max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 py-24 w-full">
          <div
            className="flex items-center gap-3 flex-wrap opacity-0"
            style={{ animation: 'fade-up 0.8s ease-out 0.1s forwards' }}
          >
            <span className="text-xs font-bold text-white/80 tracking-[0.2em] uppercase">
              2026 Student Council
            </span>
            {ddayText && (
              <span className="text-xs font-bold text-white tracking-[0.2em]">· {ddayText}</span>
            )}
          </div>
          <h1
            className="text-4xl sm:text-6xl font-black text-white mt-4 leading-tight opacity-0"
            style={{ animation: 'fade-up 0.8s ease-out 0.25s forwards' }}
          >
            Welcome to
            <br />
            GSM 학생회
          </h1>
          <div
            className="w-16 h-1 bg-white/70 rounded-full mt-6 opacity-0"
            style={{ animation: 'fade-up 0.8s ease-out 0.4s forwards' }}
          />
          <p
            className="text-sm sm:text-base text-white/80 mt-6 max-w-md leading-relaxed opacity-0"
            style={{ animation: 'fade-up 0.8s ease-out 0.5s forwards' }}
          >
            학생 한 사람의 목소리가 학교의 하루를 바꿉니다. 오늘의 학교를 함께 기록합니다.
          </p>
        </div>
      </section>

      {/* 소개 */}
      <section id="about" className="reveal scroll-mt-16 max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 py-20">
        <span className="text-xs font-bold text-navy/70 dark:text-blue-400 tracking-[0.2em] uppercase">
          소개
        </span>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-4">
          <h2 className="reveal-heading text-2xl sm:text-3xl font-black leading-snug">
            안녕하십니까,
            <br />
            2026학년도 GSM 학생회 회장단입니다
          </h2>
          <div className="space-y-4 text-sm sm:text-base opacity-80 leading-relaxed">
            <p>
              학생회는 학생을 대신해 말하는 조직이 아니라, 학생이 직접 말할 수 있는 통로를
              만드는 조직이라고 생각합니다. 그래서 저희는 새로운 행사를 늘리는 일보다, 이미
              불편했던 것들을 하나씩 정리하는 일에 먼저 집중하고 있습니다.
            </p>
            <p>
              학생들이 자주 마주하는 크고 작은 문제들을 기록하고, 진행 상황을 이 페이지에
              투명하게 공개합니다. 아래 공약 이행 현황은 학생회 회의 결과에 따라 수시로
              갱신됩니다.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-6 mt-2 border-t border-black/10 dark:border-white/10">
              <div>
                <div className="text-xs opacity-50">재학생</div>
                <div className="text-sm font-bold mt-1">1,024명</div>
              </div>
              <div>
                <div className="text-xs opacity-50">학생회 부서</div>
                <div className="text-sm font-bold mt-1">{DEPARTMENTS.length}개 부서</div>
              </div>
              <div>
                <div className="text-xs opacity-50">임기</div>
                <div className="text-sm font-bold mt-1">2026.03 - 2027.02</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 공약 이행 현황 */}
      <section id="pledges" className="reveal scroll-mt-16 max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 py-20">
        <span className="text-xs font-bold text-navy/70 dark:text-blue-400 tracking-[0.2em] uppercase">
          이행 현황
        </span>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mt-4">
          <h2 className="reveal-heading text-2xl sm:text-3xl font-black">우리의 약속, 지금까지</h2>
          <p className="text-xs sm:text-sm opacity-50">
            총 {pledges.length}개 공약 중 {completedCount}개 완료 · {updatedAt} 기준
          </p>
        </div>

        <div className="mt-8">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-black dark:text-white tabular-nums">
              {progressPercent}
            </span>
            <span className="text-2xl font-black text-black dark:text-white">%</span>
            <span className="text-sm opacity-50">전체 평균 이행률</span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-navy dark:bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-8 divide-y divide-black/10 dark:divide-white/10 border-t border-black/10 dark:border-white/10">
          {pledges.map((p, idx) => (
            <div
              key={p.id}
              className="reveal-item flex items-center justify-between gap-4 py-4"
              style={{ transitionDelay: `${Math.min(idx, 6) * 60}ms` }}
            >
              <div className="flex items-baseline gap-4 min-w-0">
                <span className="text-xs opacity-40 shrink-0 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate">{p.title}</p>
                  {p.subStatus && <p className="text-xs opacity-50 mt-0.5">{p.subStatus}</p>}
                </div>
              </div>
              <span className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-navy/10 text-navy border border-navy/20 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-400/30">
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 조직도 */}
      <section id="orgchart" className="reveal scroll-mt-16 max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 py-12">
        <span className="text-xs font-bold text-navy/70 dark:text-blue-400 tracking-[0.2em] uppercase">
          조직도
        </span>
        <h2 className="reveal-heading text-2xl sm:text-3xl font-black mt-4">학생회 조직 구성</h2>

        <div className="flex flex-col items-center mt-8">
          <div className="navy-surface text-white px-8 py-4 text-center shadow-sm">
            <div className="font-bold text-sm">{PRESIDENT.role}</div>
            <div className="text-xs text-white/70 mt-1">{PRESIDENT.name}</div>
          </div>

          <div className="w-px h-4 bg-black/15 dark:bg-white/15" />
          <div className="flex w-56">
            <div className="w-1/2 h-4 border-t border-r border-black/15 dark:border-white/15" />
            <div className="w-1/2 h-4 border-t border-l border-black/15 dark:border-white/15" />
          </div>

          <div className="flex gap-16 sm:gap-24">
            {VICE_PRESIDENTS.map((vp) => (
              <div
                key={vp.name}
                className="navy-surface text-white px-6 py-3 text-center shadow-sm"
              >
                <div className="font-bold text-sm">{vp.role}</div>
                <div className="text-xs text-white/70 mt-1">{vp.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {DEPARTMENTS.map((d) => (
            <div
              key={d.dept}
              className="p-4 border border-black/10 dark:border-white/10 text-center bg-white/70 dark:bg-white/5 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:border-navy/30 dark:hover:border-blue-400/40"
            >
              <div className="font-bold text-sm">{d.dept}</div>
              <div className="text-xs opacity-60 mt-2">{d.head} 부장</div>
              <div className="text-xs opacity-40 mt-0.5">{d.sub} 차장</div>
            </div>
          ))}
        </div>
      </section>

      {/* 정책 제안 CTA */}
      <section className="reveal max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 pb-12">
        <div className="rounded-2xl navy-surface text-white px-8 py-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">학생회에 바라는 점이 있나요?</h3>
            <p className="text-sm text-white/70 mt-1">자유롭게 제안해 주시면 검토 후 답변드립니다.</p>
          </div>
          <Link
            href="/policies/create"
            className="inline-block mt-6 sm:mt-0 px-6 py-3 bg-white text-navy font-semibold text-sm rounded-lg hover:bg-white/90 transition shrink-0"
          >
            건의하러 가기 →
          </Link>
        </div>
      </section>
    </main>
  );
}
