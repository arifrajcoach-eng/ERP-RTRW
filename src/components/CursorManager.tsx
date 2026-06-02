import React, { useState, useEffect } from 'react';
import CursorVapor from './CursorVapor';
import CursorFire from './CursorFire';
import CursorLightning from './CursorLightning';
import CursorSmoke from './CursorSmoke';

// Simple manager to toggle effects
const CursorManager: React.FC = () => {
  const [effect, setEffect] = useState<'vapor' | 'fire' | 'lightning' | 'smoke' | null>(() => (localStorage.getItem('cursor-effect') as any) || 'fire');

  useEffect(() => {
    const handleStorageChange = () => {
      setEffect(localStorage.getItem('cursor-effect') as any);
    };
    window.addEventListener('cursor-effect-changed', handleStorageChange);
    return () => window.removeEventListener('cursor-effect-changed', handleStorageChange);
  }, []);

  return (
    <>
      {effect === 'vapor' && <CursorVapor />}
      {effect === 'fire' && <CursorFire />}
      {effect === 'lightning' && <CursorLightning />}
      {effect === 'smoke' && <CursorSmoke />}
    </>
  );
};

export default CursorManager;
