import { EnemyType } from '../types/game.types';

export interface EnemyTypeConfig {
  health: number;
  color: number;
  minSize: number;
  maxSize: number;
  points: number;
  spawnWeight: number; // For random selection
}

export const ENEMY_TYPE_CONFIGS: Record<EnemyType, EnemyTypeConfig> = {
  [EnemyType.LIGHT]: {
    health: 1,
    color: 0xff0000, // Red
    minSize: 30,
    maxSize: 40,
    points: 30,
    spawnWeight: 0.7,
  },
  [EnemyType.MEDIUM]: {
    health: 2,
    color: 0xff8800, // Orange
    minSize: 40,
    maxSize: 55,
    points: 60,
    spawnWeight: 0.25,
  },
  [EnemyType.HEAVY]: {
    health: 3,
    color: 0x8b0000, // Dark red/burgundy
    minSize: 50,
    maxSize: 70,
    points: 100,
    spawnWeight: 0.05,
  },
};

export const ENEMY_SPAWN_CONFIG = {
  minSpeed: 2,
  maxSpeed: 4,
  minSpawnInterval: 20, // frames
  baseSpawnInterval: 30, // frames
};

export const ENEMY_LEVEL_DISTRIBUTION: Record<number, Record<EnemyType, number>> = {
  1: {
    [EnemyType.LIGHT]: 0.7,
    [EnemyType.MEDIUM]: 0.25,
    [EnemyType.HEAVY]: 0.05,
  },
  2: {
    [EnemyType.LIGHT]: 0.6,
    [EnemyType.MEDIUM]: 0.3,
    [EnemyType.HEAVY]: 0.1,
  },
  // Level 3+
  3: {
    [EnemyType.LIGHT]: 0.5,
    [EnemyType.MEDIUM]: 0.3,
    [EnemyType.HEAVY]: 0.2,
  },
};
