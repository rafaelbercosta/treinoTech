'use client';

import { useEffect, useRef } from 'react';

export default function TestePage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    // Configurações - mais partículas e mais visíveis
    const particles = [];
    const particleCount = 50; // Aumentado de 30 para 50
    const colors = ['#ffffff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1']; // Cores mais claras e visíveis
    
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
        this.vx = (Math.random() - 0.5) * 0.3; // Movimento mais rápido
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 4 + 2; // Tamanho maior
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.8 + 0.4; // Mais opaco
        this.life = Math.random() * 200 + 100;
        this.maxLife = this.life;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        // Efeito de fade out mais suave
        this.alpha = (this.life / this.maxLife) * 0.9;

        // Reposicionar quando sair da tela ou morrer
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height || this.life <= 0) {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.life = this.maxLife;
          this.alpha = Math.random() * 0.8 + 0.4;
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Gradiente radial para efeito de brilho mais intenso
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color + 'cc');
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
      ctx.fillStyle = '#000030';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Atualizar e desenhar partículas
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Conectar partículas próximas - linhas mais visíveis
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) { // Distância maior para mais conexões
            ctx.save();
            ctx.globalAlpha = (120 - distance) / 120 * 0.4; // Mais opaco
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2; // Linha mais grossa
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
  }, []);

  return (
    <>
      {/* Esconder o cabeçalho com CSS global */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .fixed.top-0.left-0.right-0.z-50 {
            display: none !important;
          }
          body {
            padding-top: 0 !important;
          }
        `
      }} />
      
      {/* Fundo dinâmico customizado com bolinhas e linhas mais visíveis */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full -z-50"
        style={{ 
          background: '#000030',
          zIndex: -50,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
      
      <div 
        className="min-h-screen flex items-center justify-center p-4 relative z-10"
        style={{ backgroundColor: 'transparent' }}
      >
        {/* Container da imagem sem borda */}
        <div className="relative">
          <img
            src="/teste-image.png"
            alt="Imagem de teste"
            className="max-w-full h-auto"
            style={{ 
              maxHeight: '80vh',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
    </>
  );
}
