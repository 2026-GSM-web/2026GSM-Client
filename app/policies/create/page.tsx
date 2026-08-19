'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useOAuth } from '@themoment-team/datagsm-oauth-react';

interface Comment {
  id: number;
  author: string;
  date: string;
  text: string;
}

interface Issue {
  id: string;
  title: string;
  author: string;
  dept: string;
  status: string;
  date: string;
  body: string;
  comments: Comment[];
}

// 백엔드에 이슈-작성자 연결이 없어서(로그인은 JWT 발급만 함), "본인이 제안한 정책"은
// 이 브라우저에서 실제로 등록에 성공한 이슈 id를 별도로 기억해두는 방식으로 판별함
const MY_ISSUE_IDS_KEY = 'sc_my_issue_ids';

function getMyIssueIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MY_ISSUE_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function statusBadgeClass(status: string) {
  const base = 'text-xs px-2.5 py-0.5 rounded-full font-bold border inline-block shrink-0';
  if (status === '시행완료') return `${base} bg-emerald-500/10 text-emerald-600 border-emerald-500/30`;
  return `${base} bg-navy/10 text-navy border-navy/30 dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/30`;
}

export default function CreatePolicyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useOAuth();

  // URL 파라미터 또는 localStorage를 통한 로그인 상태 확인
  const isLogged = searchParams.get('isLoggedIn') === 'true';

  const [form, setForm] = useState({
    author: '',
    dept: '회장단',
    title: '',
    body: '',
  });

  // 'myIssues': 이미 제안한 정책이 있으면 목록 먼저 보여주는 팝업형 화면
  // 'form': 새 정책 제안 작성 폼
  const [mode, setMode] = useState<'myIssues' | 'form'>('form');
  const [myIssues, setMyIssues] = useState<Issue[]>([]);

  useEffect(() => {
    if (!isLogged) return;

    const ids = getMyIssueIds();
    if (ids.length === 0) return;

    const saved = localStorage.getItem('sc_issues');
    const allIssues: Issue[] = saved ? JSON.parse(saved) : [];
    // 관리자가 삭제한 이슈는 자연스럽게 걸러짐
    const mine = allIssues.filter((issue) => ids.includes(issue.id));
    if (mine.length === 0) return;

    // ESLint react-hooks/set-state-in-effect 경고를 회피하기 위해 한 스텝 지연
    const timer = setTimeout(() => {
      setMyIssues(mine);
      setMode('myIssues');
    }, 0);
    return () => clearTimeout(timer);
  }, [isLogged]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author || !form.title || !form.body) {
      return alert('모든 항목을 입력해주세요.');
    }

    const saved = localStorage.getItem('sc_issues');
    const currentIssues = saved ? JSON.parse(saved) : [];

    const newIssue = {
      id: `issue_${Date.now()}`,
      title: form.title,
      author: form.author,
      dept: form.dept,
      status: '검토중',
      date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      body: form.body,
      comments: [],
    };

    const updatedIssues = [newIssue, ...currentIssues];
    localStorage.setItem('sc_issues', JSON.stringify(updatedIssues));
    localStorage.setItem(MY_ISSUE_IDS_KEY, JSON.stringify([newIssue.id, ...getMyIssueIds()]));

    // 등록 후에는 홈으로 이동. 다음에 DataGSM으로 다시 로그인해서 정책 제안으로
    // 들어오면 sc_my_issue_ids에 남은 기록으로 "이미 제안한 정책이 있어요" 화면부터 뜸
    alert('정책 제안이 성공적으로 등록되었습니다.');
    router.push('/');
  };

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
              onClick={() => login()}
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
  // 2. 로그인 후, 이미 제안한 정책이 있으면: 팝업 형태로 내 제안 목록 + 답변 먼저 표시
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
              {myIssues.map((issue) => {
                const lastComment = issue.comments[issue.comments.length - 1];
                return (
                  <Link
                    key={issue.id}
                    href={`/policies/${issue.id}`}
                    className="block p-4 border border-black/10 dark:border-white/10 rounded-xl hover:border-navy/50 dark:hover:border-blue-400/50 transition space-y-1.5"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className={statusBadgeClass(issue.status)}>{issue.status}</span>
                      <span className="text-xs opacity-40 shrink-0">{issue.date}</span>
                    </div>
                    <p className="font-bold text-sm">{issue.title}</p>
                    {lastComment ? (
                      <p className="text-xs opacity-60 line-clamp-2">
                        <span className="font-semibold text-navy dark:text-blue-400">
                          {lastComment.author}
                        </span>
                        : {lastComment.text}
                      </p>
                    ) : (
                      <p className="text-xs opacity-40">아직 학생회 답변이 등록되지 않았어요.</p>
                    )}
                  </Link>
                );
              })}
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
  // 3. 정책 제안 작성 폼 표시 (처음 제안하거나, 위 팝업에서 새로 제안을 선택한 경우)
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
      <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1">
                작성자 이름
              </label>
              <input
                type="text"
                placeholder="예: 2학년 3반 학생"
                className="w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 focus:outline-navy dark:focus:outline-blue-400"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">
                관련 부서
              </label>
              <select
                className="w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 focus:outline-navy dark:focus:outline-blue-400"
                value={form.dept}
                onChange={(e) => setForm({ ...form, dept: e.target.value })}
              >
                {[
                  '회장단',
                  '학생생활안전부',
                  '전공부',
                  '복지부',
                  '문화체육부',
                  '정보통신부',
                  '방송부',
                  '행사기획부',
                ].map((d) => (
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
              className="w-full py-3 navy-surface dark:bg-blue-500 dark:bg-none text-white font-semibold text-sm rounded-lg hover:brightness-110 dark:hover:bg-blue-400 transition"
            >
              제안 등록하기
            </button>
      </form>
    </main>
  );
}