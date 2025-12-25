/**
 * Утилиты для работы с изометрическими анимациями
 */

/**
 * Перечисление направлений для изометрической анимации
 * 8 направлений по часовой стрелке
 */
export enum IsometricDirection {
  Right = 'Right',
  RightDown = 'RightDown',
  Down = 'Down',
  DownLeft = 'DownLeft',
  Left = 'Left',
  LeftUp = 'LeftUp',
  Up = 'Up',
  UpRight = 'UpRight',
}

/**
 * Определяет направление движения на основе вектора движения
 * @param dx Изменение по X (-1 до 1)
 * @param dy Изменение по Y (-1 до 1)
 * @returns Одно из 8 изометрических направлений
 */
export function getDirectionFromMovement(dx: number, dy: number): IsometricDirection {
  // Если нет движения, возвращаем Down по умолчанию
  if (dx === 0 && dy === 0) {
    return IsometricDirection.Down;
  }

  // Вычисляем угол в радианах (от -PI до PI)
  const angle = Math.atan2(dy, dx);
  
  // Конвертируем в градусы (от -180 до 180)
  let degrees = angle * (180 / Math.PI);
  
  // Нормализуем к диапазону 0-360
  if (degrees < 0) {
    degrees += 360;
  }

  // Определяем направление на основе угла
  // Делим круг на 8 секторов по 45 градусов
  // Right = 0° (337.5° - 22.5°)
  // RightDown = 45° (22.5° - 67.5°)
  // Down = 90° (67.5° - 112.5°)
  // DownLeft = 135° (112.5° - 157.5°)
  // Left = 180° (157.5° - 202.5°)
  // LeftUp = 225° (202.5° - 247.5°)
  // Up = 270° (247.5° - 292.5°)
  // UpRight = 315° (292.5° - 337.5°)

  if (degrees >= 337.5 || degrees < 22.5) {
    return IsometricDirection.Right;
  } else if (degrees >= 22.5 && degrees < 67.5) {
    return IsometricDirection.RightDown;
  } else if (degrees >= 67.5 && degrees < 112.5) {
    return IsometricDirection.Down;
  } else if (degrees >= 112.5 && degrees < 157.5) {
    return IsometricDirection.DownLeft;
  } else if (degrees >= 157.5 && degrees < 202.5) {
    return IsometricDirection.Left;
  } else if (degrees >= 202.5 && degrees < 247.5) {
    return IsometricDirection.LeftUp;
  } else if (degrees >= 247.5 && degrees < 292.5) {
    return IsometricDirection.Up;
  } else {
    return IsometricDirection.UpRight;
  }
}

/**
 * Формирует имя анимации на основе действия и направления
 * @param action Действие (walk, idle, attack и т.д.)
 * @param direction Направление движения
 * @returns Имя анимации в формате "actionDirection" (например, "walkRight")
 */
export function getAnimationName(action: string, direction: IsometricDirection): string {
  return `${action}${direction}`;
}

/**
 * Возвращает массив всех направлений в порядке по часовой стрелке
 */
export function getAllDirections(): IsometricDirection[] {
  return [
    IsometricDirection.Right,
    IsometricDirection.RightDown,
    IsometricDirection.Down,
    IsometricDirection.DownLeft,
    IsometricDirection.Left,
    IsometricDirection.LeftUp,
    IsometricDirection.Up,
    IsometricDirection.UpRight,
  ];
}

/**
 * Возвращает индекс направления (0-7)
 * @param direction Направление
 * @returns Индекс от 0 до 7
 */
export function getDirectionIndex(direction: IsometricDirection): number {
  const directions = getAllDirections();
  return directions.indexOf(direction);
}

