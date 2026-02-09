// Custom fireworks animation system using HTML5 Canvas
// Implements particle physics for realistic fireworks effects

class Particle {
  constructor(x, y, vx, vy, color, gravity = 0.05, decay = 0.98) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.gravity = gravity;
    this.decay = decay;
    this.opacity = 1;
    this.life = 1;
    this.trail = [];
  }

  update() {
    // Store trail positions
    this.trail.push({ x: this.x, y: this.y, opacity: this.opacity });
    if (this.trail.length > 15) {
      this.trail.shift();
    }

    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Apply gravity and decay
    this.vy += this.gravity;
    this.vx *= this.decay;
    this.vy *= this.decay;
    
    // Fade out over time
    this.life *= 0.98;
    this.opacity = this.life;
  }

  draw(ctx) {
    // Draw trail
    this.trail.forEach((point, index) => {
      const trailOpacity = (index / this.trail.length) * this.opacity * 0.3;
      if (trailOpacity > 0.01) {
        ctx.globalAlpha = trailOpacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw main particle
    if (this.opacity > 0.01) {
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  isDead() {
    return this.life <= 0.01;
  }
}

class Firework {
  constructor(canvas, startX, targetX, targetY) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.startX = startX;
    this.x = startX;
    this.y = canvas.height;
    this.targetX = targetX;
    this.targetY = targetY;
    
    // Calculate trajectory
    const distance = Math.sqrt(
      Math.pow(targetX - startX, 2) + Math.pow(targetY - canvas.height, 2)
    );
    const speed = 8;
    this.vx = (targetX - startX) / distance * speed;
    this.vy = (targetY - canvas.height) / distance * speed;
    
    this.exploded = false;
    this.particles = [];
    this.trail = [];
    this.color = this.getRandomColor();
  }

  getRandomColor() {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b',
      '#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e',
      '#55a3ff', '#26de81', '#fc427b', '#fed330', '#fd9644'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    if (!this.exploded) {
      // Store trail for rocket
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 10) {
        this.trail.shift();
      }

      // Move rocket toward target
      this.x += this.vx;
      this.y += this.vy;

      // Check if reached target or close enough
      const distanceToTarget = Math.sqrt(
        Math.pow(this.targetX - this.x, 2) + Math.pow(this.targetY - this.y, 2)
      );
      
      if (distanceToTarget < 20 || this.y <= this.targetY) {
        this.explode();
      }
    } else {
      // Update explosion particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        this.particles[i].update();
        if (this.particles[i].isDead()) {
          this.particles.splice(i, 1);
        }
      }
    }
  }

  explode() {
    this.exploded = true;
    const particleCount = 50 + Math.random() * 50;
    const colors = [this.color, this.getRandomColor(), this.getRandomColor()];
    
    // Create explosion particles
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const velocity = 2 + Math.random() * 8;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      this.particles.push(new Particle(
        this.x, this.y, vx, vy, color,
        0.05 + Math.random() * 0.05, // gravity
        0.96 + Math.random() * 0.04  // decay
      ));
    }
    
    // Add some sparkle particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 1 + Math.random() * 3;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      
      this.particles.push(new Particle(
        this.x, this.y, vx, vy, '#ffffff',
        0.02, 0.95
      ));
    }
  }

  draw() {
    this.ctx.globalCompositeOperation = 'screen';
    
    if (!this.exploded) {
      // Draw rocket trail
      this.trail.forEach((point, index) => {
        const opacity = index / this.trail.length;
        this.ctx.globalAlpha = opacity * 0.8;
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        this.ctx.fill();
      });

      // Draw rocket
      this.ctx.globalAlpha = 1;
      this.ctx.fillStyle = this.color;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = this.color;
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    } else {
      // Draw explosion particles
      this.particles.forEach(particle => {
        particle.draw(this.ctx);
      });
    }
    
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.globalAlpha = 1;
  }

  isDead() {
    return this.exploded && this.particles.length === 0;
  }
}

export class FireworksSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.fireworks = [];
    this.animationId = null;
    this.isRunning = false;
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  launch(count = 1) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const startX = Math.random() * this.canvas.width;
        const targetX = Math.random() * this.canvas.width;
        const targetY = 100 + Math.random() * (this.canvas.height * 0.4);
        
        this.fireworks.push(new Firework(this.canvas, startX, targetX, targetY));
        
        if (!this.isRunning) {
          this.start();
        }
      }, i * 200 + Math.random() * 300);
    }
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.animate();
  }

  animate() {
    // Clear canvas with slight fade effect for trails
    this.ctx.fillStyle = 'rgba(15, 15, 19, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw fireworks
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      this.fireworks[i].update();
      this.fireworks[i].draw();
      
      if (this.fireworks[i].isDead()) {
        this.fireworks.splice(i, 1);
      }
    }
    
    // Continue animation if there are active fireworks
    if (this.fireworks.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.stop();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  clear() {
    this.fireworks = [];
    this.stop();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// Export factory function for easy initialization
export function createFireworks(canvas) {
  return new FireworksSystem(canvas);
}