import React, { useRef, useEffect } from 'react';
import { PulsePoint } from '../../../types/telemetry';
import styles from './PulseVisualizer.module.css';

interface PulseVisualizerProps {
  telemetry: PulsePoint;
}

export const PulseVisualizer: React.FC<PulseVisualizerProps> = ({ telemetry }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveHistoryRef = useRef<number[]>([]);
  const beatScaleRef = useRef<number>(1.0);

  // Calcula pulsação do coração baseada no BPM
  useEffect(() => {
    // A cada novo dado se o BPM for válido, dispara pulso sistólico
    if (telemetry.bpm > 30) {
      beatScaleRef.current = 1.25;
      const timeout = setTimeout(() => {
        beatScaleRef.current = 1.0;
      }, 140);
      return () => clearTimeout(timeout);
    }
  }, [telemetry.id, telemetry.bpm]);

  // Histórico de pontos para o osciloscópio de ECG
  useEffect(() => {
    const raw = telemetry.rawWaveform || 300;
    waveHistoryRef.current.push(raw);
    if (waveHistoryRef.current.length > 200) {
      waveHistoryRef.current.shift();
    }
  }, [telemetry.rawWaveform, telemetry.id]);

  // Renderização contínua do traçado neon de ECG no Canvas
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Fundo escuro
      ctx.fillStyle = '#050108';
      ctx.fillRect(0, 0, width, height);

      // Grade médica do osciloscópio
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Linha isoelétrica de centro
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Traçado contínuo da onda de ECG
      const history = waveHistoryRef.current;
      if (history.length > 1) {
        ctx.beginPath();
        const stepX = width / 200;

        for (let i = 0; i < history.length; i++) {
          const val = history[i];
          // Normaliza valor de 0 a 1023 para a altura do canvas
          const normY = height - (val / 1023) * (height - 20) - 10;
          const x = i * stepX;

          if (i === 0) {
            ctx.moveTo(x, normY);
          } else {
            ctx.lineTo(x, normY);
          }
        }

        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Ponto de varredura na ponta
        const lastIdx = history.length - 1;
        const lastX = lastIdx * stepX;
        const lastY = height - (history[lastIdx] / 1023) * (height - 20) - 10;
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ec4899';
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className={styles.container}>
      {/* Vitals HUD Superior */}
      <div className={styles.topVitals}>
        <div className={styles.vitalCard}>
          <div className={styles.vitalTitle}>
            <span>🫀</span> Frequência
          </div>
          <div className={styles.vitalValue}>
            {telemetry.bpm > 0 ? `${telemetry.bpm} BPM` : '-- BPM'}
          </div>
        </div>

        <div className={styles.vitalCard}>
          <div className={styles.vitalTitle}>
            <span>🩸</span> SpO2 Oximetria
          </div>
          <div className={`${styles.vitalValue} ${styles.vitalValueCyan}`}>
            {telemetry.spo2 > 0 ? `${telemetry.spo2} %` : '-- %'}
          </div>
        </div>

        <div className={styles.vitalCard}>
          <div className={styles.vitalTitle}>
            <span>📊</span> HRV (Variab.)
          </div>
          <div className={styles.vitalValue} style={{ color: '#a855f7' }}>
            {telemetry.hrv} ms
          </div>
        </div>

        <div className={styles.vitalCard}>
          <div className={styles.vitalTitle}>
            <span>🧠</span> Nível Estresse
          </div>
          <div className={styles.vitalValue} style={{ color: '#f59e0b', fontSize: '18px' }}>
            {telemetry.stressLevel}
          </div>
        </div>
      </div>

      {/* Centro: Coração 3D Holográfico + Osciloscópio ECG */}
      <div className={styles.centerDisplay}>
        <div className={styles.heartArea}>
          <svg
            viewBox="0 0 100 100"
            className={styles.heartSvg}
            style={{
              transform: `scale(${beatScaleRef.current})`,
            }}
          >
            <defs>
              <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor="#be185d" />
                <stop offset="100%" stopColor="#831843" />
              </linearGradient>
            </defs>
            {/* Formato de Coração Anatômico / Cyberpunk */}
            <path
              d="M 50,30 
                 A 20,20 0,0,0 15,48 
                 C 15,70 50,92 50,92 
                 C 50,92 85,70 85,48 
                 A 20,20 0,0,0 50,30 Z"
              fill="url(#heartGrad)"
              stroke="#f472b6"
              strokeWidth="2.5"
            />
            {/* Aorta e Vasos Sanguíneos Superiores */}
            <path d="M 42,30 L 42,14 L 48,14 L 48,30" fill="#06b6d4" stroke="#22d3ee" strokeWidth="1.5" />
            <path d="M 52,30 L 52,10 L 60,10 L 60,30" fill="#ec4899" stroke="#f472b6" strokeWidth="1.5" />
            {/* Linhas de Grade Holográficas no Coração */}
            <line x1="30" y1="50" x2="70" y2="50" stroke="#fbcfe8" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
            <line x1="50" y1="35" x2="50" y2="75" stroke="#fbcfe8" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
          </svg>
          <div className={styles.heartBpmLabel}>
            {telemetry.bpm > 0 ? `SÍSTOLE · ${telemetry.bpm} BPM` : 'AGUARDANDO DEDO'}
          </div>
        </div>

        {/* Osciloscópio de ECG */}
        <div className={styles.ecgArea}>
          <div className={styles.ecgHeader}>
            <span>OSCILOSCÓPIO PPG / ECG NEON</span>
            <span>AMPLITUDE: 1.0 mV · CANAL A</span>
          </div>
          <canvas ref={canvasRef} width={440} height={140} className={styles.ecgCanvas} />
        </div>
      </div>

      {/* Barra de Status Inferior */}
      <div className={styles.bottomBar}>
        <div className={styles.statusBar}>
          <span className={styles.statusIndicator} />
          <span>STATUS BIOMÉTRICO: {telemetry.status}</span>
          <span>|</span>
          <span>SENSOR: {telemetry.fingerDetected ? 'Acoplamento Óptico Estável' : 'Posicione o Dedo'}</span>
        </div>
      </div>
    </div>
  );
};
