'use client';

import { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: [number, number, number]; // RGB
}

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    // Warm star-like color palette: gold, amber, orange, warm white
    const warmColors: [number, number, number][] = [
      [255, 214, 100], // gold
      [255, 191, 71],  // amber
      [255, 167, 55],  // orange
      [255, 235, 180], // warm white
      [255, 200, 120], // light gold
    ];

    const initParticles = () => {
      const count = Math.min(Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 10000), 120);
      particles = Array.from({ length: count }, () => {
        const baseOpacity = Math.random() * 0.5 + 0.5;
        return {
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2.5 + 0.8,
          opacity: baseOpacity,
          baseOpacity,
          twinkleSpeed: Math.random() * 2 + 1,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: warmColors[Math.floor(Math.random() * warmColors.length)],
        };
      });
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const time = Date.now() / 1000;

      // Draw connections with warm tone
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 200, 100, ${0.05 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw twinkling star-like particles
      for (const p of particles) {
        const twinkle = Math.sin(time * p.twinkleSpeed + p.twinkleOffset);
        // Opacity oscillates between dim and bright
        p.opacity = Math.min(p.baseOpacity + twinkle * 0.5, 1);
        const [r, g, b] = p.color;

        // Outer glow (larger, brighter)
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 5);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${Math.min(p.opacity * 0.9, 1)})`);
        gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot (brighter)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(p.opacity + 0.4, 1)})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    initParticles();
    draw();

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 1 }}
    />
  );
}
