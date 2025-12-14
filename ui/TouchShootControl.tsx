'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './TouchShootControl.module.scss';

interface TouchShootControlProps {
  onShoot: (x: number, y: number) => void;
  onStop: () => void;
}

export const TouchShootControl = ({
  onShoot,
  onStop,
}: TouchShootControlProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const touchIdRef = useRef<number | null>(null);
  const lastShootTimeRef = useRef<number>(0);
  const shootIntervalRef = useRef<number | null>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!containerRef.current) return;

      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();

      // Проверяем, что касание в правой части экрана (область стрельбы)
      if (touch.clientX >= rect.left && touch.clientY >= rect.top) {
        e.preventDefault();
        touchIdRef.current = touch.identifier;
        setIsActive(true);

        // Немедленная стрельба при касании
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        onShoot(x, y);
        lastShootTimeRef.current = Date.now();

        // Непрерывная стрельба при удержании
        shootIntervalRef.current = window.setInterval(() => {
          const currentTouch = Array.from(e.touches).find(
            t => t.identifier === touchIdRef.current
          );
          if (currentTouch) {
            const shootX = currentTouch.clientX - rect.left;
            const shootY = currentTouch.clientY - rect.top;
            onShoot(shootX, shootY);
          }
        }, 100); // Стрельба каждые 100мс при удержании
      }
    },
    [onShoot]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (touchIdRef.current === null || !isActive || !containerRef.current) return;

      const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
      if (!touch) return;

      e.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // Обновляем направление стрельбы при движении
      const now = Date.now();
      if (now - lastShootTimeRef.current >= 100) {
        onShoot(x, y);
        lastShootTimeRef.current = now;
      }
    },
    [isActive, onShoot]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (touchIdRef.current === null) return;

      const touch = Array.from(e.changedTouches).find(
        t => t.identifier === touchIdRef.current
      );

      if (touch) {
        e.preventDefault();
        touchIdRef.current = null;
        setIsActive(false);
        onStop();

        if (shootIntervalRef.current !== null) {
          clearInterval(shootIntervalRef.current);
          shootIntervalRef.current = null;
        }
      }
    },
    [onStop]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);

      if (shootIntervalRef.current !== null) {
        clearInterval(shootIntervalRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      className={`${styles.shootControl} ${isActive ? styles.active : ''}`}
    />
  );
};

