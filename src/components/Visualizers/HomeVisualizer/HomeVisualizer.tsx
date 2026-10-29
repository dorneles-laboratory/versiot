import React from 'react';
import { SmartHomePoint } from '../../../types/telemetry';
import styles from './HomeVisualizer.module.css';

interface HomeVisualizerProps {
  telemetry: SmartHomePoint;
}

export const HomeVisualizer: React.FC<HomeVisualizerProps> = ({ telemetry }) => {
  const isNight = telemetry.lightLux < 350;
  const isLivingRoomLightOn = telemetry.lampLivingRoom || telemetry.pirDetected;
  const isKitchenAlertOn = telemetry.gasAlert;

  return (
    <div className={styles.container}>
      {/* Cards de Métricas Superiores */}
      <div className={styles.topStats}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>
            <span>🚶</span> Presença PIR
          </div>
          <div
            className={styles.statValue}
            style={{ color: telemetry.pirDetected ? '#38bdf8' : '#94a3b8' }}
          >
            {telemetry.pirDetected ? 'Detectada' : 'Sem Movimento'}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTitle}>
            <span>🔥</span> Gás / Fumaça
          </div>
          <div
            className={`${styles.statValue} ${
              telemetry.gasAlert ? styles.statDanger : ''
            }`}
            style={{ color: telemetry.gasAlert ? '#ef4444' : '#10b981' }}
          >
            {telemetry.gasPpm} PPM
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTitle}>
            <span>🛋️</span> Luz da Sala
          </div>
          <div
            className={styles.statValue}
            style={{ color: isLivingRoomLightOn ? '#facc15' : '#64748b' }}
          >
            {isLivingRoomLightOn ? 'LIGADA' : 'DESLIGADA'}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTitle}>
            <span>💡</span> Claridade Ext.
          </div>
          <div className={styles.statValue} style={{ color: '#a78bfa' }}>
            {telemetry.lightLux} lux ({isNight ? 'Noite' : 'Dia'})
          </div>
        </div>
      </div>

      {telemetry.gasAlert && (
        <div className={styles.alarmBanner}>
          <span>🚨</span> ALERTA DE SEGURANÇA: VAZAMENTO DE GÁS OU FUMAÇA DETECTADO!
        </div>
      )}

      {/* Planta Baixa Isométrica Interativa */}
      <div className={styles.isoCanvasArea}>
        <svg viewBox="0 0 600 380" className={styles.isoSvg}>
          <defs>
            {/* Gradiente do Piso da Sala */}
            <linearGradient id="livingFloorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isLivingRoomLightOn ? '#334155' : '#0f172a'} />
              <stop offset="100%" stopColor={isLivingRoomLightOn ? '#1e293b' : '#090d16'} />
            </linearGradient>

            {/* Brilho da Lâmpada da Sala */}
            <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(250, 204, 21, 0.45)" />
              <stop offset="60%" stopColor="rgba(250, 204, 21, 0.15)" />
              <stop offset="100%" stopColor="rgba(250, 204, 21, 0)" />
            </radialGradient>

            {/* Alerta de Gás Vermelho na Cozinha */}
            <radialGradient id="gasGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.6)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
            </radialGradient>
          </defs>

          {/* Base da Casa Isométrica */}
          {/* Piso Central Sala de Estar (Losango Isométrico) */}
          <polygon
            points="300,60 480,160 300,260 120,160"
            fill="url(#livingFloorGrad)"
            stroke="#475569"
            strokeWidth="3"
          />

          {/* Paredes da Sala */}
          <polygon points="120,160 120,110 300,10 300,60" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          <polygon points="300,60 300,10 480,110 480,160" fill="#0f172a" stroke="#334155" strokeWidth="2" />

          {/* Divisão Cozinha / Quarto (Lado Esquerdo) */}
          <polygon
            points="120,160 210,210 120,260 30,210"
            fill={isKitchenAlertOn ? '#450a0a' : '#1e1b4b'}
            stroke="#6366f1"
            strokeWidth="2"
          />
          <polygon points="30,210 30,170 120,120 120,160" fill="#312e81" stroke="#4338ca" strokeWidth="1.5" />

          {/* Divisão Varanda / Entrada (Lado Direito) */}
          <polygon
            points="480,160 570,210 480,260 390,210"
            fill="#064e3b"
            stroke="#10b981"
            strokeWidth="2"
          />

          {/* Efeito Iluminação da Sala se ligada */}
          {isLivingRoomLightOn && (
            <ellipse cx="300" cy="160" rx="130" ry="70" fill="url(#lampGlow)" />
          )}

          {/* Alarme Vermelho se Gás Alto */}
          {isKitchenAlertOn && (
            <ellipse cx="120" cy="210" rx="70" ry="40" fill="url(#gasGlow)" />
          )}

          {/* Mobília da Sala: Sofá Isométrico */}
          <g transform="translate(260, 140)">
            <polygon points="0,20 40,0 70,15 30,35" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
            <polygon points="30,35 70,15 70,28 30,48" fill="#1e40af" />
            <polygon points="0,20 30,35 30,48 0,33" fill="#2563eb" />
          </g>

          {/* Tapete da Sala */}
          <polygon points="260,185 340,145 360,155 280,195" fill="#64748b" opacity="0.6" />

          {/* Lâmpada Pendente do Teto */}
          <line x1="300" y1="40" x2="300" y2="90" stroke="#facc15" strokeWidth="2" />
          <circle
            cx="300"
            cy="92"
            r="8"
            fill={isLivingRoomLightOn ? '#fef08a' : '#475569'}
            stroke="#ca8a04"
            strokeWidth="2"
          />

          {/* Indicador de Presença PIR (Avatar / Onda) */}
          {telemetry.pirDetected && (
            <g transform="translate(320, 160)">
              <circle cx="0" cy="0" r="14" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.8">
                <animate attributeName="r" values="8;24" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="1.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="0" cy="-12" r="5" fill="#38bdf8" />
              <path d="M -6,4 Q 0,-6 6,4 Z" fill="#38bdf8" />
            </g>
          )}

          {/* Fogão na Cozinha com Partículas de Fumaça se Gás Ativo */}
          <g transform="translate(90, 190)">
            <rect x="0" y="0" width="24" height="20" rx="3" fill="#64748b" stroke="#334155" />
            <circle cx="8" cy="8" r="3" fill="#ef4444" />
            <circle cx="16" cy="8" r="3" fill="#ef4444" />
            {isKitchenAlertOn && (
              <g>
                <circle cx="12" cy="-6" r="6" fill="#ef4444" opacity="0.7">
                  <animate attributeName="cy" values="-6;-22" dur="0.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0" dur="0.8s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
          </g>

          {/* Rótulos dos Cômodos */}
          <text x="300" y="235" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">
            SALA DE ESTAR
          </text>
          <text x="120" y="245" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="bold">
            COZINHA
          </text>
          <text x="480" y="245" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">
            JARDIM / ENTRADA
          </text>
        </svg>
      </div>

      {/* Barra de Status Inferior */}
      <div className={styles.bottomBar}>
        <div className={styles.statusBar}>
          <span
            className={`${styles.statusIndicator} ${
              telemetry.gasAlert ? styles.statusIndicatorAlert : ''
            }`}
          />
          <span>STATUS DA CASA: {telemetry.status}</span>
          <span>|</span>
          <span>AUTOMAÇÃO: {telemetry.pirDetected ? 'Ocupado' : 'Modo Econômico'}</span>
        </div>
      </div>
    </div>
  );
};
