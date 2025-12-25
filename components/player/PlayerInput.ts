import * as PIXI from 'pixi.js';

/**
 * Состояние мыши
 */
interface MouseState {
  x: number;
  y: number;
  isDown: boolean;
}

/**
 * Состояние тач-ввода
 */
interface TouchState {
  moveX: number;
  moveY: number;
  shootX: number;
  shootY: number;
  isShooting: boolean;
  isActive: boolean;
}

/**
 * Компонент обработки ввода игрока
 */
export class PlayerInput {
  private keys: Set<string> = new Set();
  private mouse: MouseState = { x: 0, y: 0, isDown: false };
  private touch: TouchState = {
    moveX: 0,
    moveY: 0,
    shootX: 0,
    shootY: 0,
    isShooting: false,
    isActive: false,
  };
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {

    // Клавиатура
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Мышь
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.key.toLowerCase());
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.key.toLowerCase());
  };

  private handleMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  };

  private handleMouseDown = (e: MouseEvent): void => {
    if (e.button === 0) {
      this.mouse.isDown = true;
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    }
  };

  private handleMouseUp = (e: MouseEvent): void => {
    if (e.button === 0) {
      this.mouse.isDown = false;
    }
  };

  private handleMouseLeave = (): void => {
    this.mouse.isDown = false;
  };

  /**
   * Получает направление движения из ввода
   * @returns Нормализованное направление {x, y} или null если нет движения
   */
  public getMovementDirection(): { x: number; y: number } | null {
    // console.log(this.keys);
    // Приоритет тач-вводу
    if (this.touch.isActive && (Math.abs(this.touch.moveX) > 0.1 || Math.abs(this.touch.moveY) > 0.1)) {
      return {
        x: this.touch.moveX,
        y: this.touch.moveY,
      };
    }

    // Клавиатура (WASD или стрелки)
    let x = 0;
    let y = 0;

    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;

    if (x === 0 && y === 0) return null;

    // Нормализуем диагональное движение
    const length = Math.sqrt(x * x + y * y);
    return {
      x: x / length,
      y: y / length,
    };
  }

  /**
   * Получает позицию для стрельбы
   * @returns Координаты {x, y} цели
   */
  public getShootDirection(): { x: number; y: number } {
    // Приоритет тач-вводу
    if (this.touch.isActive && this.touch.isShooting) {
      return {
        x: this.touch.shootX,
        y: this.touch.shootY,
      };
    }

    // Мышь
    return {
      x: this.mouse.x,
      y: this.mouse.y,
    };
  }

  /**
   * Проверяет, нажата ли кнопка стрельбы
   */
  public isShootPressed(): boolean {
    return this.touch.isActive ? this.touch.isShooting : this.mouse.isDown;
  }

  /**
   * Устанавливает направление движения от виртуального джойстика
   */
  public setTouchMovement(dx: number, dy: number): void {
    this.touch.moveX = dx;
    this.touch.moveY = dy;
    this.touch.isActive = true;
  }

  /**
   * Останавливает тач-ввод движения
   */
  public stopTouchMovement(): void {
    this.touch.moveX = 0;
    this.touch.moveY = 0;
  }

  /**
   * Устанавливает координаты стрельбы от тач-контрола
   */
  public setTouchShooting(x: number, y: number, isShooting: boolean): void {
    this.touch.shootX = x;
    this.touch.shootY = y;
    this.touch.isShooting = isShooting;
    this.touch.isActive = true;
  }

  /**
   * Останавливает тач-стрельбу
   */
  public stopTouchShooting(): void {
    this.touch.isShooting = false;
  }

  /**
   * Очищает все обработчики событий
   */
  public destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
  }
}

