import { VirtualJoystick } from '../../ui/VirtualJoystick';
import { TouchShootControl } from '../../ui/TouchShootControl';

interface MobileControlsProps {
  onJoystickMove: (dx: number, dy: number) => void;
  onJoystickStop: () => void;
  onTouchShoot: (x: number, y: number) => void;
  onTouchShootStop: () => void;
}

/**
 * Mobile Controls Wrapper
 * Renders virtual joystick and touch shoot control for mobile devices
 */
export const MobileControls = ({
  onJoystickMove,
  onJoystickStop,
  onTouchShoot,
  onTouchShootStop
}: MobileControlsProps) => {
  return (
    <>
      <VirtualJoystick onMove={onJoystickMove} onStop={onJoystickStop} />
      <TouchShootControl onShoot={onTouchShoot} onStop={onTouchShootStop} />
    </>
  );
};

