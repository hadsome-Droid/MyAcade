import * as PIXI from 'pixi.js';
import { Bullet } from '../../components/Bullet';
import { Direction } from '../../types/game.types';
import { WeaponUpgrades } from '../../store/gameStore';
import { GAME_CONFIG } from '../../constants/game.constants';

export class BulletFactory {
  /**
   * Create a bullet
   */
  public static create(
    app: PIXI.Application,
    x: number,
    y: number,
    direction: Direction,
    upgrades: WeaponUpgrades
  ): Bullet {
    return new Bullet(
      app,
      x,
      y,
      direction.x,
      direction.y,
      upgrades.bulletSpeed || GAME_CONFIG.BULLET.DEFAULT_SPEED,
      upgrades.bulletSize || GAME_CONFIG.BULLET.DEFAULT_SIZE
    );
  }

  /**
   * Create multiple bullets with spread
   */
  public static createSpread(
    app: PIXI.Application,
    x: number,
    y: number,
    directions: Direction[],
    upgrades: WeaponUpgrades
  ): Bullet[] {
    return directions.map((dir) => this.create(app, x, y, dir, upgrades));
  }
}

