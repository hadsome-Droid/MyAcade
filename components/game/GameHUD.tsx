import { Player } from '../Player';
import styles from '../Game.module.scss';

interface GameHUDProps {
  score: number;
  player: Player | null;
  level: number;
  currentLevelScore: number;
  getPointsForNextLevel: (level: number) => number;
  isMobile: boolean;
  weaponUpgrades: {
    fireRate: number;
    bulletCount: number;
    bulletSpeed: number;
  };
}

/**
 * Game Heads-Up Display (HUD)
 * Shows score, health, level progress, controls hint, and weapon upgrades
 */
export const GameHUD = ({
  score,
  player,
  level,
  currentLevelScore,
  getPointsForNextLevel,
  isMobile,
  weaponUpgrades
}: GameHUDProps) => {
  const progressPercentage = Math.min(
    100,
    (currentLevelScore / getPointsForNextLevel(level)) * 100
  );
  
  return (
    <div className={styles.hud}>
      <div className={styles.hudScore}>Счет: {score}</div>
      
      {player && (
        <div className={styles.hudHealth}>
          HP: {player.currentHealth} / {player.maxHealth}
        </div>
      )}
      
      <div className={styles.hudLevel}>Уровень: {level}</div>
      
      <div className={styles.hudProgress}>
        Прогресс: {currentLevelScore} / {getPointsForNextLevel(level)}
      </div>
      
      <div className={styles.progressBar}>
        <div 
          className={styles.progressBarFill}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className={styles.hudControls}>
        {isMobile 
          ? 'Управление: джойстик - движение, тап - стрельба'
          : 'Управление: WASD/Стрелки - движение, ЛКМ - стрельба | F3 - отладка'
        }
      </div>
      
      <div className={styles.hudUpgrades}>Улучшения:</div>
      
      <div className={styles.hudUpgradeItem}>
        Скорость: {weaponUpgrades.fireRate.toFixed(1)}x
      </div>
      
      <div className={styles.hudUpgradeItem}>
        Пули: {weaponUpgrades.bulletCount}
      </div>
      
      <div className={styles.hudUpgradeItem}>
        Скорость пуль: {weaponUpgrades.bulletSpeed}
      </div>
    </div>
  );
};

