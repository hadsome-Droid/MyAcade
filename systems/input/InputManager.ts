import { KeyboardInput } from './KeyboardInput';
import { MouseInput } from './MouseInput';
import * as PIXI from 'pixi.js';

export class InputManager {
  public keyboard: KeyboardInput;
  public mouse: MouseInput;

  constructor(canvas: HTMLCanvasElement) {
    this.keyboard = new KeyboardInput();
    this.mouse = new MouseInput(canvas);
  }

  public destroy(): void {
    this.keyboard.destroy();
    this.mouse.destroy();
  }
}

