import { WeaponUpgrades } from '../../store/gameStore';

/**
 * Компонент системы оружия игрока
 */
export class PlayerWeapon {
  private lastShotTime: number = 0;
  private shootCallback?: (x: number, y: number, directionX: number, directionY: number, upgrades: WeaponUpgrades) => void;

  /**
   * Устанавливает callback для создания пуль
   */
  public setShootCallback(callback: (x: number, y: number, directionX: number, directionY: number, upgrades: WeaponUpgrades) => void): void {
    this.shootCallback = callback;
  }

  /**
   * Проверяет, можно ли стрелять (учитывая cooldown)
   */
  public canShoot(upgrades: WeaponUpgrades): boolean {
    const currentTime = Date.now();
    const cooldown = 300 / upgrades.fireRate;
    return currentTime - this.lastShotTime >= cooldown;
  }

  /**
   * Выполняет выстрел
   * @param position Позиция игрока {x, y}
   * @param target Цель для стрельбы {x, y}
   * @param upgrades Улучшения оружия
   */
  public shoot(position: { x: number; y: number }, target: { x: number; y: number }, upgrades: WeaponUpgrades): void {
    if (!this.shootCallback) return;

    const dx = target.x - position.x;
    const dy = target.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Базовое направление (к цели, или вверх по умолчанию)
    let baseDirX = 0;
    let baseDirY = -1; // Default: shoot up

    if (distance > 0) {
      baseDirX = dx / distance;
      baseDirY = dy / distance;
    }

    // Создаем пули в зависимости от bulletCount
    if (upgrades.bulletCount === 1) {
      // Одна пуля в направлении цели
      this.shootCallback(position.x, position.y, baseDirX, baseDirY, upgrades);
    } else if (upgrades.bulletCount === 2) {
      // Две пули с небольшим разбросом
      const spreadAngle = Math.PI / 12; // 15 degrees
      const dir1X = baseDirX * Math.cos(spreadAngle) - baseDirY * Math.sin(spreadAngle);
      const dir1Y = baseDirX * Math.sin(spreadAngle) + baseDirY * Math.cos(spreadAngle);
      const dir2X = baseDirX * Math.cos(-spreadAngle) - baseDirY * Math.sin(-spreadAngle);
      const dir2Y = baseDirX * Math.sin(-spreadAngle) + baseDirY * Math.cos(-spreadAngle);

      this.shootCallback(position.x, position.y, dir1X, dir1Y, upgrades);
      this.shootCallback(position.x, position.y, dir2X, dir2Y, upgrades);
    } else if (upgrades.bulletCount >= 3) {
      // Три пули: центр, лево, право с разбросом
      const spreadAngle = Math.PI / 10; // 18 degrees
      const dirLeftX = baseDirX * Math.cos(spreadAngle) - baseDirY * Math.sin(spreadAngle);
      const dirLeftY = baseDirX * Math.sin(spreadAngle) + baseDirY * Math.cos(spreadAngle);
      const dirRightX = baseDirX * Math.cos(-spreadAngle) - baseDirY * Math.sin(-spreadAngle);
      const dirRightY = baseDirX * Math.sin(-spreadAngle) + baseDirY * Math.cos(-spreadAngle);

      this.shootCallback(position.x, position.y, dirLeftX, dirLeftY, upgrades);
      this.shootCallback(position.x, position.y, baseDirX, baseDirY, upgrades);
      this.shootCallback(position.x, position.y, dirRightX, dirRightY, upgrades);
    }

    this.lastShotTime = Date.now();
  }
}

