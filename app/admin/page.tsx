'use client';

import { useState } from 'react';

interface Pledge {
  id: string;
  title: string;
  color: string;
  done: boolean;
  completedAt?: string;
}

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

// localStorage에 예전 방식(percent/items 기반)의 데이터가 남아있을 수 있어
// done 값을 갖춘 유효한 형태인지 확인 후, 아니면 기본값으로 대체
function isValidPledges(data: unknown): data is Pledge[] {
  return Array.isArray(data) && data.every((p) => p && typeof p.done === 'boolean');
}

const defaultPledges: Pledge[] = [
  { id: 'p1', title: 'AI 프로 지원', color: '#3b82f6', done: false },
  { id: 'p2', title: '전공 동아리 활성화', color: '#10b981', done: false },
  { id: 'p3', title: '교내 대회 개최', color: '#f59e0b', done: false },
  { id: 'p4', title: '지필평가 금요일로 변경', color: '#8b5cf6', done: false },
];

const STATUS_OPTIONS = ['대기중', '검토중', '시행완료'];

const BTN_PRIMARY =
  'bg-blue-600 dark:bg-blue-500 text-white font-semibold hover:bg-blue-700 dark:hover:bg-blue-400 transition';
const INPUT_CLASS =
  'w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 dark:border-white/20 focus:outline-blue-600 dark:focus:outline-blue-400';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [activeTab, setActiveTab] = useState<'pledges' | 'issues'>('pledges');

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

  const [issues, setIssues] = useState<Issue[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('sc_issues');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [commentDrafts, setCommentDrafts] = useState<{ [key: string]: string }>({});

  const VALID_CODES = ['gsm1!!', 'gsm2!!', 'gsm3!!'];

  const savePledges = (newPledges: Pledge[]) => {
    setPledges(newPledges);
    localStorage.setItem('sc_pledges', JSON.stringify(newPledges));
    window.dispatchEvent(new Event('storage'));
  };

  const saveIssues = (newIssues: Issue[]) => {
    setIssues(newIssues);
    localStorage.setItem('sc_issues', JSON.stringify(newIssues));
    window.dispatchEvent(new Event('storage'));
  };

  const handleResetPledges = () => {
    if (confirm('모든 공약을 이행 전 상태로 초기화하시겠습니까?')) {
      const resetPledges = pledges.map((p) => ({ ...p, done: false, completedAt: undefined }));
      savePledges(resetPledges);
      alert('공약 진행 상황이 초기화되었습니다.');
    }
  };

  const handleTogglePledge = (pledgeId: string) => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

    const updated = pledges.map((p) =>
      p.id === pledgeId
        ? { ...p, done: !p.done, completedAt: !p.done ? today : undefined }
        : p
    );

    savePledges(updated);
  };

  const handleDeleteIssue = (id: string) => {
    if (confirm('이 이슈를 삭제하시겠습니까?')) {
      saveIssues(issues.filter((i) => i.id !== id));
    }
  };

  const handleAddComment = (issueId: string) => {
    const text = commentDrafts[issueId]?.trim();
    if (!text) return alert('답변 내용을 입력해 주세요.');

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

    const updated = issues.map((i) => {
      if (i.id === issueId) {
        return {
          ...i,
          comments: [...i.comments, { id: Date.now(), author: '회장단', date: today, text }],
        };
      }
      return i;
    });

    saveIssues(updated);
    setCommentDrafts({ ...commentDrafts, [issueId]: '' });
    alert('\'회장단\' 답변이 등록되었습니다.');
  };

  const handleUpdateStatus = (issueId: string, newStatus: string) => {
    saveIssues(issues.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_CODES.includes(accessCode.trim())) {
      setIsLoggedIn(true);
      setErrorMessage('');
      setAccessCode('');
    } else {
      setErrorMessage('유효하지 않은 관리자 코드입니다.');
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm p-8 border border-black/10 dark:border-white/10 rounded-2xl space-y-5 bg-white/70 dark:bg-white/5">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider">ADMIN ACCESS</span>
          <h1 className="text-xl font-bold mt-1">관리자 인증</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="관리자 코드를 입력하세요"
              className={INPUT_CLASS}
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              autoFocus
            />
            {errorMessage && <p className="text-xs text-red-500 font-medium">{errorMessage}</p>}
            <button type="submit" className={`w-full py-2.5 text-sm rounded-lg ${BTN_PRIMARY}`}>
              인증하고 들어가기
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div className="pb-4 border-b border-black/10 dark:border-white/10">
        <h1 className="text-2xl font-bold">🔒 관리자 대시보드</h1>
      </div>

      <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('pledges')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeTab === 'pledges' ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            공약 이행률
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeTab === 'issues' ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            제안 및 답변 ({issues.length})
          </button>
        </div>

        {activeTab === 'pledges' && (
          <button
            onClick={handleResetPledges}
            className="text-xs px-3 py-1.5 bg-red-500/10 text-red-600 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition font-medium"
          >
            전체 이행 전으로 리셋
          </button>
        )}
      </div>

      {activeTab === 'pledges' && (
        <div className="space-y-3">
          <p className="text-xs opacity-50">이행 체크를 하면 그 공약은 &apos;이행함&apos;으로 표시되고, 대시보드 이행률에 반영돼요.</p>
          {pledges.map((p) => (
            <label
              key={p.id}
              className="flex items-center justify-between gap-3 p-4 border border-black/10 dark:border-white/10 rounded-xl bg-white/70 dark:bg-white/5 cursor-pointer"
            >
              <span className="flex items-center gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={p.done}
                  onChange={() => handleTogglePledge(p.id)}
                  className="w-4 h-4 shrink-0 accent-blue-600"
                />
                <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-black/30 dark:bg-white/30" />
                <span className="font-bold text-sm truncate">{p.title}</span>
              </span>
              <span className="flex items-center gap-3 shrink-0">
                {p.done && p.completedAt && (
                  <span className="text-xs opacity-40">{p.completedAt}</span>
                )}
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    p.done
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-black/5 dark:bg-white/10 opacity-50'
                  }`}
                >
                  {p.done ? '이행함' : '미이행'}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="space-y-6">
          {issues.length === 0 ? (
            <div className="text-center py-12 text-sm opacity-50">등록된 이슈가 없습니다.</div>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="p-5 border border-black/10 dark:border-white/10 rounded-xl space-y-4 bg-white/70 dark:bg-white/5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-black/20 font-medium">{issue.status}</span>
                    <h3 className="font-bold text-base mt-2">{issue.title}</h3>
                    <p className="text-xs opacity-50 mt-0.5">{issue.dept} · {issue.author} · {issue.date}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteIssue(issue.id)}
                    className="px-3 py-1 bg-red-500/10 text-red-600 text-xs font-semibold rounded-md hover:bg-red-500/20 transition"
                  >
                    삭제
                  </button>
                </div>

                <p className="text-sm opacity-80 whitespace-pre-line">{issue.body}</p>

                {issue.comments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
                    <span className="text-xs font-bold opacity-60">등록된 답변</span>
                    {issue.comments.map((c) => (
                      <div key={c.id} className="p-3 bg-white/70 dark:bg-white/5 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="text-blue-600 dark:text-blue-400">{c.author}</span>
                          <span className="opacity-40">{c.date}</span>
                        </div>
                        <p>{c.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="'회장단' 이름으로 답변 작성을 입력하세요"
                    className="flex-1 p-2 text-xs border rounded-lg bg-transparent border-black/20 dark:border-white/20"
                    value={commentDrafts[issue.id] || ''}
                    onChange={(e) => setCommentDrafts({ ...commentDrafts, [issue.id]: e.target.value })}
                  />
                  <button
                    onClick={() => handleAddComment(issue.id)}
                    className={`px-4 py-2 text-xs rounded-lg ${BTN_PRIMARY}`}
                  >
                    답변 등록
                  </button>
                </div>

                <div className="flex gap-2 text-xs pt-1 items-center flex-wrap">
                  <span className="opacity-50 font-medium">상태 변경:</span>
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(issue.id, status)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        issue.status === status
                          ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-sm'
                          : 'border-black/20 dark:border-white/20 hover:bg-black/5 opacity-70'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </main>
  );
}
