import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { TelemetryPoint } from '../../types/telemetry';
import styles from '../../App.module.css';

interface FlightscopeTelemetrySectionProps {
  latestPoint: TelemetryPoint;
  telemetryHistory: TelemetryPoint[];
  theme: 'dark' | 'light';
  maxPoints?: number;
}

export const FlightscopeTelemetrySection: React.FC<FlightscopeTelemetrySectionProps> = ({
  latestPoint,
  telemetryHistory,
  theme,
  maxPoints = 30,
}) => {
  const chartGridColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const chartAxisColor = theme === 'dark' ? '#475569' : '#cbd5e1';
  const pitchColor = theme === 'dark' ? '#00e5ff' : '#0284c7';
  const rollColor = theme === 'dark' ? '#c084fc' : '#7c3aed';
  const radarColor = theme === 'dark' ? '#10b981' : '#059669';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* HUD Rápido: Métricas Instantâneas */}
      <section className={styles.hudGrid} aria-label="Métricas Instantâneas">
        {/* Card Pitch */}
        <div className={styles.hudCard}>
          <div className={styles.hudCardHeader}>
            <span className={styles.hudCardLabel}>Pitch (Arfagem)</span>
            <span className={styles.hudCardUnit}>Graus (°)</span>
          </div>
          <div className={`${styles.hudCardValue} ${styles.hudCardValuePitch}`}>
            {latestPoint.Pitch >= 0 ? `+${latestPoint.Pitch.toFixed(1)}` : latestPoint.Pitch.toFixed(1)}°
          </div>
          <div className={styles.hudCardFooter}>
            <span>Faixa Nominal: -90° a +90°</span>
            <span>{latestPoint.Pitch > 0 ? '▲ Subindo' : latestPoint.Pitch < 0 ? '▼ Descendo' : '● Nivelado'}</span>
          </div>
        </div>

        {/* Card Roll */}
        <div className={styles.hudCard}>
          <div className={styles.hudCardHeader}>
            <span className={styles.hudCardLabel}>Roll (Rolamento)</span>
            <span className={styles.hudCardUnit}>Graus (°)</span>
          </div>
          <div className={`${styles.hudCardValue} ${styles.hudCardValueRoll}`}>
            {latestPoint.Roll >= 0 ? `+${latestPoint.Roll.toFixed(1)}` : latestPoint.Roll.toFixed(1)}°
          </div>
          <div className={styles.hudCardFooter}>
            <span>Faixa Nominal: -90° a +90°</span>
            <span>{latestPoint.Roll > 0 ? '↷ Direita' : latestPoint.Roll < 0 ? '↶ Esquerda' : '● Nivelado'}</span>
          </div>
        </div>

        {/* Card Radar_cm */}
        <div className={styles.hudCard}>
          <div className={styles.hudCardHeader}>
            <span className={styles.hudCardLabel}>Radar de Altitude</span>
            <span className={styles.hudCardUnit}>Centímetros</span>
          </div>
          <div className={`${styles.hudCardValue} ${styles.hudCardValueRadar}`}>
            {latestPoint.Radar_cm.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>cm</span>
          </div>
          <div className={styles.hudCardFooter}>
            <span>Range: 0 a 60 cm</span>
            <span>{(latestPoint.Radar_cm / 100).toFixed(2)} m</span>
          </div>
        </div>

        {/* Card Nível de Perigo */}
        <div className={styles.hudCard}>
          <div className={styles.hudCardHeader}>
            <span className={styles.hudCardLabel}>Índice de Risco</span>
            <span className={styles.hudCardUnit}>0 — 100</span>
          </div>
          <div className={`${styles.hudCardValue} ${styles.hudCardValueDanger}`}>
            {latestPoint.Nivel_Perigo.toFixed(0)}
          </div>
          <div className={styles.hudCardFooter}>
            <span>
              {latestPoint.Nivel_Perigo < 1
                ? '🟢 Faixa Segura'
                : latestPoint.Nivel_Perigo === 1
                ? '🟡 Faixa de Alerta'
                : '🔴 Faixa Crítica'}
            </span>
            <span>{telemetryHistory.length}/{maxPoints} pts</span>
          </div>
        </div>
      </section>

      {/* Gráficos em Tempo Real (Recharts) */}
      <main className={styles.chartsSection}>
        {/* Gráfico 1: Pitch e Roll juntos */}
        <article className={styles.chartCard}>
          <header className={styles.chartCardHeader}>
            <div className={styles.chartTitleGroup}>
              <h2 className={styles.chartTitle}>Atitude de Voo (Pitch &amp; Roll)</h2>
              <span className={styles.chartBadge}>Eixo Y: [-90°, +90°]</span>
            </div>
            <div className={styles.chartLegendCustom}>
              <div className={styles.legendItem}>
                <span className={styles.legendColorBox} style={{ backgroundColor: pitchColor }} />
                <span>Pitch (Arfagem)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColorBox} style={{ backgroundColor: rollColor }} />
                <span>Roll (Rolamento)</span>
              </div>
            </div>
          </header>

          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={telemetryHistory}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} opacity={0.8} />
                <XAxis
                  dataKey="time"
                  stroke={chartAxisColor}
                  tick={{ fill: chartAxisColor, fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[-90, 90]}
                  stroke={chartAxisColor}
                  tick={{ fill: chartAxisColor, fontSize: 11 }}
                  unit="°"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className={styles.customTooltip}>
                          <div className={styles.tooltipTitle}>{label}</div>
                          {payload.map((entry, index) => (
                            <div key={`item-${index}`} className={styles.tooltipRow}>
                              <span style={{ color: entry.color }}>{entry.name}:</span>
                              <strong>{Number(entry.value).toFixed(1)}°</strong>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke={chartAxisColor} strokeDasharray="2 2" />
                <Line
                  type="monotone"
                  dataKey="Pitch"
                  name="Pitch"
                  stroke={pitchColor}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="Roll"
                  name="Roll"
                  stroke={rollColor}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Gráfico 2: Altitude Radar HC-SR04 */}
        <article className={styles.chartCard}>
          <header className={styles.chartCardHeader}>
            <div className={styles.chartTitleGroup}>
              <h2 className={styles.chartTitle}>Radar de Altitude (HC-SR04)</h2>
              <span className={styles.chartBadge}>Faixa: 0 a 60 cm</span>
            </div>
            <div className={styles.chartLegendCustom}>
              <div className={styles.legendItem}>
                <span className={styles.legendColorBox} style={{ backgroundColor: radarColor }} />
                <span>Altitude Radar (cm)</span>
              </div>
            </div>
          </header>

          <div className={styles.chartWrapperRadar}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={telemetryHistory}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} opacity={0.8} />
                <XAxis
                  dataKey="time"
                  stroke={chartAxisColor}
                  tick={{ fill: chartAxisColor, fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 60]}
                  stroke={chartAxisColor}
                  tick={{ fill: chartAxisColor, fontSize: 11 }}
                  unit="cm"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className={styles.customTooltip}>
                          <div className={styles.tooltipTitle}>{label}</div>
                          {payload.map((entry, index) => (
                            <div key={`item-${index}`} className={styles.tooltipRow}>
                              <span style={{ color: entry.color }}>{entry.name}:</span>
                              <strong>{Number(entry.value).toFixed(1)} cm</strong>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={15} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Zona Crítica', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Alerta', fill: '#f59e0b', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="Radar_cm"
                  name="Radar"
                  stroke={radarColor}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </main>
    </div>
  );
};
