import * as PIXI from 'pixi.js';

/**
 * Позиция объекта на экране
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Направление движения (нормализованный вектор)
 */
export interface Direction {
  x: number;
  y: number;
}

/**
 * Интерфейс для сущностей со здоровьем
 */
export interface Healthable {
  maxHealth: number;
  currentHealth: number;
  takeDamage(damage: number): boolean;
}

/**
 * Интерфейс для подвижных объектов
 */
export interface Movable {
  sprite: PIXI.Sprite | PIXI.Graphics;
  update(...args: any[]): void;
}

/**
 * Интерфейс для объектов с коллизиями
 */
export interface Collidable {
  getBounds(): PIXI.Bounds;
  checkCollision?(otherBounds: PIXI.Bounds): boolean;
}

/**
 * Интерфейс для уничтожаемых объектов
 */
export interface Destroyable {
  isDestroyed: boolean;
  destroy(): void;
}

/**
 * Базовый интерфейс игровой сущности
 */
export interface IGameEntity extends Movable, Collidable, Destroyable {
  getPosition(): Position;
  setPosition(x: number, y: number): void;
  getSpeed(): number;
  setSpeed(speed: number): void;
  isOutOfBounds(margin?: number): boolean;
}

/**
 * Интерфейс для сущностей со здоровьем
 */
export interface IHealthEntity extends IGameEntity, Healthable {
  getCurrentHealth(): number;
  getMaxHealth(): number;
  setCurrentHealth(health: number): void;
  heal(amount: number): void;
  getHealthPercent(): number;
}

/**
 * Общий интерфейс для всех сущностей (сохранен для обратной совместимости)
 */
export interface Entity extends Movable, Collidable, Destroyable {}
