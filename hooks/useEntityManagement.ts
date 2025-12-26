import { useRef, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { Enemy, EnemyType, SpawnSide } from '../components/Enemy';
import { Bullet } from '../components/Bullet';
import { Player } from '../components/Player';
import { useGameStore } from '../store/gameStore';
import { getScaledSize, getScaledSpeed } from '../utils/scaling';

/**
 * Hook for managing game entities (enemies and bullets)
 * Handles spawning, creation, and cleanup
 */
export const useEntityManagement = (
  appRef: React.RefObject<PIXI.Application | null>,
  playerRef: React.RefObject<Player | null>
) => {
  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  
  const spawnEnemy = useCallback(() => {
    if (!appRef.current || !playerRef.current) return;
    
    const currentLevel = useGameStore.getState().level;
    
    // Determine enemy type based on current level
    const getEnemyTypeForLevel = (level: number): EnemyType => {
      const rand = Math.random();
      if (level === 1) {
        // Level 1: 70% light, 25% medium, 5% heavy
        if (rand < 0.7) return EnemyType.LIGHT;
        if (rand < 0.95) return EnemyType.MEDIUM;
        return EnemyType.HEAVY;
      } else if (level === 2) {
        // Level 2: 60% light, 30% medium, 10% heavy
        if (rand < 0.6) return EnemyType.LIGHT;
        if (rand < 0.9) return EnemyType.MEDIUM;
        return EnemyType.HEAVY;
      } else {
        // Level 3+: 50% light, 30% medium, 20% heavy
        if (rand < 0.5) return EnemyType.LIGHT;
        if (rand < 0.8) return EnemyType.MEDIUM;
        return EnemyType.HEAVY;
      }
    };
    
    // Randomly select spawn side
    const sides = [SpawnSide.TOP, SpawnSide.BOTTOM, SpawnSide.LEFT, SpawnSide.RIGHT];
    const spawnSide = sides[Math.floor(Math.random() * sides.length)];
    
    // Spawn 1-2 enemies at once
    const enemyCount = Math.random() > 0.5 ? 1 : 2;
    
    // Get player position for enemy targeting
    const playerBounds = playerRef.current.getBounds();
    const targetX = playerBounds.x + playerBounds.width / 2;
    const targetY = playerBounds.y + playerBounds.height / 2;
    
    for (let i = 0; i < enemyCount; i++) {
      const baseSpeed = 2 + Math.random() * 2;
      const scaledSpeed = getScaledSpeed(baseSpeed);
      const enemyType = getEnemyTypeForLevel(currentLevel);
      const enemy = new Enemy(appRef.current, spawnSide, scaledSpeed, enemyType, targetX, targetY);
      enemiesRef.current.push(enemy);
    }
  }, [appRef, playerRef]);
  
  const createBullet = useCallback((
    x: number,
    y: number,
    directionX: number,
    directionY: number,
    upgrades: any
  ) => {
    if (!appRef.current) return;
    
    const scaledBulletSize = getScaledSize('BULLET');
    const scaledBulletSpeed = getScaledSpeed(upgrades.bulletSpeed);
    
    const bullet = new Bullet(
      appRef.current,
      x,
      y,
      directionX,
      directionY,
      scaledBulletSpeed,
      scaledBulletSize
    );
    bulletsRef.current.push(bullet);
  }, [appRef]);
  
  const clearEntities = useCallback(() => {
    enemiesRef.current.forEach((enemy) => enemy.destroy());
    enemiesRef.current = [];
    bulletsRef.current.forEach((bullet) => bullet.destroy());
    bulletsRef.current = [];
  }, []);
  
  return { enemiesRef, bulletsRef, spawnEnemy, createBullet, clearEntities };
};

