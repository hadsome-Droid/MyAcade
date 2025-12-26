import styles from '../Game.module.scss';

interface GameOverModalProps {
  score: number;
  level: number;
  onRestart: () => void;
}

/**
 * Game Over Modal
 * Displays final score and level, with a restart button
 */
export const GameOverModal = ({ score, level, onRestart }: GameOverModalProps) => {
  return (
    <div className={styles.gameOverModal}>
      <h2>Игра окончена!</h2>
      <p>Счет: {score}</p>
      <p>Достигнут уровень: {level}</p>
      <button className={styles.restartButton} onClick={onRestart}>
        Начать заново
      </button>
    </div>
  );
};

