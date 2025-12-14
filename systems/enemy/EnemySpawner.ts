import * as PIXI from 'pixi.js';
import { Enemy } from '../../components/Enemy';
import { SpawnSide, EnemyType } from '../../types/game.types';
import { EnemyFactory } from './EnemyFactory';
import { getRandomSpawnSide, getEnemyTypeForLevel } from '../../utils/game.utils';
import { ENEMY_SPAWN_CONFIG } from '../../constants/enemy.constants';

export class EnemySpawner {
  private app: PIXI.Application;
  private timer: number = 0;

  constructor(app: PIXI.Application) {
    this.app = app;
  }

  /**
   * Update spawn timer and spawn enemies if needed
   */
  public update(
    gameSpeed: number,
    targetX: number,
    targetY: number,
    level: number
  ): Enemy[] {
    this.timer += 1;
    const spawnInterval = Math.max(
      ENEMY_SPAWN_CONFIG.baseSpawnInterval / gameSpeed,
      ENEMY_SPAWN_CONFIG.minSpawnInterval
    );

    if (this.timer > spawnInterval) {
      this.timer = 0;
      return this.spawn(targetX, targetY, level);
    }

    return [];
  }

  /**
   * Spawn enemies
   */
  private spawn(targetX: number, targetY: number, level: number): Enemy[] {
    const enemies: Enemy[] = [];
    const spawnSide = getRandomSpawnSide() as SpawnSide;
    const enemyCount = Math.random() > 0.5 ? 1 : 2;

    for (let i = 0; i < enemyCount; i++) {
      const enemyType = getEnemyTypeForLevel(level);
      const enemy = EnemyFactory.create(
        this.app,
        spawnSide,
        targetX,
        targetY,
        enemyType
      );
      enemies.push(enemy);
    }

    return enemies;
  }

  public reset(): void {
    this.timer = 0;
  }
}

