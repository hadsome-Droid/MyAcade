'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Player } from './Player';
import { Enemy, EnemyType, SpawnSide } from './Enemy';
import { Bullet } from './Bullet';
import { useGameStore } from '../store/gameStore';
import { MainMenu } from '../ui/MainMenu';
import { SettingsMenu } from '../ui/SettingsMenu';
import { HighScoresMenu } from '../ui/HighScoresMenu';
import { AboutMenu } from '../ui/AboutMenu';
import { AchievementsMenu } from '../ui/AchievementsMenu';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { TouchShootControl } from '../ui/TouchShootControl';
import { isMobileOrTablet, getScreenOrientation } from '../utils/deviceDetection';
import { getScaledSize, getScaledSpeed } from '../utils/scaling';
import styles from './Game.module.scss';

export const Game = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const playerRef = useRef<Player | null>(null);
  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const enemySpawnTimerRef = useRef<number>(0);
  const lastDamageTimeRef = useRef<number>(0);
  const damageCooldown = 500; // 500ms cooldown between damage

  const { isGameOver, isPaused, isInMenu, currentMenuScreen, setGameOver, reset, gameSpeed, addScore, score, weaponUpgrades, level, currentLevelScore, getPointsForNextLevel, showMenu } = useGameStore();

  // Мобильные контролы
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

  const spawnEnemy = useCallback(() => {
    if (!appRef.current || !playerRef.current) return;

    const currentLevel = useGameStore.getState().level;
    
    // Распределение типов врагов в зависимости от уровня
    const getEnemyTypeForLevel = (level: number): EnemyType => {
      const rand = Math.random();
      if (level === 1) {
        // Уровень 1: 70% легкие, 25% средние, 5% тяжелые
        if (rand < 0.7) return EnemyType.LIGHT;
        if (rand < 0.95) return EnemyType.MEDIUM;
        return EnemyType.HEAVY;
      } else if (level === 2) {
        // Уровень 2: 60% легкие, 30% средние, 10% тяжелые
        if (rand < 0.6) return EnemyType.LIGHT;
        if (rand < 0.9) return EnemyType.MEDIUM;
        return EnemyType.HEAVY;
      } else {
        // Уровень 3+: 50% легкие, 30% средние, 20% тяжелые
        if (rand < 0.5) return EnemyType.LIGHT;
        if (rand < 0.8) return EnemyType.MEDIUM;
        return EnemyType.HEAVY;
      }
    };

    // Randomly select spawn side
    const sides = [SpawnSide.TOP, SpawnSide.BOTTOM, SpawnSide.LEFT, SpawnSide.RIGHT];
    const spawnSide = sides[Math.floor(Math.random() * sides.length)];

    // Увеличиваем количество врагов - спавним 1-2 врага одновременно
    const enemyCount = Math.random() > 0.5 ? 1 : 2;
    
    // Get player position for enemy targeting
    const playerBounds = playerRef.current.getBounds();
    const targetX = playerBounds.x + playerBounds.width / 2;
    const targetY = playerBounds.y + playerBounds.height / 2;
    
    for (let i = 0; i < enemyCount; i++) {
      const baseSpeed = 2 + Math.random() * 2; // Случайная скорость
      const scaledSpeed = getScaledSpeed(baseSpeed);
      const enemyType = getEnemyTypeForLevel(currentLevel);
      const enemy = new Enemy(appRef.current, spawnSide, scaledSpeed, enemyType, targetX, targetY);
      enemiesRef.current.push(enemy);
    }
  }, []);

  const createBullet = useCallback((
    x: number,
    y: number,
    directionX: number,
    directionY: number,
    upgrades: typeof weaponUpgrades
  ) => {
    if (!appRef.current) return;
    
    // Используем масштабированные размеры
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
  }, []);

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

      // Обновляем игрока с учетом улучшений
      if (playerRef.current) {
        playerRef.current.update(currentState.weaponUpgrades);
      }

      // Спавн врагов (увеличиваем частоту - спавним чаще)
      enemySpawnTimerRef.current += 1;
      const spawnInterval = Math.max(30 / currentState.gameSpeed, 20); // Минимум 20 кадров между спавнами
      if (enemySpawnTimerRef.current > spawnInterval) {
        spawnEnemy();
        enemySpawnTimerRef.current = 0;
      }

      // Обновляем пули (используем обратный цикл для безопасного удаления)
      for (let bulletIndex = bulletsRef.current.length - 1; bulletIndex >= 0; bulletIndex--) {
        const bullet = bulletsRef.current[bulletIndex];
        
        if (bullet.isDestroyed) {
          bulletsRef.current.splice(bulletIndex, 1);
          continue;
        }

        bullet.update();

        // Проверяем выход за границы после обновления
        if (bullet.isDestroyed || bullet.isOutOfBounds()) {
          if (!bullet.isDestroyed) {
            bullet.destroy();
          }
          bulletsRef.current.splice(bulletIndex, 1);
          continue;
        }

        // Проверка столкновений пуль с врагами
        for (let enemyIndex = enemiesRef.current.length - 1; enemyIndex >= 0; enemyIndex--) {
          const enemy = enemiesRef.current[enemyIndex];
          
          if (enemy.isDestroyed || bullet.isDestroyed) continue;
          
          const bulletBounds = bullet.getBounds();
          if (enemy.checkBulletCollision(bulletBounds)) {
            // Наносим урон врагу
            const wasDestroyed = enemy.takeDamage(1);
            
            // Уничтожаем пулю
            bullet.destroy();
            bulletsRef.current.splice(bulletIndex, 1);
            
            // Если враг уничтожен, начисляем очки и удаляем его
            if (wasDestroyed) {
              const points = enemy.getPointsForDestroying();
              addScore(points);
              enemiesRef.current.splice(enemyIndex, 1);
            }
            
            break; // Выходим из внутреннего цикла, так как пуля уже уничтожена
          }
        }
      }

      // Обновляем врагов
      enemiesRef.current.forEach((enemy, index) => {
        if (enemy.isDestroyed) {
          enemiesRef.current.splice(index, 1);
          return;
        }

        enemy.update(currentState.gameSpeed);
        
        // Remove enemies that go off-screen (no points awarded)
        if (enemy.isOutOfBounds() && !enemy.isDestroyed) {
          enemy.destroy();
          enemiesRef.current.splice(index, 1);
          return;
        }
        
        // Проверка столкновения с игроком
        if (playerRef.current && !enemy.isDestroyed) {
          const playerBounds = playerRef.current.getBounds();
          if (enemy.checkCollision(playerBounds)) {
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
  }, [spawnEnemy, addScore]);

  useEffect(() => {
    if (!containerRef.current || isInMenu) return; // Не инициализируем игру, если в меню

    // Инициализация Pixi.js
    const app = new PIXI.Application();
    appRef.current = app;

    app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x1a1a2e,
      antialias: true,
    }).then(() => {
      if (!containerRef.current) return;
      containerRef.current.appendChild(app.canvas as HTMLCanvasElement);

      // Создаем игрока (размеры будут масштабированы внутри Player, если нужно)
      playerRef.current = new Player(app);
      
      // Настраиваем callback для стрельбы
      playerRef.current.setShootCallback((x, y, directionX, directionY, upgrades) => {
        createBullet(x, y, directionX, directionY, upgrades);
      });

      // Запускаем игровой цикл
      startGameLoop();
    });

    // Обработка изменения размера окна и ориентации
    const handleResize = () => {
      if (app && containerRef.current) {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        app.renderer.resize(newWidth, newHeight);
        
        // Обновляем ориентацию
        const newOrientation = getScreenOrientation();
        setOrientation(newOrientation);
        
        if (playerRef.current) {
          const playerRadius = playerRef.current.getRadius();
          playerRef.current.sprite.x = Math.min(
            playerRef.current.sprite.x,
            newWidth - playerRadius
          );
          playerRef.current.sprite.y = Math.min(
            playerRef.current.sprite.y,
            newHeight - playerRadius
          );
        }
      }
    };

    const handleOrientationChange = () => {
      // Задержка для корректного определения размеров после поворота
      setTimeout(() => {
        handleResize();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Очистка
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      enemiesRef.current.forEach((enemy) => enemy.destroy());
      enemiesRef.current = [];
      bulletsRef.current.forEach((bullet) => bullet.destroy());
      bulletsRef.current = [];
      if (app && appRef.current) {
        try {
          // Проверяем, что приложение инициализировано перед уничтожением
          if (app.canvas) {
            app.destroy(true, { children: true, texture: true });
          }
        } catch (error) {
          console.error('Error destroying Pixi app:', error);
        }
        appRef.current = null;
      }
    };
  }, [startGameLoop, createBullet, isInMenu]);

  // Определение мобильного устройства и ориентации
  useEffect(() => {
    setIsMobile(isMobileOrTablet());
    setOrientation(getScreenOrientation());

    const handleResize = () => {
      setIsMobile(isMobileOrTablet());
      setOrientation(getScreenOrientation());
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        setIsMobile(isMobileOrTablet());
        setOrientation(getScreenOrientation());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Обработчики для виртуального джойстика
  const handleJoystickMove = useCallback((dx: number, dy: number) => {
    if (playerRef.current) {
      playerRef.current.setTouchMovement(dx, dy);
    }
  }, []);

  const handleJoystickStop = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.stopTouchMovement();
    }
  }, []);

  // Обработчики для тач-контрола стрельбы
  const handleTouchShoot = useCallback((x: number, y: number) => {
    if (playerRef.current && appRef.current) {
      // Конвертируем координаты экрана в координаты canvas
      const rect = appRef.current.canvas.getBoundingClientRect();
      const canvasX = x - rect.left;
      const canvasY = y - rect.top;
      playerRef.current.setTouchShooting(canvasX, canvasY, true);
    }
  }, []);

  const handleTouchShootStop = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.stopTouchShooting();
    }
  }, []);

  const handleRestart = useCallback(() => {
    reset();
    showMenu(); // Возвращаемся в меню вместо перезапуска игры
    
    // Очищаем всех врагов и пуль
    enemiesRef.current.forEach((enemy) => enemy.destroy());
    enemiesRef.current = [];
    bulletsRef.current.forEach((bullet) => bullet.destroy());
    bulletsRef.current = [];
    enemySpawnTimerRef.current = 0;
    lastDamageTimeRef.current = 0;
    
    // Останавливаем игровой цикл
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // Уничтожаем приложение Pixi
    if (appRef.current) {
      try {
        if (appRef.current.canvas) {
          appRef.current.destroy(true, { children: true, texture: true });
        }
      } catch (error) {
        console.error('Error destroying Pixi app:', error);
      }
      appRef.current = null;
    }
    
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
  }, [reset, showMenu]);

  // Рендеринг меню
  if (isInMenu) {
    switch (currentMenuScreen) {
      case 'settings':
        return <SettingsMenu />;
      case 'achievements':
        return <AchievementsMenu />;
      case 'highScores':
        return <HighScoresMenu />;
      case 'about':
        return <AboutMenu />;
      default:
        return <MainMenu />;
    }
  }

  return (
    <div className={styles.gameContainer}>
      <div ref={containerRef} className={styles.canvasContainer} />
      
      {/* Мобильные контролы - показываем только на мобильных устройствах */}
      {isMobile && !isInMenu && (
        <>
          <VirtualJoystick
            onMove={handleJoystickMove}
            onStop={handleJoystickStop}
          />
          <TouchShootControl
            onShoot={handleTouchShoot}
            onStop={handleTouchShootStop}
          />
        </>
      )}
      
      {isGameOver && (
        <div className={styles.gameOverModal}>
          <h2>Игра окончена!</h2>
          <p>
            Счет: {score}
          </p>
          <p>
            Достигнут уровень: {level}
          </p>
          <button
            className={styles.restartButton}
            onClick={handleRestart}
          >
            Начать заново
          </button>
        </div>
      )}

      <div className={styles.hud}>
        <div className={styles.hudScore}>Счет: {score}</div>
        {playerRef.current && (
          <div className={styles.hudHealth}>
            HP: {playerRef.current.currentHealth} / {playerRef.current.maxHealth}
          </div>
        )}
        <div className={styles.hudLevel}>
          Уровень: {level}
        </div>
        <div className={styles.hudProgress}>
          Прогресс: {currentLevelScore} / {getPointsForNextLevel(level)}
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressBarFill}
            style={{
              width: `${Math.min(100, (currentLevelScore / getPointsForNextLevel(level)) * 100)}%`
            }}
          />
        </div>
        <div className={styles.hudControls}>
          {isMobile 
            ? 'Управление: джойстик - движение, тап - стрельба'
            : 'Управление: WASD/Стрелки - движение, ЛКМ - стрельба'
          }
        </div>
        <div className={styles.hudUpgrades}>
          Улучшения:
        </div>
        <div className={styles.hudUpgradeItem}>
          Скорость: {weaponUpgrades.fireRate.toFixed(1)}x
        </div>
        <div className={styles.hudUpgradeItem}>
          Пули: {weaponUpgrades.bulletCount}
        </div>
        <div className={styles.hudUpgradeItem}>
          Скорость пуль: {weaponUpgrades.bulletSpeed}
        </div>
      </div>
    </div>
  );
};
