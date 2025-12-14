import { EnemyType } from '../../types/game.types';
import { ENEMY_TYPE_CONFIGS } from '../../constants/enemy.constants';

export class EnemyTypeConfig {
  /**
   * Get health for enemy type
   */
  public static getHealth(type: EnemyType): number {
    return ENEMY_TYPE_CONFIGS[type].health;
  }

  /**
   * Get color for enemy type
   */
  public static getColor(type: EnemyType): number {
    return ENEMY_TYPE_CONFIGS[type].color;
  }

  /**
   * Get random size for enemy type
   */
  public static getRandomSize(type: EnemyType): number {
    const config = ENEMY_TYPE_CONFIGS[type];
    return config.minSize + Math.random() * (config.maxSize - config.minSize);
  }

  /**
   * Get points for destroying enemy type
   */
  public static getPoints(type: EnemyType): number {
    return ENEMY_TYPE_CONFIGS[type].points;
  }

  /**
   * Get random enemy type based on level
   */
  public static getRandomTypeForLevel(level: number): EnemyType {
    const { getEnemyTypeForLevel } = require('../../utils/game.utils');
    return getEnemyTypeForLevel(level);
  }
}

