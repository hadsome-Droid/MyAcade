import { useRef, useCallback } from 'react';
import { Player } from '../components/Player';
import { Enemy } from '../components/Enemy';
import { Bullet } from '../components/Bullet';
import { useGameStore } from '../store/gameStore';

/**
 * Hook for managing the main game loop
 * Handles entity updates, collision detection, and game state
 */
export const useGameLoop = (
  playerRef: React.RefObject<Player | null>,
  enemiesRef: React.RefObject<Enemy[]>,
  bulletsRef: React.RefObject<Bullet[]>,
  spawnEnemy: () => void,
  addScore: (points: number) => void
) => {
  const gameLoopRef = useRef<number | null>(null);
  const enemySpawnTimerRef = useRef<number>(0);
  const lastDamageTimeRef = useRef<number>(0);
  const damageCooldown = 500; // 500ms cooldown between damage
  
  const startGameLoop = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    const gameLoop = () => {
      const currentState = useGameStore.getState();
      
      if (currentState.isPaused || currentState.isGameOver) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      
      // Update player with weapon upgrades
      if (playerRef.current) {
        playerRef.current.update(currentState.weaponUpgrades, 1/60);
      }
      
      // Enemy spawning logic
      enemySpawnTimerRef.current += 1;
      const spawnInterval = Math.max(30 / currentState.gameSpeed, 20); // Min 20 frames between spawns
      if (enemySpawnTimerRef.current > spawnInterval) {
        spawnEnemy();
        enemySpawnTimerRef.current = 0;
      }
      
      // Update bullets (reverse loop for safe deletion)
      for (let bulletIndex = bulletsRef.current!.length - 1; bulletIndex >= 0; bulletIndex--) {
        const bullet = bulletsRef.current![bulletIndex];
        
        if (bullet.isDestroyed) {
          bulletsRef.current!.splice(bulletIndex, 1);
          continue;
        }
        
        bullet.update();
        
        // Check if bullet is out of bounds
        if (bullet.isDestroyed || bullet.isOutOfBounds()) {
          if (!bullet.isDestroyed) {
            bullet.destroy();
          }
          bulletsRef.current!.splice(bulletIndex, 1);
          continue;
        }
        
        // Check bullet-enemy collisions
        for (let enemyIndex = enemiesRef.current!.length - 1; enemyIndex >= 0; enemyIndex--) {
          const enemy = enemiesRef.current![enemyIndex];
          
          if (enemy.isDestroyed || bullet.isDestroyed) continue;
          
          const bulletBounds = bullet.getBounds();
          if (enemy.checkBulletCollision(bulletBounds)) {
            // Damage enemy
            const wasDestroyed = enemy.takeDamage(1);
            
            // Destroy bullet
            bullet.destroy();
            bulletsRef.current!.splice(bulletIndex, 1);
            
            // Award points if enemy was destroyed
            if (wasDestroyed) {
              const points = enemy.getPointsForDestroying();
              addScore(points);
              enemiesRef.current!.splice(enemyIndex, 1);
            }
            
            break; // Exit inner loop as bullet is destroyed
          }
        }
      }
      
      // Update enemies
      enemiesRef.current!.forEach((enemy, index) => {
        if (enemy.isDestroyed) {
          enemiesRef.current!.splice(index, 1);
          return;
        }
        
        enemy.update(currentState.gameSpeed);
        
        // Remove enemies that go off-screen (no points awarded)
        if (enemy.isOutOfBounds() && !enemy.isDestroyed) {
          enemy.destroy();
          enemiesRef.current!.splice(index, 1);
          return;
        }
        
        // Check player-enemy collision (circular collision)
        if (playerRef.current && !enemy.isDestroyed) {
          const playerCollisionData = playerRef.current.getCircleCollisionData();
          if (enemy.checkCircleCollision(playerCollisionData.x, playerCollisionData.y, playerCollisionData.radius)) {
            const currentTime = Date.now();
            // Apply damage with cooldown to prevent rapid damage
            if (currentTime - lastDamageTimeRef.current >= damageCooldown) {
              const isDead = playerRef.current.takeDamage(10); // 10 damage per hit
              lastDamageTimeRef.current = currentTime;
              
              if (isDead) {
                useGameStore.getState().setGameOver(true);
              }
            }
          }
        }
      });
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [spawnEnemy, addScore, playerRef, enemiesRef, bulletsRef]);
  
  const stopGameLoop = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    enemySpawnTimerRef.current = 0;
    lastDamageTimeRef.current = 0;
  }, []);
  
  return { startGameLoop, stopGameLoop };
};

