import { MainMenu } from '../../ui/MainMenu';
import { SettingsMenu } from '../../ui/SettingsMenu';
import { HighScoresMenu } from '../../ui/HighScoresMenu';
import { AboutMenu } from '../../ui/AboutMenu';
import { AchievementsMenu } from '../../ui/AchievementsMenu';

interface GameMenuRouterProps {
  currentMenuScreen: string;
}

/**
 * Game Menu Router
 * Routes between different menu screens based on current state
 */
export const GameMenuRouter = ({ currentMenuScreen }: GameMenuRouterProps) => {
  switch (currentMenuScreen) {
    case 'settings':
      return <SettingsMenu />;
    case 'achievements':
      return <AchievementsMenu />;
    case 'highScores':
      return <HighScoresMenu />;
    case 'about':
      return <AboutMenu />;
    default:
      return <MainMenu />;
  }
};

