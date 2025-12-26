import { useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { Player } from '../components/Player';
import { getScreenOrientation } from '../utils/deviceDetection';

/**
 * Hook for managing game-related event handlers
 * Handles window resize, orientation change, and keyboard events
 */
export const useGameEventHandlers = (
  appRef: React.RefObject<PIXI.Application | null>,
  playerRef: React.RefObject<Player | null>,
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void
) => {
  useEffect(() => {
    const handleResize = () => {
      const app = appRef.current;
      if (app) {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        app.renderer.resize(newWidth, newHeight);
        
        // Update orientation
        const newOrientation = getScreenOrientation();
        if (onOrientationChange) {
          onOrientationChange(newOrientation);
        }
        
        // Constrain player position within new bounds
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
    
    const handleKeyPress = (e: KeyboardEvent) => {
      // F3 - Toggle debug mode
      if (e.key === 'F3' || e.key === 'f3') {
        if (playerRef.current) {
          playerRef.current.toggleDebugMode();
        }
      }
    };
    
    const handleOrientationChange = () => {
      // Delay for correct dimension detection after rotation
      setTimeout(() => {
        handleResize();
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [appRef, playerRef, onOrientationChange]);
};

