"use client";

import { useEffect, useRef } from 'react';

export default function DynamicBackground({ modoClaro = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    // Configurações
    const particles = [];
    const particleCount = 30;
    const colors = modoClaro 
      ? ['#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'] // Cores claras
      : ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#7209b7']; // Cores escuras
    
    // Configurar canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Classe da partícula
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 3 + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.5 + 0.2;
        this.life = Math.random() * 200 + 100;
        this.maxLife = this.life;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        // Efeito de fade out
        this.alpha = (this.life / this.maxLife) * 0.7;

        // Reposicionar quando sair da tela ou morrer
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height || this.life <= 0) {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.life = this.maxLife;
          this.alpha = Math.random() * 0.5 + 0.2;
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Gradiente radial para efeito de brilho
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color + '80');
        gradient.addColorStop(1, this.color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // Criar partículas
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }


    // Função de animação
    const animate = () => {
      ctx.fillStyle = modoClaro ? '#f8fafc' : '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Atualizar e desenhar partículas
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Conectar partículas próximas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 80) {
            ctx.save();
            ctx.globalAlpha = (80 - distance) / 80 * (modoClaro ? 0.2 : 0.15);
            ctx.strokeStyle = modoClaro ? '#6b7280' : '#ffffff';
            ctx.lineWidth = modoClaro ? 0.6 : 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [modoClaro]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-50"
      style={{ 
        background: modoClaro 
          ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)'
          : 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        zIndex: -50,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }}
    />
  );
}

