'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOAuth } from '@themoment-team/datagsm-oauth-react';

type PledgeStatus = '진행 중' | '시범 운영 중' | '완료';

interface Pledge {
  id: string;
  title: string;
  subStatus: string;
  status: PledgeStatus;
}

const STATUS_VALUES: PledgeStatus[] = ['진행 중', '시범 운영 중', '완료'];

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

const STATUS_OPTIONS = ['대기중', '검토중', '시행완료'];

const BTN_PRIMARY =
  'navy-surface dark:bg-blue-500 dark:bg-none text-white font-semibold hover:brightness-110 dark:hover:bg-blue-400 active:brightness-90 active:scale-95 transition';
const INPUT_CLASS =
  'w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 dark:border-white/20 focus:outline-navy dark:focus:outline-blue-400';

export default function AdminPage() {
  const searchParams = useSearchParams();
  const { login } = useOAuth();

  // DataGSM 계정 로그인 여부로만 접근을 판단함.
  // TODO: 백엔드에 임원 승인 여부를 확인하는 엔드포인트가 생기면, 로그인 여부만이 아니라
  // "로그인한 DataGSM 계정이 승인된 임원인지"까지 서버에 확인하도록 교체해야 함.
  // 그 전까지는 DataGSM 계정만 있으면(=재학생 누구나) 이 페이지에 들어올 수 있음.
  const isDataGsmLogged = searchParams.get('isLoggedIn') === 'true';

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

  const [progressPercent, setProgressPercent] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('sc_progress_percent');
    const parsed = saved ? Number(saved) : 0;
    return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 0;
  });
  const [percentInput, setPercentInput] = useState(String(progressPercent));

  const [commentDrafts, setCommentDrafts] = useState<{ [key: string]: string }>({});

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

  const handleSavePercent = () => {
    const value = Math.min(100, Math.max(0, Math.round(Number(percentInput) || 0)));
    setProgressPercent(value);
    setPercentInput(String(value));
    localStorage.setItem('sc_progress_percent', String(value));
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeletePledge = (pledgeId: string) => {
    if (confirm('이 공약을 삭제하시겠습니까?')) {
      savePledges(pledges.filter((p) => p.id !== pledgeId));
    }
  };

  const handleResetPledges = () => {
    if (confirm('모든 공약을 \'진행 중\' 상태로 초기화하시겠습니까?')) {
      const resetPledges = pledges.map((p) => ({ ...p, status: '진행 중' as PledgeStatus, subStatus: '' }));
      savePledges(resetPledges);
      alert('공약 진행 상황이 초기화되었습니다.');
    }
  };

  const handleUpdatePledgeStatus = (pledgeId: string, status: PledgeStatus) => {
    savePledges(pledges.map((p) => (p.id === pledgeId ? { ...p, status } : p)));
  };

  const handleUpdatePledgeSubStatus = (pledgeId: string, subStatus: string) => {
    setPledges(pledges.map((p) => (p.id === pledgeId ? { ...p, subStatus } : p)));
  };

  const handleBlurPledgeSubStatus = () => {
    localStorage.setItem('sc_pledges', JSON.stringify(pledges));
    window.dispatchEvent(new Event('storage'));
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

  // ------------------------------------------------------------- //
  // DataGSM 로그인 전
  // ------------------------------------------------------------- //
  if (!isDataGsmLogged) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm p-8 border border-black/10 dark:border-white/10 rounded-2xl space-y-5 bg-white/70 dark:bg-white/5">
          <h1 className="text-xl font-bold">관리자 인증</h1>
          <p className="text-xs opacity-50">학생회 관리자만 접근할 수 있는 페이지입니다.</p>
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem('sc_oauth_return_to', '/admin');
              login();
            }}
            className={`w-full py-3.5 text-sm rounded-xl ${BTN_PRIMARY}`}
          >
            DataGSM 계정으로 로그인하기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 pt-12 pb-24 space-y-8">
      <div className="pb-4 border-b border-black/10 dark:border-white/10">
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
      </div>

      <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('pledges')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeTab === 'pledges' ? 'navy-surface dark:bg-blue-500 dark:bg-none text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            공약 이행률
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeTab === 'issues' ? 'navy-surface dark:bg-blue-500 dark:bg-none text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
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
        <div className="space-y-6">
          <div className="p-4 border border-black/10 dark:border-white/10 rounded-xl bg-white/70 dark:bg-white/5 space-y-2">
            <span className="text-sm font-bold">정책 이행률 (%)</span>
            <p className="text-xs opacity-50">대시보드에 표시될 전체 이행률을 직접 입력해 주세요.</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={percentInput}
                onChange={(e) => setPercentInput(e.target.value)}
                className={`${INPUT_CLASS} max-w-[100px]`}
              />
              <span className="text-sm opacity-50">%</span>
              <button
                onClick={handleSavePercent}
                className={`px-4 py-2 text-xs rounded-lg ${BTN_PRIMARY}`}
              >
                저장
              </button>
            </div>
          </div>

          <div className="space-y-3">
          <p className="text-xs opacity-50">상태와 진행 상황 문구는 대시보드의 이행 현황 목록에 그대로 표시돼요.</p>
          {pledges.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 p-4 border border-black/10 dark:border-white/10 rounded-xl bg-white/70 dark:bg-white/5"
            >
              <span className="font-bold text-sm">{p.title}</span>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="text"
                  placeholder="진행 상황 (예: 3월 시행 완료)"
                  value={p.subStatus}
                  onChange={(e) => handleUpdatePledgeSubStatus(p.id, e.target.value)}
                  onBlur={handleBlurPledgeSubStatus}
                  className={`${INPUT_CLASS} sm:flex-1`}
                />

                <select
                  value={p.status}
                  onChange={(e) => handleUpdatePledgeStatus(p.id, e.target.value as PledgeStatus)}
                  className="p-2.5 text-sm border rounded-lg bg-transparent border-black/20 dark:border-white/20 focus:outline-navy dark:focus:outline-blue-400 shrink-0"
                >
                  {STATUS_VALUES.map((status) => (
                    <option key={status} value={status} className="text-black">
                      {status}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleDeletePledge(p.id)}
                  className="px-2 py-1 bg-red-500/10 text-red-600 text-xs font-semibold rounded-md hover:bg-red-500/20 transition shrink-0"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="space-y-6">
          {issues.length === 0 ? (
            <div className="min-h-[360px] flex items-center justify-center text-sm opacity-50">등록된 이슈가 없습니다.</div>
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
                          <span className="text-navy dark:text-blue-400">{c.author}</span>
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
                          ? 'navy-surface dark:bg-blue-500 dark:bg-none text-white border-transparent dark:border-blue-500 shadow-sm'
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
