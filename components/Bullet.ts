import * as PIXI from 'pixi.js';
import { GameEntity } from '../entities/GameEntity';

/**
 * Класс пули, наследуется от GameEntity
 */
export class Bullet extends GameEntity {
  private directionX: number;
  private directionY: number;
  private size: number;

  /**
   * Загружает текстуры для пуль
   */
  public static async loadTextures(): Promise<void> {
    // Создаем простую текстуру программно
    // В будущем можно загрузить из файла через Assets.load
    // Текстуры будут создаваться динамически в конструкторе
    // Этот метод оставлен для совместимости с архитектурой
    return Promise.resolve();
  }

  constructor(
    app: PIXI.Application,
    x: number,
    y: number,
    directionX: number,
    directionY: number,
    speed: number = 8,
    size: number = 5
  ) {
    super(app, speed);
    this.directionX = directionX;
    this.directionY = directionY;
    this.size = size;
    
    this.init(x, y);
  }

  private init(x: number, y: number) {
    // Создаем графику для пули (временно, пока не загружены текстуры)
    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, this.size);
    graphics.fill(0xffff00); // Желтый цвет
    
    // Создаем текстуру из графики
    const texture = this.app.renderer.generateTexture(graphics);
    this.sprite = new PIXI.Sprite(texture);
    
    // Настраиваем спрайт
    this.sprite.anchor.set(0.5);
    this.sprite.x = x;
    this.sprite.y = y;
    
    this.app.stage.addChild(this.sprite);
    
    // Очищаем временную графику
    graphics.destroy();
  }

  public update(): void {
    if (this.isDestroyed || !this.sprite) return;

    // Движение пули
    this.move(this.directionX, this.directionY);

    // Удаляем если вышли за пределы экрана
    if (this.isOutOfBounds()) {
      this.destroy();
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

