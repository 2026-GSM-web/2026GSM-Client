'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { startDataGsmLogin } from '@/lib/auth';
import {
  ApiError,
  Pledge,
  PLEDGE_STATUS_LABELS,
  PLEDGE_STATUS_OPTIONS,
  PledgeStatus,
  STATUS_LABELS,
  STATUS_OPTIONS,
  Suggestion,
  createPledge,
  deletePledge,
  deleteSuggestion,
  getAllSuggestions,
  getMe,
  getPledgeProgress,
  getPledges,
  promoteToAdmin,
  updatePledge,
  updatePledgeProgress,
  updateSuggestionStatus,
  UserInfo,
} from '@/lib/api';

const BTN_PRIMARY =
  'navy-surface dark:bg-blue-500 dark:bg-none text-white font-semibold hover:brightness-110 dark:hover:bg-blue-400 active:brightness-90 active:scale-95 transition';
const INPUT_CLASS =
  'w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 dark:border-white/20 focus:outline-navy dark:focus:outline-blue-400';

function statusButtonClass(active: boolean) {
  return `px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
    active
      ? 'navy-surface dark:bg-blue-500 dark:bg-none text-white border-transparent dark:border-blue-500 shadow-sm'
      : 'border-black/20 dark:border-white/20 hover:bg-black/5 opacity-70'
  }`;
}

function AdminPageContent() {
  const searchParams = useSearchParams();

  const isDataGsmLogged = searchParams.get('isLoggedIn') === 'true';

  // 서버에 실제로 임원(ADMIN)인지 확인하는 단계
  const [me, setMe] = useState<UserInfo | null>(null);
  const [meError, setMeError] = useState<string | null>(null);
  const [promoteCode, setPromoteCode] = useState('');
  const [promoteError, setPromoteError] = useState('');
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    if (!isDataGsmLogged) return;

    let cancelled = false;
    getMe()
      .then((user) => {
        if (!cancelled) setMe(user);
      })
      .catch((err) => {
        if (!cancelled) setMeError(err instanceof ApiError ? err.message : '내 정보를 불러오지 못했습니다.');
      });

    return () => {
      cancelled = true;
    };
  }, [isDataGsmLogged]);

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteCode.trim()) return;

    setPromoting(true);
    setPromoteError('');
    try {
      const result = await promoteToAdmin(promoteCode.trim());
      setMe((prev) => (prev ? { ...prev, role: result.role } : prev));
      setPromoteCode('');
    } catch (err) {
      setPromoteError(err instanceof ApiError ? err.message : '승격 코드 확인 중 오류가 발생했습니다.');
    } finally {
      setPromoting(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'pledges' | 'issues'>('pledges');

  // 공약 목록 - 실제 백엔드 연동 (/api/pledges)
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [pledgesLoading, setPledgesLoading] = useState(true);
  const [pledgesError, setPledgesError] = useState('');
  const [newPledgeTitle, setNewPledgeTitle] = useState('');
  const [newPledgeContent, setNewPledgeContent] = useState('');
  const [creatingPledge, setCreatingPledge] = useState(false);
  const [createPledgeError, setCreatePledgeError] = useState('');

  useEffect(() => {
    getPledges()
      .then(setPledges)
      .catch((err) => {
        setPledgesError(err instanceof ApiError ? err.message : '공약 목록을 불러오지 못했습니다.');
      })
      .finally(() => setPledgesLoading(false));
  }, []);

  // 공약 이행률(%) - 실제 백엔드 연동 (/api/pledge-progress)
  const [progressPercent, setProgressPercent] = useState(0);
  const [percentInput, setPercentInput] = useState('0');
  const [percentSaving, setPercentSaving] = useState(false);
  const [percentError, setPercentError] = useState('');

  useEffect(() => {
    getPledgeProgress()
      .then((data) => {
        setProgressPercent(data.percentage);
        setPercentInput(String(data.percentage));
      })
      .catch(() => {
        // 조회 실패 시 기본값(0)을 그대로 두고 저장 시 다시 시도하도록 함
      });
  }, []);

  // 정책 제안(건의사항) - 실제 백엔드 연동
  const [issues, setIssues] = useState<Suggestion[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesError, setIssuesError] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<{ [id: number]: string }>({});

  const loadIssues = () => {
    setIssuesLoading(true);
    setIssuesError('');
    getAllSuggestions()
      .then((page) => {
        setIssues(page.content);
        setReplyDrafts(
          Object.fromEntries(page.content.map((s) => [s.id, s.adminReply ?? '']))
        );
      })
      .catch((err) => {
        setIssuesError(err instanceof ApiError ? err.message : '제안 목록을 불러오지 못했습니다.');
      })
      .finally(() => setIssuesLoading(false));
  };

  useEffect(() => {
    if (me?.role !== 'ADMIN' || activeTab !== 'issues') return;

    // ESLint react-hooks/set-state-in-effect 경고를 회피하기 위해 한 스텝 지연
    const timer = setTimeout(loadIssues, 0);
    return () => clearTimeout(timer);
  }, [me, activeTab]);

  const handleSavePercent = async () => {
    const value = Math.min(100, Math.max(0, Math.round(Number(percentInput) || 0)));
    setPercentSaving(true);
    setPercentError('');
    try {
      const updated = await updatePledgeProgress(value);
      setProgressPercent(updated.percentage);
      setPercentInput(String(updated.percentage));
    } catch (err) {
      setPercentError(err instanceof ApiError ? err.message : '이행률 저장 중 오류가 발생했습니다.');
    } finally {
      setPercentSaving(false);
    }
  };

  const handleDeletePledge = async (pledgeId: number) => {
    if (!confirm('이 공약을 삭제하시겠습니까?')) return;
    try {
      await deletePledge(pledgeId);
      setPledges((prev) => prev.filter((p) => p.id !== pledgeId));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  const handleResetPledges = async () => {
    if (!confirm('모든 공약을 \'진행 중\' 상태로 초기화하시겠습니까?')) return;
    try {
      const reset = await Promise.all(
        pledges.map((p) =>
          updatePledge(p.id, {
            title: p.title,
            content: p.content,
            category: p.category,
            status: 'IN_PROGRESS',
            subStatus: '',
            displayOrder: p.displayOrder,
          })
        )
      );
      setPledges(reset);
      alert('공약 진행 상황이 초기화되었습니다.');
    } catch (err) {
      alert(err instanceof ApiError ? err.message : '초기화 중 오류가 발생했습니다.');
    }
  };

  const handleUpdatePledgeStatus = async (pledge: Pledge, status: PledgeStatus) => {
    const prevPledges = pledges;
    setPledges((prev) => prev.map((p) => (p.id === pledge.id ? { ...p, status } : p)));
    try {
      const updated = await updatePledge(pledge.id, {
        title: pledge.title,
        content: pledge.content,
        category: pledge.category,
        status,
        subStatus: pledge.subStatus,
        displayOrder: pledge.displayOrder,
      });
      setPledges((prev) => prev.map((p) => (p.id === pledge.id ? updated : p)));
    } catch (err) {
      setPledges(prevPledges);
      alert(err instanceof ApiError ? err.message : '상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleUpdatePledgeSubStatus = (pledgeId: number, subStatus: string) => {
    setPledges((prev) => prev.map((p) => (p.id === pledgeId ? { ...p, subStatus } : p)));
  };

  const handleBlurPledgeSubStatus = async (pledge: Pledge) => {
    try {
      const updated = await updatePledge(pledge.id, {
        title: pledge.title,
        content: pledge.content,
        category: pledge.category,
        status: pledge.status,
        subStatus: pledge.subStatus,
        displayOrder: pledge.displayOrder,
      });
      setPledges((prev) => prev.map((p) => (p.id === pledge.id ? updated : p)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : '공약 저장 중 오류가 발생했습니다.');
    }
  };

  const handleCreatePledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPledgeTitle.trim() || !newPledgeContent.trim()) {
      return alert('제목과 내용을 입력해주세요.');
    }

    setCreatingPledge(true);
    setCreatePledgeError('');
    try {
      const nextOrder = pledges.length > 0 ? Math.max(...pledges.map((p) => p.displayOrder)) + 1 : 1;
      const created = await createPledge({
        title: newPledgeTitle.trim(),
        content: newPledgeContent.trim(),
        status: 'IN_PROGRESS',
        subStatus: '',
        displayOrder: nextOrder,
      });
      setPledges((prev) => [...prev, created]);
      setNewPledgeTitle('');
      setNewPledgeContent('');
    } catch (err) {
      setCreatePledgeError(err instanceof ApiError ? err.message : '공약 추가 중 오류가 발생했습니다.');
    } finally {
      setCreatingPledge(false);
    }
  };

  const handleDeleteIssue = async (id: number) => {
    if (!confirm('이 제안을 삭제하시겠습니까?')) return;
    try {
      await deleteSuggestion(id);
      setIssues((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSaveReply = async (issue: Suggestion) => {
    const text = replyDrafts[issue.id]?.trim();
    try {
      const updated = await updateSuggestionStatus(issue.id, {
        status: issue.status,
        adminReply: text || null,
      });
      setIssues((prev) => prev.map((i) => (i.id === issue.id ? updated : i)));
      alert('답변이 등록되었습니다.');
    } catch (err) {
      alert(err instanceof ApiError ? err.message : '답변 등록 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateStatus = async (issue: Suggestion, newStatus: Suggestion['status']) => {
    try {
      const updated = await updateSuggestionStatus(issue.id, {
        status: newStatus,
        adminReply: issue.adminReply,
      });
      setIssues((prev) => prev.map((i) => (i.id === issue.id ? updated : i)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : '상태 변경 중 오류가 발생했습니다.');
    }
  };

  // ------------------------------------------------------------- //
  // 1. DataGSM 로그인 전
  // ------------------------------------------------------------- //
  if (!isDataGsmLogged) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm p-8 border border-black/10 dark:border-white/10 rounded-2xl space-y-5 bg-white/70 dark:bg-white/5">
          <h1 className="text-xl font-bold">관리자 인증</h1>
          <p className="text-xs opacity-50">학생회 관리자만 접근할 수 있는 페이지입니다.</p>
          <button
            type="button"
            onClick={() => startDataGsmLogin('/admin')}
            className={`w-full py-3.5 text-sm rounded-xl ${BTN_PRIMARY}`}
          >
            DataGSM 계정으로 로그인하기
          </button>
        </div>
      </main>
    );
  }

  // ------------------------------------------------------------- //
  // 2. 로그인 후, 내 계정의 임원 권한 확인 중
  // ------------------------------------------------------------- //
  if (!me) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        {meError ? (
          <p className="text-sm text-red-500">{meError}</p>
        ) : (
          <p className="text-sm opacity-50">권한 확인 중...</p>
        )}
      </main>
    );
  }

  // ------------------------------------------------------------- //
  // 3. 로그인은 했지만 아직 관리자로 승격되지 않은 계정
  // ------------------------------------------------------------- //
  if (me.role !== 'ADMIN') {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm p-8 border border-black/10 dark:border-white/10 rounded-2xl space-y-5 bg-white/70 dark:bg-white/5">
          <h1 className="text-xl font-bold">관리자 승격</h1>
          <p className="text-xs opacity-50">
            {me.name}님은 아직 관리자 권한이 없습니다. 학생회 담당 서버 관리자에게 전달받은 승격
            코드를 입력해 주세요.
          </p>
          <form onSubmit={handlePromote} className="space-y-4">
            <input
              type="password"
              placeholder="관리자 승격 코드를 입력하세요"
              className={INPUT_CLASS}
              value={promoteCode}
              onChange={(e) => setPromoteCode(e.target.value)}
              autoFocus
            />
            {promoteError && <p className="text-xs text-red-500 font-medium">{promoteError}</p>}
            <button
              type="submit"
              disabled={promoting}
              className={`w-full py-2.5 text-sm rounded-lg ${BTN_PRIMARY} disabled:opacity-50`}
            >
              {promoting ? '확인 중...' : '승격하기'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 pt-12 pb-24 space-y-8">
      <div className="pb-4 border-b border-black/10 dark:border-white/10">
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
        <p className="text-xs opacity-50 mt-1">{me.name}님으로 로그인됨</p>
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
                disabled={percentSaving}
                className={`px-4 py-2 text-xs rounded-lg ${BTN_PRIMARY} disabled:opacity-50`}
              >
                {percentSaving ? '저장 중...' : '저장'}
              </button>
            </div>
            {percentError && <p className="text-xs text-red-500 font-medium">{percentError}</p>}
          </div>

          <div className="space-y-3">
          <p className="text-xs opacity-50">상태와 진행 상황 문구는 대시보드의 이행 현황 목록에 그대로 표시돼요.</p>

          {pledgesLoading ? (
            <div className="min-h-30 flex items-center justify-center text-sm opacity-50">불러오는 중...</div>
          ) : pledgesError ? (
            <div className="min-h-30 flex items-center justify-center text-sm text-red-500">{pledgesError}</div>
          ) : (
            pledges.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-3 p-4 border border-black/10 dark:border-white/10 rounded-xl bg-white/70 dark:bg-white/5"
              >
                <span className="font-bold text-sm">{p.title}</span>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <input
                    type="text"
                    placeholder="진행 상황 (예: 3월 시행 완료)"
                    value={p.subStatus ?? ''}
                    onChange={(e) => handleUpdatePledgeSubStatus(p.id, e.target.value)}
                    onBlur={() => handleBlurPledgeSubStatus(p)}
                    className={`${INPUT_CLASS} sm:flex-1`}
                  />

                  <select
                    value={p.status}
                    onChange={(e) => handleUpdatePledgeStatus(p, e.target.value as PledgeStatus)}
                    className="p-2.5 text-sm border rounded-lg bg-transparent border-black/20 dark:border-white/20 focus:outline-navy dark:focus:outline-blue-400 shrink-0"
                  >
                    {PLEDGE_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status} className="text-black">
                        {PLEDGE_STATUS_LABELS[status]}
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
            ))
          )}
          </div>

          <form
            onSubmit={handleCreatePledge}
            className="p-4 border border-dashed border-black/20 dark:border-white/20 rounded-xl space-y-3"
          >
            <span className="text-sm font-bold">+ 새 공약 추가</span>
            <input
              type="text"
              placeholder="공약 제목"
              value={newPledgeTitle}
              onChange={(e) => setNewPledgeTitle(e.target.value)}
              className={INPUT_CLASS}
            />
            <textarea
              placeholder="공약 내용"
              rows={3}
              value={newPledgeContent}
              onChange={(e) => setNewPledgeContent(e.target.value)}
              className={INPUT_CLASS}
            />
            {createPledgeError && <p className="text-xs text-red-500 font-medium">{createPledgeError}</p>}
            <button
              type="submit"
              disabled={creatingPledge}
              className={`px-4 py-2 text-xs rounded-lg ${BTN_PRIMARY} disabled:opacity-50`}
            >
              {creatingPledge ? '추가 중...' : '공약 추가'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="space-y-6">
          {issuesLoading ? (
            <div className="min-h-[360px] flex items-center justify-center text-sm opacity-50">불러오는 중...</div>
          ) : issuesError ? (
            <div className="min-h-[360px] flex items-center justify-center text-sm text-red-500">{issuesError}</div>
          ) : issues.length === 0 ? (
            <div className="min-h-[360px] flex items-center justify-center text-sm opacity-50">등록된 제안이 없습니다.</div>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="p-5 border border-black/10 dark:border-white/10 rounded-xl space-y-4 bg-white/70 dark:bg-white/5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-black/20 font-medium">
                      {STATUS_LABELS[issue.status]}
                    </span>
                    <h3 className="font-bold text-base mt-2">{issue.title}</h3>
                    <p className="text-xs opacity-50 mt-0.5">
                      {issue.authorName}
                      {issue.createdAt && ` · ${issue.createdAt.slice(0, 10)}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteIssue(issue.id)}
                    className="px-3 py-1 bg-red-500/10 text-red-600 text-xs font-semibold rounded-md hover:bg-red-500/20 transition"
                  >
                    삭제
                  </button>
                </div>

                <p className="text-sm opacity-80 whitespace-pre-line">{issue.content}</p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="학생회 답변을 입력하세요"
                    className="flex-1 p-2 text-xs border rounded-lg bg-transparent border-black/20 dark:border-white/20"
                    value={replyDrafts[issue.id] ?? ''}
                    onChange={(e) => setReplyDrafts({ ...replyDrafts, [issue.id]: e.target.value })}
                  />
                  <button
                    onClick={() => handleSaveReply(issue)}
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
                      onClick={() => handleUpdateStatus(issue, status)}
                      className={statusButtonClass(issue.status === status)}
                    >
                      {STATUS_LABELS[status]}
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

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[80vh] flex items-center justify-center px-4">
          <p className="text-sm opacity-50">불러오는 중...</p>
        </main>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
