import { EnemyType } from '../types/game.types';
import { ENEMY_LEVEL_DISTRIBUTION } from '../constants/enemy.constants';

/**
 * Get enemy type distribution for a given level
 */
export function getEnemyTypeForLevel(level: number): EnemyType {
  const rand = Math.random();
  const distribution = ENEMY_LEVEL_DISTRIBUTION[level] || ENEMY_LEVEL_DISTRIBUTION.default;
  
  if (rand < distribution[EnemyType.LIGHT]) {
    return EnemyType.LIGHT;
  } else if (rand < distribution[EnemyType.LIGHT] + distribution[EnemyType.MEDIUM]) {
    return EnemyType.MEDIUM;
  } else {
    return EnemyType.HEAVY;
  }
}

/**
 * Get random spawn side
 */
export function getRandomSpawnSide(): 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' {
  const sides: Array<'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT'> = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'];
  return sides[Math.floor(Math.random() * sides.length)];
}

/**
 * Calculate spawn position based on side
 */
export function getSpawnPosition(
  side: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT',
  screenWidth: number,
  screenHeight: number,
  size: number
): { x: number; y: number } {
  switch (side) {
    case 'TOP':
      return {
        x: Math.random() * (screenWidth - size),
        y: -size,
      };
    case 'BOTTOM':
      return {
        x: Math.random() * (screenWidth - size),
        y: screenHeight + size,
      };
    case 'LEFT':
      return {
        x: -size,
        y: Math.random() * (screenHeight - size),
      };
    case 'RIGHT':
      return {
        x: screenWidth + size,
        y: Math.random() * (screenHeight - size),
      };
  }
}
