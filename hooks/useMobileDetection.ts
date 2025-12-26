import { useState, useEffect } from 'react';
import { isMobileOrTablet, getScreenOrientation } from '../utils/deviceDetection';

/**
 * Hook for detecting mobile devices and screen orientation
 * Automatically updates on window resize and orientation change
 */
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  
  useEffect(() => {
    // Initial detection
    setIsMobile(isMobileOrTablet());
    setOrientation(getScreenOrientation());
    
    const handleResize = () => {
      setIsMobile(isMobileOrTablet());
      setOrientation(getScreenOrientation());
    };
    
    const handleOrientationChange = () => {
      // Delay for correct dimension detection after rotation
      setTimeout(() => {
        setIsMobile(isMobileOrTablet());
        setOrientation(getScreenOrientation());
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
  
  return { isMobile, orientation };
};

