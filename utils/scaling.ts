/**
 * Утилиты для масштабирования размеров игровых объектов
 */

import { calculateScaleFactor } from './deviceDetection';

// Минимальные размеры объектов (в пикселях)
export const MIN_SIZES = {
  PLAYER: 20,
  ENEMY_LIGHT: 15,
  ENEMY_MEDIUM: 20,
  ENEMY_HEAVY: 25,
  BULLET: 4,
  HP_BAR_WIDTH: 40,
  HP_BAR_HEIGHT: 4,
} as const;

// Базовые размеры объектов (для расчета масштабирования)
export const BASE_SIZES = {
  PLAYER: 25,
  ENEMY_LIGHT: 20,
  ENEMY_MEDIUM: 25,
  ENEMY_HEAVY: 30,
  BULLET: 5,
  HP_BAR_WIDTH: 60,
  HP_BAR_HEIGHT: 6,
} as const;

/**
 * Получает минимальный размер для объекта
 */
export function getMinSize(type: keyof typeof MIN_SIZES): number {
  return MIN_SIZES[type];
}

/**
 * Получает базовый размер для объекта
 */
export function getBaseSize(type: keyof typeof BASE_SIZES): number {
  return BASE_SIZES[type];
}

/**
 * Рассчитывает масштабированный размер объекта
 * Использует комбинированный подход: минимальный размер + масштабирование на больших экранах
 * 
 * @param type Тип объекта
 * @param customScaleFactor Опциональный коэффициент масштабирования (если не указан, рассчитывается автоматически)
 * @returns Масштабированный размер
 */
export function getScaledSize(
  type: keyof typeof MIN_SIZES,
  customScaleFactor?: number
): number {
  const minSize = getMinSize(type);
  const baseSize = getBaseSize(type as keyof typeof BASE_SIZES);
  const scaleFactor = customScaleFactor ?? calculateScaleFactor();
  
  // Комбинированный подход: минимальный размер + масштабирование
  const scaledSize = Math.max(minSize, baseSize * scaleFactor);
  
  return Math.round(scaledSize);
}

/**
 * Рассчитывает масштабированную скорость на основе базовой скорости
 * 
 * @param baseSpeed Базовая скорость
 * @param customScaleFactor Опциональный коэффициент масштабирования
 * @returns Масштабированная скорость
 */
export function getScaledSpeed(
  baseSpeed: number,
  customScaleFactor?: number
): number {
  const scaleFactor = customScaleFactor ?? calculateScaleFactor();
  // Скорость масштабируется пропорционально размеру экрана
  return baseSpeed * scaleFactor;
}

