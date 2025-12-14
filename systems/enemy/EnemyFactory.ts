import * as PIXI from 'pixi.js';
import { Enemy } from '../../components/Enemy';
import { EnemyType, SpawnSide } from '../../types/game.types';
import { EnemyTypeConfig } from './EnemyTypeConfig';
import { ENEMY_SPAWN_CONFIG } from '../../constants/enemy.constants';
import { directionTo } from '../../utils/math.utils';
import { getSpawnPosition } from '../../utils/game.utils';

export class EnemyFactory {
  /**
   * Create an enemy
   */
  public static create(
    app: PIXI.Application,
    spawnSide: SpawnSide,
    targetX: number,
    targetY: number,
    enemyType?: EnemyType,
    speed?: number
  ): Enemy {
    const type = enemyType || EnemyTypeConfig.getRandomTypeForLevel(1);
    const enemySpeed = speed || 
      (ENEMY_SPAWN_CONFIG.minSpeed + 
       Math.random() * (ENEMY_SPAWN_CONFIG.maxSpeed - ENEMY_SPAWN_CONFIG.minSpeed));

    const size = EnemyTypeConfig.getRandomSize(type);
    const spawnPos = getSpawnPosition(
      spawnSide,
      app.screen.width,
      app.screen.height,
      size
    );

    // Create enemy with calculated position
    const enemy = new Enemy(app, spawnSide, enemySpeed, type, targetX, targetY);
    enemy.sprite.x = spawnPos.x;
    enemy.sprite.y = spawnPos.y;

    return enemy;
  }
}

