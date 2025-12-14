import * as PIXI from 'pixi.js';
import { CollisionDetector } from './CollisionDetector';

export interface Damageable {
  takeDamage(damage: number): boolean;
}

export class CollisionHandler {
  /**
   * Handle collision between two entities with damage
   */
  public static handleDamageCollision(
    attacker: { getBounds(): PIXI.Bounds },
    target: { getBounds(): PIXI.Bounds } & Damageable,
    damage: number,
    cooldown?: { lastTime: number; interval: number }
  ): boolean {
    const attackerBounds = attacker.getBounds();
    const targetBounds = target.getBounds();

    if (!CollisionDetector.checkAABBCollision(attackerBounds, targetBounds)) {
      return false;
    }

    // Check cooldown if provided
    if (cooldown) {
      const currentTime = Date.now();
      if (currentTime - cooldown.lastTime < cooldown.interval) {
        return false;
      }
      cooldown.lastTime = currentTime;
    }

    return target.takeDamage(damage);
  }
}
