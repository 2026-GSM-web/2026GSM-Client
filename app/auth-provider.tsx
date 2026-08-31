'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ApiError, getMe, UserInfo } from '@/lib/api';
import { AUTH_CHANGE_EVENT, clearToken, getToken } from '@/lib/auth';

// 'loading' : 아직 토큰 확인/검증 중 (SSR·첫 렌더는 항상 이 값)
// 'authed'  : 유효한 토큰으로 /api/auth/me 조회까지 성공
// 'guest'   : 토큰이 없거나 만료됨
type AuthStatus = 'loading' | 'authed' | 'guest';

interface AuthContextValue {
  status: AuthStatus;
  user: UserInfo | null;
  /** 로그인 직후 / 관리자 승격 직후처럼 서버 기준 내 정보를 다시 확인해야 할 때 호출 */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 <AuthProvider> 안에서만 사용할 수 있습니다.');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // localStorage는 서버에 없으므로 첫 렌더는 무조건 'loading'으로 시작해서
  // 하이드레이션 mismatch를 피함 (app/page.tsx 등에서 쓰는 패턴과 동일)
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<UserInfo | null>(null);

  const check = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setStatus('guest');
      return;
    }

    try {
      const me = await getMe();
      setUser(me);
      setStatus('authed');
    } catch (err) {
      // 토큰은 있지만 만료/무효 - apiFetch가 401에서 이미 토큰을 지우지만,
      // 네트워크 오류 등 다른 실패도 일단 로그아웃 상태로 떨어뜨림
      if (err instanceof ApiError && err.status === 401) {
        clearToken();
      }
      setUser(null);
      setStatus('guest');
    }
  }, []);

  useEffect(() => {
    // 마운트 직후 1회 확인. 이펙트 본문에서 곧바로 setState 하는 걸 피하려고 한 스텝 지연
    const timer = setTimeout(check, 0);

    // 같은 탭의 로그인/로그아웃(AUTH_CHANGE_EVENT) + 다른 탭의 변경('storage')에 반응
    const onChange = () => check();
    window.addEventListener(AUTH_CHANGE_EVENT, onChange);
    window.addEventListener('storage', onChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [check]);

  return (
    <AuthContext.Provider value={{ status, user, refresh: check }}>
      {children}
    </AuthContext.Provider>
  );
}
