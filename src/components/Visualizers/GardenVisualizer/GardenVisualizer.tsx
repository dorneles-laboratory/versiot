import React, { useRef, useEffect } from 'react';
import { GardenPoint } from '../../../types/telemetry';
import styles from './GardenVisualizer.module.css';

interface GardenVisualizerProps {
  telemetry: GardenPoint;
}

export const GardenVisualizer: React.FC<GardenVisualizerProps> = ({ telemetry }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determina tema do céu baseado no LDR
  const skyTheme =
    telemetry.lightLevel > 550
      ? styles.skyDay
      : telemetry.lightLevel > 280
      ? styles.skySunset
      : styles.skyNight;

  const isNight = telemetry.lightLevel <= 280;
  const isRaining = telemetry.humidity > 70 || telemetry.pumpActive;
  const isHealthy = telemetry.soilMoisture >= 35 && telemetry.soilMoisture <= 85;

  // Renderização de partículas (gotas de chuva e estrelas)
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Inicializa gotas de chuva
    const drops = Array.from({ length: 60 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 500,
      speed: 4 + Math.random() * 6,
      length: 10 + Math.random() * 10,
    }));

    // Estrelas fixas na noite
    const stars = Array.from({ length: 45 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 250,
      radius: Math.random() * 1.5 + 0.5,
      twinkle: Math.random() * Math.PI,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Desenha Estrelas se for Noite
      if (isNight) {
        stars.forEach((s) => {
          s.twinkle += 0.05;
          const alpha = 0.4 + Math.sin(s.twinkle) * 0.4;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
        });

        // Lua Crescente
        ctx.beginPath();
        ctx.arc(canvas.width - 90, 80, 26, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#fef08a';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(canvas.width - 80, 75, 23, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
      } else {
        // Sol Brilhante no Dia / Crepúsculo
        const sunY = telemetry.lightLevel > 550 ? 70 : 120;
        const sunColor = telemetry.lightLevel > 550 ? '#fde047' : '#f97316';
        ctx.beginPath();
        ctx.arc(canvas.width - 90, sunY, 32, 0, Math.PI * 2);
        ctx.fillStyle = sunColor;
        ctx.shadowColor = sunColor;
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Desenha Gotas de Chuva / Irrigação se ativo
      if (isRaining) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 1.8;
        drops.forEach((d) => {
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 2, d.y + d.length);
          ctx.stroke();

          d.y += d.speed;
          if (d.y > canvas.height - 80) {
            d.y = 0;
            d.x = Math.random() * canvas.width;
          }
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isNight, isRaining]);

  return (
    <div className={`${styles.container} ${skyTheme}`}>
      <canvas ref={canvasRef} width={800} height={520} className={styles.canvasBiome} />

      {/* Indicadores do Clima */}
      <div className={styles.topGauges}>
        <div className={styles.gaugeCard}>
          <div className={styles.gaugeTitle}>
            <span>🌡️</span> Temperatura
          </div>
          <div className={styles.gaugeValue} style={{ color: '#f87171' }}>
            {telemetry.temperature.toFixed(1)} °C
          </div>
        </div>

        <div className={styles.gaugeCard}>
          <div className={styles.gaugeTitle}>
            <span>💧</span> Umidade Ar
          </div>
          <div className={styles.gaugeValue} style={{ color: '#38bdf8' }}>
            {telemetry.humidity.toFixed(1)} %
          </div>
        </div>

        <div className={styles.gaugeCard}>
          <div className={styles.gaugeTitle}>
            <span>🪴</span> Umidade Solo
          </div>
          <div
            className={styles.gaugeValue}
            style={{ color: isHealthy ? '#34d399' : '#fbbf24' }}
          >
            {telemetry.soilMoisture} %
          </div>
        </div>

        <div className={styles.gaugeCard}>
          <div className={styles.gaugeTitle}>
            <span>☀️</span> Luminosidade
          </div>
          <div className={styles.gaugeValue} style={{ color: '#facc15' }}>
            {telemetry.lightLevel} lux
          </div>
        </div>
      </div>

      {/* Planta Botânica Reativa */}
      <div className={styles.centerPlantArea}>
        {telemetry.pumpActive && (
          <div className={styles.pumpBadge}>
            <span>🚿</span> Bomba de Irrigação Ativada
          </div>
        )}

        <svg
          viewBox="0 0 200 240"
          className={styles.plantSvg}
          style={{
            transform: isHealthy ? 'scale(1) rotate(0deg)' : 'scale(0.92) rotate(6deg)',
          }}
        >
          {/* Vaso de Cerâmica */}
          <path d="M 60 170 L 140 170 L 128 230 L 72 230 Z" fill="#b45309" stroke="#78350f" strokeWidth="3" />
          <rect x="54" y="160" width="92" height="12" rx="3" fill="#d97706" />

          {/* Terra Substrato com Nível de Umidade */}
          <ellipse
            cx="100"
            cy="166"
            rx="40"
            ry="6"
            fill={isHealthy ? '#451a03' : '#78350f'}
          />

          {/* Caule Principal */}
          <path
            d={
              isHealthy
                ? 'M 100 165 Q 100 110 100 60'
                : 'M 100 165 Q 115 120 120 80'
            }
            stroke={isHealthy ? '#15803d' : '#854d0e'}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />

          {/* Folha Esquerda */}
          <path
            d={
              isHealthy
                ? 'M 100 120 C 65 110 50 80 75 75 C 95 85 98 110 100 120'
                : 'M 105 130 C 80 135 65 115 80 125 C 95 130 102 125 105 130'
            }
            fill={isHealthy ? '#22c55e' : '#ca8a04'}
            stroke={isHealthy ? '#16a34a' : '#a16207'}
            strokeWidth="2"
          />

          {/* Folha Direita */}
          <path
            d={
              isHealthy
                ? 'M 100 100 C 135 90 150 60 125 55 C 105 65 102 90 100 100'
                : 'M 112 110 C 135 120 140 140 125 135 C 115 130 112 115 112 110'
            }
            fill={isHealthy ? '#16a34a' : '#a16207'}
            stroke={isHealthy ? '#15803d' : '#854d0e'}
            strokeWidth="2"
          />

          {/* Flor Desabrochada ou Murcha no Topo */}
          {isHealthy ? (
            <g transform="translate(100, 55)">
              <circle cx="-12" cy="0" r="10" fill="#f43f5e" opacity="0.9" />
              <circle cx="12" cy="0" r="10" fill="#f43f5e" opacity="0.9" />
              <circle cx="0" cy="-12" r="10" fill="#f43f5e" opacity="0.9" />
              <circle cx="0" cy="12" r="10" fill="#f43f5e" opacity="0.9" />
              <circle cx="0" cy="0" r="8" fill="#fbbf24" />
            </g>
          ) : (
            <g transform="translate(120, 80)">
              <circle cx="0" cy="0" r="7" fill="#ca8a04" opacity="0.8" />
            </g>
          )}
        </svg>
      </div>

      {/* Barra de Status Inferior */}
      <div className={styles.bottomBar}>
        <div className={styles.statusBar}>
          <span
            className={`${styles.statusIndicator} ${
              !isHealthy ? styles.statusIndicatorAlert : ''
            }`}
          />
          <span>ESTADO DO ECOSSISTEMA: {telemetry.status}</span>
          <span>|</span>
          <span>SOLO: {isHealthy ? 'Ótimo para Fotossíntese' : 'Necessita de Hidratação'}</span>
        </div>
      </div>
    </div>
  );
};
