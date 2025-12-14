import { WeaponUpgrades } from '../store/gameStore';

export enum EnemyType {
  LIGHT = 'LIGHT',   // 1 HP
  MEDIUM = 'MEDIUM', // 2 HP
  HEAVY = 'HEAVY',   // 3 HP
}

export enum SpawnSide {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Direction {
  x: number;
  y: number;
}

export type ShootCallback = (
  x: number,
  y: number,
  directionX: number,
  directionY: number,
  upgrades: WeaponUpgrades
) => void;
