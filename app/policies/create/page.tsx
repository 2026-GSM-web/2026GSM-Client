'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { startDataGsmLogin } from '@/lib/auth';
import { useAuth } from '@/app/auth-provider';
import { ApiError, STATUS_LABELS, Suggestion, createSuggestion, getMySuggestions } from '@/lib/api';

const DEPARTMENTS = [
  '회장단',
  '학생생활안전부',
  '전공부',
  '복지부',
  '문화체육부',
  '정보통신부',
  '방송부',
  '행사기획부',
];

function statusBadgeClass(status: Suggestion['status']) {
  const base = 'text-xs px-2.5 py-0.5 rounded-full font-bold border inline-block shrink-0';
  if (status === 'RESOLVED') return `${base} bg-emerald-500/10 text-emerald-600 border-emerald-500/30`;
  if (status === 'REJECTED') return `${base} bg-red-500/10 text-red-600 border-red-500/30`;
  return `${base} bg-navy/10 text-navy border-navy/30 dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/30`;
}

export default function CreatePolicyPage() {
  const router = useRouter();

  // 로그인 상태는 토큰 기반 AuthProvider에서 가져옴 (새로고침·직접 접속에도 유지됨)
  const { status } = useAuth();
  const isLogged = status === 'authed';

  const [form, setForm] = useState({
    dept: DEPARTMENTS[0],
    title: '',
    body: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // 'loading': 내 제안 이력 확인 중, 'myIssues': 이미 제안한 게 있으면 목록부터 표시,
  // 'form': 새 정책 제안 작성 폼
  const [mode, setMode] = useState<'loading' | 'myIssues' | 'form'>('loading');
  const [myIssues, setMyIssues] = useState<Suggestion[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLogged) return;

    let cancelled = false;

    getMySuggestions(0, 5)
      .then((page) => {
        if (cancelled) return;
        if (page.content.length > 0) {
          setMyIssues(page.content);
          setMode('myIssues');
        } else {
          setMode('form');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof ApiError ? err.message : '내 제안 목록을 불러오지 못했습니다.');
        setMode('form');
      });

    return () => {
      cancelled = true;
    };
  }, [isLogged]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.body) {
      return alert('제목과 내용을 입력해주세요.');
    }

    setSubmitting(true);
    try {
      await createSuggestion({
        title: form.title,
        content: `관련 부서: ${form.dept}\n\n${form.body}`,
      });
      alert('정책 제안이 성공적으로 등록되었습니다.');
      router.push('/');
    } catch (err) {
      alert(err instanceof ApiError ? err.message : '제안 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------- //
  // 0. 아직 로그인 상태 확인 중 (토큰 검증)
  // ------------------------------------------------------------- //
  if (status === 'loading') {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <p className="text-sm opacity-50">불러오는 중...</p>
      </main>
    );
  }

  // ------------------------------------------------------------- //
  // 1. 로그인 전: 콜백 에러 화면과 동일하게 화면 중앙에 로그인 유도 카드만 표시
  // ------------------------------------------------------------- //
  if (!isLogged) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="p-8 border border-black/10 dark:border-white/10 rounded-2xl space-y-5 bg-white/70 dark:bg-white/5">
            <h1 className="text-2xl font-bold mb-3">정책 제안하기</h1>
            <p className="text-sm text-zinc-500 mb-8">
              학생회 정책 제안을 작성하려면 DataGSM 계정 로그인이 필요합니다.
            </p>
            <button
              type="button"
              onClick={() => startDataGsmLogin('/policies/create')}
              className="w-full py-3.5 navy-surface dark:bg-blue-500 dark:bg-none text-white font-semibold text-sm rounded-xl hover:brightness-110 dark:hover:bg-blue-400 transition"
            >
              DataGSM 계정으로 로그인하기
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ------------------------------------------------------------- //
  // 2. 로그인 후, 내 제안 이력 확인 중
  // ------------------------------------------------------------- //
  if (mode === 'loading') {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <p className="text-sm opacity-50">불러오는 중...</p>
      </main>
    );
  }

  // ------------------------------------------------------------- //
  // 3. 이미 제안한 정책이 있으면: 팝업 형태로 내 제안 목록 + 답변 먼저 표시
  // ------------------------------------------------------------- //
  if (mode === 'myIssues') {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="p-8 border border-black/10 dark:border-white/10 rounded-2xl space-y-5 bg-white/70 dark:bg-white/5">
            <div>
              <h1 className="text-2xl font-bold mb-2">이미 제안한 정책이 있어요</h1>
              <p className="text-sm text-zinc-500">
                지금까지 제안한 정책과 학생회 답변을 확인해 보세요.
              </p>
            </div>

            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
              {myIssues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/policies/${issue.id}`}
                  className="block p-4 border border-black/10 dark:border-white/10 rounded-xl hover:border-navy/50 dark:hover:border-blue-400/50 transition space-y-1.5"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={statusBadgeClass(issue.status)}>{STATUS_LABELS[issue.status]}</span>
                    {issue.createdAt && (
                      <span className="text-xs opacity-40 shrink-0">{issue.createdAt.slice(0, 10)}</span>
                    )}
                  </div>
                  <p className="font-bold text-sm">{issue.title}</p>
                  {issue.adminReply ? (
                    <p className="text-xs opacity-60 line-clamp-2">
                      <span className="font-semibold text-navy dark:text-blue-400">학생회</span>:{' '}
                      {issue.adminReply}
                    </p>
                  ) : (
                    <p className="text-xs opacity-40">아직 학생회 답변이 등록되지 않았어요.</p>
                  )}
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMode('form')}
              className="w-full py-3.5 navy-surface dark:bg-blue-500 dark:bg-none text-white font-semibold text-sm rounded-xl hover:brightness-110 dark:hover:bg-blue-400 transition"
            >
              + 또 다른 정책 제안하기
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ------------------------------------------------------------- //
  // 4. 정책 제안 작성 폼 표시 (처음 제안하거나, 위 팝업에서 새로 제안을 선택한 경우)
  // ------------------------------------------------------------- //
  return (
    <main className="max-w-xl mx-auto px-6 py-12">
      <button
        onClick={() => router.back()}
        className="text-xs opacity-60 mb-6 hover:opacity-100"
      >
        ← 목록으로
      </button>

      <h1 className="text-2xl font-bold mb-6">정책 제안</h1>
      {loadError && <p className="text-xs text-red-500 mb-4">{loadError}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1">
                관련 부서
              </label>
              <select
                className="w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 focus:outline-navy dark:focus:outline-blue-400"
                value={form.dept}
                onChange={(e) => setForm({ ...form, dept: e.target.value })}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d} className="dark:bg-zinc-800">
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">제목</label>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                className="w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 focus:outline-navy dark:focus:outline-blue-400"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">내용</label>
              <textarea
                rows={5}
                placeholder="내용을 자세히 작성해 주세요"
                className="w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 focus:outline-navy dark:focus:outline-blue-400"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 navy-surface dark:bg-blue-500 dark:bg-none text-white font-semibold text-sm rounded-lg hover:brightness-110 dark:hover:bg-blue-400 transition disabled:opacity-50"
            >
              {submitting ? '등록 중...' : '제안 등록하기'}
            </button>
      </form>
    </main>
  );
}
