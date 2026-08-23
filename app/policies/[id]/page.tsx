'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ApiError,
  STATUS_LABELS,
  Suggestion,
  deleteSuggestion,
  getMe,
  getSuggestion,
  updateSuggestion,
} from '@/lib/api';

function statusBadgeClass(status: Suggestion['status']) {
  const base = 'text-xs px-2.5 py-1 rounded-full font-bold border inline-block';
  if (status === 'RESOLVED') return `${base} bg-emerald-500/10 text-emerald-600 border-emerald-500/30`;
  if (status === 'REJECTED') return `${base} bg-red-500/10 text-red-600 border-red-500/30`;
  return `${base} bg-navy/10 text-navy border-navy/30 dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/30`;
}

export default function PolicyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [issue, setIssue] = useState<Suggestion | null>(null);
  const [isMine, setIsMine] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getSuggestion(id), getMe().catch(() => null)])
      .then(([suggestion, me]) => {
        if (cancelled) return;
        setIssue(suggestion);
        setIsMine(me?.id === suggestion.authorId);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : '정책 정보를 불러오지 못했습니다.');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const startEditing = () => {
    if (!issue) return;
    setEditForm({ title: issue.title, content: issue.content });
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || !editForm.title || !editForm.content) {
      return alert('제목과 내용을 입력해주세요.');
    }

    setSaving(true);
    try {
      const updated = await updateSuggestion(issue.id, editForm);
      setIssue(updated);
      setIsEditing(false);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : '수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!issue) return;
    if (!confirm('이 제안을 삭제하시겠습니까?')) return;

    try {
      await deleteSuggestion(issue.id);
      router.push('/');
    } catch (err) {
      alert(err instanceof ApiError ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  if (error) {
    return <main className="max-w-2xl mx-auto px-6 py-12 text-sm text-red-500">{error}</main>;
  }

  if (!issue) {
    return <main className="max-w-2xl mx-auto px-6 py-12 text-xs opacity-50">불러오는 중...</main>;
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1"
        >
          ← 목록으로
        </button>

        {isMine && !isEditing && (
          <div className="flex gap-2">
            <button
              onClick={startEditing}
              className="text-xs px-3 py-1.5 border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition font-medium"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="text-xs px-3 py-1.5 bg-red-500/10 text-red-600 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition font-medium"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1">제목</label>
            <input
              type="text"
              className="w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 focus:outline-navy dark:focus:outline-blue-400"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">내용</label>
            <textarea
              rows={6}
              className="w-full p-2.5 text-sm border rounded-lg bg-transparent border-black/20 focus:outline-navy dark:focus:outline-blue-400"
              value={editForm.content}
              onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 navy-surface dark:bg-blue-500 dark:bg-none text-white font-semibold text-sm rounded-lg hover:brightness-110 dark:hover:bg-blue-400 transition disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 text-sm border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="space-y-2 border-b border-black/10 dark:border-white/10 pb-4">
            <span className={statusBadgeClass(issue.status)}>{STATUS_LABELS[issue.status]}</span>
            <h1 className="text-2xl font-bold mt-2">{issue.title}</h1>
            <p className="text-xs opacity-50">
              {issue.authorName}
              {issue.createdAt && ` · ${issue.createdAt.slice(0, 10)}`}
            </p>
          </div>

          <p className="text-sm leading-relaxed whitespace-pre-line">{issue.content}</p>

          {/* 답변 - 관리자 작성 답변 */}
          <div className="pt-8 border-t border-black/10 dark:border-white/10 space-y-4">
            <h3 className="font-bold text-sm">학생회 답변</h3>
            {issue.adminReply ? (
              <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg text-xs space-y-1 bg-white/70 dark:bg-white/5">
                <div className="flex justify-between font-bold">
                  <span className="text-navy dark:text-blue-400">학생회</span>
                  {issue.updatedAt && <span className="opacity-40">{issue.updatedAt.slice(0, 10)}</span>}
                </div>
                <p className="text-sm opacity-80 whitespace-pre-line">{issue.adminReply}</p>
              </div>
            ) : (
              <p className="text-xs opacity-50">아직 학생회 답변이 없습니다.</p>
            )}
          </div>
        </>
      )}
    </main>
  );
}
