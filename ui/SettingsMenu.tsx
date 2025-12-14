'use client';

import { useGameStore } from '../store/gameStore';
import styles from './SettingsMenu.module.scss';

export const SettingsMenu = () => {
  const { setMenuScreen, settings, updateSettings } = useGameStore();

  const handleBack = () => {
    setMenuScreen('main');
  };

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const toggleMusic = () => {
    updateSettings({ musicEnabled: !settings.musicEnabled });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Настройки</h1>
      
      <div className={styles.content}>
        <div className={styles.settingItem}>
          <span className={styles.label}>Звук</span>
          <button
            className={`${styles.toggleButton} ${settings.soundEnabled ? styles.enabled : styles.disabled}`}
            onClick={toggleSound}
          >
            {settings.soundEnabled ? 'Вкл' : 'Выкл'}
          </button>
        </div>

        <div className={styles.settingItem}>
          <span className={styles.label}>Музыка</span>
          <button
            className={`${styles.toggleButton} ${settings.musicEnabled ? styles.enabled : styles.disabled}`}
            onClick={toggleMusic}
          >
            {settings.musicEnabled ? 'Вкл' : 'Выкл'}
          </button>
        </div>

        <button className={styles.backButton} onClick={handleBack}>
          Назад
        </button>
      </div>
    </div>
  );
};

