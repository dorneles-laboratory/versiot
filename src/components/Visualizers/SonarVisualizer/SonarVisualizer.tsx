import React, { useRef, useEffect } from 'react';
import { SonarPoint } from '../../../types/telemetry';
import styles from './SonarVisualizer.module.css';

interface SonarVisualizerProps {
  telemetry: SonarPoint;
}

interface Blip {
  angle: number;
  distance: number; // cm
  intensity: number; // 1.0 to 0.0
  danger: number;
  timestamp: number;
}

export const SonarVisualizer: React.FC<SonarVisualizerProps> = ({ telemetry }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const blipsRef = useRef<Blip[]>([]);
  const lastAngleRef = useRef<number>(telemetry.angle);

  // Armazena e atualiza os alvos detectados
  useEffect(() => {
    lastAngleRef.current = telemetry.angle;

    // Se detectou objeto a menos de 75cm, registra o eco no radar
    if (telemetry.distance < 75.0) {
      // Remove ecos muito próximos no mesmo ângulo para manter limpo
      blipsRef.current = blipsRef.current.filter(
        (b) => Math.abs(b.angle - telemetry.angle) > 3 || Math.abs(b.distance - telemetry.distance) > 5
      );

      blipsRef.current.push({
        angle: telemetry.angle,
        distance: telemetry.distance,
        intensity: 1.0,
        danger: telemetry.dangerLevel,
        timestamp: Date.now(),
      });

      // Limita a 40 blips simultâneos
      if (blipsRef.current.length > 40) {
        blipsRef.current.shift();
      }
    }
  }, [telemetry]);

  // Loop de animação do Radar Canvas a 60 FPS
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height - 30; // Origem do radar na base central
      const maxRadius = Math.min(centerX - 40, height - 70);

      // Fundo limpo com rastro de fósforo
      ctx.fillStyle = 'rgba(2, 10, 6, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Desenha Arcos de Distância (10cm, 20cm, 30cm, 40cm, 60cm, 80cm)
      const rings = [0.2, 0.4, 0.6, 0.8, 1.0];
      const ringDistances = [15, 30, 45, 60, 80];

      ctx.lineWidth = 1;
      rings.forEach((ratio, idx) => {
        const r = maxRadius * ratio;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, Math.PI, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
        ctx.stroke();

        // Label de distância em cm
        ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
        ctx.font = '10px Courier New';
        ctx.fillText(`${ringDistances[idx]}cm`, centerX + r - 32, centerY - 6);
      });

      // Linhas Radiais de Ângulo (0°, 30°, 60°, 90°, 120°, 150°, 180°)
      const angles = [0, 30, 60, 90, 120, 150, 180];
      angles.forEach((deg) => {
        const rad = ((180 - deg) * Math.PI) / 180;
        const x = centerX + Math.cos(rad) * maxRadius;
        const y = centerY - Math.sin(rad) * maxRadius;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = deg === 90 ? 'rgba(0, 255, 136, 0.35)' : 'rgba(0, 255, 136, 0.12)';
        ctx.stroke();

        // Rótulos de ângulos na borda externa
        const labelX = centerX + Math.cos(rad) * (maxRadius + 18);
        const labelY = centerY - Math.sin(rad) * (maxRadius + 18);
        ctx.fillStyle = 'rgba(0, 255, 136, 0.7)';
        ctx.font = '11px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${deg}°`, labelX, labelY);
      });

      // Atualiza e desenha blips com decaimento suave
      const now = Date.now();
      blipsRef.current.forEach((blip) => {
        // Reduz intensidade ao longo de 4 segundos
        const ageSec = (now - blip.timestamp) / 1000;
        blip.intensity = Math.max(0, 1 - ageSec / 4);

        if (blip.intensity > 0.05) {
          const normDist = Math.min(1.0, blip.distance / 80.0);
          const r = normDist * maxRadius;
          const rad = ((180 - blip.angle) * Math.PI) / 180;
          const bx = centerX + Math.cos(rad) * r;
          const by = centerY - Math.sin(rad) * r;

          // Ponto de eco com brilho holográfico
          ctx.beginPath();
          ctx.arc(bx, by, blip.danger === 2 ? 6 : 4, 0, Math.PI * 2);
          const color =
            blip.danger === 2
              ? `rgba(255, 51, 102, ${blip.intensity})`
              : blip.danger === 1
              ? `rgba(255, 170, 0, ${blip.intensity})`
              : `rgba(0, 255, 136, ${blip.intensity})`;
          ctx.fillStyle = color;
          ctx.shadowColor = blip.danger === 2 ? '#ff3366' : '#00ff88';
          ctx.shadowBlur = 10 * blip.intensity;
          ctx.fill();
          ctx.shadowBlur = 0; // reseta
        }
      });
      // Remove blips expirados
      blipsRef.current = blipsRef.current.filter((b) => b.intensity > 0.05);

      // Linha do Feixe de Varredura Atual (Current Sweep Beam)
      const currentAngleRad = ((180 - lastAngleRef.current) * Math.PI) / 180;
      const beamX = centerX + Math.cos(currentAngleRad) * maxRadius;
      const beamY = centerY - Math.sin(currentAngleRad) * maxRadius;

      // Gradiente do leque de varredura
      const beamGradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, maxRadius);
      beamGradient.addColorStop(0, 'rgba(0, 255, 136, 0.9)');
      beamGradient.addColorStop(1, 'rgba(0, 255, 136, 0.1)');

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(beamX, beamY);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = beamGradient;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Base do emissor do servo (origem)
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#00ff88';
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} width={680} height={420} className={styles.radarCanvas} />

      <div className={styles.hudOverlay}>
        <div className={styles.hudBlock}>
          <div className={styles.hudTitle}>Ângulo Atual</div>
          <div className={styles.hudValue}>{telemetry.angle.toFixed(0)}°</div>
        </div>

        <div className={styles.hudBlock}>
          <div className={styles.hudTitle}>Distância Sonar</div>
          <div
            className={`${styles.hudValue} ${
              telemetry.dangerLevel === 2 ? styles.hudValueDanger : ''
            }`}
          >
            {telemetry.distance.toFixed(1)} cm
          </div>
        </div>

        <div className={styles.hudBlock}>
          <div className={styles.hudTitle}>Status do Alvo</div>
          <div
            className={`${styles.hudValue} ${
              telemetry.dangerLevel === 2 ? styles.hudValueDanger : ''
            }`}
            style={{ fontSize: '15px' }}
          >
            {telemetry.status}
          </div>
        </div>
      </div>

      <div className={styles.targetTable}>
        <div className={styles.targetCard}>
          <span
            className={`${styles.dotPulse} ${
              telemetry.dangerLevel === 2 ? styles.dotDanger : ''
            }`}
          />
          <span>ECOS RASTREADOS: {blipsRef.current.length}</span>
          <span>|</span>
          <span>RAIO DE VARREDURA: 15° - 165°</span>
          <span>|</span>
          <span>FREQUÊNCIA: 40 kHz</span>
        </div>
      </div>
    </div>
  );
};
