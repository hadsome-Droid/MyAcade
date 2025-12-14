import { Vector2, Direction } from '../types/game.types';

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Normalize a vector to unit length
 */
export function normalizeVector(x: number, y: number): Direction {
  const dist = Math.sqrt(x * x + y * y);
  if (dist === 0) {
    return { x: 0, y: 0 };
  }
  return { x: x / dist, y: y / dist };
}

/**
 * Calculate direction vector from point A to point B
 */
export function directionTo(from: Vector2, to: Vector2): Direction {
  return normalizeVector(to.x - from.x, to.y - from.y);
}

/**
 * Rotate a direction vector by an angle (in radians)
 */
export function rotateDirection(dir: Direction, angle: number): Direction {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: dir.x * cos - dir.y * sin,
    y: dir.x * sin + dir.y * cos,
  };
}

/**
 * Calculate angle between two points (in radians)
 */
export function angleBetween(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}
