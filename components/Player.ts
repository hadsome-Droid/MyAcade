import * as PIXI from 'pixi.js';
import {WeaponUpgrades} from '../store/gameStore';
import {HealthEntity} from '../entities/HealthEntity';
import {PlayerConfig, mergePlayerConfig, DEFAULT_PLAYER_CONFIG} from './player/PlayerConfig';
import {PlayerInput} from './player/PlayerInput';
import {PlayerWeapon} from './player/PlayerWeapon';
import {PlayerSprite} from './player/PlayerSprite';
import {PlayerAnimator} from './player/PlayerAnimator';
import {PlayerHealthBar} from './player/PlayerHealthBar';
import {IsometricDirection, getDirectionFromMovement, getAnimationName} from '@/utils/isometric.utils';
import {CharacterAnimationConfig, CharacterConfig, PlayableCharacter} from "@/entities/PlayableCharacter";

/**
 * Класс игрока с компонентной архитектурой
 */
export class Player extends PlayableCharacter {
    private playerConfig: PlayerConfig;

    /**
     * Статический метод для загрузки текстур воина
     */
    public static async loadTextures(): Promise<void> {
        const animConfig = Player.getStaticAnimationConfig();

        await Promise.all([
            PlayerSprite.loadTextures(animConfig.walkAnimationPath, animConfig.walkAlias),
            PlayerSprite.loadTextures(animConfig.idleAnimationPath, animConfig.idleAlias),
            PlayerSprite.loadTextures(animConfig.attackAnimationPath, animConfig.attackAlias),
            PlayerSprite.loadTextures(animConfig.runAttackAnimationPath, animConfig.runAttackAlias),
            PlayerSprite.loadTextures(animConfig.runBackwardsAttackAnimationPath, animConfig.runBackwardsAttackAlias),
            PlayerSprite.loadTextures(animConfig.strafeLeftAttackAnimationPath, animConfig.strafeLeftAttackAlias),
            PlayerSprite.loadTextures(animConfig.strafeRightAttackAnimationPath, animConfig.strafeRightAttackAlias),
        ]);
    }

    /**
     * Возвращает конфигурацию анимаций воина (статический метод)
     */
    private static getStaticAnimationConfig(): CharacterAnimationConfig {
        return {
            walkAnimationPath: DEFAULT_PLAYER_CONFIG.walkAnimationPath,
            idleAnimationPath: DEFAULT_PLAYER_CONFIG.idleAnimationPath,
            attackAnimationPath: DEFAULT_PLAYER_CONFIG.attackAnimationPath,
            runAttackAnimationPath: DEFAULT_PLAYER_CONFIG.runAttackAnimationPath,
            runBackwardsAttackAnimationPath: DEFAULT_PLAYER_CONFIG.runBackwardsAttackAnimationPath,
            strafeLeftAttackAnimationPath: DEFAULT_PLAYER_CONFIG.strafeLeftAttackAnimationPath,
            strafeRightAttackAnimationPath: DEFAULT_PLAYER_CONFIG.strafeRightAttackAnimationPath,

            walkAlias: 'player_walk',
            idleAlias: 'player_idle',
            attackAlias: 'player_attack',
            runAttackAlias: 'player_runAttack',
            runBackwardsAttackAlias: 'player_runBackwardsAttack',
            strafeLeftAttackAlias: 'player_strafeLeftAttack',
            strafeRightAttackAlias: 'player_strafeRightAttack',

            walkFrameRate: 12,
            idleFrameRate: 6,
            attackFrameRate: 12,
            framesPerDirection: 8,
        };
    }

    /**
     * Получает информацию о текущем состоянии спрайта
     */
    public getSpriteInfo(): {
        // Базовые параметры конфигурации
        configRadius: number;
        configScale: number;

        // Размеры оригинальной текстуры
        originalWidth: number;
        originalHeight: number;

        // Текущие размеры спрайта на экране (после масштабирования)
        currentWidth: number;
        currentHeight: number;

        // Текущий масштаб Pixi.js
        pixiScaleX: number;
        pixiScaleY: number;

        // Позиция
        x: number;
        y: number;
    } {
        const texture = this.sprite.texture;

        return {
            // Конфигурация
            configRadius: this.config.radius,
            configScale: this.config.scale,

            // Оригинальные размеры
            originalWidth: texture.width,
            originalHeight: texture.height,

            // Текущие размеры
            currentWidth: this.sprite.width,
            currentHeight: this.sprite.height,

            // Масштаб Pixi
            pixiScaleX: this.sprite.scale.x,
            pixiScaleY: this.sprite.scale.y,

            // Позиция
            x: this.sprite.x,
            y: this.sprite.y,
        };
    }

    /**
     * Выводит информацию о спрайте в консоль для отладки
     */
    public debugSpriteInfo(): void {
        const info = this.getSpriteInfo();

        console.log('═══════════════════════════════════════');
        console.log('🎮 SPRITE INFO');
        console.log('═══════════════════════════════════════');
        console.log('📝 Configuration:');
        console.log(`   Radius: ${info.configRadius}px`);
        console.log(`   Base Scale: ${info.configScale}`);
        console.log('');
        console.log('📐 Original Texture:');
        console.log(`   Size: ${info.originalWidth} × ${info.originalHeight}px`);
        console.log('');
        console.log('🖼️ Current Sprite:');
        console.log(`   Size: ${info.currentWidth.toFixed(2)} × ${info.currentHeight.toFixed(2)}px`);
        console.log(`   Pixi Scale: x=${info.pixiScaleX.toFixed(6)}, y=${info.pixiScaleY.toFixed(6)}`);
        console.log(`   Position: (${info.x.toFixed(0)}, ${info.y.toFixed(0)})`);
        console.log('═══════════════════════════════════════');
    }
    constructor(app: PIXI.Application, config?: Partial<PlayerConfig>) {
        const finalConfig = mergePlayerConfig(config);

        const characterConfig: CharacterConfig = {
            speed: finalConfig.speed,
            maxHealth: finalConfig.maxHealth,
            radius: finalConfig.radius,
            scale: finalConfig.scale,
        };

        super(app, characterConfig);

        this.playerConfig = finalConfig;

        // Инициализируем анимации воина
        this.initCharacterAnimations(this.getAnimationConfig());
    }

    /**
     * Реализация абстрактного метода - возвращает конфигурацию анимаций
     */
    protected getAnimationConfig(): CharacterAnimationConfig {
        // console.log(this.debugSpriteInfo())
        return Player.getStaticAnimationConfig();
    }
}
