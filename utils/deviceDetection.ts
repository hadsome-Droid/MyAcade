/**
 * Утилиты для определения типа устройства и его характеристик
 */

export type ScreenOrientation = 'portrait' | 'landscape';

/**
 * Определяет, является ли устройство мобильным (телефон)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Проверка на мобильные устройства
  const mobileRegex = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i;
  const isMobile = mobileRegex.test(userAgent);
  
  // Дополнительная проверка по размеру экрана (для более точного определения)
  const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;
  
  return isMobile && isSmallScreen;
}

/**
 * Определяет, является ли устройство планшетом
 */
export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Проверка на планшеты
  const tabletRegex = /ipad|android(?!.*mobile)|tablet/i;
  const isTablet = tabletRegex.test(userAgent);
  
  // Дополнительная проверка по размеру экрана
  const isMediumScreen = window.innerWidth > 768 && window.innerWidth <= 1024;
  
  return isTablet || (isMediumScreen && !isMobileDevice());
}

/**
 * Определяет, является ли устройство мобильным (телефон или планшет)
 */
export function isMobileOrTablet(): boolean {
  return isMobileDevice() || isTabletDevice();
}

/**
 * Определяет текущую ориентацию экрана
 */
export function getScreenOrientation(): ScreenOrientation {
  if (typeof window === 'undefined') return 'landscape';
  
  // Проверка через window.orientation (для мобильных устройств)
  if (typeof (window as any).orientation !== 'undefined') {
    const orientation = (window as any).orientation;
    return Math.abs(orientation) === 90 ? 'landscape' : 'portrait';
  }
  
  // Проверка через размеры экрана
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

/**
 * Рассчитывает коэффициент масштабирования на основе размера экрана
 * @param baseWidth Базовая ширина (по умолчанию 1920)
 * @param baseHeight Базовая высота (по умолчанию 1080)
 * @returns Коэффициент масштабирования (от 0.5 до 2.0)
 */
export function calculateScaleFactor(
  baseWidth: number = 1920,
  baseHeight: number = 1080
): number {
  if (typeof window === 'undefined') return 1;
  
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Используем минимальную сторону для расчета масштаба
  const screenMin = Math.min(screenWidth, screenHeight);
  const baseMin = Math.min(baseWidth, baseHeight);
  
  // Рассчитываем масштаб
  let scale = screenMin / baseMin;
  
  // Ограничиваем масштаб разумными значениями
  scale = Math.max(0.5, Math.min(2.0, scale));
  
  return scale;
}

/**
 * Получает размер экрана в пикселях
 */
export function getScreenSize(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 1920, height: 1080 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

