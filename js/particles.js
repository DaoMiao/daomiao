/* =================================================================
   Canvas 粒子星空背景
   ================================================================= */

(function() {
  'use strict';

  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let animationId = null;

  // 配色 - 紫蓝粉青
  const colors = [
    { r: 124, g: 58, b: 237 },   // 紫
    { r: 37, g: 99, b: 235 },    // 蓝
    { r: 244, g: 114, b: 182 },  // 粉
    { r: 6, g: 182, b: 212 },    // 青
  ];

  // 鼠标交互
  let mouse = { x: null, y: null, radius: 150 };

  // 检测移动端/弱设备
  const isMobile = window.innerWidth < 768;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setSize() {
    width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    canvas.style.width = canvas.offsetWidth + 'px';
    canvas.style.height = canvas.offsetHeight + 'px';
  }

  function createParticle() {
    const x = Math.random() * canvas.offsetWidth;
    const y = Math.random() * canvas.offsetHeight;
    const color = colors[Math.floor(Math.random() * colors.length)];

    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 0.5,
      color,
      baseAlpha: Math.random() * 0.5 + 0.3,
      pulseOffset: Math.random() * Math.PI * 2
    };
  }

  function init() {
    particles = [];
    const count = isMobile ? 35 : (Math.min(window.innerWidth, 1600) / 25);
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  function drawParticle(p, t) {
    const pulse = Math.sin(t * 0.001 + p.pulseOffset) * 0.3 + 0.7;
    const alpha = p.baseAlpha * pulse;

    // 计算鼠标排斥
    let dx = 0, dy = 0, force = 0;
    if (mouse.x !== null) {
      const mx = p.x - mouse.x;
      const my = p.y - mouse.y;
      const dist = Math.sqrt(mx * mx + my * my);
      if (dist < mouse.radius) {
        const angle = Math.atan2(my, mx);
        force = (1 - dist / mouse.radius) * 0.5;
        dx = Math.cos(angle) * force;
        dy = Math.sin(angle) * force;
      }
    }

    p.x += p.vx + dx;
    p.y += p.vy + dy;

    // 边界反弹
    if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;
    p.x = Math.max(0, Math.min(canvas.offsetWidth, p.x));
    p.y = Math.max(0, Math.min(canvas.offsetHeight, p.y));

    // 绘制光点
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
    ctx.fill();

    // 光晕
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.15})`;
    ctx.fill();
  }

  function drawConnections(t) {
    const maxDist = isMobile ? 80 : 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.25;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }

  function animate(t) {
    if (reducedMotion) return;
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    particles.forEach(p => drawParticle(p, t));
    drawConnections(t);
    animationId = requestAnimationFrame(animate);
  }

  // 鼠标事件
  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }

  function onMouseLeave() {
    mouse.x = null;
    mouse.y = null;
  }

  function onResize() {
    setSize();
    init();
  }

  function onVisibilityChange() {
    if (document.hidden) {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    } else if (!animationId && !reducedMotion) {
      animationId = requestAnimationFrame(animate);
    }
  }

  function init_() {
    setSize();
    init();

    if (!reducedMotion) {
      animationId = requestAnimationFrame(animate);
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibilityChange);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init_);
  } else {
    init_();
  }
})();
