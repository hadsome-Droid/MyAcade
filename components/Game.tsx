'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Player } from './Player';
import styles from './Game.module.scss';

// Custom Hooks
import { usePixiApp } from '../hooks/usePixiApp';
import { useEntityManagement } from '../hooks/useEntityManagement';
import { useGameLoop } from '../hooks/useGameLoop';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { useGameEventHandlers } from '../hooks/useGameEventHandlers';

// UI Components
import { GameMenuRouter } from './game/GameMenuRouter';
import { GameHUD } from './game/GameHUD';
import { GameOverModal } from './game/GameOverModal';
import { MobileControls } from './game/MobileControls';

/**
 * Main Game Component
 * Orchestrates all game systems using custom hooks and components
 */
export const Game = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  
  // Game store
  const {
    isGameOver,
    isInMenu,
    currentMenuScreen,
    reset,
    addScore,
    score,
    weaponUpgrades,
    level,
    currentLevelScore,
    getPointsForNextLevel,
    showMenu
  } = useGameStore();
  
  // Mobile detection
  const { isMobile, orientation } = useMobileDetection();
  
  // Create stable callback refs
  const startGameLoopRef = useRef<(() => void) | null>(null);
  const createBulletRef = useRef<((x: number, y: number, dx: number, dy: number, upgrades: any) => void) | null>(null);
  
  // Stable callbacks for Pixi initialization (prevent re-initialization on re-renders)
  const handlePlayerCreated = useCallback((player: Player) => {
    // Player created callback - setup player and start game
    playerRef.current = player;
    
    // Set shoot callback
    player.setShootCallback((x, y, directionX, directionY, upgrades) => {
      if (createBulletRef.current) {
        createBulletRef.current(x, y, directionX, directionY, upgrades);
      }
    });
    
    // Start game loop
    if (startGameLoopRef.current) {
      startGameLoopRef.current();
    }
  }, []); // Empty deps - uses refs which are stable
  
  const handleAppReady = useCallback(() => {
    // App ready callback (optional)
  }, []);
  
  // Pixi.js initialization
  const appRef = usePixiApp(
    containerRef,
    isInMenu,
    handlePlayerCreated,
    handleAppReady
  );
  
  // Entity management hooks (uses appRef from Pixi initialization)
  const {
    enemiesRef,
    bulletsRef,
    spawnEnemy,
    createBullet,
    clearEntities
  } = useEntityManagement(appRef, playerRef);
  
  // Game loop hooks
  const { startGameLoop, stopGameLoop } = useGameLoop(
    playerRef,
    enemiesRef,
    bulletsRef,
    spawnEnemy,
    addScore
  );
  
  // Update callback refs
  useEffect(() => {
    startGameLoopRef.current = startGameLoop;
    createBulletRef.current = createBullet;
  }, [startGameLoop, createBullet]);
  
  // Event handlers (resize, keyboard, orientation)
  useGameEventHandlers(appRef, playerRef);
  
  // Mobile control handlers
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
  
  const handleTouchShoot = useCallback((x: number, y: number) => {
    if (playerRef.current && appRef.current) {
      const rect = appRef.current.canvas.getBoundingClientRect();
      const canvasX = x - rect.left;
      const canvasY = y - rect.top;
      playerRef.current.setTouchShooting(canvasX, canvasY, true);
    }
  }, [appRef]);
  
  const handleTouchShootStop = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.stopTouchShooting();
    }
  }, []);
  
  // Restart handler
  const handleRestart = useCallback(() => {
    reset();
    showMenu();
    clearEntities();
    stopGameLoop();
    
    // Destroy Pixi app
    if (appRef.current) {
      try {
        if (appRef.current.canvas) {
          appRef.current.destroy(true, { children: true, texture: true });
        }
      } catch (error) {
        console.error('Error destroying Pixi app:', error);
      }
    }
    
    // Destroy player
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
  }, [reset, showMenu, clearEntities, stopGameLoop, appRef]);
  
  // Render menu if in menu state
  if (isInMenu) {
    return <GameMenuRouter currentMenuScreen={currentMenuScreen} />;
  }
  
  // Render game
  return (
    <div className={styles.gameContainer}>
      <div ref={containerRef} className={styles.canvasContainer} />
      
      {/* Mobile controls */}
      {isMobile && !isInMenu && (
        <MobileControls
          onJoystickMove={handleJoystickMove}
          onJoystickStop={handleJoystickStop}
          onTouchShoot={handleTouchShoot}
          onTouchShootStop={handleTouchShootStop}
        />
      )}
      
      {/* Game over modal */}
      {isGameOver && (
        <GameOverModal
          score={score}
          level={level}
          onRestart={handleRestart}
        />
      )}
      
      {/* HUD */}
      <GameHUD
        score={score}
        player={playerRef.current}
        level={level}
        currentLevelScore={currentLevelScore}
        getPointsForNextLevel={getPointsForNextLevel}
        isMobile={isMobile}
        weaponUpgrades={weaponUpgrades}
      />
    </div>
  );
};
