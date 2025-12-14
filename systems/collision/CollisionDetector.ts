import * as PIXI from 'pixi.js';

export class CollisionDetector {
  /**
   * Check if two bounding boxes overlap (AABB collision)
   */
  public static checkAABBCollision(
    bounds1: PIXI.Bounds,
    bounds2: PIXI.Bounds
  ): boolean {
    return (
      bounds1.x < bounds2.x + bounds2.width &&
      bounds1.x + bounds1.width > bounds2.x &&
      bounds1.y < bounds2.y + bounds2.height &&
      bounds1.y + bounds1.height > bounds2.y
    );
  }

  /**
   * Check collision between two sprites
   */
  public static checkSpriteCollision(
    sprite1: PIXI.Graphics,
    sprite2: PIXI.Graphics
  ): boolean {
    const bounds1 = sprite1.getBounds();
    const bounds2 = sprite2.getBounds();
    return this.checkAABBCollision(bounds1, bounds2);
  }

  /**
   * Check collision between a sprite and bounds
   */
  public static checkSpriteBoundsCollision(
    sprite: PIXI.Graphics,
    bounds: PIXI.Bounds
  ): boolean {
    const spriteBounds = sprite.getBounds();
    return this.checkAABBCollision(spriteBounds, bounds);
  }
}
