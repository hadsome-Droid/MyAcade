import { Healthable } from '../../types/entity.types';

export class HealthSystem implements Healthable {
  public maxHealth: number;
  public currentHealth: number;

  constructor(maxHealth: number, startHealth?: number) {
    this.maxHealth = maxHealth;
    this.currentHealth = startHealth ?? maxHealth;
  }

  public takeDamage(damage: number): boolean {
    if (this.currentHealth <= 0) return false;
    
    this.currentHealth = Math.max(0, this.currentHealth - damage);
    return this.currentHealth <= 0;
  }

  public heal(amount: number): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }

  public getHealthPercent(): number {
    return Math.max(0, this.currentHealth / this.maxHealth);
  }

  public isAlive(): boolean {
    return this.currentHealth > 0;
  }

  public reset(): void {
    this.currentHealth = this.maxHealth;
  }
}
