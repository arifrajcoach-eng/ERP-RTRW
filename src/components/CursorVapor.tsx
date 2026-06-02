import React, { useEffect, useRef } from 'react';

const CursorVapor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<{ x: number, y: number, vx: number, vy: number, life: number, initialSize: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleMouseMove = (e: MouseEvent) => {
      for (let i = 0; i < 4; i++) {
        particles.current.push({
          x: e.clientX + (Math.random() - 0.5) * 15,
          y: e.clientY + (Math.random() - 0.5) * 15,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -Math.random() * 1.5 - 0.5,
          life: 1.0,
          initialSize: Math.random() * 5 + 2
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'screen';
      
      particles.current.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.015;

        if (p.life <= 0) {
          particles.current.splice(index, 1);
        } else {
          const currentSize = p.initialSize * p.life;
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize);
          gradient.addColorStop(0, `rgba(200, 240, 255, ${p.life * 0.8})`);
          gradient.addColorStop(1, `rgba(200, 240, 255, 0)`);
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });
      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
    />
  );
};

export default CursorVapor;
