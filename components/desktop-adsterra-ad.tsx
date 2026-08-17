'use client';

import {useEffect, useRef} from 'react';
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

function normalizePathname(pathname: string) {
  if (pathname === '/') {
    return '/';
  }

  return pathname.replace(/\/+$/, '');
}

export default function DesktopAdsterraAd() {
  const pathname = usePathname();
  const adRef = useRef<HTMLDivElement>(null);

  const normalizedPathname = normalizePathname(pathname);
  const isAllowedPage = ALLOWED_PATHS.has(normalizedPathname);

  useEffect(() => {
    const container = adRef.current;

    if (!container || !isAllowedPage) {
      return;
    }

    const mediaQuery = window.matchMedia(
      `(min-width: ${MIN_WIDTH}px)`,
    );

    const removeAd = () => {
      container.innerHTML = '';
      delete container.dataset.loaded;
    };

    const loadAd = () => {
      if (!mediaQuery.matches) {
        return;
      }

      if (container.dataset.loaded === 'true') {
        return;
      }

      container.dataset.loaded = 'true';

      (
        window as Window & {
          atOptions?: {
            key: string;
            format: string;
            height: number;
            width: number;
            params: Record<string, unknown>;
          };
        }
      ).atOptions = {
        key: 'eed843932b8aa1280524a74adc1273e2',
        format: 'iframe',
        height: 300,
        width: 160,
        params: {},
      };

      const script = document.createElement('script');

      script.src =
        'https://www.highperformanceformat.com/eed843932b8aa1280524a74adc1273e2/invoke.js';

      script.async = true;

      container.appendChild(script);
    };

    const handleViewportChange = () => {
      if (mediaQuery.matches) {
        loadAd();
      } else {
        removeAd();
      }
    };

    handleViewportChange();

    mediaQuery.addEventListener(
      'change',
      handleViewportChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        'change',
        handleViewportChange,
      );

      removeAd();
    };
  }, [isAllowedPage, normalizedPathname]);

  if (!isAllowedPage) {
    return null;
  }

  return (
    <aside
      className="fixed left-[calc(50%+632px)] top-44 z-20 hidden min-[1600px]:block"
      aria-label="Advertisement"
    >
      {process.env.NODE_ENV === 'development' ? (
      <div
        style={{
          width: 160,
          height: 300,
          border: '2px dashed #999',
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          color: '#666',
        }}
      >
        160 × 300 Ad
      </div>
    ) : (
      <div
        ref={adRef}
        style={{
          width: 160,
          minHeight: 300,
        }}
      />
    )}
    </aside>
  );
}