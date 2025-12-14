import * as PIXI from 'pixi.js';
import { getScaledSize } from '../utils/scaling';

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

export class Enemy {
  public sprite: PIXI.Graphics;
  private app: PIXI.Application;
  private speed: number;
  public isDestroyed: boolean = false;
  public enemyType: EnemyType;
  public maxHealth: number;
  public currentHealth: number;
  private directionX: number = 0;
  private directionY: number = 0;

  constructor(
    app: PIXI.Application,
    spawnSide: SpawnSide,
    speed: number = 2,
    enemyType?: EnemyType,
    targetX?: number,
    targetY?: number
  ) {
    this.app = app;
    this.speed = speed;
    this.enemyType = enemyType || this.getRandomEnemyType();
    this.maxHealth = this.getHealthForType(this.enemyType);
    this.currentHealth = this.maxHealth;
    this.sprite = new PIXI.Graphics();
    
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

  private getRandomEnemyType(): EnemyType {
    const rand = Math.random();
    if (rand < 0.7) return EnemyType.LIGHT;
    if (rand < 0.95) return EnemyType.MEDIUM;
    return EnemyType.HEAVY;
  }

  private getHealthForType(type: EnemyType): number {
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
    const size = this.getSizeForType(this.enemyType);
    const color = this.getColorForType(this.enemyType);
    
    // Создаем прямоугольник для врага
    this.sprite.rect(0, 0, size, size);
    this.sprite.fill(color);
    
    // Position based on spawn side
    switch (spawnSide) {
      case SpawnSide.TOP:
        this.sprite.x = Math.random() * (this.app.screen.width - size);
        this.sprite.y = -size;
        break;
      case SpawnSide.BOTTOM:
        this.sprite.x = Math.random() * (this.app.screen.width - size);
        this.sprite.y = this.app.screen.height + size;
        break;
      case SpawnSide.LEFT:
        this.sprite.x = -size;
        this.sprite.y = Math.random() * (this.app.screen.height - size);
        break;
      case SpawnSide.RIGHT:
        this.sprite.x = this.app.screen.width + size;
        this.sprite.y = Math.random() * (this.app.screen.height - size);
        break;
    }
    
    // Calculate direction toward target (player center if not specified)
    const targetPosX = targetX ?? this.app.screen.width / 2;
    const targetPosY = targetY ?? this.app.screen.height / 2;
    this.calculateDirection(targetPosX, targetPosY);
    
    this.app.stage.addChild(this.sprite);
  }

  public takeDamage(damage: number = 1): boolean {
    if (this.isDestroyed) return false;
    
    this.currentHealth -= damage;
    
    // Визуальная обратная связь - изменение прозрачности при уроне
    const healthPercent = this.currentHealth / this.maxHealth;
    this.sprite.alpha = 0.5 + (healthPercent * 0.5); // От 0.5 до 1.0
    
    if (this.currentHealth <= 0) {
      this.destroy();
      return true; // Враг уничтожен
    }
    
    return false; // Враг еще жив
  }

  public update(gameSpeed: number = 1) {
    if (this.isDestroyed) return;

    // Move in direction vector
    this.sprite.x += this.directionX * this.speed * gameSpeed;
    this.sprite.y += this.directionY * this.speed * gameSpeed;
  }

  public isOutOfBounds(): boolean {
    const size = this.getSizeForType(this.enemyType);
    return (
      this.sprite.x < -size ||
      this.sprite.x > this.app.screen.width + size ||
      this.sprite.y < -size ||
      this.sprite.y > this.app.screen.height + size
    );
  }

  public getBounds() {
    return this.sprite.getBounds();
  }

  public destroy() {
    if (!this.isDestroyed) {
      this.isDestroyed = true;
      this.sprite.destroy();
    }
  }

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
