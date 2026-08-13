import localFont from 'next/font/local';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from './provider';

const nanumSquareNeo = localFont({
  src: [
    { path: './fonts/NanumSquareNeo-Light.woff2', weight: '300', style: 'normal' },
    { path: './fonts/NanumSquareNeo-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/NanumSquareNeo-Bold.woff2', weight: '700', style: 'normal' },
    { path: './fonts/NanumSquareNeo-ExtraBold.woff2', weight: '800', style: 'normal' },
    { path: './fonts/NanumSquareNeo-Heavy.woff2', weight: '900', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-nanumsquareneo',
});

// 본문 전체 폰트 (D-day 숫자는 예외로 나눔스퀘어 네오 유지)
const roboto = localFont({
  src: [
    { path: './fonts/Roboto-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Roboto-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/Roboto-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: './fonts/Roboto-Bold.woff2', weight: '700', style: 'normal' },
    { path: './fonts/Roboto-ExtraBold.woff2', weight: '800', style: 'normal' },
    { path: './fonts/Roboto-Black.woff2', weight: '900', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-roboto',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning className={`${nanumSquareNeo.variable} ${roboto.variable}`}>
      <body className="font-[family-name:var(--font-roboto)]">
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
