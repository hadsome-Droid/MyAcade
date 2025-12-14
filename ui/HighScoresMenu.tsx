'use client';

import { useGameStore } from '../store/gameStore';
import styles from './HighScoresMenu.module.scss';

export const HighScoresMenu = () => {
  const { setMenuScreen } = useGameStore();

  const handleBack = () => {
    setMenuScreen('main');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Рекорды</h1>
      <p className={styles.message}>
        Функция рекордов будет реализована в будущем обновлении
      </p>
      <button className={styles.backButton} onClick={handleBack}>
        Назад
      </button>
    </div>
  );
};

