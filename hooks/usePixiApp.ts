import { useRef, useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { Player } from '../components/Player';
import { Enemy } from '../components/Enemy';
import { Bullet } from '../components/Bullet';

/**
 * Hook for managing Pixi.js application lifecycle
 * Handles initialization, texture loading, and cleanup
 */
export const usePixiApp = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  isInMenu: boolean,
  onPlayerCreated: (player: Player) => void,
  onAppReady: () => void
) => {
  const appRef = useRef<PIXI.Application | null>(null);
  const onPlayerCreatedRef = useRef(onPlayerCreated);
  const onAppReadyRef = useRef(onAppReady);
  
  // Update refs when callbacks change
  useEffect(() => {
    onPlayerCreatedRef.current = onPlayerCreated;
    onAppReadyRef.current = onAppReady;
  }, [onPlayerCreated, onAppReady]);
  
  useEffect(() => {
    if (!containerRef.current || isInMenu) return;
    
    const app = new PIXI.Application();
    appRef.current = app;
    
    app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x1a1a2e,
      antialias: true,
    }).then(async () => {
      if (!containerRef.current) return;
      containerRef.current.appendChild(app.canvas as HTMLCanvasElement);
      
      try {
        // Load all textures in parallel
        await Promise.all([
          Player.loadTextures(),
          Enemy.loadTextures(),
          Bullet.loadTextures(),
        ]);
        
        // Create player
        const player = new Player(app);
        onPlayerCreatedRef.current(player);
        
        // Notify that app is ready
        onAppReadyRef.current();
      } catch (error) {
        console.error('Texture loading error:', error);
        // Fallback: create player even if textures fail to load
        const player = new Player(app);
        onPlayerCreatedRef.current(player);
        onAppReadyRef.current();
      }
    });
    
    // Cleanup on unmount
    return () => {
      if (app && appRef.current) {
        try {
          if (app.canvas) {
            app.destroy(true, { children: true, texture: true });
          }
        } catch (error) {
          console.error('Error destroying Pixi app:', error);
        }
        appRef.current = null;
      }
    };
  }, [containerRef, isInMenu]); // Removed callback deps - using refs instead
  
  return appRef;
};

