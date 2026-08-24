// school.https.gsmsv.site 백엔드 API 클라이언트.
// 스웨거(https://school.https.gsmsv.site/swagger-ui/index.html) 기준으로 작성함.

export type SuggestionStatus = 'RECEIVED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export const STATUS_LABELS: Record<SuggestionStatus, string> = {
  RECEIVED: '접수됨',
  IN_PROGRESS: '검토중',
  RESOLVED: '시행완료',
  REJECTED: '반려',
};

export const STATUS_OPTIONS: SuggestionStatus[] = ['RECEIVED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

export interface Suggestion {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  status: SuggestionStatus;
  adminReply: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UserInfo {
  id: number;
  name: string;
  email: string | null;
  role: 'USER' | 'ADMIN';
}

export interface PledgeProgress {
  percentage: number;
  updatedAt: string | null;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function authHeader(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('sc_jwt');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
  if (!apiBaseUrl) {
    throw new ApiError(0, '로그인 서버 주소가 설정되지 않았습니다. 관리자에게 문의해 주세요.');
  }

  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401) throw new ApiError(401, '로그인이 만료되었습니다. 다시 로그인해 주세요.');
    if (res.status === 403) throw new ApiError(403, '이 작업을 수행할 권한이 없습니다.');
    throw new ApiError(res.status, `요청이 실패했습니다. (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function getMe() {
  return apiFetch<UserInfo>('/api/auth/me');
}

export function promoteToAdmin(code: string) {
  return apiFetch<{ role: 'USER' | 'ADMIN'; message: string }>('/api/auth/promote', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export function createSuggestion(data: { title: string; content: string }) {
  return apiFetch<Suggestion>('/api/suggestions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateSuggestion(id: number, data: { title: string; content: string }) {
  return apiFetch<Suggestion>(`/api/suggestions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function getMySuggestions(page = 0, size = 20) {
  return apiFetch<Page<Suggestion>>(`/api/suggestions/me?page=${page}&size=${size}`);
}

export function getSuggestion(id: number | string) {
  return apiFetch<Suggestion>(`/api/suggestions/${id}`);
}

export function getAllSuggestions(status?: SuggestionStatus, page = 0, size = 50) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) params.set('status', status);
  return apiFetch<Page<Suggestion>>(`/api/suggestions?${params.toString()}`);
}

export function updateSuggestionStatus(
  id: number,
  data: { status: SuggestionStatus; adminReply?: string | null }
) {
  return apiFetch<Suggestion>(`/api/suggestions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteSuggestion(id: number) {
  return apiFetch<void>(`/api/suggestions/${id}`, { method: 'DELETE' });
}

export function getPledgeProgress() {
  return apiFetch<PledgeProgress>('/api/pledge-progress');
}

export function updatePledgeProgress(percentage: number) {
  return apiFetch<PledgeProgress>('/api/pledge-progress', {
    method: 'PUT',
    body: JSON.stringify({ percentage }),
  });
}
