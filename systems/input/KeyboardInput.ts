export class KeyboardInput {
  private keys: Set<string> = new Set();

  constructor() {
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  public isPressed(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }

  public isMovementKeyPressed(): { left: boolean; right: boolean; up: boolean; down: boolean } {
    return {
      left: this.isPressed('a') || this.isPressed('arrowleft'),
      right: this.isPressed('d') || this.isPressed('arrowright'),
      up: this.isPressed('w') || this.isPressed('arrowup'),
      down: this.isPressed('s') || this.isPressed('arrowdown'),
    };
  }

  public destroy(): void {
    // Event listeners are automatically cleaned up when window is destroyed
    this.keys.clear();
  }
}
