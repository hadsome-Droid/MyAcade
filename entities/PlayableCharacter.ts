import * as PIXI from 'pixi.js';
import { WeaponUpgrades } from '../store/gameStore';
import { HealthEntity } from './HealthEntity';
import { IsometricDirection, getDirectionFromMovement, getAnimationName } from '@/utils/isometric.utils';
import { PlayerInput } from '../components/player/PlayerInput';
import { PlayerWeapon } from '../components/player/PlayerWeapon';
import { PlayerSprite } from '../components/player/PlayerSprite';
import { PlayerAnimator } from '../components/player/PlayerAnimator';
import { PlayerHealthBar } from '../components/player/PlayerHealthBar';
import { DebugGraphics } from '../components/player/DebugGraphics';

/**
 * Интерфейс конфигурации анимаций персонажа
 */
export interface CharacterAnimationConfig {
    // Пути к спрайт-листам
    walkAnimationPath: string;
    idleAnimationPath: string;
    attackAnimationPath: string;
    runAttackAnimationPath: string;
    runBackwardsAttackAnimationPath: string;
    strafeLeftAttackAnimationPath: string;
    strafeRightAttackAnimationPath: string;

    // Алиасы для кэша PIXI
    walkAlias: string;
    idleAlias: string;
    attackAlias: string;
    runAttackAlias: string;
    runBackwardsAttackAlias: string;
    strafeLeftAttackAlias: string;
    strafeRightAttackAlias: string;

    // Параметры анимаций
    walkFrameRate?: number;
    idleFrameRate?: number;
    attackFrameRate?: number;
    framesPerDirection?: number;
}

/**
 * Базовая конфигурация персонажа
 */
export interface CharacterConfig {
    speed: number;
    maxHealth: number;
    radius: number;
    scale: number;
}

/**
 * Абстрактный класс для всех играбельных персонажей
 * Содержит общую логику движения, анимации и боя
 */
export abstract class PlayableCharacter extends HealthEntity {
    protected config: CharacterConfig;
    protected input: PlayerInput;
    protected weapon: PlayerWeapon;
    protected spriteManager: PlayerSprite;
    public animator: PlayerAnimator;
    protected healthBar: PlayerHealthBar;
    protected lastDirection: IsometricDirection = IsometricDirection.Down;
    private debugGraphics?: DebugGraphics;
    public showDebug: boolean = false;

    constructor(app: PIXI.Application, config: CharacterConfig) {
        super(app, config.speed, config.maxHealth);
        this.config = config;

        // Инициализируем компоненты
        this.input = new PlayerInput(app.canvas as HTMLCanvasElement);
        this.weapon = new PlayerWeapon();
        this.spriteManager = new PlayerSprite(
            app,
            '', // Путь будет установлен в подклассе
            config.radius,
            config.scale
        );

        // Получаем спрайт от менеджера (выбросит ошибку если null)
        this.sprite = this.spriteManager.getSprite();

        // Инициализируем аниматор
        this.animator = new PlayerAnimator(this.sprite);

        // Инициализируем HP бар
        this.healthBar = new PlayerHealthBar(app, config.radius);

        // Обновляем позицию HP бара
        const pos = this.spriteManager.getPosition();
        this.healthBar.setPosition(pos.x, pos.y);
        this.healthBar.update(this.currentHealth, this.maxHealth);

        // Инициализируем дебаг-графику
        this.debugGraphics = new DebugGraphics(app);
        
        // По умолчанию выключено
        this.showDebug = false;

        // Информация о режиме отладки
        console.log(
            '%c🎮 PlayableCharacter Initialized',
            'color: #00ff00; font-weight: bold; font-size: 14px;'
        );
        console.log(
            '%cPress F3 to toggle collision debug mode',
            'color: #ffff00; font-size: 12px;'
        );
    }

    /**
     * Абстрактный метод для загрузки текстур
     * Должен быть реализован в каждом конкретном персонаже
     */
    protected abstract getAnimationConfig(): CharacterAnimationConfig;

    /**
     * Загружает текстуры персонажа на основе конфигурации
     */
    // protected async loadCharacterTextures(animConfig: CharacterAnimationConfig): Promise<void> {
    //     await Promise.all([
    //         PlayerSprite.loadTextures(animConfig.walkAnimationPath, animConfig.walkAlias),
    //         PlayerSprite.loadTextures(animConfig.idleAnimationPath, animConfig.idleAlias),
    //         PlayerSprite.loadTextures(animConfig.attackAnimationPath, animConfig.attackAlias),
    //         PlayerSprite.loadTextures(animConfig.runAttackAnimationPath, animConfig.runAttackAlias),
    //         PlayerSprite.loadTextures(animConfig.runBackwardsAttackAnimationPath, animConfig.runBackwardsAttackAlias),
    //         PlayerSprite.loadTextures(animConfig.strafeLeftAttackAnimationPath, animConfig.strafeLeftAttackAlias),
    //         PlayerSprite.loadTextures(animConfig.strafeRightAttackAnimationPath, animConfig.strafeRightAttackAlias),
    //     ]);
    // }

    /**
     * Инициализирует анимации персонажа
     */
    protected initCharacterAnimations(animConfig: CharacterAnimationConfig): void {
        const framesPerDirection = animConfig.framesPerDirection || 8;
        const walkFrameRate = animConfig.walkFrameRate || 12;
        const idleFrameRate = animConfig.idleFrameRate || 6;
        const attackFrameRate = animConfig.attackFrameRate || 12;

        // Загружаем кадры всех анимаций
        const idleFrames = PlayerSprite.loadIsometricFrames(animConfig.idleAlias, framesPerDirection, 'idle2/');
        const walkFrames = PlayerSprite.loadIsometricFrames(animConfig.walkAlias, framesPerDirection, 'run/');
        const attackFrames = PlayerSprite.loadIsometricFrames(animConfig.attackAlias, framesPerDirection, 'attack/');
        const runAttackFrames = PlayerSprite.loadIsometricFrames(animConfig.runAttackAlias, framesPerDirection, 'runAttack/');
        const runBackwardsAttackFrames = PlayerSprite.loadIsometricFrames(animConfig.runBackwardsAttackAlias, framesPerDirection, 'runBackwardsAttack/');
        const strafeLeftAttackFrames = PlayerSprite.loadIsometricFrames(animConfig.strafeLeftAttackAlias, framesPerDirection, 'strafeLeftAttack/');
        const strafeRightAttackFrames = PlayerSprite.loadIsometricFrames(animConfig.strafeRightAttackAlias, framesPerDirection, 'strafeRightAttack/');

        if (walkFrames.size === 0) {
            console.warn(`Не удалось загрузить кадры walk анимации для ${animConfig.walkAlias}`);
            return;
        }
        if (attackFrames.size === 0) {
            console.warn(`Не удалось загрузить кадры attack анимации для ${animConfig.attackAlias}`);
            return;
        }

        // Загружаем все анимации для всех 8 направлений
        this.animator.loadIsometricAnimation('walk', walkFrames, walkFrameRate, true);
        this.animator.loadIsometricAnimation('attack', attackFrames, attackFrameRate, true);
        this.animator.loadIsometricAnimation('runAttack', runAttackFrames, attackFrameRate, true);
        this.animator.loadIsometricAnimation('runBackwardsAttack', runBackwardsAttackFrames, attackFrameRate, true);
        this.animator.loadIsometricAnimation('strafeLeftAttack', strafeLeftAttackFrames, attackFrameRate, true);
        this.animator.loadIsometricAnimation('strafeRightAttack', strafeRightAttackFrames, attackFrameRate, true);

        if (idleFrames.size > 0) {
            this.animator.loadIsometricAnimation('idle', idleFrames, idleFrameRate, true);
        } else {
            console.warn(`Не удалось загрузить кадры idle анимации для ${animConfig.idleAlias}`);
        }

        // Запускаем idle Down по умолчанию
        this.animator.play('idleDown');
    }

    /**
     * Вычисляет угол (в градусах) между двумя векторами
     * @returns Угол от 0 до 180 градусов
     */
    protected getAngleBetweenVectors(v1x: number, v1y: number, v2x: number, v2y: number): number {
        const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
        const len2 = Math.sqrt(v2x * v2x + v2y * v2y);

        if (len1 === 0 || len2 === 0) return 0;

        const norm1x = v1x / len1;
        const norm1y = v1y / len1;
        const norm2x = v2x / len2;
        const norm2y = v2y / len2;

        const dotProduct = norm1x * norm2x + norm1y * norm2y;
        const angleRad = Math.acos(Math.max(-1, Math.min(1, dotProduct)));

        return angleRad * 180 / Math.PI;
    }

    /**
     * Определяет, движется ли персонаж влево или вправо относительно направления стрельбы
     * @returns Положительное значение = влево, отрицательное = вправо
     */
    protected getCrossProduct(v1x: number, v1y: number, v2x: number, v2y: number): number {
        return v1x * v2y - v1y * v2x;
    }

    /**
     * Проверка круговой коллизии с другим объектом
     * @param otherX X координата другого объекта
     * @param otherY Y координата другого объекта
     * @param otherRadius Радиус другого объекта
     * @returns true если объекты пересекаются
     */
    public checkCircleCollision(otherX: number, otherY: number, otherRadius: number): boolean {
        const pos = this.spriteManager.getPosition();
        const dx = pos.x - otherX;
        const dy = pos.y - otherY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.config.radius + otherRadius);
    }

    /**
     * Получает позицию и радиус для круговой коллизии
     */
    public getCircleCollisionData(): { x: number; y: number; radius: number } {
        const pos = this.spriteManager.getPosition();
        return {
            x: pos.x,
            y: pos.y,
            radius: this.config.radius
        };
    }

    /**
     * Включить/выключить режим отладки коллизий
     */
    public toggleDebugMode(enabled?: boolean): void {
        this.showDebug = enabled !== undefined ? enabled : !this.showDebug;
        if (this.debugGraphics) {
            this.debugGraphics.setVisible(this.showDebug);
        }
        
        if (this.showDebug) {
            console.log(
                '%c🔍 DEBUG MODE: ON',
                'background: #00ff00; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;'
            );
            console.log('🟢 Green circles = Player collision radius');
            console.log('🟠 Orange circles = Enemy collision radius');
            console.log('🔴 Red rectangles = Sprite bounds (old AABB)');
        } else {
            console.log(
                '%c🔍 DEBUG MODE: OFF',
                'background: #ff0000; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 3px;'
            );
        }
    }

    /**
     * Отрисовка дебаг-информации
     */
    private renderDebugInfo(): void {
        if (!this.showDebug || !this.debugGraphics) return;

        this.debugGraphics.update();

        // Рисуем хитбокс персонажа (красный прямоугольник) - старый метод
        const bounds = this.getBounds();
        this.debugGraphics.drawBounds(bounds, 0xff0000, 0.1);

        // Рисуем радиус круговой коллизии (зеленый круг) - новый метод
        const pos = this.spriteManager.getPosition();
        this.debugGraphics.drawCircle(pos.x, pos.y, this.config.radius, 0x00ff00, 0.3);

        // Информация о размерах
        this.debugGraphics.drawLabel(
            bounds.x,
            bounds.y - 25,
            `Circle Collision | Radius: ${this.config.radius}px`,
            0x00ff00
        );
        
        this.debugGraphics.drawLabel(
            bounds.x,
            bounds.y - 10,
            `Sprite: ${bounds.width.toFixed(0)}x${bounds.height.toFixed(0)}px`,
            0xff0000
        );
    }

    /**
     * Определяет и проигрывает правильную анимацию на основе движения и стрельбы
     */
    protected updateAnimation(movement: { x: number; y: number } | null, isShooting: boolean): void {
        if (movement) {
            const direction = getDirectionFromMovement(movement.x, movement.y);
            this.lastDirection = direction;

            if (isShooting) {
                this.handleMovingAndShootingAnimation(movement);
            } else {
                const walkAnimName = getAnimationName('walk', direction);
                if (this.animator.getCurrentAnimation() !== walkAnimName) {
                    this.animator.play(walkAnimName);
                }
            }
        } else {
            if (isShooting) {
                this.handleStationaryShootingAnimation();
            } else {
                const idleAnimName = getAnimationName('idle', this.lastDirection);
                if (this.animator.getCurrentAnimation() !== idleAnimName) {
                    this.animator.play(idleAnimName);
                }
            }
        }
    }

    /**
     * Обрабатывает анимацию когда персонаж движется и стреляет
     */
    private handleMovingAndShootingAnimation(movement: { x: number; y: number }): void {
        const target = this.input.getShootDirection();
        const position = this.spriteManager.getPosition();

        const shootDx = target.x - position.x;
        const shootDy = target.y - position.y;
        const moveDx = movement.x;
        const moveDy = movement.y;

        const angle = this.getAngleBetweenVectors(moveDx, moveDy, shootDx, shootDy);
        const shootDirection = getDirectionFromMovement(shootDx, shootDy);

        if (angle >= 60 && angle <= 120) {
            // Strafe движение
            const crossProduct = this.getCrossProduct(shootDx, shootDy, moveDx, moveDy);
            const animAction = crossProduct > 0 ? 'strafeLeftAttack' : 'strafeRightAttack';
            const animName = getAnimationName(animAction, shootDirection);

            if (this.animator.getCurrentAnimation() !== animName) {
                this.animator.play(animName);
            }
        } else if (angle > 120) {
            // Движение назад
            const animName = getAnimationName('runBackwardsAttack', shootDirection);
            if (this.animator.getCurrentAnimation() !== animName) {
                this.animator.play(animName);
            }
        } else {
            // Движение вперед
            const animName = getAnimationName('runAttack', shootDirection);
            if (this.animator.getCurrentAnimation() !== animName) {
                this.animator.play(animName);
            }
        }
    }

    /**
     * Обрабатывает анимацию когда персонаж стоит и стреляет
     */
    private handleStationaryShootingAnimation(): void {
        const target = this.input.getShootDirection();
        const position = this.spriteManager.getPosition();

        const dx = target.x - position.x;
        const dy = target.y - position.y;

        const direction = getDirectionFromMovement(dx, dy);
        this.lastDirection = direction;

        const attackAnimName = getAnimationName('attack', direction);
        if (this.animator.getCurrentAnimation() !== attackAnimName) {
            this.animator.play(attackAnimName);
        }
    }

    /**
     * Обработка движения персонажа с учетом границ
     */
    protected handleMovement(movement: { x: number; y: number }): void {
        const newX = this.sprite.x + movement.x * this.speed;
        const newY = this.sprite.y + movement.y * this.speed;

        const radius = this.config.radius;
        this.sprite.x = Math.max(radius, Math.min(this.app.screen.width - radius, newX));
        this.sprite.y = Math.max(radius, Math.min(this.app.screen.height - radius, newY));
    }

    /**
     * Главный метод обновления - общий для всех персонажей
     */
    public update(upgrades: WeaponUpgrades, delta: number = 1 / 60): void {
        const movement = this.input.getMovementDirection();
        const isShooting = this.input.isShootPressed();

        // Обработка движения
        if (movement) {
            this.handleMovement(movement);
        }

        // Обработка анимации
        this.updateAnimation(movement, isShooting);

        // Обновляем позицию HP бара
        if (this.sprite) {
            this.healthBar.setPosition(this.sprite.x, this.sprite.y);
        }

        // Обработка стрельбы
        if (isShooting && this.weapon.canShoot(upgrades)) {
            const position = this.spriteManager.getPosition();
            const target = this.input.getShootDirection();
            this.weapon.shoot(position, target, upgrades);
        }

        // Обновляем аниматор
        this.animator.update(delta);

        // Отрисовка дебаг-информации
        this.renderDebugInfo();
    }

    // ============ Public API Methods ============

    public setShootCallback(callback: (x: number, y: number, directionX: number, directionY: number, upgrades: WeaponUpgrades) => void): void {
        this.weapon.setShootCallback(callback);
    }

    public setScale(scale: number): void {
        this.spriteManager.setScale(scale);
    }

    public getScale(): number {
        return this.spriteManager.getScale();
    }

    public setTouchMovement(dx: number, dy: number): void {
        this.input.setTouchMovement(dx, dy);
    }

    public stopTouchMovement(): void {
        this.input.stopTouchMovement();
    }

    public setTouchShooting(x: number, y: number, isShooting: boolean): void {
        this.input.setTouchShooting(x, y, isShooting);
    }

    public stopTouchShooting(): void {
        this.input.stopTouchShooting();
    }

    public getShootPosition(): { x: number; y: number } {
        return this.spriteManager.getPosition();
    }

    public getRadius(): number {
        return this.config.radius;
    }

    protected onDamageEffect(): void {
        if (this.sprite.destroyed) return;
        
        this.spriteManager.setTint(0xff0000);
        setTimeout(() => {
            if (this.sprite && !this.sprite.destroyed) {
                this.spriteManager.setTint(0xffffff);
            }
        }, 100);

        this.healthBar.update(this.currentHealth, this.maxHealth);
    }

    public destroy(): void {
        super.destroy();
        this.input.destroy();
        this.spriteManager.destroy();
        this.healthBar.destroy();
        if (this.debugGraphics) {
            this.debugGraphics.destroy();
        }
    }
}