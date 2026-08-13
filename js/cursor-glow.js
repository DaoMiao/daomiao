/* =================================================================
   鼠标光晕跟随效果
   ================================================================= */

(function() {
  'use strict';

  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  // 仅在支持 hover 的设备启用
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!supportsHover) {
    glow.style.display = 'none';
    return;
  }

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let active = false;
  let rafId = null;

  const LERP = 0.18;  // 平滑系数

  function update() {
    currentX += (targetX - currentX) * LERP;
    currentY += (targetY - currentY) * LERP;

    glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;

    if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
      rafId = requestAnimationFrame(update);
    } else {
      rafId = null;
    }
  }

  function start() {
    if (!rafId) {
      rafId = requestAnimationFrame(update);
    }
  }

  function onMouseMove(e) {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!active) {
      active = true;
      glow.classList.add('active');
      currentX = targetX;
      currentY = targetY;
    }
    start();
  }

  function onMouseLeave() {
    active = false;
    glow.classList.remove('active');
  }

  document.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave);
  window.addEventListener('blur', onMouseLeave);
})();
