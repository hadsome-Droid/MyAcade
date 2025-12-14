import * as PIXI from 'pixi.js';

/**
 * Check if a sprite is out of bounds
 */
export function isOutOfBounds(
  sprite: PIXI.Graphics,
  app: PIXI.Application,
  margin: number = 0
): boolean {
  if (!sprite || sprite.x === null || sprite.x === undefined) {
    return true;
  }
  const size = sprite.width || margin || 5;
  return (
    sprite.x < -size - margin ||
    sprite.x > app.screen.width + size + margin ||
    sprite.y < -size - margin ||
    sprite.y > app.screen.height + size + margin
  );
}

/**
 * Get center point of a sprite
 */
export function getSpriteCenter(sprite: PIXI.Graphics): { x: number; y: number } {
  const bounds = sprite.getBounds();
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

/**
 * Constrain sprite position within screen bounds
 */
export function constrainToBounds(
  sprite: PIXI.Graphics,
  app: PIXI.Application,
  radius: number = 0
): void {
  sprite.x = Math.max(radius, Math.min(app.screen.width - radius, sprite.x));
  sprite.y = Math.max(radius, Math.min(app.screen.height - radius, sprite.y));
}
