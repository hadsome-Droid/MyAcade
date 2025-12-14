import * as PIXI from 'pixi.js';

export class MouseInput {
  private mouseX: number = 0;
  private mouseY: number = 0;
  private isMouseDown: boolean = false;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupListeners();
  }

  private setupListeners(): void {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left mouse button
        this.isMouseDown = true;
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) { // Left mouse button
        this.isMouseDown = false;
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isMouseDown = false;
    });
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.mouseX, y: this.mouseY };
  }

  public isButtonDown(): boolean {
    return this.isMouseDown;
  }

  public destroy(): void {
    // Event listeners are automatically cleaned up when canvas is destroyed
  }
}

