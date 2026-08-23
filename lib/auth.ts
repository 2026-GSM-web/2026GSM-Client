// 실제 백엔드(school.https.gsmsv.site) 로그인은 Spring Security의 기본 OAuth2 클라이언트
// 엔드포인트(/oauth2/authorization/school)로 그냥 풀 페이지 리다이렉트하면 되는 구조.
// 백엔드가 DataGSM SSO 로그인까지 알아서 처리한 뒤, 서버에 미리 설정된 프론트엔드 주소로
// `#token=<JWT>` 형태로 되돌려준다(스웨거 설명 기준). PKCE 코드 교환 같은 절차는 필요 없음.
export const OAUTH_RETURN_TO_KEY = 'sc_oauth_return_to';

export function startDataGsmLogin(returnTo: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
  if (!apiBaseUrl) {
    alert('로그인 서버 주소가 설정되지 않았습니다. 관리자에게 문의해 주세요.');
    return;
  }

  // 로그인 후 돌아갈 위치를 기억해둠 - 백엔드 리다이렉트는 고정된 한 주소로만 오기 때문에,
  // 실제 이동은 콜백 페이지에서 이 값을 읽어 처리함
  sessionStorage.setItem(OAUTH_RETURN_TO_KEY, returnTo);
  window.location.href = `${apiBaseUrl}/oauth2/authorization/school`;
}
