// visualizerEngine.ts — Extracted visualization rendering engine
// Shared by LiveVisualizer (sidebar, songlist, fullscreen) and VideoGeneratorModal (export)

// ─── Types ────────────────────────────────────────────────────────────────────

export type PresetType =
    | 'NCS Circle' | 'Linear Bars' | 'Dual Mirror' | 'Center Wave'
    | 'Orbital' | 'Digital Rain' | 'Hexagon' | 'Shockwave'
    | 'Oscilloscope' | 'Minimal';

export interface VisualizerConfig {
    preset: PresetType;
    primaryColor: string;
    secondaryColor: string;
    bgDim: number;
    particleCount: number;
}

export interface EffectConfig {
    shake: boolean;
    glitch: boolean;
    vhs: boolean;
    cctv: boolean;
    scanlines: boolean;
    chromatic: boolean;
    bloom: boolean;
    filmGrain: boolean;
    pixelate: boolean;
    strobe: boolean;
    vignette: boolean;
    hueShift: boolean;
    letterbox: boolean;
}

export interface EffectIntensities {
    shake: number;
    glitch: number;
    vhs: number;
    cctv: number;
    scanlines: number;
    chromatic: number;
    bloom: number;
    filmGrain: number;
    pixelate: number;
    strobe: number;
    vignette: number;
    hueShift: number;
    letterbox: number;
}

export const ALL_PRESETS: PresetType[] = [
    'NCS Circle', 'Linear Bars', 'Dual Mirror', 'Center Wave',
    'Orbital', 'Hexagon', 'Oscilloscope', 'Digital Rain',
    'Shockwave', 'Minimal',
];

export const DEFAULT_CONFIG: VisualizerConfig = {
    preset: 'NCS Circle',
    primaryColor: '#ec4899',
    secondaryColor: '#3b82f6',
    bgDim: 0.6,
    particleCount: 50,
};

export const DEFAULT_EFFECTS: EffectConfig = {
    shake: false,
    glitch: false,
    vhs: false,
    cctv: false,
    scanlines: false,
    chromatic: false,
    bloom: false,
    filmGrain: false,
    pixelate: false,
    strobe: false,
    vignette: false,
    hueShift: false,
    letterbox: false,
};

export const DEFAULT_INTENSITIES: EffectIntensities = {
    shake: 0.05,
    glitch: 0.3,
    vhs: 0.5,
    cctv: 0.8,
    scanlines: 0.4,
    chromatic: 0.5,
    bloom: 0.5,
    filmGrain: 0.3,
    pixelate: 0.3,
    strobe: 0.5,
    vignette: 0.5,
    hueShift: 0.5,
    letterbox: 0.5,
};

// ─── Drawing Functions ────────────────────────────────────────────────────────

export function drawNCSCircle(
    ctx: CanvasRenderingContext2D, cx: number, cy: number,
    data: Uint8Array, pulse: number, time: number, c1: string, c2: string
) {
    const radius = 150 + (pulse - 1) * 50;
    const bars = 80;
    const step = (Math.PI * 2) / bars;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.15);
    for (let i = 0; i < bars; i++) {
        const val = data[i + 10];
        const normalized = val / 255;
        const h = 8 + Math.pow(normalized, 1.5) * 120;
        ctx.save();
        ctx.rotate(i * step);
        const grad = ctx.createLinearGradient(0, radius, 0, radius + h);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(-3, radius + 10, 6, h, 3);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.roundRect(-3, radius + 10 + h + 2, 6, 3, 2);
        ctx.fill();
        ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, radius + 150, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
}

export function drawLinearBars(
    ctx: CanvasRenderingContext2D, w: number, h: number,
    data: Uint8Array, c1: string, c2: string
) {
    const bars = 64;
    const barW = w / bars;
    const gap = 2;
    for (let i = 0; i < bars; i++) {
        const val = data[i * 2];
        const normalized = val / 255;
        const barH = 10 + Math.pow(normalized, 1.3) * (h * 0.35);
        const grad = ctx.createLinearGradient(0, h / 2, 0, h / 2 - barH);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        ctx.fillStyle = grad;
        ctx.fillRect(i * barW + gap / 2, h / 2 - barH, barW - gap, barH);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(i * barW + gap / 2, h / 2, barW - gap, barH * 0.3);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(0, h / 2, w, 1);
}

export function drawDualMirror(
    ctx: CanvasRenderingContext2D, w: number, h: number,
    data: Uint8Array, color: string
) {
    const bars = 40;
    const barH = h / bars;
    const cy = h / 2;
    for (let i = 0; i < bars; i++) {
        const val = data[i * 3];
        const normalized = val / 255;
        const len = 20 + Math.pow(normalized, 1.4) * (w * 0.3);
        const alpha = 0.4 + normalized * 0.6;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(0, cy - (i * barH), len, barH - 2);
        ctx.fillRect(0, cy + (i * barH), len, barH - 2);
        ctx.fillRect(w - len, cy - (i * barH), len, barH - 2);
        ctx.fillRect(w - len, cy + (i * barH), len, barH - 2);
    }
    ctx.globalAlpha = 1;
}

export function drawOrbital(
    ctx: CanvasRenderingContext2D, cx: number, cy: number,
    data: Uint8Array, time: number, c1: string, c2: string
) {
    for (let i = 0; i < 5; i++) {
        const r = 100 + (i * 55);
        const val = data[i * 10];
        const normalized = val / 255;
        const width = 4 + normalized * 6;
        ctx.beginPath();
        ctx.strokeStyle = i % 2 === 0 ? c1 : c2;
        ctx.lineWidth = width;
        ctx.shadowBlur = 20;
        ctx.shadowColor = ctx.strokeStyle;
        const direction = i % 2 === 0 ? 1 : -1;
        const speed = direction * (0.5 + i * 0.1);
        const start = time * speed;
        const arcLength = Math.PI * 1.2 + normalized * Math.PI * 0.3;
        ctx.arc(cx, cy, r, start, start + arcLength);
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
}

export function drawHexagon(
    ctx: CanvasRenderingContext2D, cx: number, cy: number,
    data: Uint8Array, pulse: number, time: number, color: string
) {
    const sides = 6;
    const r = 180 * pulse;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.4);
    ctx.beginPath();
    ctx.lineWidth = 12;
    ctx.strokeStyle = color;
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 25;
    ctx.shadowColor = color;
    for (let i = 0; i <= sides; i++) {
        const angle = i * 2 * Math.PI / sides;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
    ctx.shadowBlur = 0;
}

export function drawOscilloscope(
    ctx: CanvasRenderingContext2D, w: number, h: number,
    data: Uint8Array, color: string
) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.beginPath();
    const sliceWidth = w / data.length;
    let x = 0;
    for (let i = 0; i < data.length; i++) {
        const normalized = (data[i] - 128) / 128.0;
        const dampened = normalized * 0.6;
        const yPos = (h / 2) + (dampened * h / 2);
        if (i === 0) ctx.moveTo(x, yPos);
        else ctx.lineTo(x, yPos);
        x += sliceWidth;
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
}

export function drawCenterWave(
    ctx: CanvasRenderingContext2D, cx: number, cy: number,
    data: Uint8Array, time: number, color: string
) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        const baseR = 60 + (i * 35);
        const val = data[i * 4];
        const normalized = val / 255;
        const r = baseR + Math.pow(normalized, 1.5) * 25;
        ctx.globalAlpha = 0.8 - (i / 15);
        ctx.ellipse(cx, cy, r, r * 0.75, time * 0.5 + i * 0.3, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

export function drawDigitalRain(
    ctx: CanvasRenderingContext2D, w: number, h: number,
    data: Uint8Array, time: number, color: string
) {
    const cols = 50;
    const colW = w / cols;
    ctx.fillStyle = color;
    ctx.font = 'bold 14px monospace';
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    for (let i = 0; i < cols; i++) {
        const val = data[i * 2];
        const normalized = val / 255;
        const len = 8 + Math.floor(Math.pow(normalized, 1.3) * 15);
        const baseSpeed = 40 + (i % 5) * 10;
        const speedOffset = (time * baseSpeed) % h;
        for (let j = 0; j < len; j++) {
            const char = String.fromCharCode(0x30A0 + Math.random() * 96);
            const y = (speedOffset + (j * 18)) % h;
            ctx.globalAlpha = (1 - (j / len)) * 0.8;
            ctx.fillText(char, i * colW, y);
        }
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

export function drawShockwave(
    ctx: CanvasRenderingContext2D, cx: number, cy: number,
    bass: number, time: number, color: string
) {
    const normBass = bass / 255;
    const maxRadius = 500;
    const rings = 6;

    ctx.shadowColor = color;

    for (let i = 0; i < rings; i++) {
        const phase = (time * 0.8 + (i * 0.4)) % 2;
        const progress = phase / 2;
        const radius = 50 + progress * maxRadius;
        const alpha = (1 - progress) * (0.5 + normBass * 0.5);
        const lineWidth = (1 - progress) * (8 + normBass * 12);

        if (alpha > 0.05) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 20 + normBass * 30;
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    const coreSize = 30 + normBass * 40;
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
    coreGrad.addColorStop(0, color);
    coreGrad.addColorStop(0.5, color);
    coreGrad.addColorStop(1, 'transparent');
    ctx.globalAlpha = 0.6 + normBass * 0.4;
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

export function drawParticles(
    ctx: CanvasRenderingContext2D, w: number, h: number,
    time: number, bass: number, count: number, color: string
) {
    const normBass = bass / 255;
    const cx = w / 2;
    const cy = h / 2;

    // Rising particles
    const risingCount = Math.floor(count * 0.4);
    for (let i = 0; i < risingCount; i++) {
        const seed = i * 127.1;
        const xBase = ((Math.sin(seed) * 10000) % w + w) % w;
        const drift = Math.sin(time * 2 + seed) * 30;
        const x = xBase + drift;
        const speed = 20 + (i % 7) * 15;
        const y = h - ((time * speed + seed * 10) % (h + 100));
        const size = 2 + (i % 4) + normBass * 3;
        const twinkle = 0.5 + Math.sin(time * 8 + seed) * 0.3;

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.shadowBlur = 15 + normBass * 10;
        ctx.shadowColor = color;
        ctx.globalAlpha = twinkle * (0.4 + normBass * 0.4);
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Burst particles
    const burstCount = Math.floor(count * 0.35);
    for (let i = 0; i < burstCount; i++) {
        const angle = (i / burstCount) * Math.PI * 2 + time * 0.3;
        const seed = i * 234.5;
        const burstPhase = (time * 1.5 + seed * 0.01) % 3;
        const burstProgress = burstPhase / 3;
        const maxDist = 300 + normBass * 200;
        const dist = burstProgress * maxDist;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;
        const size = (1 - burstProgress) * (3 + normBass * 4);
        const alpha = (1 - burstProgress) * (0.6 + normBass * 0.4);

        if (size > 0.5 && alpha > 0.1) {
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.globalAlpha = alpha;
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Orbital sparkles
    const orbitalCount = Math.floor(count * 0.15);
    for (let i = 0; i < orbitalCount; i++) {
        const orbitRadius = 150 + (i % 4) * 80 + normBass * 50;
        const speed = (i % 2 === 0 ? 1 : -1) * (0.8 + (i % 3) * 0.3);
        const angle = time * speed + (i / orbitalCount) * Math.PI * 2;
        const x = cx + Math.cos(angle) * orbitRadius;
        const y = cy + Math.sin(angle) * orbitRadius;
        const sparkle = 0.5 + Math.sin(time * 12 + i * 5) * 0.5;
        const size = 2 + sparkle * 2 + normBass * 2;

        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.globalAlpha = sparkle * 0.8;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Floating dust
    const dustCount = Math.floor(count * 0.1);
    for (let i = 0; i < dustCount; i++) {
        const seed = i * 567.8;
        const x = ((Math.sin(seed) * 10000) % w + w) % w;
        const y = ((Math.cos(seed) * 10000) % h + h) % h;
        const drift = Math.sin(time + seed) * 2;
        const size = 1 + Math.sin(time * 3 + seed) * 0.5;

        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#fff';
        ctx.globalAlpha = 0.2 + normBass * 0.2;
        ctx.arc(x + drift, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

export function drawAlbumArt(
    ctx: CanvasRenderingContext2D, cx: number, cy: number,
    pulse: number, url: string, borderColor: string,
    preloadedImage?: HTMLImageElement | null
) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);
    ctx.shadowBlur = 40;
    ctx.shadowColor = borderColor;
    ctx.beginPath();
    ctx.arc(0, 0, 150, 0, Math.PI * 2);
    ctx.closePath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.clip();

    if (preloadedImage && preloadedImage.complete) {
        ctx.drawImage(preloadedImage, -150, -150, 300, 300);
    } else {
        const img = new Image();
        img.src = url;
        if (img.complete) {
            ctx.drawImage(img, -150, -150, 300, 300);
        } else {
            ctx.fillStyle = '#111';
            ctx.fillRect(-150, -150, 300, 300);
        }
    }
    ctx.restore();
}

// ─── Post-Processing Effects ──────────────────────────────────────────────────

export interface PostProcessParams {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
    normBass: number;
    effects: EffectConfig;
    intensities: EffectIntensities;
    primaryColor: string;
}

export function applyPostProcessing(params: PostProcessParams) {
    const { canvas, ctx, width, height, centerX, centerY, normBass, effects, intensities, primaryColor } = params;

    // Scanlines
    if (effects.scanlines || effects.cctv) {
        ctx.fillStyle = `rgba(0,0,0,${intensities.scanlines * 0.8})`;
        for (let i = 0; i < height; i += 4) {
            ctx.fillRect(0, i, width, 2);
        }
    }

    // VHS Color Shift / Chromatic Aberration
    if (effects.vhs || effects.chromatic || (effects.glitch && Math.random() > (1 - intensities.glitch))) {
        const intensity = effects.vhs ? intensities.vhs : intensities.chromatic;
        const offset = (10 * intensity) * normBass;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255,0,0,${0.2 * intensity})`;
        ctx.fillRect(-offset, 0, width, height);
        ctx.fillStyle = `rgba(0,0,255,${0.2 * intensity})`;
        ctx.fillRect(offset, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
    }

    // Glitch Slices
    if (effects.glitch && Math.random() > (1 - intensities.glitch)) {
        const sliceHeight = Math.random() * 50;
        const sliceY = Math.random() * height;
        const offset = (Math.random() - 0.5) * 40 * intensities.glitch;
        ctx.drawImage(canvas, 0, sliceY, width, sliceHeight, offset, sliceY, width, sliceHeight);
        ctx.fillStyle = Math.random() > 0.5 ? primaryColor : '#fff';
        ctx.fillRect(Math.random() * width, Math.random() * height, Math.random() * 200, 4);
    }

    // CCTV
    if (effects.cctv) {
        const intensity = intensities.cctv;
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = `rgba(0, 50, 0, ${0.4 * intensity})`;
        ctx.fillRect(0, 0, width, height);

        const grad = ctx.createRadialGradient(centerX, centerY, height * 0.4, centerX, centerY, height * 0.9);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, 'black');
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        ctx.globalCompositeOperation = 'source-over';
        ctx.font = 'mono 24px monospace';
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'black';
        ctx.fillText(new Date().toLocaleString().toUpperCase(), 60, 60);
        ctx.fillText("REC ●", width - 120, 60);
    }

    // Bloom
    if (effects.bloom) {
        const intensity = intensities.bloom;
        ctx.globalCompositeOperation = 'screen';
        ctx.filter = `blur(${15 * intensity}px)`;
        ctx.globalAlpha = 0.4 * intensity;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }

    // Film Grain
    if (effects.filmGrain) {
        const intensity = intensities.filmGrain;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const grainAmount = intensity * 50;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * grainAmount;
            data[i] += noise;
            data[i + 1] += noise;
            data[i + 2] += noise;
        }
        ctx.putImageData(imageData, 0, 0);
    }

    // Strobe
    if (effects.strobe && normBass > (0.7 - intensities.strobe * 0.3)) {
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255, 255, 255, ${intensities.strobe * normBass * 0.8})`;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
    }

    // Vignette
    if (effects.vignette) {
        const intensity = intensities.vignette;
        const grad = ctx.createRadialGradient(centerX, centerY, height * 0.3, centerX, centerY, height * 0.8);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, `rgba(0, 0, 0, ${0.8 * intensity})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    }

    // Hue Shift
    if (effects.hueShift) {
        const hueRotation = intensities.hueShift * 360 * (1 + normBass * 0.5);
        ctx.filter = `hue-rotate(${hueRotation}deg)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
    }

    // Letterbox
    if (effects.letterbox) {
        const barHeight = height * 0.12 * intensities.letterbox;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, barHeight);
        ctx.fillRect(0, height - barHeight, width, barHeight);
    }
}

// Pixelate effect (called separately, before text in VideoGeneratorModal)
export function applyPixelate(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    width: number, height: number,
    intensity: number
) {
    const pixelSize = Math.max(4, Math.floor(16 * intensity));
    ctx.imageSmoothingEnabled = false;
    const tempCanvas = document.createElement('canvas');
    const smallW = Math.floor(width / pixelSize);
    const smallH = Math.floor(height / pixelSize);
    tempCanvas.width = smallW;
    tempCanvas.height = smallH;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(canvas, 0, 0, smallW, smallH);
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(tempCanvas, 0, 0, smallW, smallH, 0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
}

// ─── Main Render Entry Point ──────────────────────────────────────────────────

export interface RenderFrameParams {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    frequencyData: Uint8Array;
    timeDomainData: Uint8Array;
    time: number;
    config: VisualizerConfig;
    effects?: EffectConfig;
    intensities?: EffectIntensities;
    /** If provided, background is drawn with dim from config. */
    bgSource?: HTMLImageElement | HTMLVideoElement | null;
    /** If provided, album art is drawn for applicable presets. */
    albumArtImage?: HTMLImageElement | null;
    albumArtUrl?: string;
}

/**
 * Render a single visualization frame.
 * Used by LiveVisualizer (real-time) and VideoGeneratorModal (offline export).
 */
export function renderVisualizerFrame(params: RenderFrameParams) {
    const {
        canvas, ctx, width, height,
        frequencyData, timeDomainData, time,
        config,
        effects = DEFAULT_EFFECTS,
        intensities = DEFAULT_INTENSITIES,
        bgSource,
        albumArtImage,
        albumArtUrl,
    } = params;

    const centerX = width / 2;
    const centerY = height / 2;

    // Bass calculation
    let bass = 0;
    for (let i = 0; i < 20; i++) bass += frequencyData[i];
    bass = bass / 20;
    const normBass = bass / 255;
    const pulse = 1 + normBass * 0.15;

    // 1. Clear & Background
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    if (bgSource) {
        ctx.save();
        ctx.globalAlpha = 1 - config.bgDim;

        if (effects.shake && normBass > (0.6 - (intensities.shake * 0.3))) {
            const magnitude = intensities.shake * 50;
            const shakeX = (Math.random() - 0.5) * magnitude * normBass;
            const shakeY = (Math.random() - 0.5) * magnitude * normBass;
            ctx.translate(shakeX, shakeY);
        }

        const zoom = 1 + (Math.sin(time * 0.5) * 0.05);
        ctx.translate(centerX, centerY);
        ctx.scale(zoom, zoom);
        ctx.drawImage(bgSource, -width / 2, -height / 2, width, height);
        ctx.restore();
    }

    // 2. Preset Drawing
    ctx.save();

    if (effects.shake && normBass > 0.6) {
        const magnitude = intensities.shake * 30;
        const shakeX = (Math.random() - 0.5) * magnitude * normBass;
        const shakeY = (Math.random() - 0.5) * magnitude * normBass;
        ctx.translate(shakeX, shakeY);
    }

    switch (config.preset) {
        case 'NCS Circle':
            drawNCSCircle(ctx, centerX, centerY, frequencyData, pulse, time, config.primaryColor, config.secondaryColor);
            break;
        case 'Linear Bars':
            drawLinearBars(ctx, width, height, frequencyData, config.primaryColor, config.secondaryColor);
            break;
        case 'Dual Mirror':
            drawDualMirror(ctx, width, height, frequencyData, config.primaryColor);
            break;
        case 'Center Wave':
            drawCenterWave(ctx, centerX, centerY, frequencyData, time, config.primaryColor);
            break;
        case 'Orbital':
            drawOrbital(ctx, centerX, centerY, frequencyData, time, config.primaryColor, config.secondaryColor);
            break;
        case 'Hexagon':
            drawHexagon(ctx, centerX, centerY, frequencyData, pulse, time, config.primaryColor);
            break;
        case 'Oscilloscope':
            drawOscilloscope(ctx, width, height, timeDomainData, config.primaryColor);
            break;
        case 'Digital Rain':
            drawDigitalRain(ctx, width, height, frequencyData, time, config.primaryColor);
            break;
        case 'Shockwave':
            drawShockwave(ctx, centerX, centerY, bass, time, config.primaryColor);
            break;
        case 'Minimal':
            // Minimal draws nothing except text (handled externally)
            break;
    }

    drawParticles(ctx, width, height, time, bass, config.particleCount, config.primaryColor);

    // Album art for applicable presets
    if (['NCS Circle', 'Hexagon', 'Orbital', 'Shockwave'].includes(config.preset) && (albumArtImage || albumArtUrl)) {
        drawAlbumArt(ctx, centerX, centerY, pulse, albumArtUrl || '', config.primaryColor, albumArtImage);
    }

    // Pixelate (before text)
    if (effects.pixelate) {
        applyPixelate(canvas, ctx, width, height, intensities.pixelate);
    }

    ctx.restore();

    // 3. Post-processing effects
    applyPostProcessing({
        canvas, ctx, width, height, centerX, centerY, normBass,
        effects, intensities, primaryColor: config.primaryColor,
    });
}
