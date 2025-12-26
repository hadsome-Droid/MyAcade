import * as PIXI from 'pixi.js';

/**
 * Компонент для визуальной отладки хитбоксов и границ
 */
export class DebugGraphics {
    private graphics: PIXI.Graphics;
    private app: PIXI.Application;
    private isVisible: boolean = false;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.graphics = new PIXI.Graphics();
        this.app.stage.addChild(this.graphics);
        
        // Рисуем поверх всех объектов
        this.graphics.zIndex = 10000;
    }

    /**
     * Включить/выключить отображение дебаг-графики
     */
    public toggle(): void {
        this.isVisible = !this.isVisible;
        if (!this.isVisible) {
            this.graphics.clear();
        }
    }

    /**
     * Установить видимость
     */
    public setVisible(visible: boolean): void {
        this.isVisible = visible;
        if (!this.isVisible) {
            this.graphics.clear();
        }
    }

    /**
     * Получить текущую видимость
     */
    public getVisible(): boolean {
        return this.isVisible;
    }

    /**
     * Рисует границы объекта (хитбокс)
     */
    public drawBounds(bounds: PIXI.Bounds, color: number = 0xff0000, alpha: number = 0.3): void {
        if (!this.isVisible) return;

        this.graphics.lineStyle(2, color, 1);
        this.graphics.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        // Заливка для лучшей видимости
        this.graphics.beginFill(color, alpha);
        this.graphics.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
        this.graphics.endFill();
    }

    /**
     * Рисует круг (для радиуса коллизии)
     */
    public drawCircle(x: number, y: number, radius: number, color: number = 0x00ff00, alpha: number = 0.3): void {
        if (!this.isVisible) return;

        this.graphics.lineStyle(2, color, 1);
        this.graphics.drawCircle(x, y, radius);
        
        // Заливка
        this.graphics.beginFill(color, alpha);
        this.graphics.drawCircle(x, y, radius);
        this.graphics.endFill();
        
        // Крестик в центре
        this.graphics.lineStyle(1, color, 1);
        this.graphics.moveTo(x - 5, y);
        this.graphics.lineTo(x + 5, y);
        this.graphics.moveTo(x, y - 5);
        this.graphics.lineTo(x, y + 5);
    }

    /**
     * Рисует текстовую метку
     */
    public drawLabel(x: number, y: number, text: string, color: number = 0xffffff): void {
        if (!this.isVisible) return;

        const label = new PIXI.Text(text, {
            fontSize: 12,
            fill: color,
            stroke: {
                color: 0x000000,
                width: 2
            },
        });
        label.x = x;
        label.y = y;
        this.graphics.addChild(label);
    }

    /**
     * Очищает всю дебаг-графику
     */
    public clear(): void {
        this.graphics.clear();
        this.graphics.removeChildren();
    }

    /**
     * Обновление каждый кадр
     */
    public update(): void {
        if (this.isVisible) {
            this.clear();
        }
    }

    /**
     * Уничтожает компонент
     */
    public destroy(): void {
        this.graphics.destroy();
    }
}

