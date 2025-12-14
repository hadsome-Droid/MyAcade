import { create } from 'zustand';

export interface WeaponUpgrades {
  fireRate: number; // Множитель скорости стрельбы (больше = быстрее)
  bulletCount: number; // Количество пуль за выстрел
  bulletSpeed: number; // Скорость пуль
  bulletSize: number; // Размер пуль
}

export type MenuScreen = 'main' | 'settings' | 'highScores' | 'about' | 'achievements';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface GameState {
  score: number;
  level: number;
  currentLevelScore: number;
  isGameOver: boolean;
  isPaused: boolean;
  isInMenu: boolean;
  currentMenuScreen: MenuScreen;
  gameSpeed: number;
  weaponUpgrades: WeaponUpgrades;
  settings: GameSettings;
  setScore: (score: number) => void;
  addScore: (points: number) => void;
  setGameOver: (isGameOver: boolean) => void;
  setPaused: (isPaused: boolean) => void;
  setGameSpeed: (speed: number) => void;
  upgradeWeapon: (type: keyof WeaponUpgrades, value: number) => void;
  getPointsForNextLevel: (level: number) => number;
  reset: () => void;
  showMenu: () => void;
  hideMenu: () => void;
  setMenuScreen: (screen: MenuScreen) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
}

const defaultWeaponUpgrades: WeaponUpgrades = {
  fireRate: 1,
  bulletCount: 1,
  bulletSpeed: 8,
  bulletSize: 5,
};

// Функция расчета очков для перехода на следующий уровень
const getPointsForNextLevel = (level: number): number => {
  return level * 500;
};

// Загрузка настроек из localStorage
const loadSettings = (): GameSettings => {
  if (typeof window === 'undefined') {
    return { soundEnabled: true, musicEnabled: true };
  }
  
  try {
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  
  return { soundEnabled: true, musicEnabled: true };
};

// Сохранение настроек в localStorage
const saveSettings = (settings: GameSettings) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export const useGameStore = create<GameState>((set, get) => ({
  score: 0,
  level: 1,
  currentLevelScore: 0,
  isGameOver: false,
  isPaused: false,
  isInMenu: true, // Меню показывается по умолчанию
  currentMenuScreen: 'main',
  gameSpeed: 1,
  weaponUpgrades: { ...defaultWeaponUpgrades },
  settings: loadSettings(),
  getPointsForNextLevel,
  setScore: (score) => set({ score }),
  addScore: (points) => set((state) => {
    const newScore = state.score + points;
    const newLevelScore = state.currentLevelScore + points;
    
    // Проверка перехода на новый уровень
    const pointsNeeded = getPointsForNextLevel(state.level);
    let newLevel = state.level;
    let updatedLevelScore = newLevelScore;
    let newGameSpeed = state.gameSpeed;
    
    if (newLevelScore >= pointsNeeded) {
      newLevel = state.level + 1;
      updatedLevelScore = newLevelScore - pointsNeeded; // Остаток очков переносится на следующий уровень
      newGameSpeed = Math.min(state.gameSpeed + 0.1, 3); // Увеличиваем скорость игры (максимум 3x)
    }
    
    // Автоматические улучшения при достижении определенного счета
    const upgrades = { ...state.weaponUpgrades };
    let upgraded = false;

    if (newScore >= 100 && state.weaponUpgrades.fireRate === 1) {
      upgrades.fireRate = 1.5;
      upgraded = true;
    }
    if (newScore >= 250 && state.weaponUpgrades.bulletCount === 1) {
      upgrades.bulletCount = 2;
      upgraded = true;
    }
    if (newScore >= 500 && state.weaponUpgrades.bulletSpeed === 8) {
      upgrades.bulletSpeed = 12;
      upgraded = true;
    }
    if (newScore >= 750 && state.weaponUpgrades.bulletCount === 2) {
      upgrades.bulletCount = 3;
      upgraded = true;
    }
    if (newScore >= 1000 && state.weaponUpgrades.fireRate === 1.5) {
      upgrades.fireRate = 2;
      upgraded = true;
    }

    return {
      score: newScore,
      level: newLevel,
      currentLevelScore: updatedLevelScore,
      gameSpeed: newGameSpeed,
      ...(upgraded ? { weaponUpgrades: upgrades } : {}),
    };
  }),
  setGameOver: (isGameOver) => set({ isGameOver }),
  setPaused: (isPaused) => set({ isPaused }),
  setGameSpeed: (gameSpeed) => set({ gameSpeed }),
  upgradeWeapon: (type, value) => set((state) => ({
    weaponUpgrades: {
      ...state.weaponUpgrades,
      [type]: value,
    },
  })),
  reset: () => set({
    score: 0,
    level: 1,
    currentLevelScore: 0,
    isGameOver: false,
    isPaused: false,
    gameSpeed: 1,
    weaponUpgrades: { ...defaultWeaponUpgrades },
  }),
  showMenu: () => set({ isInMenu: true, currentMenuScreen: 'main' }),
  hideMenu: () => set({ isInMenu: false }),
  setMenuScreen: (screen: MenuScreen) => set({ currentMenuScreen: screen }),
  updateSettings: (newSettings: Partial<GameSettings>) => {
    const updatedSettings = { ...get().settings, ...newSettings };
    set({ settings: updatedSettings });
    saveSettings(updatedSettings);
  },
}));

