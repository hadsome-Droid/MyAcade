import * as PIXI from 'pixi.js';
import { getScaledSize } from '../utils/scaling';
import { HealthEntity } from '../entities/HealthEntity';

export enum EnemyType {
  LIGHT = 'LIGHT',   // 1 HP
  MEDIUM = 'MEDIUM', // 2 HP
  HEAVY = 'HEAVY',   // 3 HP
}

export enum SpawnSide {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

/**
 * Класс врага, наследуется от HealthEntity
 */
export class Enemy extends HealthEntity {
  public enemyType: EnemyType;
  private directionX: number = 0;
  private directionY: number = 0;
  private size: number;

  /**
   * Загружает текстуры для врагов
   */
  public static async loadTextures(): Promise<void> {
    // Создаем простые текстуры для разных типов врагов программно
    // В будущем можно загрузить из файлов через Assets.load
    // Для программно созданных текстур не требуется загрузка через Assets
    
    // Текстуры будут создаваться динамически в методе init()
    // Этот метод оставлен для совместимости с архитектурой
    return Promise.resolve();
  }

  constructor(
    app: PIXI.Application,
    spawnSide: SpawnSide,
    speed: number = 2,
    enemyType?: EnemyType,
    targetX?: number,
    targetY?: number
  ) {
    const type = enemyType || Enemy.getRandomEnemyType();
    const health = Enemy.getHealthForType(type);
    
    super(app, speed, health);
    
    this.enemyType = type;
    this.size = this.getSizeForType(this.enemyType);
    
    // Initialize position and calculate direction
    this.init(spawnSide, targetX, targetY);
  }

  private calculateDirection(targetX: number, targetY: number) {
    const startX = this.sprite.x;
    const startY = this.sprite.y;
    
    // Calculate direction vector
    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize direction vector (avoid division by zero)
    if (distance > 0) {
      this.directionX = dx / distance;
      this.directionY = dy / distance;
    } else {
      this.directionX = 0;
      this.directionY = 0;
    }
  }

  private static getRandomEnemyType(): EnemyType {
    const rand = Math.random();
    if (rand < 0.7) return EnemyType.LIGHT;
    if (rand < 0.95) return EnemyType.MEDIUM;
    return EnemyType.HEAVY;
  }

  private static getHealthForType(type: EnemyType): number {
    switch (type) {
      case EnemyType.LIGHT:
        return 1;
      case EnemyType.MEDIUM:
        return 2;
      case EnemyType.HEAVY:
        return 3;
      default:
        return 1;
    }
  }

  private getColorForType(type: EnemyType): number {
    switch (type) {
      case EnemyType.LIGHT:
        return 0xff0000; // Красный
      case EnemyType.MEDIUM:
        return 0xff8800; // Оранжевый
      case EnemyType.HEAVY:
        return 0x8b0000; // Темно-красный/бордовый
      default:
        return 0xff0000;
    }
  }

  private getSizeForType(type: EnemyType): number {
    // Базовые размеры для расчета
    let baseSize: number;
    switch (type) {
      case EnemyType.LIGHT:
        baseSize = 20 + Math.random() * 5; // 20-25
        break;
      case EnemyType.MEDIUM:
        baseSize = 25 + Math.random() * 5; // 25-30
        break;
      case EnemyType.HEAVY:
        baseSize = 30 + Math.random() * 5; // 30-35
        break;
      default:
        baseSize = 25;
    }
    
    // Используем масштабированные размеры
    const minSize = type === EnemyType.LIGHT 
      ? getScaledSize('ENEMY_LIGHT')
      : type === EnemyType.MEDIUM
      ? getScaledSize('ENEMY_MEDIUM')
      : getScaledSize('ENEMY_HEAVY');
    
    // Комбинируем базовый размер с масштабированием
    return Math.max(minSize, baseSize);
  }

  private init(spawnSide: SpawnSide, targetX?: number, targetY?: number) {
    const color = this.getColorForType(this.enemyType);
    
    // Создаем графику для врага
    const graphics = new PIXI.Graphics();
    graphics.rect(0, 0, this.size, this.size);
    graphics.fill(color);
    
    // Создаем текстуру из графики
    const texture = this.app.renderer.generateTexture(graphics);
    this.sprite = new PIXI.Sprite(texture);
    
    // Настраиваем спрайт
    this.sprite.anchor.set(0);
    
    // Position based on spawn side
    switch (spawnSide) {
      case SpawnSide.TOP:
        this.sprite.x = Math.random() * (this.app.screen.width - this.size);
        this.sprite.y = -this.size;
        break;
      case SpawnSide.BOTTOM:
        this.sprite.x = Math.random() * (this.app.screen.width - this.size);
        this.sprite.y = this.app.screen.height + this.size;
        break;
      case SpawnSide.LEFT:
        this.sprite.x = -this.size;
        this.sprite.y = Math.random() * (this.app.screen.height - this.size);
        break;
      case SpawnSide.RIGHT:
        this.sprite.x = this.app.screen.width + this.size;
        this.sprite.y = Math.random() * (this.app.screen.height - this.size);
        break;
    }
    
    // Calculate direction toward target (player center if not specified)
    const targetPosX = targetX ?? this.app.screen.width / 2;
    const targetPosY = targetY ?? this.app.screen.height / 2;
    this.calculateDirection(targetPosX, targetPosY);
    
    this.app.stage.addChild(this.sprite);
    
    // Очищаем временную графику
    graphics.destroy();
  }

  /**
   * Реализация визуального эффекта при получении урона
   */
  protected onDamageEffect(): void {
    if (this.sprite.destroyed) return;
    
    // Визуальная обратная связь - изменение прозрачности при уроне
    const healthPercent = this.getHealthPercent();
    this.sprite.alpha = 0.5 + (healthPercent * 0.5); // От 0.5 до 1.0
  }

  public update(gameSpeed: number = 1): void {
    if (this.isDestroyed) return;

    // Move in direction vector
    this.move(this.directionX, this.directionY, gameSpeed);
  }

  public isOutOfBounds(): boolean {
    return super.isOutOfBounds(this.size);
  }

  /**
   * Проверка круговой коллизии с игроком (новый метод)
   * @param playerX X координата игрока
   * @param playerY Y координата игрока
   * @param playerRadius Радиус игрока
   * @returns true если враг столкнулся с игроком
   */
  public checkCircleCollision(playerX: number, playerY: number, playerRadius: number): boolean {
    const dx = this.sprite.x - playerX;
    const dy = this.sprite.y - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const enemyRadius = this.size / 2;
    return distance < (enemyRadius + playerRadius);
  }

  /**
   * Получает радиус врага для круговой коллизии
   */
  public getRadius(): number {
    return this.size / 2;
  }

  /**
   * УСТАРЕВШИЙ: Проверка AABB коллизии с игроком (для обратной совместимости)
   * Рекомендуется использовать checkCircleCollision
   */
  public checkCollision(playerBounds: PIXI.Bounds): boolean {
    const enemyBounds = this.getBounds();
    return (
      enemyBounds.x < playerBounds.x + playerBounds.width &&
      enemyBounds.x + enemyBounds.width > playerBounds.x &&
      enemyBounds.y < playerBounds.y + playerBounds.height &&
      enemyBounds.y + enemyBounds.height > playerBounds.y
    );
  }

  public checkBulletCollision(bulletBounds: PIXI.Bounds): boolean {
    const enemyBounds = this.getBounds();
    return (
      bulletBounds.x < enemyBounds.x + enemyBounds.width &&
      bulletBounds.x + bulletBounds.width > enemyBounds.x &&
      bulletBounds.y < enemyBounds.y + enemyBounds.height &&
      bulletBounds.y + bulletBounds.height > enemyBounds.y
    );
  }

  public getPointsForDestroying(): number {
    switch (this.enemyType) {
      case EnemyType.LIGHT:
        return 30;
      case EnemyType.MEDIUM:
        return 60;
      case EnemyType.HEAVY:
        return 100;
      default:
        return 30;
    }
  }
}
