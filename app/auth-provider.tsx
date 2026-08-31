'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ApiError, getMe, UserInfo } from '@/lib/api';

// 'loading' : 아직 로그인 여부 확인 중 (SSR·첫 렌더는 항상 이 값)
// 'authed'  : ACCESS_TOKEN 쿠키로 /api/auth/me 조회까지 성공
// 'guest'   : 쿠키가 없거나 만료됨(= /api/auth/me 가 401)
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
  // 인증은 httpOnly 쿠키(JS로 못 읽음)로 이뤄지므로, 로그인 여부는 오직 /api/auth/me
  // 응답으로만 알 수 있음. SSR에는 쿠키가 없으니 첫 렌더는 무조건 'loading'으로 시작.
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<UserInfo | null>(null);

  const check = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
      setStatus('authed');
    } catch (err) {
      // 401(비로그인/만료)뿐 아니라 네트워크 오류 등 다른 실패도 일단 게스트로 떨어뜨림
      if (!(err instanceof ApiError) || err.status !== 401) {
        console.warn('[auth] /api/auth/me 확인 실패:', err);
      }
      setUser(null);
      setStatus('guest');
    }
  }, []);

  useEffect(() => {
    // 마운트 직후 1회 확인. 이펙트 본문에서 곧바로 setState 하는 걸 피하려고 한 스텝 지연
    const timer = setTimeout(check, 0);
    return () => clearTimeout(timer);
  }, [check]);

  return (
    <AuthContext.Provider value={{ status, user, refresh: check }}>
      {children}
    </AuthContext.Provider>
  );
}
