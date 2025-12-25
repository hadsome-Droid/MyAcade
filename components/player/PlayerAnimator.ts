import * as PIXI from 'pixi.js';

/**
 * Состояние анимации
 */
interface AnimationState {
  textures: PIXI.Texture[];
  frameRate: number; // Кадров в секунду
  loop: boolean;
}

/**
 * Компонент управления анимациями игрока
 */
export class PlayerAnimator {
  private sprite: PIXI.Sprite;
  private animations: Map<string, AnimationState> = new Map();
  private currentAnimation: string | null = null;
  private currentFrame: number = 0;
  private frameTime: number = 0;
  private isPlaying: boolean = false;

  constructor(sprite: PIXI.Sprite) {
    this.sprite = sprite;
  }

  /**
   * Загружает анимации из спрайт-листов
   * @param animationConfigs Конфигурации анимаций
   */
  public loadAnimations(animationConfigs: { name: string; textures: PIXI.Texture[]; frameRate?: number; loop?: boolean }[]): void {
    for (const config of animationConfigs) {
      this.animations.set(config.name, {
        textures: config.textures,
        frameRate: config.frameRate || 10,
        loop: config.loop !== undefined ? config.loop : true,
      });
    }
  }

  /**
   * Добавляет одну анимацию
   */
  public addAnimation(name: string, textures: PIXI.Texture[], frameRate: number = 10, loop: boolean = true): void {
    this.animations.set(name, {
      textures,
      frameRate,
      loop,
    });
  }

  /**
   * Загружает изометрические анимации для действия (walk, idle и т.д.)
   * Создает 8 анимаций для каждого направления
   * @param action Название действия (walk, idle, attack и т.д.)
   * @param directionalFrames Map с кадрами для каждого направления
   * @param frameRate FPS анимации
   * @param loop Зацикливать ли анимацию
   */
  public loadIsometricAnimation(
    action: string,
    directionalFrames: Map<string, PIXI.Texture[]>,
    frameRate: number = 10,
    loop: boolean = true
  ): void {
    const directions = ['Right', 'RightDown', 'Down', 'DownLeft', 'Left', 'LeftUp', 'Up', 'UpRight'];
    directions.forEach(direction => {
      const frames = directionalFrames.get(direction);
      if (frames && frames.length > 0) {
        const animName = `${action}${direction}`;
        this.addAnimation(animName, frames, frameRate, loop);
      }
    });
  }

  /**
   * Воспроизводит анимацию
   * @param animationName Название анимации
   * @param restart Начать заново, даже если уже воспроизводится
   */
  public play(animationName: string, restart: boolean = false): void {
    // console.log(animationName);
    const animation = this.animations.get(animationName);
    if (!animation) {
      console.warn(`Анимация "${animationName}" не найдена`);
      return;
    }

    // Если уже воспроизводится эта анимация и не нужен рестарт, ничего не делаем
    if (this.currentAnimation === animationName && this.isPlaying && !restart) {
      return;
    }

    this.currentAnimation = animationName;
    this.currentFrame = 0;
    this.frameTime = 0;
    this.isPlaying = true;

    // Устанавливаем первый кадр
    if (animation.textures.length > 0) {
      this.sprite.texture = animation.textures[0];
    }
  }

  /**
   * Останавливает текущую анимацию
   */
  public stop(): void {
    this.isPlaying = false;
  }

  /**
   * Обновляет анимацию (вызывать каждый кадр)
   * @param delta Время с последнего кадра в секундах
   */
  public update(delta: number): void {
    if (!this.isPlaying || !this.currentAnimation) return;

    const animation = this.animations.get(this.currentAnimation);
    if (!animation || animation.textures.length === 0) return;

    // Обновляем время
    this.frameTime += delta;

    // Время на один кадр
    const timePerFrame = 1 / animation.frameRate;

    // Если прошло достаточно времени, переключаем кадр
    if (this.frameTime >= timePerFrame) {
      this.frameTime -= timePerFrame;
      this.currentFrame++;

      // Проверка на конец анимации
      if (this.currentFrame >= animation.textures.length) {
        if (animation.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = animation.textures.length - 1;
          this.isPlaying = false;
        }
      }

      // Устанавливаем текстуру текущего кадра
      this.sprite.texture = animation.textures[this.currentFrame];
    }
  }

  /**
   * Получает название текущей анимации
   */
  public getCurrentAnimation(): string | null {
    return this.currentAnimation;
  }

  /**
   * Проверяет, воспроизводится ли анимация
   */
  public isAnimationPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Получает список доступных анимаций
   */
  public getAvailableAnimations(): string[] {
    return Array.from(this.animations.keys());
  }
}

