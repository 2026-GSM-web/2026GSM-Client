# 배포

이 프로젝트는 **Vercel** 로 배포합니다. (기존 학교 서버 SSH 배포 `deploy.yml` 은 제거됨)

## 자동 배포

- Vercel 프로젝트: `wook11/2026gsm-client` (GitHub `2026-GSM-web/2026GSM-Client` 연결됨)
- `main` 브랜치 push → **Production** 자동 배포
- 그 외 브랜치 / PR → **Preview** 자동 배포
- Production URL: https://2026gsm-client.vercel.app

## 환경변수

Vercel 프로젝트 Settings → Environment Variables 에 등록되어 있음 (Production/Preview/Development):

| 이름 | 값 |
| --- | --- |
| `NEXT_PUBLIC_AUTH_API_URL` | `https://school.https.gsmsv.site` |

`NEXT_PUBLIC_` 접두사라 빌드 시점에 번들에 포함됨. 값 변경 시 재배포 필요.

## 백엔드 쪽 필요 설정

프론트가 브라우저에서 직접 백엔드(`school.https.gsmsv.site`)를 호출하고, 로그인은 백엔드 OAuth 로 리다이렉트하므로 백엔드에서 아래를 허용해야 함:

- **CORS** allowed origin 에 `https://2026gsm-client.vercel.app` (및 필요 시 `https://*.vercel.app` preview 도메인) 추가
- OAuth 로그인 완료 후 프론트로 돌아오는 **redirect 허용 목록**에 위 도메인 추가
- DataGSM OAuth 앱 redirect URI 등록

## 수동 배포 (필요 시)

```bash
npx vercel deploy --prod
```
