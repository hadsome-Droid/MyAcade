'use client';

import { useGameStore } from '../store/gameStore';
import styles from './MainMenu.module.scss';

export const MainMenu = () => {
  const { hideMenu, setMenuScreen } = useGameStore();

  const handlePlay = () => {
    hideMenu();
  };

  const handleSettings = () => {
    setMenuScreen('settings');
  };

  const handleHighScores = () => {
    setMenuScreen('highScores');
  };

  const handleAbout = () => {
    setMenuScreen('about');
  };

  const handleAchievements = () => {
    setMenuScreen('achievements');
  };

  const handleExit = () => {
    // Заглушка для выхода
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ARENA SHOOTER</h1>
      <div className={styles.buttonsContainer}>
        <button className={styles.button} onClick={handlePlay}>
          Играть
        </button>
        <button className={styles.button} onClick={handleSettings}>
          Настройки
        </button>
        <button className={styles.button} onClick={handleHighScores}>
          Рекорды
        </button>
        <button className={styles.button} onClick={handleAbout}>
          Об игре
        </button>
        <button className={styles.button} onClick={handleAchievements}>
          Достижения
        </button>
        <button className={styles.button} onClick={handleExit}>
          Выход
        </button>
      </div>
    </div>
  );
};

