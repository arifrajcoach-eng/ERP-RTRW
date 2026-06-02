import React, { useState, useEffect } from 'react';

const CursorControls: React.FC = () => {
  const [effect, setEffect] = useState<'vapor' | 'fire' | 'lightning' | 'smoke' | null>(() => (localStorage.getItem('cursor-effect') as any) || 'fire');

  const toggleEffect = () => {
    let nextEffect: 'vapor' | 'fire' | 'lightning' | 'smoke' | null = 'fire';
    if (effect === 'fire') nextEffect = 'vapor';
    else if (effect === 'vapor') nextEffect = 'lightning';
    else if (effect === 'lightning') nextEffect = 'smoke';
    else if (effect === 'smoke') nextEffect = null;
    else nextEffect = 'fire';
    
    setEffect(nextEffect);
    if (nextEffect) localStorage.setItem('cursor-effect', nextEffect);
    else localStorage.removeItem('cursor-effect');
    
    window.dispatchEvent(new Event('cursor-effect-changed'));
  };

  return (
    <button
      onClick={toggleEffect}
      className="p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-90 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-brand-blue/30 mr-[91px]"
      title={effect === 'fire' ? '🔥 FIRE ON' : effect === 'vapor' ? '✨ VAPOR ON' : effect === 'lightning' ? '⚡ LIGHTNING ON' : effect === 'smoke' ? '💨 SMOKE ON' : 'CURSOR OFF'}
    >
      {effect === 'fire' ? '🔥' : effect === 'vapor' ? '✨' : effect === 'lightning' ? '⚡' : effect === 'smoke' ? '💨' : '∅'}
    </button>
  );
};

export default CursorControls;
