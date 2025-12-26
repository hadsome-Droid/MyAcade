import * as PIXI from 'pixi.js';

/**
 * Компонент управления спрайтом игрока
 */
export class PlayerSprite {
    private sprite: PIXI.Sprite | null = null;
    private app: PIXI.Application;
    private baseScale: number;
    private radius: number;

    /**
     * Загружает текстуры для игрока
     */
    public static async loadTextures(srcPath: string, alias: string): Promise<void> {
        try {
            await PIXI.Assets.load({
                alias: alias,
                src: srcPath
            });
        } catch (error) {
            console.error('Ошибка загрузки текстур игрока:', error);
            throw error;
        }
    }

    /**
     * Извлекает кадры для изометрической анимации (8 направлений)
     * @param assetPath
     * @param framesPerDirection Количество кадров на направление (по умолчанию 8)
     * @param framePrefix для поиска ключей в json
     * @returns Map<direction, textures[]> - карта направлений и их кадров
     */
    public static loadIsometricFrames(
        assetPath: string,
        framesPerDirection: number = 8,
        framePrefix: string = '',
    ): Map<string, PIXI.Texture[]> {
        const spriteSheet = PIXI.Assets.get(assetPath) as PIXI.Spritesheet | null;
        const directions = ['Right', 'RightDown', 'Down', 'DownLeft', 'Left', 'LeftUp', 'Up', 'UpRight'];
        const framesMap = new Map<string, PIXI.Texture[]>();
        if (!spriteSheet || !spriteSheet.textures) {
            console.warn(`Спрайт-лист не найден: ${assetPath}`);
            return framesMap;
        }

        directions.forEach((dir, dirIndex) => {
            const frames: PIXI.Texture[] = [];
            for (let i = 0; i < framesPerDirection; i++) {
                const frameIndex = dirIndex * framesPerDirection + i;
                const frameName = `${framePrefix}${frameIndex.toString().padStart(2, '0')}.png`;
                const tex = spriteSheet.textures[frameName]
                if (tex) {
                    frames.push(tex);
                }
            }
            if (frames.length > 0) {
                framesMap.set(dir, frames);
            }
        });
        // console.log(framesMap)
        return framesMap;
    }

    constructor(app: PIXI.Application, assetKey: string, radius: number, scale: number = 1.0) {
        this.app = app;
        this.radius = radius;
        this.baseScale = scale;

        // Создаем спрайт из загруженной текстуры
        const spriteSheet = PIXI.Assets.get(assetKey) as PIXI.Spritesheet | null;
        let texture: PIXI.Texture | null = null;
        if (spriteSheet && spriteSheet.textures) {
            // Получаем текстуру по имени кадра из JSON
            const firstKey = Object.keys(spriteSheet.textures)[0];
            texture = spriteSheet.textures[firstKey];
        }

        if (texture && texture.width > 0 && texture.height > 0) {
            this.sprite = new PIXI.Sprite(texture);
            console.log('PlayerSprite: Created sprite with texture from', assetKey);
        } else {
            // Fallback: создаем простой спрайт
            console.warn('PlayerSprite: Текстура игрока не найдена для', assetKey, '- используется fallback');
            this.sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
        }
        
        if (!this.sprite) {
            throw new Error('Failed to create sprite in PlayerSprite constructor');
        }
        
        console.log('PlayerSprite: Sprite initialized successfully', this.sprite);

        this.init();
    }

    private init(): void {
        if (!this.sprite) return;
        
        // Центрируем спрайт
        this.sprite.anchor.set(0.5);

        // Начальная позиция
        this.sprite.x = this.app.screen.width / 2;
        this.sprite.y = this.app.screen.height / 2;

        // Применяем масштаб
        this.applyScale();

        // Добавляем на сцену
        this.app.stage.addChild(this.sprite);
    }

    private applyScale(): void {
        if (!this.sprite) return;
        
        // Масштабируем спрайт в соответствии с радиусом и baseScale
        const targetSize = this.radius * 2;
        console.log(this.sprite.texture, this.sprite.width, this.sprite.height);
        if (this.sprite.texture && this.sprite.texture.width > 0) {
            const textureScale = targetSize / Math.max(this.sprite.texture.width, this.sprite.texture.height);
            this.sprite.scale.set(textureScale * this.baseScale);
        }
    }

    /**
     * Устанавливает масштаб спрайта
     */
    public setScale(scale: number): void {
        this.baseScale = scale;
        this.applyScale();
    }

    /**
     * Получает текущий масштаб
     */
    public getScale(): number {
        return this.baseScale;
    }

    /**
     * Получает спрайт
     */
    public getSprite(): PIXI.Sprite | null {
        return this.sprite;
    }

    /**
     * Получает позицию спрайта
     */
    public getPosition(): { x: number; y: number } {
        if (!this.sprite) {
            console.warn('PlayerSprite: sprite is null, returning default position');
            return { x: 0, y: 0 };
        }
        return {
            x: this.sprite.x,
            y: this.sprite.y,
        };
    }

    /**
     * Устанавливает tint (цветовой оттенок) спрайта
     */
    public setTint(color: number): void {
        if (this.sprite) {
            this.sprite.tint = color;
        }
    }

    /**
     * Уничтожает спрайт
     */
    public destroy(): void {
        if (this.sprite) {
            if (this.sprite.parent) {
                this.sprite.parent.removeChild(this.sprite);
            }
            this.sprite.destroy();
            this.sprite = null;
        }
    }
}

