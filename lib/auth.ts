// 로그인 흐름(스웨거 /v3/api-docs 기준):
//  1. 프론트가 `${apiBase}/api/auth/dg/authorize`로 풀 페이지 리다이렉트
//  2. 백엔드가 state를 만들어 Redis에 저장하고 DataGSM 동의 화면으로 리다이렉트
//  3. DataGSM이 백엔드의 등록된 redirect_uri(/api/auth/dg/callback)로 code·state를 돌려줌
//  4. 백엔드가 code를 토큰/유저정보로 교환한 뒤, 서버에 고정 설정된 프론트엔드 주소로
//     `#token=<JWT>`(성공) 또는 `?error=<code>`(실패) 형태로 리다이렉트 → app/callback 에서 처리
// 프론트에서 redirect_uri나 return 주소를 넘길 파라미터는 없음(백엔드 설정값이 유일).
export const OAUTH_RETURN_TO_KEY = 'sc_oauth_return_to';

// 발급받은 JWT는 localStorage에 보관함(백엔드가 쿠키가 아니라 URL 해시로 토큰을 주기 때문에
// 서버 컴포넌트에서 읽을 방법이 없음 - 로그인 상태 판단은 전적으로 클라이언트에서 이뤄짐)
export const AUTH_TOKEN_KEY = 'sc_jwt';

// 같은 탭 안의 다른 컴포넌트(헤더 / 페이지)들이 로그인·로그아웃을 즉시 반영하도록,
// 토큰이 바뀔 때 직접 발생시키는 이벤트. (다른 탭 간 동기화는 브라우저 기본 'storage'
// 이벤트가 담당함 - 그건 토큰을 바꾼 탭 자신에게는 안 오므로 이 커스텀 이벤트가 필요)
export const AUTH_CHANGE_EVENT = 'sc-auth-change';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function logout(returnTo = '/') {
  clearToken();
  // 로그아웃 후에는 페이지 상태를 확실히 초기화하기 위해 풀 리로드
  window.location.href = returnTo;
}

export function startDataGsmLogin(returnTo: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
  if (!apiBaseUrl) {
    alert('로그인 서버 주소가 설정되지 않았습니다. 관리자에게 문의해 주세요.');
    return;
  }

  // 로그인 후 돌아갈 위치를 기억해둠 - 백엔드 리다이렉트는 고정된 한 주소로만 오기 때문에,
  // 실제 이동은 콜백 페이지에서 이 값을 읽어 처리함
  sessionStorage.setItem(OAUTH_RETURN_TO_KEY, returnTo);
  window.location.href = `${apiBaseUrl}/api/auth/dg/authorize`;
}
