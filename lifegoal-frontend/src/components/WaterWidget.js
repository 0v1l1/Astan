import React, { useRef, useEffect, useState } from 'react';
import './WaterWidget.css';

function WaterWidget({ percentage = 0, size = 'medium', showLabel = true, label = 'ВОДА', showPercentage = true }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [waveOffset, setWaveOffset] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [ripple, setRipple] = useState({ x: 0, y: 0, scale: 0, opacity: 0 });

  // Size configurations
  const sizes = {
    small: { width: 48, height: 72, glassWidth: 44, glassHeight: 68, fontSize: 20 },
    medium: { width: 56, height: 90, glassWidth: 52, glassHeight: 86, fontSize: 28 },
    large: { width: 80, height: 130, glassWidth: 74, glassHeight: 124, fontSize: 36 },
  };

  const s = sizes[size];

  // Generate bubbles
  useEffect(() => {
    const newBubbles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * (s.glassWidth * 0.8) + s.glassWidth * 0.1,
      y: s.glassHeight + Math.random() * 20,
      size: Math.random() * 3 + 1.5,
      speed: Math.random() * 0.5 + 0.3,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    setBubbles(newBubbles);
  }, [s.glassWidth, s.glassHeight]);

  // Animation loop for waves
  useEffect(() => {
    let start = null;

    function animate(timestamp) {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) / 1000;

      // Wave offset animation - slower, more organic
      setWaveOffset(elapsed * 0.8);

      // Update bubbles
      setBubbles(prev => prev.map(b => {
        const newY = b.y - b.speed;
        if (newY < -10) {
          return { ...b, y: s.glassHeight + 10, x: Math.random() * (s.glassWidth * 0.8) + s.glassWidth * 0.1 };
        }
        return { ...b, y: newY };
      }));

      // Ripple fade out
      setRipple(prev => ({
        ...prev,
        scale: prev.scale + 0.02,
        opacity: prev.opacity * 0.95,
      }));

      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [s.glassHeight]);

  // Trigger ripple when percentage changes significantly
  useEffect(() => {
    setRipple({
      x: s.glassWidth / 2 + (Math.random() - 0.5) * 10,
      y: s.glassHeight * (1 - percentage / 100) + (Math.random() - 0.5) * 5,
      scale: 0,
      opacity: 0.6,
    });
  }, [percentage, s.glassWidth, s.glassHeight]);

  // Canvas-based wave rendering for smooth, performant animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = s.glassWidth * dpr;
    canvas.height = s.glassHeight * dpr;
    canvas.style.width = `${s.glassWidth}px`;
    canvas.style.height = `${s.glassHeight}px`;
    ctx.scale(dpr, dpr);

    let waveTime = 0;

    function drawWaves() {
      ctx.clearRect(0, 0, s.glassWidth, s.glassHeight);

      const fillHeight = s.glassHeight * (percentage / 100);
      const waterTop = s.glassHeight - fillHeight;

      if (fillHeight <= 0) return;

      // Multiple wave layers for depth
      const layers = [
        { amplitude: 4, frequency: 0.02, speed: 0.5, opacity: 0.15, color: '#34C759', phase: 0 },
        { amplitude: 3, frequency: 0.035, speed: 0.7, opacity: 0.2, color: '#30D158', phase: Math.PI / 3 },
        { amplitude: 2, frequency: 0.05, speed: 1, opacity: 0.25, color: '#4CD964', phase: Math.PI * 2 / 3 },
        { amplitude: 1.5, frequency: 0.07, speed: 1.3, opacity: 0.3, color: '#5CE16E', phase: Math.PI },
      ];

      // Draw each wave layer
      layers.forEach((layer, layerIndex) => {
        ctx.beginPath();
        ctx.moveTo(0, s.glassHeight);
        ctx.lineTo(0, waterTop);

        // Create wave path
        for (let x = 0; x <= s.glassWidth; x += 2) {
          const wave = Math.sin(x * layer.frequency + waveTime * layer.speed + layer.phase) * layer.amplitude;
          // Add subtle secondary wave for more organic feel
          const wave2 = Math.sin(x * layer.frequency * 2.3 + waveTime * layer.speed * 1.7 + layer.phase * 1.5) * (layer.amplitude * 0.3);
          const y = waterTop + wave + wave2;
          ctx.lineTo(x, Math.max(waterTop, y);
        }

        ctx.lineTo(s.glassWidth, s.glassHeight);
        ctx.closePath();

        // Gradient fill for depth
        const gradient = ctx.createLinearGradient(0, waterTop, 0, s.glassHeight);
        gradient.addColorStop(0, layer.color.replace(')', `, ${layer.opacity * 0.7})`).replace('rgb', 'rgba'));
        gradient.addColorStop(0.5, layer.color.replace(')', `, ${layer.opacity})`).replace('rgb', 'rgba'));
        gradient.addColorStop(1, layer.color.replace(')', `, ${layer.opacity * 1.2})`).replace('rgb', 'rgba'));

        // Handle hex colors
        const hexToRgba = (hex, alpha) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const c1 = hexToRgba(layer.color, layer.opacity * 0.5);
        const c2 = hexToRgba(layer.color, layer.opacity);
        const c3 = hexToRgba(layer.color, Math.min(layer.opacity * 1.3, 1));

        const grad = ctx.createLinearGradient(0, waterTop, 0, s.glassHeight);
        grad.addColorStop(0, c1);
        grad.addColorStop(0.5, c2);
        grad.addColorStop(1, c3);

        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Surface highlight/reflection
      if (fillHeight > 5) {
        ctx.beginPath();
        ctx.moveTo(0, waterTop);
        for (let x = 0; x <= s.glassWidth; x += 2) {
          const wave = Math.sin(x * 0.035 + waveTime * 0.7) * 2;
          const wave2 = Math.sin(x * 0.07 + waveTime * 1.2) * 0.8;
          ctx.lineTo(x, waterTop + wave + wave2);
        }
        ctx.lineTo(s.glassWidth, waterTop + 3);
        ctx.lineTo(0, waterTop + 3);
        ctx.closePath();

        const surfaceGrad = ctx.createLinearGradient(0, waterTop - 3, 0, waterTop + 3);
        surfaceGrad.addColorStop(0, 'rgba(255,255,255,0)');
        surfaceGrad.addColorStop(0.3, 'rgba(255,255,255,0.15)');
        surfaceGrad.addColorStop(0.6, 'rgba(255,255,255,0.08)');
        surfaceGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = surfaceGrad;
        ctx.fill();
      }

      // Caustics/refraction light rays (subtle)
      if (fillHeight > 20) {
        for (let i = 0; i < 3; i++) {
          const rayX = (s.glassWidth / 4) * (i + 1) + Math.sin(waveTime * 0.3 + i) * 3;
          ctx.beginPath();
          ctx.moveTo(rayX, waterTop);
          ctx.lineTo(rayX + Math.sin(waveTime * 0.4 + i) * 4, s.glassHeight);
          ctx.strokeStyle = `rgba(52, 199, 89, ${0.03 + i * 0.01})`;
          ctx.lineWidth = 8;
          ctx.stroke();
        }
      }

      // Draw bubbles
      bubbles.forEach(bubble => {
        if (bubble.y < waterTop + bubble.size) return; // Only draw bubbles in water

        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity})`;
        ctx.fill();

        // Bubble highlight
        ctx.beginPath();
        ctx.arc(bubble.x - bubble.size * 0.3, bubble.y - bubble.size * 0.3, bubble.size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
      });

      // Draw ripple effect
      if (ripple.opacity > 0.05 && ripple.scale < 3) {
        const rippleY = Math.max(waterTop, ripple.y);
        ctx.beginPath();
        ctx.arc(ripple.x, rippleY, ripple.scale * 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(52, 199, 89, ${ripple.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Second ripple ring
        ctx.beginPath();
        ctx.arc(ripple.x, rippleY, ripple.scale * 12, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(52, 199, 89, ${ripple.opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      waveTime += 0.016;
      requestAnimationFrame(drawWaves);
    }

    drawWaves();
  }, [percentage, s.glassWidth, s.glassHeight, bubbles, ripple, waveOffset]);

  return (
    <div className="water-widget" style={{
      width: s.width,
      height: s.height,
      '--glass-width': `${s.glassWidth}px`,
      '--glass-height': `${s.glassHeight}px`
    }}>
      <div className="water-glass">
        {/* Canvas for animated waves */}
        <canvas
          ref={canvasRef}
          className="water-canvas"
          width={s.glassWidth}
          height={s.glassHeight}
          style={{
            width: s.glassWidth,
            height: s.glassHeight,
            position: 'absolute',
            bottom: 0,
            left: 2,
            borderRadius: `0 0 ${size === 'large' ? 16 : size === 'small' ? 10 : 12}px ${size === 'large' ? 16 : size === 'small' ? 10 : 12}px`
          }}
        />

        {/* Glass border/rim */}
        <div className="glass-rim" />

        {/* Condensation effect */}
        <div className="condensation" />

        {/* Light refraction overlay */}
        <div className="refraction" />
      </div>

      {showLabel && (
        <div className="water-info">
          <div className="water-label">{label}</div>
          {showPercentage && (
            <div className="water-percentage" style={{ fontSize: s.fontSize }}>
              {Math.round(percentage)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WaterWidget;