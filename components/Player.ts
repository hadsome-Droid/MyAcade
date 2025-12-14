import * as PIXI from 'pixi.js';
import { WeaponUpgrades } from '../store/gameStore';
import { getScaledSize } from '../utils/scaling';

export class Player {
  public sprite: PIXI.Graphics;
  private app: PIXI.Application;
  private keys: Set<string> = new Set();
  private speed: number = 5;
  private lastShotTime: number = 0;
  private lastDirectionX: number = 0;
  private lastDirectionY: number = -1; // Default: shoot up
  private mouseX: number = 0;
  private mouseY: number = 0;
  private isMouseDown: boolean = false;
  // Touch input for mobile devices
  private touchMoveX: number = 0;
  private touchMoveY: number = 0;
  private touchShootX: number = 0;
  private touchShootY: number = 0;
  private isTouchShooting: boolean = false;
  private isUsingTouch: boolean = false;
  private shootCallback?: (x: number, y: number, directionX: number, directionY: number, upgrades: WeaponUpgrades) => void;
  public maxHealth: number = 100;
  public currentHealth: number = 100;
  private radius: number;
  private hpBar!: PIXI.Graphics;
  private hpBarBackground!: PIXI.Graphics;

  constructor(app: PIXI.Application, customRadius?: number) {
    this.app = app;
    // Используем масштабированный размер, если не указан кастомный
    this.radius = customRadius ?? getScaledSize('PLAYER');
    this.sprite = new PIXI.Graphics();
    this.init();
    this.setupControls();
  }

  public setShootCallback(callback: (x: number, y: number, directionX: number, directionY: number, upgrades: WeaponUpgrades) => void) {
    this.shootCallback = callback;
  }

  /**
   * Устанавливает направление движения от виртуального джойстика
   * @param dx Нормализованное значение X (-1 до 1)
   * @param dy Нормализованное значение Y (-1 до 1)
   */
  public setTouchMovement(dx: number, dy: number) {
    this.touchMoveX = dx;
    this.touchMoveY = dy;
    this.isUsingTouch = true;
  }

  /**
   * Устанавливает координаты стрельбы от тач-контрола
   * @param x Координата X в пикселях canvas
   * @param y Координата Y в пикселях canvas
   */
  public setTouchShooting(x: number, y: number, isShooting: boolean) {
    this.touchShootX = x;
    this.touchShootY = y;
    this.isTouchShooting = isShooting;
    this.isUsingTouch = true;
  }

  /**
   * Останавливает тач-ввод (когда джойстик отпущен)
   */
  public stopTouchMovement() {
    this.touchMoveX = 0;
    this.touchMoveY = 0;
  }

  /**
   * Останавливает тач-стрельбу
   */
  public stopTouchShooting() {
    this.isTouchShooting = false;
  }

  private init() {
    // Создаем круг для игрока
    this.sprite.circle(0, 0, this.radius);
    this.sprite.fill(0x00ff00); // Зеленый цвет
    this.sprite.x = this.app.screen.width / 2;
    this.sprite.y = this.app.screen.height / 2; // Центр экрана
    
    // Create HP bar
    this.hpBarBackground = new PIXI.Graphics();
    this.hpBarBackground.rect(-30, -this.radius - 15, 60, 6);
    this.hpBarBackground.fill(0x333333); // Dark gray background
    this.hpBarBackground.x = this.sprite.x;
    this.hpBarBackground.y = this.sprite.y;
    
    this.hpBar = new PIXI.Graphics();
    this.hpBar.rect(-30, -this.radius - 15, 60, 6);
    this.hpBar.fill(0xff0000); // Red health bar
    this.hpBar.x = this.sprite.x;
    this.hpBar.y = this.sprite.y;
    
    this.app.stage.addChild(this.sprite);
    this.app.stage.addChild(this.hpBarBackground);
    this.app.stage.addChild(this.hpBar);
    
    this.updateHPBar();
  }

  private setupControls() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });

    // Mouse controls for shooting
    this.app.canvas.addEventListener('mousemove', (e) => {
      const rect = this.app.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });

    this.app.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left mouse button
        this.isMouseDown = true;
        const rect = this.app.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
      }
    });

    this.app.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) { // Left mouse button
        this.isMouseDown = false;
      }
    });

    this.app.canvas.addEventListener('mouseleave', () => {
      this.isMouseDown = false;
    });
  }

  public update(upgrades: WeaponUpgrades) {
    // Движение: приоритет тач-вводу, если он активен, иначе клавиатура
    if (this.isUsingTouch && (Math.abs(this.touchMoveX) > 0.1 || Math.abs(this.touchMoveY) > 0.1)) {
      // Движение от виртуального джойстика
      const moveX = this.touchMoveX * this.speed;
      const moveY = this.touchMoveY * this.speed;
      
      this.sprite.x = Math.max(
        this.radius,
        Math.min(this.app.screen.width - this.radius, this.sprite.x + moveX)
      );
      this.sprite.y = Math.max(
        this.radius,
        Math.min(this.app.screen.height - this.radius, this.sprite.y + moveY)
      );
    } else {
      // 4-directional movement (WASD or Arrow keys)
      if (this.keys.has('a') || this.keys.has('arrowleft')) {
        this.sprite.x = Math.max(this.radius, this.sprite.x - this.speed);
      }
      if (this.keys.has('d') || this.keys.has('arrowright')) {
        this.sprite.x = Math.min(
          this.app.screen.width - this.radius,
          this.sprite.x + this.speed
        );
      }
      if (this.keys.has('w') || this.keys.has('arrowup')) {
        this.sprite.y = Math.max(this.radius, this.sprite.y - this.speed);
      }
      if (this.keys.has('s') || this.keys.has('arrowdown')) {
        this.sprite.y = Math.min(
          this.app.screen.height - this.radius,
          this.sprite.y + this.speed
        );
      }
    }
    
    // Update HP bar position
    this.hpBarBackground.x = this.sprite.x;
    this.hpBarBackground.y = this.sprite.y;
    this.hpBar.x = this.sprite.x;
    this.hpBar.y = this.sprite.y;

    // Стрельба: приоритет тач-вводу, если он активен, иначе мышь
    const shouldShoot = this.isUsingTouch 
      ? this.isTouchShooting 
      : this.isMouseDown;
    
    if (shouldShoot && this.shootCallback) {
      const currentTime = Date.now();
      const cooldown = 300 / upgrades.fireRate; // Базовый cooldown 300ms, уменьшается с улучшениями
      
      if (currentTime - this.lastShotTime >= cooldown) {
        this.shoot(upgrades);
        this.lastShotTime = currentTime;
      }
    }
  }

  private shoot(upgrades: WeaponUpgrades) {
    if (!this.shootCallback) return;

    const centerX = this.sprite.x;
    const centerY = this.sprite.y;

    // Calculate direction: приоритет тач-вводу, если он активен, иначе мышь
    let targetX: number;
    let targetY: number;
    
    if (this.isUsingTouch && this.isTouchShooting) {
      targetX = this.touchShootX;
      targetY = this.touchShootY;
    } else {
      targetX = this.mouseX;
      targetY = this.mouseY;
    }

    const dx = targetX - centerX;
    const dy = targetY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Base direction (toward target, or default up if target not set)
    let baseDirX = 0;
    let baseDirY = -1; // Default: shoot up
    
    if (distance > 0) {
      baseDirX = dx / distance;
      baseDirY = dy / distance;
    }

    // Создаем пули в зависимости от bulletCount
    if (upgrades.bulletCount === 1) {
      // Одна пуля в направлении движения
      this.shootCallback(centerX, centerY, baseDirX, baseDirY, upgrades);
    } else if (upgrades.bulletCount === 2) {
      // Две пули с небольшим разбросом
      const spreadAngle = Math.PI / 12; // 15 degrees
      const dir1X = baseDirX * Math.cos(spreadAngle) - baseDirY * Math.sin(spreadAngle);
      const dir1Y = baseDirX * Math.sin(spreadAngle) + baseDirY * Math.cos(spreadAngle);
      const dir2X = baseDirX * Math.cos(-spreadAngle) - baseDirY * Math.sin(-spreadAngle);
      const dir2Y = baseDirX * Math.sin(-spreadAngle) + baseDirY * Math.cos(-spreadAngle);
      
      this.shootCallback(centerX, centerY, dir1X, dir1Y, upgrades);
      this.shootCallback(centerX, centerY, dir2X, dir2Y, upgrades);
    } else if (upgrades.bulletCount >= 3) {
      // Три пули: центр, лево, право с разбросом
      const spreadAngle = Math.PI / 10; // 18 degrees
      const dirLeftX = baseDirX * Math.cos(spreadAngle) - baseDirY * Math.sin(spreadAngle);
      const dirLeftY = baseDirX * Math.sin(spreadAngle) + baseDirY * Math.cos(spreadAngle);
      const dirRightX = baseDirX * Math.cos(-spreadAngle) - baseDirY * Math.sin(-spreadAngle);
      const dirRightY = baseDirX * Math.sin(-spreadAngle) + baseDirY * Math.cos(-spreadAngle);
      
      this.shootCallback(centerX, centerY, dirLeftX, dirLeftY, upgrades);
      this.shootCallback(centerX, centerY, baseDirX, baseDirY, upgrades);
      this.shootCallback(centerX, centerY, dirRightX, dirRightY, upgrades);
    }
  }

  public getShootPosition() {
    return {
      x: this.sprite.x,
      y: this.sprite.y,
    };
  }
  
  public takeDamage(damage: number = 1): boolean {
    if (this.currentHealth <= 0) return false;
    
    this.currentHealth = Math.max(0, this.currentHealth - damage);
    this.updateHPBar();
    
    // Visual feedback - flash red when hit
    this.sprite.tint = 0xff0000;
    setTimeout(() => {
      if (this.sprite) {
        this.sprite.tint = 0xffffff;
      }
    }, 100);
    
    return this.currentHealth <= 0;
  }
  
  private updateHPBar() {
    if (!this.hpBar || !this.hpBarBackground) return;
    
    const healthPercent = Math.max(0, this.currentHealth / this.maxHealth);
    const barWidth = 60;
    const currentWidth = barWidth * healthPercent;
    
    // Update HP bar color based on health
    let barColor = 0x00ff00; // Green
    if (healthPercent < 0.3) {
      barColor = 0xff0000; // Red
    } else if (healthPercent < 0.6) {
      barColor = 0xffff00; // Yellow
    }
    
    // Clear and redraw HP bar
    this.hpBar.clear();
    this.hpBar.rect(-barWidth / 2, -this.radius - 15, currentWidth, 6);
    this.hpBar.fill(barColor);
  }
  
  public getRadius(): number {
    return this.radius;
  }

  public getBounds() {
    return this.sprite.getBounds();
  }

  public destroy() {
    if (this.sprite) this.sprite.destroy();
    if (this.hpBar) this.hpBar.destroy();
    if (this.hpBarBackground) this.hpBarBackground.destroy();
    // Note: Event listeners are automatically cleaned up when canvas is destroyed
  }
}

