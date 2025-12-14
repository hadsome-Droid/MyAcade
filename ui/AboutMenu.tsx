'use client';

import { useGameStore } from '../store/gameStore';
import styles from './AboutMenu.module.scss';

export const AboutMenu = () => {
  const { setMenuScreen } = useGameStore();

  const handleBack = () => {
    setMenuScreen('main');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Об игре</h1>
      <div className={styles.content}>
        <p>
          <strong>Arena Shooter</strong> - это аркадная игра в жанре шутера с видом сверху.
        </p>
        <p>
          Враги появляются со всех сторон экрана и движутся к вам. Ваша задача - выжить как можно дольше,
          уничтожая врагов и набирая очки.
        </p>
        <p className={styles.controls}>
          Управление: WASD/Стрелки - движение, ЛКМ - стрельба
        </p>
      </div>
      <button className={styles.backButton} onClick={handleBack}>
        Назад
      </button>
    </div>
  );
};

