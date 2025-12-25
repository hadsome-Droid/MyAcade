import * as PIXI from 'pixi.js';
import { GameEntity } from './GameEntity';

/**
 * Промежуточный абстрактный класс для сущностей со здоровьем
 * Расширяет GameEntity, добавляя систему здоровья и получения урона
 */
export abstract class HealthEntity extends GameEntity {
  public maxHealth: number;
  public currentHealth: number;

  constructor(app: PIXI.Application, speed: number, maxHealth: number) {
    super(app, speed);
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
  }

  /**
   * Обрабатывает получение урона сущностью
   * @param damage Количество урона
   * @returns true если сущность уничтожена, false если еще жива
   */
  public takeDamage(damage: number = 1): boolean {
    if (this.isDestroyed || this.currentHealth <= 0) return false;
    
    this.currentHealth = Math.max(0, this.currentHealth - damage);
    
    // Вызываем визуальный эффект урона
    this.onDamageEffect();
    
    // Если здоровье закончилось, уничтожаем сущность
    if (this.currentHealth <= 0) {
      this.destroy();
      return true; // Сущность уничтожена
    }
    
    return false; // Сущность еще жива
  }

  /**
   * Абстрактный метод для визуальных эффектов при получении урона
   * Должен быть реализован в дочерних классах
   */
  protected abstract onDamageEffect(): void;

  /**
   * Получает текущее здоровье
   */
  public getCurrentHealth(): number {
    return this.currentHealth;
  }

  /**
   * Получает максимальное здоровье
   */
  public getMaxHealth(): number {
    return this.maxHealth;
  }

  /**
   * Устанавливает текущее здоровье
   */
  public setCurrentHealth(health: number): void {
    this.currentHealth = Math.max(0, Math.min(health, this.maxHealth));
  }

  /**
   * Восстанавливает здоровье
   * @param amount Количество восстанавливаемого здоровья
   */
  public heal(amount: number): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }

  /**
   * Получает процент здоровья (0-1)
   */
  public getHealthPercent(): number {
    return this.maxHealth > 0 ? this.currentHealth / this.maxHealth : 0;
  }
}

