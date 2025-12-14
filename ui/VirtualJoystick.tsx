'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './VirtualJoystick.module.scss';

interface VirtualJoystickProps {
  onMove: (dx: number, dy: number) => void;
  onStop: () => void;
}

export const VirtualJoystick = ({ onMove, onStop }: VirtualJoystickProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const baseRadiusRef = useRef<number>(0);
  const stickRadiusRef = useRef<number>(0);

  // Инициализация размеров
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      baseRadiusRef.current = rect.width / 2;
      stickRadiusRef.current = (rect.width * 0.4) / 2; // 40% от размера базы
    }
  }, []);

  const getTouchPosition = useCallback((e: TouchEvent): { x: number; y: number } | null => {
    const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
    if (!touch || !containerRef.current) return null;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    return {
      x: touch.clientX - centerX,
      y: touch.clientY - centerY,
    };
  }, []);

  const updateStickPosition = useCallback((x: number, y: number) => {
    if (!containerRef.current) return;

    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = baseRadiusRef.current - stickRadiusRef.current;

    // Ограничиваем движение ручки радиусом базы
    if (distance > maxDistance) {
      const angle = Math.atan2(y, x);
      x = Math.cos(angle) * maxDistance;
      y = Math.sin(angle) * maxDistance;
    }

    setPosition({ x, y });

    // Нормализуем значения от -1 до 1
    const dx = x / maxDistance;
    const dy = y / maxDistance;

    onMove(dx, dy);
  }, [onMove]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    // Проверяем, что касание в пределах области джойстика
    if (
      touchX >= rect.left &&
      touchX <= rect.right &&
      touchY >= rect.top &&
      touchY <= rect.bottom
    ) {
      e.preventDefault();
      touchIdRef.current = touch.identifier;
      setIsActive(true);

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = touchX - centerX;
      const y = touchY - centerY;

      updateStickPosition(x, y);
    }
  }, [updateStickPosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (touchIdRef.current === null || !isActive) return;

    const pos = getTouchPosition(e);
    if (pos) {
      e.preventDefault();
      updateStickPosition(pos.x, pos.y);
    }
  }, [isActive, getTouchPosition, updateStickPosition]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchIdRef.current === null) return;

    // Проверяем, что это касание того же идентификатора
    const touch = Array.from(e.changedTouches).find(
      t => t.identifier === touchIdRef.current
    );

    if (touch) {
      e.preventDefault();
      touchIdRef.current = null;
      setIsActive(false);
      setPosition({ x: 0, y: 0 });
      onStop();
    }
  }, [onStop]);

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
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div ref={containerRef} className={styles.joystickContainer}>
      <div className={styles.joystickBase} />
      <div
        ref={stickRef}
        className={`${styles.joystickStick} ${isActive ? styles.active : ''}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      />
    </div>
  );
};

