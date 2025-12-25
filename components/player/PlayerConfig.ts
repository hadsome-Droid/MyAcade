/**
 * Конфигурация игрока
 */
export interface PlayerConfig {
    /** Скорость движения */
    speed: number;
    /** Максимальное здоровье */
    maxHealth: number;
    /** Радиус коллизии */
    radius: number;
    /** Масштаб спрайта */
    scale: number;
    /** Пути к спрайт-листам анимаций */
    /** walk */
    walkAnimationPath: string;
    /** idle */
    idleAnimationPath: string;
    /** attack */
    attackAnimationPath: string;
    /** runAttack */
    runAttackAnimationPath: string;
    /** runBackwardAttack */
    runBackwardsAttackAnimationPath: string;
    /** strafeLeftAttack */
    strafeLeftAttackAnimationPath: string;
    /** strafeRightAttack */
    strafeRightAttackAnimationPath: string;
}

/**
 * Дефолтная конфигурация игрока
 */
export const DEFAULT_PLAYER_CONFIG: PlayerConfig = {
    speed: 5,
    maxHealth: 100,
    radius: 15,
    scale: 0.05,
    // walkAnimationPath: '/texture/player/walk/walk.json',
    walkAnimationPath: '/texture/player/run/run.json',
    idleAnimationPath: '/texture/player/idle2/idle2.json',
    attackAnimationPath: '/texture/player/attack/attack.json',
    runAttackAnimationPath: '/texture/player/runAttack/runAttack.json',
    runBackwardsAttackAnimationPath: '/texture/player/runBackwardsAttack/runBackwardAttack.json',
    strafeLeftAttackAnimationPath: '/texture/player/strafeLeftAttack/strafeLeftAttack.json',
    strafeRightAttackAnimationPath: '/texture/player/strafeRightAttack/strafeRightAttack.json',
};

/**
 * Объединяет пользовательскую конфигурацию с дефолтной
 */
export function mergePlayerConfig(custom?: Partial<PlayerConfig>): PlayerConfig {
    return {
        ...DEFAULT_PLAYER_CONFIG,
        ...custom,
    };
}

