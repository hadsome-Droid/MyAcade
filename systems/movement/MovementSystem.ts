import * as PIXI from 'pixi.js';
import { Direction } from '../../types/game.types';

export interface MovementInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export class MovementSystem {
  /**
   * Calculate movement direction from input
   */
  public static getMovementDirection(input: MovementInput): Direction {
    let moveX = 0;
    let moveY = 0;

    if (input.left) moveX = -1;
    if (input.right) moveX = 1;
    if (input.up) moveY = -1;
    if (input.down) moveY = 1;

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      const length = Math.sqrt(2);
      return { x: moveX / length, y: moveY / length };
    }

    return { x: moveX, y: moveY };
  }

  /**
   * Apply movement to sprite
   */
  public static applyMovement(
    sprite: PIXI.Graphics | PIXI.Sprite,
    direction: Direction,
    speed: number,
    gameSpeed: number = 1
  ): void {
    sprite.x += direction.x * speed * gameSpeed;
    sprite.y += direction.y * speed * gameSpeed;
  }

  /**
   * Move sprite with boundary constraints
   */
  public static moveWithBounds(
    sprite: PIXI.Graphics | PIXI.Sprite,
    direction: Direction,
    speed: number,
    app: PIXI.Application,
    radius: number = 0,
    gameSpeed: number = 1
  ): void {
    const newX = sprite.x + direction.x * speed * gameSpeed;
    const newY = sprite.y + direction.y * speed * gameSpeed;

    sprite.x = Math.max(radius, Math.min(app.screen.width - radius, newX));
    sprite.y = Math.max(radius, Math.min(app.screen.height - radius, newY));
  }
}
