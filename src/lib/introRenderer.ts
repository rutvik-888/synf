/**
 * Team SYNF — OMEGA BLACK Cinematic Renderer
 *
 * Concept: The night is a physical dimension. A dimensional environment
 * of obsidian monoliths, liquid-chrome geometry, smoked glass, and
 * fine luminous filaments. The signature SYNF Signal emerges as a
 * sculptural artifact of chrome, black crystal, and translucent glass.
 *
 * Palette: void black → obsidian → graphite, with restrained signal
 * cyan (#50E6FF) and ultraviolet (#9472FF) as light accents only.
 * Black areas stay genuinely dark. Light reveals form, not glow.
 */

const C = {
  void: '#020307',
  obsidian: '#05070C',
  ink: '#090D15',
  graphite: '#111722',
  gunmetal: '#1A2330',
  silver: '#C6D0E0',
  ice: '#F3F6FF',
  cyan: '#50E6FF',
  laser: '#4F7DFF',
  violet: '#9472FF',
  spectral: '#C6A5FF',
};

const RGB = {
  cyan: [80, 230, 255],
  laser: [79, 125, 255],
  violet: [148, 114, 255],
  spectral: [198, 165, 255],
  silver: [198, 208, 224],
  ice: [243, 246, 255],
};

const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

type Particle = {
  x: number; y: number; z: number; vx: number; vy: number; vz: number;
  size: number; alpha: number; baseAlpha: number; lit: boolean;
};

type Monolith = {
  x: number; z: number; w: number; h: number; depth: number;
  rotation: number; alpha: number; targetAlpha: number;
};

type Filament = {
  angle: number; radius: number; phase: number; speed: number;
  color: number[]; width: number; alpha: number;
};

type RingSegment = {
  angle: number; targetLen: number; len: number; color: number[];
};

export class CinematicRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private w = 0; private h = 0; private dpr = 1;
  private raf = 0;
  private frame = 0;
  private time = 0;
  private scene = 0;
  private mouseX = 0; private mouseY = 0;
  private targetMouseX = 0; private targetMouseY = 0;
  private isMobile = false;
  private flashAlpha = 0;
  private shakeAmount = 0;

  private particles: Particle[] = [];
  private monoliths: Monolith[] = [];
  private filaments: Filament[] = [];
  private ringSegments: RingSegment[] = [];

  private sceneStartFrame = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No canvas context');
    this.ctx = ctx;
    this.resize();
    this.initParticles();
    this.initMonoliths();
    this.initFilaments();
    this.initRingSegments();
  }

  private resize = () => {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.isMobile = this.w < 768;
  };

  private initParticles() {
    const count = this.isMobile ? 60 : 140;
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      z: Math.random(),
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.1,
      vz: (Math.random() - 0.5) * 0.004,
      size: 0.4 + Math.random() * 1.4,
      alpha: 0,
      baseAlpha: 0.15 + Math.random() * 0.35,
      lit: Math.random() > 0.7,
    }));
  }

  private initMonoliths() {
    const count = this.isMobile ? 6 : 10;
    this.monoliths = Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * this.w * 1.6,
      z: 0.2 + Math.random() * 0.8,
      w: 80 + Math.random() * 160,
      h: 200 + Math.random() * 400,
      depth: 40 + Math.random() * 120,
      rotation: (Math.random() - 0.5) * 0.3,
      alpha: 0,
      targetAlpha: 0,
    }));
  }

  private initFilaments() {
    const count = this.isMobile ? 16 : 32;
    this.filaments = Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2,
      radius: 0,
      phase: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.02,
      color: i % 3 === 0 ? RGB.cyan : i % 3 === 1 ? RGB.violet : RGB.spectral,
      width: 0.8 + Math.random() * 1.2,
      alpha: 0,
    }));
  }

  private initRingSegments() {
    const count = this.isMobile ? 48 : 96;
    this.ringSegments = Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2,
      targetLen: 0,
      len: 0,
      color: i % 2 === 0 ? RGB.cyan : RGB.violet,
    }));
  }

  setScene(s: number) {
    this.scene = s;
    this.sceneStartFrame = this.frame;
  }
  setMouse(x: number, y: number) { this.targetMouseX = x; this.targetMouseY = y; }
  triggerFlash() { this.flashAlpha = 0.6; }
  triggerShake(amount: number) { this.shakeAmount = amount; }

  start() {
    window.addEventListener('resize', this.resize);
    this.loop();
  }

  stop() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
  }

  private sceneProgress(): number {
    return Math.min(1, (this.frame - this.sceneStartFrame) / 90);
  }

  private loop = () => {
    this.frame++;
    this.time += 0.016;
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    const ctx = this.ctx;
    const cx = this.w / 2, cy = this.h / 2;
    const px = (this.mouseX - cx) * 0.02;
    const py = (this.mouseY - cy) * 0.02;

    let shakeX = 0, shakeY = 0;
    if (this.shakeAmount > 0.1) {
      shakeX = (Math.random() - 0.5) * this.shakeAmount;
      shakeY = (Math.random() - 0.5) * this.shakeAmount;
      this.shakeAmount *= 0.85;
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    const s = this.scene;
    if (s === 0) this.renderVoid(ctx, cx, cy, px, py);
    else if (s === 1) this.renderEmergence(ctx, cx, cy, px, py);
    else if (s === 2) this.renderWorld(ctx, cx, cy, px, py);
    else if (s === 3) this.renderCascade(ctx, cx, cy, px, py);
    else if (s === 4) this.renderTagline(ctx, cx, cy, px, py);
    else if (s === 5) this.renderSynf(ctx, cx, cy, px, py);
    else if (s === 6) this.renderArrival(ctx, cx, cy, px, py);

    this.updateParticles(ctx, cx, cy, px, py);

    if (this.flashAlpha > 0.01) {
      ctx.fillStyle = rgba(RGB.ice, this.flashAlpha);
      ctx.fillRect(0, 0, this.w, this.h);
      this.flashAlpha *= 0.8;
    }

    ctx.restore();
    this.raf = requestAnimationFrame(this.loop);
  };

  private updateParticles(ctx: CanvasRenderingContext2D, cx: number, cy: number, px: number, py: number) {
    const s = this.scene;
    const baseAlpha = s <= 1 ? 0.3 : s === 4 ? 0.6 : 0.4;
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      if (p.z < 0.05 || p.z > 1) p.vz *= -1;
      if (p.x < 0) p.x = this.w; if (p.x > this.w) p.x = 0;
      if (p.y < 0) p.y = this.h; if (p.y > this.h) p.y = 0;

      const scale = 0.3 + p.z * 0.7;
      const a = p.baseAlpha * baseAlpha * scale;
      const sz = p.size * scale;
      const dx = p.x + px * p.z;
      const dy = p.y + py * p.z;

      if (p.lit && s >= 3) {
        ctx.fillStyle = rgba(RGB.cyan, a * 0.5);
        ctx.beginPath();
        ctx.arc(dx, dy, sz * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = rgba(RGB.ice, a);
      ctx.beginPath();
      ctx.arc(dx, dy, sz, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawSignal(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, rot: number, alpha: number) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    // Ambient aura
    const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, 200);
    aura.addColorStop(0, rgba(RGB.violet, 0.35));
    aura.addColorStop(0.6, rgba(RGB.violet, 0.06));
    aura.addColorStop(1, rgba(RGB.violet, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(-200, -200, 400, 400);

    // Outer fractured ring arcs
    ctx.strokeStyle = rgba(RGB.spectral, 0.8);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    const arcs = [
      [200, 40, 358, 188], [372, 232, 252, 356], [168, 358, 40, 240],
    ];
    for (const [x2, y2, x1, y1] of arcs) {
      ctx.beginPath();
      ctx.moveTo(x1 - 200, y1 - 200);
      ctx.lineTo(x2 - 200, y2 - 200);
      ctx.stroke();
    }

    // Mid intersecting ellipses
    ctx.strokeStyle = rgba(RGB.silver, 0.6);
    ctx.lineWidth = 3;
    for (const rot2 of [32, -38]) {
      ctx.save();
      ctx.rotate((rot2 * Math.PI) / 180);
      ctx.beginPath();
      ctx.ellipse(0, 0, 124, 66, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Inner ring
    ctx.strokeStyle = rgba(RGB.silver, 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 92, 0, Math.PI * 2);
    ctx.stroke();

    // Fractured crystal core
    const core = ctx.createRadialGradient(-8, -12, 0, 0, 0, 58);
    core.addColorStop(0, rgba(RGB.ice, 0.9));
    core.addColorStop(0.22, rgba(RGB.spectral, 0.5));
    core.addColorStop(0.55, rgba(RGB.violet, 0.4));
    core.addColorStop(0.82, rgba([26, 11, 58], 0.85));
    core.addColorStop(1, 'rgba(3,4,7,0.95)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight
    ctx.fillStyle = rgba(RGB.ice, 0.5);
    ctx.beginPath();
    ctx.ellipse(-16, -18, 20, 11, -0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // === SHOT 01: ABSOLUTE VOID ===
  private renderVoid(ctx: CanvasRenderingContext2D, cx: number, cy: number, px: number, py: number) {
    // Near-total blackness with the faintest depth
    ctx.fillStyle = C.void;
    ctx.fillRect(0, 0, this.w, this.h);

    // Immense surface suggestion — one faint reflection gradient
    const surfGrad = ctx.createLinearGradient(0, this.h * 0.5, 0, this.h);
    surfGrad.addColorStop(0, 'rgba(5,7,12,0)');
    surfGrad.addColorStop(1, 'rgba(9,13,21,0.6)');
    ctx.fillStyle = surfGrad;
    ctx.fillRect(0, this.h * 0.5, this.w, this.h * 0.5);

    // Single distant point of cold light
    const lightX = cx + px * 0.5;
    const lightY = cy * 0.7 + py * 0.5;
    const lightR = 2 + Math.sin(this.time * 0.8) * 0.5;
    const lightGrad = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, 120);
    lightGrad.addColorStop(0, rgba(RGB.ice, 0.5));
    lightGrad.addColorStop(0.15, rgba(RGB.cyan, 0.08));
    lightGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lightGrad;
    ctx.fillRect(lightX - 120, lightY - 120, 240, 240);
    ctx.fillStyle = rgba(RGB.ice, 0.85);
    ctx.beginPath();
    ctx.arc(lightX, lightY, lightR, 0, Math.PI * 2);
    ctx.fill();

    // Faint horizon line
    const hy = this.h * 0.55 + py * 0.3;
    const lineGrad = ctx.createLinearGradient(0, hy, this.w, hy);
    lineGrad.addColorStop(0, 'rgba(80,230,255,0)');
    lineGrad.addColorStop(0.5, 'rgba(80,230,255,0.04)');
    lineGrad.addColorStop(1, 'rgba(80,230,255,0)');
    ctx.fillStyle = lineGrad;
    ctx.fillRect(0, hy - 0.5, this.w, 1);
  }

  // === SHOT 02: MATTER EMERGES ===
  private renderEmergence(ctx: CanvasRenderingContext2D, cx: number, cy: number, px: number, py: number) {
    const prog = this.sceneProgress();
    ctx.fillStyle = C.void;
    ctx.fillRect(0, 0, this.w, this.h);

    // Obsidian surface with subtle gradient
    const bg = ctx.createLinearGradient(0, 0, 0, this.h);
    bg.addColorStop(0, C.void);
    bg.addColorStop(0.5, C.obsidian);
    bg.addColorStop(1, C.ink);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.w, this.h);

    // Distant monoliths emerging — revealed by rim light
    for (const m of this.monoliths) {
      m.targetAlpha = prog * 0.15;
      m.alpha += (m.targetAlpha - m.alpha) * 0.05;
      if (m.alpha < 0.01) continue;
      const sx = cx + m.x * (1 - m.z * 0.5) + px * (1 - m.z);
      const sy = cy + py * (1 - m.z) + this.h * 0.1;
      const sw = m.w * (1 - m.z * 0.4);
      const sh = m.h * (1 - m.z * 0.4);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(m.rotation);
      // Monolith body — obsidian
      const mGrad = ctx.createLinearGradient(-sw / 2, 0, sw / 2, 0);
      mGrad.addColorStop(0, rgba([5, 7, 12], m.alpha));
      mGrad.addColorStop(0.5, rgba([17, 23, 34], m.alpha * 1.2));
      mGrad.addColorStop(1, rgba([5, 7, 12], m.alpha));
      ctx.fillStyle = mGrad;
      ctx.fillRect(-sw / 2, -sh, sw, sh);
      // Rim light on top edge
      ctx.strokeStyle = rgba(RGB.cyan, m.alpha * 0.4);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-sw / 2, -sh);
      ctx.lineTo(sw / 2, -sh);
      ctx.stroke();
      ctx.restore();
    }

    // Signal emerges from darkness — revealed through rim light, not opacity pop
    const signalAlpha = Math.min(1, prog * 1.5) * 0.6;
    const signalScale = 0.3 + prog * 0.4;
    const signalRot = this.time * 0.08 + prog * 0.5;
    // Rim-light reveal: only draw when enough light
    if (prog > 0.15) {
      this.drawSignal(ctx, cx + px * 0.3, cy + py * 0.3, signalScale, signalRot, signalAlpha);
    }

    // Controlled light sweep revealing form
    const sweepX = ((this.frame * 1.2) % (this.w + 200)) - 100;
    const sweepGrad = ctx.createLinearGradient(sweepX - 100, 0, sweepX + 100, 0);
    sweepGrad.addColorStop(0, 'rgba(80,230,255,0)');
    sweepGrad.addColorStop(0.5, 'rgba(80,230,255,0.03)');
    sweepGrad.addColorStop(1, 'rgba(80,230,255,0)');
    ctx.fillStyle = sweepGrad;
    ctx.fillRect(sweepX - 100, 0, 200, this.h);
  }

  // === SHOT 03: THE WORLD AWAKENS ===
  private renderWorld(ctx: CanvasRenderingContext2D, cx: number, cy: number, px: number, py: number) {
    const prog = this.sceneProgress();
    ctx.fillStyle = C.obsidian;
    ctx.fillRect(0, 0, this.w, this.h);

    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, this.w * 0.7);
    bg.addColorStop(0, C.ink);
    bg.addColorStop(1, C.void);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.w, this.h);

    // Monoliths now fully visible — monumental architecture
    for (const m of this.monoliths) {
      m.targetAlpha = 0.2 + prog * 0.1;
      m.alpha += (m.targetAlpha - m.alpha) * 0.05;
      const sx = cx + m.x * (1 - m.z * 0.5) + px * (1 - m.z);
      const sy = cy + py * (1 - m.z) + this.h * 0.1;
      const sw = m.w * (1 - m.z * 0.4);
      const sh = m.h * (1 - m.z * 0.4);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(m.rotation);
      const mGrad = ctx.createLinearGradient(-sw / 2, 0, sw / 2, 0);
      mGrad.addColorStop(0, rgba([5, 7, 12], m.alpha));
      mGrad.addColorStop(0.3, rgba([9, 13, 21], m.alpha * 1.5));
      mGrad.addColorStop(0.7, rgba([17, 23, 34], m.alpha * 1.3));
      mGrad.addColorStop(1, rgba([5, 7, 12], m.alpha));
      ctx.fillStyle = mGrad;
      ctx.fillRect(-sw / 2, -sh, sw, sh);
      // Cyan rim
      ctx.strokeStyle = rgba(RGB.cyan, m.alpha * 0.5);
      ctx.lineWidth = 1;
      ctx.strokeRect(-sw / 2, -sh, sw, sh);
      // Subtle internal vertical filament
      ctx.strokeStyle = rgba(RGB.violet, m.alpha * 0.2);
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -sh);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.restore();
    }

    // Reflective floor
    const floorY = this.h * 0.7;
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, this.h);
    floorGrad.addColorStop(0, 'rgba(9,13,21,0)');
    floorGrad.addColorStop(0.5, 'rgba(17,23,34,0.15)');
    floorGrad.addColorStop(1, 'rgba(5,7,12,0.4)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, this.w, this.h - floorY);

    // Floor reflection of signal (faint)
    const sigScale = 0.7 + prog * 0.1;
    this.drawSignal(ctx, cx + px * 0.4, cy + py * 0.4, sigScale, this.time * 0.1, 0.7);
    // Reflection — mirrored, faint
    ctx.save();
    ctx.translate(0, floorY * 2);
    ctx.scale(1, -1);
    ctx.globalAlpha = 0.12;
    this.drawSignal(ctx, cx + px * 0.4, cy + py * 0.4, sigScale, this.time * 0.1, 1);
    ctx.restore();

    // Distant luminous points
    for (let i = 0; i < 5; i++) {
      const dx = cx + Math.cos(i * 1.3 + this.time * 0.1) * this.w * 0.35 + px * 0.2;
      const dy = cy + Math.sin(i * 1.3 + this.time * 0.1) * this.h * 0.2 + py * 0.2;
      const dGrad = ctx.createRadialGradient(dx, dy, 0, dx, dy, 30);
      dGrad.addColorStop(0, rgba(i % 2 === 0 ? RGB.cyan : RGB.violet, 0.3));
      dGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = dGrad;
      ctx.fillRect(dx - 30, dy - 30, 60, 60);
    }
  }

  // === SHOT 04: THE ENERGY CASCADE ===
  private renderCascade(ctx: CanvasRenderingContext2D, cx: number, cy: number, px: number, py: number) {
    const prog = this.sceneProgress();
    ctx.fillStyle = C.void;
    ctx.fillRect(0, 0, this.w, this.h);

    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, this.w * 0.6);
    bg.addColorStop(0, C.ink);
    bg.addColorStop(1, C.void);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.w, this.h);

    // Monoliths faint in background
    for (const m of this.monoliths) {
      if (m.alpha < 0.01) continue;
      const sx = cx + m.x * (1 - m.z * 0.5) + px * (1 - m.z);
      const sy = cy + py * (1 - m.z) + this.h * 0.1;
      const sw = m.w * (1 - m.z * 0.4);
      const sh = m.h * (1 - m.z * 0.4);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(m.rotation);
      ctx.fillStyle = rgba([5, 7, 12], m.alpha * 0.4);
      ctx.fillRect(-sw / 2, -sh, sw, sh);
      ctx.restore();
    }

    // Circular energy ring around signal — bars respond to the pulse
    const baseR = Math.min(this.w, this.h) * 0.12;
    for (const seg of this.ringSegments) {
      const pulse = 0.5 + Math.sin(this.time * 4 + seg.angle * 3) * 0.5;
      seg.targetLen = pulse * 60 + 8;
      seg.len += (seg.targetLen - seg.len) * 0.2;
      const a = seg.angle + this.frame * 0.003;
      const x1 = cx + Math.cos(a) * baseR + px * 0.3;
      const y1 = cy + Math.sin(a) * baseR + py * 0.3;
      const x2 = cx + Math.cos(a) * (baseR + seg.len) + px * 0.3;
      const y2 = cy + Math.sin(a) * (baseR + seg.len) + py * 0.3;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, rgba(seg.color, 0.6));
      grad.addColorStop(1, rgba(seg.color, 0));
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Signal at center, intensifying
    this.drawSignal(ctx, cx + px * 0.3, cy + py * 0.3, 0.85, this.time * 0.12, 0.85);

    // Luminous filaments tracing selected edges
    for (const f of this.filaments) {
      f.phase += f.speed;
      f.alpha = Math.max(0, Math.sin(f.phase) * prog);
      if (f.alpha < 0.01) continue;
      const r = baseR + 60 + Math.sin(f.phase) * 20;
      const a = f.angle + this.frame * 0.002;
      const x = cx + Math.cos(a) * r + px * 0.2;
      const y = cy + Math.sin(a) * r + py * 0.2;
      const x2 = cx + Math.cos(a + 0.1) * (r + 30) + px * 0.2;
      const y2 = cy + Math.sin(a + 0.1) * (r + 30) + py * 0.2;
      ctx.strokeStyle = rgba(f.color, f.alpha * 0.5);
      ctx.lineWidth = f.width;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Expanding shockwave ring
    const wavePhase = (this.frame * 0.02) % 1;
    const waveR = wavePhase * Math.max(this.w, this.h) * 0.4;
    const waveAlpha = (1 - wavePhase) * 0.1;
    ctx.strokeStyle = rgba(RGB.cyan, waveAlpha);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, waveR, 0, Math.PI * 2);
    ctx.stroke();
  }

  // === SHOT 05: THE DECLARATION ===
  private renderTagline(ctx: CanvasRenderingContext2D, cx: number, cy: number, px: number, py: number) {
    // Environment settles — near darkness, signal fades to silhouette
    ctx.fillStyle = C.void;
    ctx.fillRect(0, 0, this.w, this.h);

    const bg = ctx.createLinearGradient(0, 0, 0, this.h);
    bg.addColorStop(0, C.void);
    bg.addColorStop(0.5, C.obsidian);
    bg.addColorStop(1, C.void);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.w, this.h);

    // Signal as a faint silhouette behind text
    this.drawSignal(ctx, cx + px * 0.2, cy + py * 0.2, 0.6, this.time * 0.05, 0.15);

    // Controlled vertical light beam — illuminating the declaration
    const beamX = cx + Math.sin(this.frame * 0.008) * 80 + px;
    const beamGrad = ctx.createLinearGradient(beamX, 0, beamX, this.h);
    beamGrad.addColorStop(0, 'rgba(80,230,255,0)');
    beamGrad.addColorStop(0.5, 'rgba(80,230,255,0.03)');
    beamGrad.addColorStop(1, 'rgba(80,230,255,0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(beamX - 80, 0, 160, this.h);
  }

  // === SHOT 06: THE SYNF REVEAL ===
  private renderSynf(ctx: CanvasRenderingContext2D, cx: number, cy: number, px: number, py: number) {
    const prog = this.sceneProgress();
    ctx.fillStyle = C.void;
    ctx.fillRect(0, 0, this.w, this.h);

    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, this.w * 0.5);
    bg.addColorStop(0, C.ink);
    bg.addColorStop(1, C.void);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.w, this.h);

    // Converging filaments toward center
    const convCount = this.isMobile ? 32 : 64;
    for (let i = 0; i < convCount; i++) {
      const a = (i / convCount) * Math.PI * 2;
      const dist = Math.max(this.w, this.h) * 0.5 * (1 - prog * 0.8);
      const x1 = cx + Math.cos(a) * dist + px * 0.15;
      const y1 = cy + Math.sin(a) * dist + py * 0.15;
      const x2 = cx + Math.cos(a) * (dist - 50) + px * 0.15;
      const y2 = cy + Math.sin(a) * (dist - 50) + py * 0.15;
      const color = i % 2 === 0 ? RGB.cyan : RGB.violet;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, rgba(color, 0));
      grad.addColorStop(1, rgba(color, 0.3 * prog));
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Central convergence glow
    const glowR = 150 + Math.sin(this.time * 2) * 15;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    glow.addColorStop(0, rgba(RGB.ice, 0.1));
    glow.addColorStop(0.3, rgba(RGB.cyan, 0.06));
    glow.addColorStop(0.6, rgba(RGB.violet, 0.03));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

    // Horizontal light sweep across the text position
    const sweepProg = (this.frame % 100) / 100;
    const sweepX = cx - 300 + sweepProg * 600;
    const revGrad = ctx.createLinearGradient(sweepX - 40, 0, sweepX + 40, 0);
    revGrad.addColorStop(0, 'rgba(243,246,255,0)');
    revGrad.addColorStop(0.5, 'rgba(243,246,255,0.04)');
    revGrad.addColorStop(1, 'rgba(243,246,255,0)');
    ctx.fillStyle = revGrad;
    ctx.fillRect(sweepX - 40, cy - 140, 80, 280);
  }

  // === SHOT 07: ENTER SYNF — arrival into homepage ===
  private renderArrival(ctx: CanvasRenderingContext2D, cx: number, cy: number, px: number, py: number) {
    const prog = this.sceneProgress();
    // Fade toward the homepage void environment
    ctx.fillStyle = C.void;
    ctx.globalAlpha = prog;
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.globalAlpha = 1;

    // Soft gradient matching homepage hero
    const bg = ctx.createLinearGradient(0, 0, 0, this.h);
    bg.addColorStop(0, 'rgba(2,3,7,1)');
    bg.addColorStop(0.5, 'rgba(5,7,12,1)');
    bg.addColorStop(1, 'rgba(9,13,21,1)');
    ctx.fillStyle = bg;
    ctx.globalAlpha = prog;
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.globalAlpha = 1;

    // Fading radiating light — bars dissipating
    const barCount = 48;
    for (let i = 0; i < barCount; i++) {
      const a = (i / barCount) * Math.PI * 2;
      const r1 = prog * Math.max(this.w, this.h) * 0.2;
      const r2 = prog * Math.max(this.w, this.h) * 0.5;
      const x1 = cx + Math.cos(a) * r1;
      const y1 = cy + Math.sin(a) * r1;
      const x2 = cx + Math.cos(a) * r2;
      const y2 = cy + Math.sin(a) * r2;
      const alpha = (1 - prog) * 0.08;
      const color = i % 2 === 0 ? RGB.cyan : RGB.violet;
      ctx.strokeStyle = rgba(color, alpha);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Faint cyan/violet atmosphere matching homepage
    if (prog > 0.3) {
      const atm = ctx.createLinearGradient(0, 0, this.w, this.h);
      atm.addColorStop(0, 'rgba(148,114,255,0.02)');
      atm.addColorStop(1, 'rgba(80,230,255,0.02)');
      ctx.fillStyle = atm;
      ctx.globalAlpha = (prog - 0.3) / 0.7;
      ctx.fillRect(0, 0, this.w, this.h);
      ctx.globalAlpha = 1;
    }
  }
}
