import * as PIXI from 'pixi.js';
import { getScaledSize } from '../utils/scaling';

export class Bullet {
  public sprite: PIXI.Graphics;
  private app: PIXI.Application;
  private speed: number;
  public isDestroyed: boolean = false;
  private directionX: number;
  private directionY: number;

  constructor(
    app: PIXI.Application,
    x: number,
    y: number,
    directionX: number,
    directionY: number,
    speed: number = 8,
    size: number = 5
  ) {
    this.app = app;
    this.speed = speed;
    this.directionX = directionX;
    this.directionY = directionY;
    this.sprite = new PIXI.Graphics();
    this.init(x, y, size);
  }

  private init(x: number, y: number, size: number) {
    // Создаем круг для пули
    this.sprite.circle(0, 0, size);
    this.sprite.fill(0xffff00); // Желтый цвет
    this.sprite.x = x;
    this.sprite.y = y;
    this.app.stage.addChild(this.sprite);
  }

  public update() {
    if (this.isDestroyed || !this.sprite) return;

    // Move in direction vector
    this.sprite.x += this.directionX * this.speed;
    this.sprite.y += this.directionY * this.speed;

    // Удаляем если вышли за пределы экрана
    if (this.isOutOfBounds()) {
      this.destroy();
    }
  }

  public isOutOfBounds(): boolean {
    if (this.isDestroyed || !this.sprite || this.sprite.y === null || this.sprite.y === undefined) {
      return true;
    }
    const size = this.sprite.width || 5;
    return (
      this.sprite.x < -size ||
      this.sprite.x > this.app.screen.width + size ||
      this.sprite.y < -size ||
      this.sprite.y > this.app.screen.height + size
    );
  }

  public getBounds() {
    if (this.isDestroyed || !this.sprite) {
      // Возвращаем пустые границы если спрайт уничтожен
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      } as PIXI.Bounds;
    }
    return this.sprite.getBounds();
  }

  public destroy() {
    if (!this.isDestroyed) {
      this.isDestroyed = true;
      this.sprite.destroy();
    }
  }

  public checkCollision(enemyBounds: PIXI.Bounds): boolean {
    if (this.isDestroyed || !this.sprite) return false;
    
    const bulletBounds = this.getBounds();
    return (
      bulletBounds.x < enemyBounds.x + enemyBounds.width &&
      bulletBounds.x + bulletBounds.width > enemyBounds.x &&
      bulletBounds.y < enemyBounds.y + enemyBounds.height &&
      bulletBounds.y + bulletBounds.height > enemyBounds.y
    );
  }
}

