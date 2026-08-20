'use client';

import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';

const MIN_WIDTH = 1600;

const ALLOWED_PATHS = new Set([
  '/',
  '/time-card-calculator-with-lunch',
  '/military-time-card-calculator',
  '/biweekly-time-card-calculator',
  '/timesheet-calculator-with-lunch',
  '/time-card-calculator-with-multiple-in-and-out',
  '/time-card-calculator-with-breaks',
  '/punch-clock-calculator',
  '/30-minute-lunch-break-calculator',
  '/time-punch-calculator',
  '/time-clock-calculator-with-lunch',
  '/lunch-break-calculator',
]);

const ADS = {
  left: {
    width: 160,
    height: 300,
    keyId: 'eed843932b8aa1280524a74adc1273e2',
    scriptSrc:
      'https://www.highperformanceformat.com/eed843932b8aa1280524a74adc1273e2/invoke.js',
  },
  right: {
    width: 160,
    height: 600,
    keyId: '6ed16934ce9cc90ef1a0216594862136',
    scriptSrc:
      'https://www.highperformanceformat.com/6ed16934ce9cc90ef1a0216594862136/invoke.js',
  },
} as const;

function normalizePathname(pathname: string) {
  if (pathname === '/') {
    return '/';
  }

  return pathname.replace(/\/+$/, '');
}

type AdsterraUnitProps = {
  width: number;
  height: number;
  keyId: string;
  scriptSrc: string;
  label: string;
};

function AdsterraUnit({
  width,
  height,
  keyId,
  scriptSrc,
  label,
}: AdsterraUnitProps) {
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        style={{
          width,
          height,
          border: '2px dashed #999',
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          color: '#666',
        }}
      >
        {label}
        <br />
        {width} × {height}
      </div>
    );
  }

  const srcDoc = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />

    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        width: ${width}px;
        height: ${height}px;
        overflow: hidden;
        background: transparent;
      }
    </style>
  </head>

  <body>
    <script>
      atOptions = {
        'key': '${keyId}',
        'format': 'iframe',
        'height': ${height},
        'width': ${width},
        'params': {}
      };
    </script>

    <script src="${scriptSrc}"></script>
  </body>
</html>
`;

  return (
    <iframe
      title={label}
      srcDoc={srcDoc}
      width={width}
      height={height}
      scrolling="no"
      style={{
        display: 'block',
        width,
        height,
        border: 0,
        overflow: 'hidden',
        background: 'transparent',
      }}
    />
  );
}

export default function DesktopAdsterraAd() {
  const pathname = usePathname();
  const [isWideDesktop, setIsWideDesktop] = useState(false);

  const normalizedPathname = normalizePathname(pathname);
  const isAllowedPage = ALLOWED_PATHS.has(normalizedPathname);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(min-width: ${MIN_WIDTH}px)`,
    );

    const update = () => {
      setIsWideDesktop(mediaQuery.matches);
    };

    update();

    mediaQuery.addEventListener('change', update);

    return () => {
      mediaQuery.removeEventListener('change', update);
    };
  }, []);

  if (!isAllowedPage || !isWideDesktop) {
    return null;
  }

  return (
    <>
      {/* Left rail — 160 × 300 */}
      <aside
        className="fixed right-[calc(50%+632px)] top-44 z-20"
        aria-label="Advertisement"
      >
        <AdsterraUnit
          {...ADS.left}
          label="Left Advertisement"
        />
      </aside>

      {/* Right rail — 160 × 600 */}
      <aside
        className="fixed left-[calc(50%+632px)] top-44 z-20"
        aria-label="Advertisement"
      >
        <AdsterraUnit
          {...ADS.right}
          label="Right Advertisement"
        />
      </aside>
    </>
  );
}