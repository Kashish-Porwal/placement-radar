import { useEffect, useRef } from 'react';

const Background3D = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Create 3D particles with motion dynamics
    const particleCount = 70;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 1000 + 1,
      size: Math.random() * 2.5 + 1,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      color: Math.random() > 0.6 ? '#06b6d4' : Math.random() > 0.3 ? '#8b5cf6' : '#ec4899',
      pulseSpeed: Math.random() * 0.03 + 0.01,
      angle: Math.random() * Math.PI * 2
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;
    let currentMouseX = width / 2;
    let currentMouseY = height / 2;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Smooth lerp mouse positioning for fluid inertia motion
      currentMouseX += (mouseX - currentMouseX) * 0.05;
      currentMouseY += (mouseY - currentMouseY) * 0.05;

      const targetX = (currentMouseX - width / 2) * 0.08;
      const targetY = (currentMouseY - height / 2) * 0.08;

      // Draw subtle futuristic grid motion wave in background
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.04)';
      ctx.lineWidth = 1;
      const step = 80;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        for (let y = 0; y < height; y += 20) {
          const wave = Math.sin(time + x * 0.01 + y * 0.01) * 8;
          if (y === 0) ctx.moveTo(x + wave, y);
          else ctx.lineTo(x + wave, y);
        }
        ctx.stroke();
      }

      // Draw 3D glowing mouse halo follower
      const gradient = ctx.createRadialGradient(currentMouseX, currentMouseY, 10, currentMouseX, currentMouseY, 220);
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.06)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(currentMouseX, currentMouseY, 220, 0, Math.PI * 2);
      ctx.fill();

      // Render storytelling 3D motion nodes
      particles.forEach((p, idx) => {
        p.angle += p.pulseSpeed;
        p.x += p.vx + Math.sin(p.angle) * 0.3;
        p.y += p.vy + Math.cos(p.angle) * 0.3;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const posX = p.x + targetX * (p.z / 1000);
        const posY = p.y + targetY * (p.z / 1000);

        // Interactive mouse magnetic pull effect
        const mdx = currentMouseX - posX;
        const mdy = currentMouseY - posY;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        let pullFactorX = 0;
        let pullFactorY = 0;
        if (mdist < 180) {
          const force = (1 - mdist / 180) * 15;
          pullFactorX = (mdx / mdist) * force;
          pullFactorY = (mdy / mdist) * force;
        }

        const renderX = posX + pullFactorX;
        const renderY = posY + pullFactorY;

        // Particle node with glowing aura
        const alpha = 0.35 + Math.sin(time * 2 + idx) * 0.3;
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.size * (1 + Math.sin(p.angle) * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.1, alpha);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby particles with glowing storytelling lines
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const p2X = p2.x + targetX * (p2.z / 1000);
          const p2Y = p2.y + targetY * (p2.z / 1000);
          const dx = renderX - p2X;
          const dy = renderY - p2Y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(renderX, renderY);
            ctx.lineTo(p2X, p2Y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 140) * 0.25;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 opacity-80 mix-blend-screen"
    />
  );
};

export default Background3D;
