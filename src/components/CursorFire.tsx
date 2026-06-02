import React, { useEffect, useRef } from 'react';

const CursorFire: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<{ x: number, y: number, vx: number, vy: number, life: number, size: number, color: string }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleMouseMove = (e: MouseEvent) => {
      // Spawn fire particles
      for (let i = 0; i < 3; i++) {
        particles.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 2 - 1,
          life: 1.0,
          size: Math.random() * 4 + 1,
          color: Math.random() > 0.5 ? '#ff4500' : '#ffa500' // orange-red mix
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.current.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;

        if (p.life <= 0) {
          particles.current.splice(index, 1);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace(')', `, ${p.life})`).replace('rgb', 'rgba'); // simple fade
          ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
          ctx.fill();
        }
      });
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

export default CursorFire;
