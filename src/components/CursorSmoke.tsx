import React, { useEffect, useRef } from 'react';

const CursorSmoke: React.FC = () => {
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
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -Math.random() * 1 - 0.5,
          life: 1.0,
          initialSize: Math.random() * 8 + 5
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01;
        if (p.life <= 0) {
          particles.current.splice(index, 1);
        } else {
          const currentSize = p.initialSize * (1 + (1 - p.life) * 2);
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize);
          gradient.addColorStop(0, `rgba(180, 180, 180, ${p.life * 0.4})`);
          gradient.addColorStop(1, `rgba(180, 180, 180, 0)`);
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });
      requestAnimationFrame(animate);
    };
    animate();
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9999]" />;
};

export default CursorSmoke;
