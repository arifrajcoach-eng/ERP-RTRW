import React, { useEffect, useRef } from 'react';

const CursorLightning: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<{ x: number, y: number, life: number, path: { x: number, y: number }[] }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleMouseMove = (e: MouseEvent) => {
      // Spawn more chaotic lightning
      const bolt: { x: number, y: number, life: number, path: { x: number, y: number }[] } = {
        x: e.clientX,
        y: e.clientY,
        life: 1.0,
        path: []
      };
      
      let currX = e.clientX;
      let currY = e.clientY;
      for (let i = 0; i < 8; i++) {
        currX += (Math.random() - 0.5) * 60;
        currY += (Math.random() - 0.5) * 40 + 10;
        bolt.path.push({ x: currX, y: currY });
      }
      particles.current.push(bolt);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'screen';
      
      particles.current.forEach((p, index) => {
        p.life -= 0.04;

        if (p.life <= 0) {
          particles.current.splice(index, 1);
        } else {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(180, 230, 255, ${p.life})`;
          ctx.lineWidth = 1 + p.life * 2;
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
          ctx.moveTo(p.x, p.y);
          p.path.forEach(pt => ctx.lineTo(pt.x, pt.y));
          ctx.stroke();
          ctx.shadowBlur = 0; // Reset shadow
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

export default CursorLightning;
