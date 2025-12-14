import * as PIXI from 'pixi.js';

export interface Healthable {
  maxHealth: number;
  currentHealth: number;
  takeDamage(damage: number): boolean;
}

export interface Movable {
  sprite: PIXI.Graphics;
  update(gameSpeed?: number): void;
}

export interface Collidable {
  getBounds(): PIXI.Bounds;
  checkCollision(otherBounds: PIXI.Bounds): boolean;
}

export interface Destroyable {
  isDestroyed: boolean;
  destroy(): void;
}

export interface Entity extends Movable, Collidable, Destroyable {}
