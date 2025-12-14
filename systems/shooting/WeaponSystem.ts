import { Direction } from '../../types/game.types';
import { WeaponUpgrades } from '../../store/gameStore';
import { GAME_CONFIG } from '../../constants/game.constants';
import { normalizeVector, rotateDirection } from '../../utils/math.utils';

export class WeaponSystem {
  private lastShotTime: number = 0;

  /**
   * Check if weapon can fire based on cooldown
   */
  public canFire(upgrades: WeaponUpgrades): boolean {
    const currentTime = Date.now();
    const cooldown = GAME_CONFIG.WEAPON.BASE_FIRE_RATE / upgrades.fireRate;
    
    if (currentTime - this.lastShotTime >= cooldown) {
      this.lastShotTime = currentTime;
      return true;
    }
    return false;
  }

  /**
   * Calculate bullet directions based on weapon upgrades and base direction
   */
  public calculateBulletDirections(
    baseDirection: Direction,
    bulletCount: number
  ): Direction[] {
    if (bulletCount === 1) {
      return [baseDirection];
    }

    if (bulletCount === 2) {
      const spreadAngle = GAME_CONFIG.WEAPON.SPREAD_ANGLE_2_BULLETS;
      return [
        rotateDirection(baseDirection, spreadAngle),
        rotateDirection(baseDirection, -spreadAngle),
      ];
    }

    // 3 or more bullets
    const spreadAngle = GAME_CONFIG.WEAPON.SPREAD_ANGLE_3_BULLETS;
    return [
      rotateDirection(baseDirection, spreadAngle),
      baseDirection,
      rotateDirection(baseDirection, -spreadAngle),
    ];
  }

  /**
   * Calculate shooting direction from position to target
   */
  public calculateShootDirection(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): Direction {
    const dx = toX - fromX;
    const dy = toY - fromY;
    return normalizeVector(dx, dy);
  }
}

