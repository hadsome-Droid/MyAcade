'use client';

import { useGameStore } from '../store/gameStore';
import styles from './AchievementsMenu.module.scss';

export const AchievementsMenu = () => {
  const { setMenuScreen } = useGameStore();

  const handleBack = () => {
    setMenuScreen('main');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Достижения</h1>
      <p className={styles.message}>
        Система достижений будет реализована в будущем обновлении
      </p>
      <button className={styles.backButton} onClick={handleBack}>
        Назад
      </button>
    </div>
  );
};

