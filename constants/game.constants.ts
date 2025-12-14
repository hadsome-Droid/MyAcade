export const GAME_CONFIG = {
  PLAYER: {
    RADIUS: 25,
    SPEED: 5,
    MAX_HEALTH: 100,
    START_HEALTH: 100,
    DAMAGE_COOLDOWN: 500, // ms
    ENEMY_DAMAGE: 10,
  },
  BULLET: {
    DEFAULT_SPEED: 8,
    DEFAULT_SIZE: 5,
    COLOR: 0xffff00, // Yellow
  },
  WEAPON: {
    BASE_FIRE_RATE: 300, // ms cooldown
    SPREAD_ANGLE_2_BULLETS: Math.PI / 12, // 15 degrees
    SPREAD_ANGLE_3_BULLETS: Math.PI / 10, // 18 degrees
  },
  HP_BAR: {
    WIDTH: 60,
    HEIGHT: 6,
    OFFSET_Y: -40, // Offset from entity center
    BACKGROUND_COLOR: 0x333333,
    HEALTH_THRESHOLDS: {
      LOW: 0.3,    // Red below 30%
      MEDIUM: 0.6, // Yellow below 60%
    },
    COLORS: {
      HIGH: 0x00ff00,  // Green
      MEDIUM: 0xffff00, // Yellow
      LOW: 0xff0000,   // Red
    },
  },
  SCREEN: {
    BACKGROUND_COLOR: 0x1a1a2e,
  },
} as const;
