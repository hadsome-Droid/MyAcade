import * as PIXI from 'pixi.js';
import { HealthSystem } from './HealthSystem';
import { GAME_CONFIG } from '../../constants/game.constants';

export class HealthBar {
  private hpBarBackground: PIXI.Graphics;
  private hpBar: PIXI.Graphics;
  private healthSystem: HealthSystem;
  private offsetY: number;
  private barWidth: number;
  private barHeight: number;

  constructor(
    app: PIXI.Application,
    healthSystem: HealthSystem,
    offsetY: number = GAME_CONFIG.HP_BAR.OFFSET_Y,
    barWidth: number = GAME_CONFIG.HP_BAR.WIDTH,
    barHeight: number = GAME_CONFIG.HP_BAR.HEIGHT
  ) {
    this.healthSystem = healthSystem;
    this.offsetY = offsetY;
    this.barWidth = barWidth;
    this.barHeight = barHeight;

    // Create HP bar background
    this.hpBarBackground = new PIXI.Graphics();
    this.hpBarBackground.rect(-barWidth / 2, offsetY, barWidth, barHeight);
    this.hpBarBackground.fill(GAME_CONFIG.HP_BAR.BACKGROUND_COLOR);
    
    // Create HP bar
    this.hpBar = new PIXI.Graphics();
    this.hpBar.rect(-barWidth / 2, offsetY, barWidth, barHeight);
    this.hpBar.fill(GAME_CONFIG.HP_BAR.COLORS.HIGH);
    
    app.stage.addChild(this.hpBarBackground);
    app.stage.addChild(this.hpBar);
    
    this.update();
  }

  public update(): void {
    const healthPercent = this.healthSystem.getHealthPercent();
    const currentWidth = this.barWidth * healthPercent;
    
    // Update HP bar color based on health
    let barColor = GAME_CONFIG.HP_BAR.COLORS.HIGH; // Green
    if (healthPercent < GAME_CONFIG.HP_BAR.HEALTH_THRESHOLDS.LOW) {
      barColor = GAME_CONFIG.HP_BAR.COLORS.LOW; // Red
    } else if (healthPercent < GAME_CONFIG.HP_BAR.HEALTH_THRESHOLDS.MEDIUM) {
      barColor = GAME_CONFIG.HP_BAR.COLORS.MEDIUM; // Yellow
    }
    
    // Clear and redraw HP bar
    this.hpBar.clear();
    this.hpBar.rect(-this.barWidth / 2, this.offsetY, currentWidth, this.barHeight);
    this.hpBar.fill(barColor);
  }

  public setPosition(x: number, y: number): void {
    this.hpBarBackground.x = x;
    this.hpBarBackground.y = y;
    this.hpBar.x = x;
    this.hpBar.y = y;
  }

  public destroy(): void {
    if (this.hpBarBackground) this.hpBarBackground.destroy();
    if (this.hpBar) this.hpBar.destroy();
  }
}
