import * as PIXI from 'pixi.js';

/**
 * Компонент визуализации HP бара игрока
 */
export class PlayerHealthBar {
  private hpBar: PIXI.Graphics;
  private hpBarBackground: PIXI.Graphics;
  private app: PIXI.Application;
  private radius: number;
  private barWidth: number = 60;
  private barHeight: number = 6;
  private offsetY: number;

  constructor(app: PIXI.Application, radius: number) {
    this.app = app;
    this.radius = radius;
    this.offsetY = -radius - 15;

    this.hpBarBackground = new PIXI.Graphics();
    this.hpBar = new PIXI.Graphics();

    this.init();
  }

  private init(): void {
    // Фон HP бара
    this.hpBarBackground.rect(-this.barWidth / 2, this.offsetY, this.barWidth, this.barHeight);
    this.hpBarBackground.fill(0x333333); // Dark gray background

    // HP бар
    this.hpBar.rect(-this.barWidth / 2, this.offsetY, this.barWidth, this.barHeight);
    this.hpBar.fill(0x00ff00); // Green by default

    // Добавляем на сцену
    this.app.stage.addChild(this.hpBarBackground);
    this.app.stage.addChild(this.hpBar);
  }

  /**
   * Обновляет HP бар
   * @param currentHealth Текущее здоровье
   * @param maxHealth Максимальное здоровье
   */
  public update(currentHealth: number, maxHealth: number): void {
    if (!this.hpBar || !this.hpBarBackground) return;

    const healthPercent = Math.max(0, Math.min(1, currentHealth / maxHealth));
    const currentWidth = this.barWidth * healthPercent;

    // Цвет в зависимости от процента здоровья
    let barColor = 0x00ff00; // Green
    if (healthPercent < 0.3) {
      barColor = 0xff0000; // Red
    } else if (healthPercent < 0.6) {
      barColor = 0xffff00; // Yellow
    }

    // Перерисовываем HP бар
    this.hpBar.clear();
    this.hpBar.rect(-this.barWidth / 2, this.offsetY, currentWidth, this.barHeight);
    this.hpBar.fill(barColor);
  }

  /**
   * Устанавливает позицию HP бара
   */
  public setPosition(x: number, y: number): void {
    this.hpBarBackground.x = x;
    this.hpBarBackground.y = y;
    this.hpBar.x = x;
    this.hpBar.y = y;
  }

  /**
   * Показывает HP бар
   */
  public show(): void {
    this.hpBarBackground.visible = true;
    this.hpBar.visible = true;
  }

  /**
   * Скрывает HP бар
   */
  public hide(): void {
    this.hpBarBackground.visible = false;
    this.hpBar.visible = false;
  }

  /**
   * Уничтожает HP бар
   */
  public destroy(): void {
    if (this.hpBar) this.hpBar.destroy();
    if (this.hpBarBackground) this.hpBarBackground.destroy();
  }
}

