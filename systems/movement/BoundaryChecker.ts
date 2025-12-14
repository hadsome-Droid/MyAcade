import * as PIXI from 'pixi.js';
import { isOutOfBounds } from '../../utils/pixi.utils';

export class BoundaryChecker {
  /**
   * Check if sprite is out of screen bounds
   */
  public static isOutOfBounds(
    sprite: PIXI.Graphics,
    app: PIXI.Application,
    margin: number = 0
  ): boolean {
    return isOutOfBounds(sprite, app, margin);
  }

  /**
   * Constrain sprite position within screen bounds
   */
  public static constrainToBounds(
    sprite: PIXI.Graphics,
    app: PIXI.Application,
    radius: number = 0
  ): void {
    sprite.x = Math.max(radius, Math.min(app.screen.width - radius, sprite.x));
    sprite.y = Math.max(radius, Math.min(app.screen.height - radius, sprite.y));
  }
}
