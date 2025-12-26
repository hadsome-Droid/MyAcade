import * as PIXI from 'pixi.js';

/**
 * Базовый абстрактный класс для всех игровых сущностей
 * Содержит общую логику для спрайтов, движения, проверки границ и уничтожения
 */
export abstract class GameEntity {
  public sprite!: PIXI.Sprite;
  protected app: PIXI.Application;
  protected speed: number;
  public isDestroyed: boolean = false;

  constructor(app: PIXI.Application, speed: number = 1) {
    this.app = app;
    this.speed = speed;
    // Sprite MUST be initialized in child class constructor
  }

  /**
   * Абстрактный метод для обновления сущности каждый кадр
   * Должен быть реализован в дочерних классах
   */
  public abstract update(...args: any[]): void;

  /**
   * Получает границы спрайта для проверки столкновений
   */
  public getBounds(): PIXI.Bounds {
    if (this.isDestroyed || this.sprite.destroyed) {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      } as PIXI.Bounds;
    }
    return this.sprite.getBounds();
  }

  /**
   * Уничтожает сущность и освобождает ресурсы
   */
  public destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    // Удаляем спрайт со сцены перед уничтожением
    if (this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
    
    // Уничтожаем спрайт с опциями (не уничтожаем базовую текстуру для переиспользования)
    this.sprite.destroy({
      children: false,
      texture: false,
      textureSource: false
    });
  }

  /**
   * Проверяет, вышла ли сущность за пределы экрана
   */
  public isOutOfBounds(margin: number = 0): boolean {
    if (this.isDestroyed || this.sprite.destroyed) return true;
    
    const size = Math.max(this.sprite.width, this.sprite.height) || margin || 5;
    return (
      this.sprite.x < -size - margin ||
      this.sprite.x > this.app.screen.width + size + margin ||
      this.sprite.y < -size - margin ||
      this.sprite.y > this.app.screen.height + size + margin
    );
  }

  /**
   * Базовый метод для движения сущности в заданном направлении
   */
  protected move(directionX: number, directionY: number, speedMultiplier: number = 1): void {
    if (this.isDestroyed) return;
    
    // Дополнительная защита: проверяем, что спрайт не был уничтожен PIXI.js
    if (this.sprite.destroyed) return;
    
    this.sprite.x += directionX * this.speed * speedMultiplier;
    this.sprite.y += directionY * this.speed * speedMultiplier;
  }

  /**
   * Получает текущую позицию сущности
   */
  public getPosition(): { x: number; y: number } {
    if (this.isDestroyed || this.sprite.destroyed) {
      return { x: 0, y: 0 };
    }
    return {
      x: this.sprite.x,
      y: this.sprite.y,
    };
  }

  /**
   * Устанавливает позицию сущности
   */
  public setPosition(x: number, y: number): void {
    if (this.isDestroyed || this.sprite.destroyed) return;
    
    this.sprite.x = x;
    this.sprite.y = y;
  }

  /**
   * Получает скорость сущности
   */
  public getSpeed(): number {
    return this.speed;
  }

  /**
   * Устанавливает скорость сущности
   */
  public setSpeed(speed: number): void {
    this.speed = speed;
  }

  /**
   * Проверяет, уничтожена ли сущность
   */
  public getIsDestroyed(): boolean {
    return this.isDestroyed;
  }
}

