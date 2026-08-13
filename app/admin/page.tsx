'use client';

import { useState } from 'react';

interface HistoryItem {
  date: string;
  reason: string;
  delta: number;
}

interface Pledge {
  id: string;
  title: string;
  percent: number;
  color: string;
  history: HistoryItem[];
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

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [activeTab, setActiveTab] = useState<'pledges' | 'issues'>('pledges');

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

  const [issues, setIssues] = useState<Issue[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('sc_issues');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [selectedPledgeId, setSelectedPledgeId] = useState<string>(() => pledges[0]?.id || '');
  const [progressReason, setProgressReason] = useState('');
  const [progressPercent, setProgressPercent] = useState('');
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
    if (confirm('모든 공약 진행률을 0%로 초기화하시겠습니까?')) {
      const resetPledges = pledges.map((p) => ({
        ...p,
        percent: 0,
        history: [],
      }));
      savePledges(resetPledges);
      alert('공약 진행 상황이 0%로 초기화되었습니다.');
    }
  };

  const handleAddProgress = (e: React.FormEvent) => {
    e.preventDefault();
    const pct = parseInt(progressPercent, 10);
    if (!progressReason.trim() || isNaN(pct) || pct <= 0) return alert('올바른 사유와 퍼센트를 입력해 주세요.');

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

    const updated = pledges.map((p) => {
      if (p.id === selectedPledgeId) {
        return {
          ...p,
          percent: Math.min(100, p.percent + pct),
          history: [...p.history, { date: today, reason: progressReason.trim(), delta: pct }],
        };
      }
      return p;
    });

    savePledges(updated);
    setProgressReason('');
    setProgressPercent('');
    alert('공약 진행 상황이 반영되었습니다.');
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
        <div className="w-full max-w-sm p-8 border border-black/10 dark:border-white/10 rounded-2xl space-y-5 bg-black/5 dark:bg-white/5">
          <span className="text-xs font-bold text-amber-600 tracking-wider">ADMIN ACCESS</span>
          <h1 className="text-xl font-bold mt-1">관리자 인증</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="관리자 코드를 입력하세요"
              className="w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 dark:border-white/20 focus:outline-amber-600"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              autoFocus
            />
            {errorMessage && <p className="text-xs text-red-500 font-medium">{errorMessage}</p>}
            <button type="submit" className="w-full py-2.5 bg-amber-600 text-white font-semibold text-sm rounded-lg hover:bg-amber-700 transition">
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

      <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('pledges')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeTab === 'pledges' ? 'bg-amber-600 text-white' : 'hover:bg-black/5'}`}
          >
            공약 이행률 관리
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeTab === 'issues' ? 'bg-amber-600 text-white' : 'hover:bg-black/5'}`}
          >
            제안 및 답변 관리 ({issues.length})
          </button>
        </div>

        {activeTab === 'pledges' && (
          <button
            onClick={handleResetPledges}
            className="text-xs px-3 py-1.5 bg-red-500/10 text-red-600 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition font-medium"
          >
            전체 0%로 리셋
          </button>
        )}
      </div>

      {activeTab === 'pledges' && (
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8 items-start">
          <div className="space-y-4">
            <h2 className="text-lg font-bold">현재 공약 진행 현황</h2>
            {pledges.map((p) => (
              <div key={p.id} className="p-4 border border-black/10 dark:border-white/10 rounded-xl space-y-2 bg-black/5 dark:bg-white/5">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-sm">{p.title}</div>
                  <span className="text-sm font-black">{p.percent}%</span>
                </div>
                <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="h-full transition-all" style={{ width: `${p.percent}%`, backgroundColor: p.color }} />
                </div>
                {p.history.length === 0 ? (
                  <p className="text-xs opacity-40 pt-1">진행 기록이 없습니다.</p>
                ) : (
                  p.history.map((h, idx) => (
                    <div key={idx} className="text-xs opacity-60 flex justify-between pt-1">
                      <span>+{h.delta}% · {h.reason}</span>
                      <span>{h.date}</span>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddProgress} className="p-6 border border-black/10 dark:border-white/10 rounded-2xl space-y-4 bg-black/5 dark:bg-white/5 sticky top-24">
            <h3 className="font-bold text-base">진행 상황 추가</h3>
            <div>
              <label className="text-xs font-semibold block mb-1">공약 선택</label>
              <select
                className="w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 dark:border-white/20"
                value={selectedPledgeId}
                onChange={(e) => setSelectedPledgeId(e.target.value)}
              >
                {pledges.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-zinc-800">{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">사유 (필수)</label>
              <textarea
                rows={3}
                placeholder="진행 내용을 작성하세요"
                className="w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 dark:border-white/20"
                value={progressReason}
                onChange={(e) => setProgressReason(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">추가할 퍼센트 (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                placeholder="예: 10"
                className="w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 dark:border-white/20"
                value={progressPercent}
                onChange={(e) => setProgressPercent(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full py-2.5 bg-amber-600 text-white font-semibold text-sm rounded-lg hover:bg-amber-700 transition">
              + 진행 상황 반영하기
            </button>
          </form>
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="space-y-6">
          {issues.length === 0 ? (
            <div className="text-center py-12 text-sm opacity-50">등록된 이슈가 없습니다.</div>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="p-5 border border-black/10 dark:border-white/10 rounded-xl space-y-4 bg-black/5 dark:bg-white/5">
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
                      <div key={c.id} className="p-3 bg-black/5 dark:bg-white/5 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="text-amber-600">{c.author}</span>
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
                    className="px-4 py-2 bg-amber-600 text-white font-semibold text-xs rounded-lg hover:bg-amber-700 transition"
                  >
                    답변 등록
                  </button>
                </div>

                <div className="flex gap-2 text-xs pt-1 items-center">
                  <span className="opacity-50 font-medium">상태 변경:</span>
                  
                  <button
                    onClick={() => handleUpdateStatus(issue.id, '대기중')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                      issue.status === '대기중'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'border-black/20 dark:border-white/20 hover:bg-black/5 opacity-70'
                    }`}
                  >
                    대기중
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(issue.id, '검토중')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                      issue.status === '검토중'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'border-black/20 dark:border-white/20 hover:bg-black/5 opacity-70'
                    }`}
                  >
                    검토중
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(issue.id, '시행완료')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                      issue.status === '시행완료'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'border-black/20 dark:border-white/20 hover:bg-black/5 opacity-70'
                    }`}
                  >
                    시행완료
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}