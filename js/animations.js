/**
 * IronPulse Haute Animation & Particle System
 * Hardware-accelerated canvas celebration sparkles, animated stat count-ups, and tactile feedback.
 */

class AnimationController {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animating = false;
  }

  init() {
    this.canvas = document.getElementById('celebration-canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'celebration-canvas';
      this.canvas.className = 'fixed inset-0 pointer-events-none z-50';
      document.body.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  // --- CHAMPAGNE GOLD & DIAMOND CELEBRATION SPARKLES ---
  triggerCelebration(originX = null, originY = null) {
    if (!this.canvas) this.init();
    this.resizeCanvas();

    const startX = originX !== null ? originX : window.innerWidth / 2;
    const startY = originY !== null ? originY : window.innerHeight / 2;

    const goldPalette = [
      '#f7e8c5', '#dab978', '#b5893d', '#edd59e', '#ffffff', '#ffd700', '#f4d068'
    ];

    const particleCount = 55;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.6;
      const speed = Math.random() * 8 + 3;
      const size = Math.random() * 5 + 3;
      const color = goldPalette[Math.floor(Math.random() * goldPalette.length)];

      this.particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 3,
        size: size,
        color: color,
        alpha: 1,
        decay: Math.random() * 0.018 + 0.012,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        shape: Math.random() > 0.4 ? 'sparkle' : 'circle'
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.loop();
    }

    this.triggerHaptic('success');
  }

  loop() {
    if (!this.particles.length) {
      this.animating = false;
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; // gravity
      p.vx *= 0.98; // air resistance
      p.rotation += p.rotationSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;

      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);

      if (p.shape === 'sparkle') {
        // Draw 4-point star sparkle
        this.ctx.beginPath();
        for (let j = 0; j < 4; j++) {
          this.ctx.lineTo(Math.cos((j * Math.PI) / 2) * p.size * 1.5, Math.sin((j * Math.PI) / 2) * p.size * 1.5);
          this.ctx.lineTo(Math.cos((j * Math.PI) / 2 + Math.PI / 4) * (p.size * 0.4), Math.sin((j * Math.PI) / 2 + Math.PI / 4) * (p.size * 0.4));
        }
        this.ctx.closePath();
        this.ctx.fill();
      } else {
        // Draw circle particle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    requestAnimationFrame(() => this.loop());
  }

  // --- STAT NUMBER COUNT-UP ANIMATION ---
  animateNumber(elementOrId, targetValue, duration = 800, prefix = '', suffix = '', decimals = 0) {
    const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (!el) return;

    const startValue = 0;
    const startTime = performance.now();
    const finalVal = Number(targetValue) || 0;

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic: 1 - pow(1 - x, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = startValue + (finalVal - startValue) * easeProgress;

      const formatted = decimals > 0 ? currentVal.toFixed(decimals) : Math.round(currentVal);
      el.textContent = `${prefix}${formatted.toLocaleString()}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        const finalFormatted = decimals > 0 ? finalVal.toFixed(decimals) : Math.round(finalVal);
        el.textContent = `${prefix}${finalFormatted.toLocaleString()}${suffix}`;
      }
    };

    requestAnimationFrame(update);
  }

  // --- TACTILE / HAPTIC FEEDBACK ---
  triggerHaptic(type = 'light') {
    if (!('vibrate' in navigator)) return;
    try {
      if (type === 'light') {
        navigator.vibrate(25);
      } else if (type === 'medium') {
        navigator.vibrate(45);
      } else if (type === 'success') {
        navigator.vibrate([35, 30, 60]);
      } else if (type === 'alarm') {
        navigator.vibrate([100, 60, 100, 60, 150]);
      }
    } catch (_) {}
  }
}

window.animator = new AnimationController();
window.triggerCelebration = (x, y) => window.animator.triggerCelebration(x, y);
window.animateNumber = (el, val, dur, pre, suf, dec) => window.animator.animateNumber(el, val, dur, pre, suf, dec);
window.triggerHaptic = (type) => window.animator.triggerHaptic(type);

document.addEventListener('DOMContentLoaded', () => {
  window.animator.init();
});
