import React from 'react';
import { useTranslation } from 'react-i18next';
import { Cpu, AlertTriangle, Layers, Zap } from 'lucide-react';
import { IoTProject } from '../../types/project';
import styles from './WiringView.module.css';

interface WiringViewProps {
  project: IoTProject;
}

export const WiringView: React.FC<WiringViewProps> = ({ project }) => {
  const { t } = useTranslation(['workspace', 'common']);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span>🔌</span> {t('wiring.title', { ns: 'workspace' })} — {project.shortName}
        </h2>
        <p className={styles.subtitle}>{t('wiring.subtitle', { ns: 'workspace' })}</p>
      </div>

      {/* Diagrama Esquemático Visual (SVG) */}
      <div>
        <h3 className={styles.sectionTitle}>
          <Zap size={16} />
          <span>{t('wiring.schematicDiagram', { ns: 'workspace' })}</span>
        </h3>
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '1.5rem',
            overflowX: 'auto',
          }}
        >
          <svg
            width="100%"
            height={Math.max(260, project.pinout.length * 44 + 80)}
            viewBox={`0 0 760 ${Math.max(260, project.pinout.length * 44 + 80)}`}
            style={{ minWidth: '680px', display: 'block' }}
          >
            {/* Bloco do Microcontrolador (Esquerda) */}
            <rect
              x="30"
              y="30"
              width="190"
              height={Math.max(200, project.pinout.length * 44 + 20)}
              rx="10"
              fill="#0f172a"
              stroke="#0284c7"
              strokeWidth="2"
            />
            <text x="125" y="60" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">
              MICROCONTROLADOR
            </text>
            <text x="125" y="78" fill="#94a3b8" fontSize="10" textAnchor="middle">
              {project.microcontrollers.join(' / ')}
            </text>

            {/* Bloco dos Módulos/Sensores (Direita) */}
            <rect
              x="540"
              y="30"
              width="190"
              height={Math.max(200, project.pinout.length * 44 + 20)}
              rx="10"
              fill="#0f172a"
              stroke={project.accentColor}
              strokeWidth="2"
            />
            <text x="635" y="60" fill={project.accentColor} fontSize="13" fontWeight="bold" textAnchor="middle">
              SENSORES & MÓDULOS
            </text>
            <text x="635" y="78" fill="#94a3b8" fontSize="10" textAnchor="middle">
              Periféricos I2C / PWM / GPIO
            </text>

            {/* Linhas de Ligação / Jumpers */}
            {project.pinout.map((pin, i) => {
              const yPos = 110 + i * 42;
              const pathD = `M 220 ${yPos} C 360 ${yPos}, 400 ${yPos}, 540 ${yPos}`;

              return (
                <g key={i}>
                  {/* Linha do jumper */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={pin.wireColor}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    opacity="0.85"
                  />

                  {/* Pino MCU */}
                  <circle cx="220" cy={yPos} r="5" fill="#f8fafc" stroke={pin.wireColor} strokeWidth="2" />
                  <text x="210" y={yPos + 4} fill="#f8fafc" fontSize="11" fontWeight="600" textAnchor="end">
                    {pin.pinMicro}
                  </text>

                  {/* Pino Sensor */}
                  <circle cx="540" cy={yPos} r="5" fill="#f8fafc" stroke={pin.wireColor} strokeWidth="2" />
                  <text x="550" y={yPos + 4} fill="#f8fafc" fontSize="11" fontWeight="600" textAnchor="start">
                    {pin.pinSensor} ({pin.sensor})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Tabela de Pinagem */}
      <div>
        <h3 className={styles.sectionTitle}>
          <Layers size={16} />
          <span>{t('wiring.pinTable.microPin', { ns: 'workspace' })} & Pinagem</span>
        </h3>
        <div className={styles.tableContainer}>
          <table className={styles.pinTable}>
            <thead>
              <tr>
                <th>{t('wiring.pinTable.microPin', { ns: 'workspace' })}</th>
                <th>{t('wiring.pinTable.sensorPin', { ns: 'workspace' })}</th>
                <th>{t('wiring.pinTable.sensor', { ns: 'workspace' })}</th>
                <th>{t('wiring.pinTable.wireColor', { ns: 'workspace' })}</th>
                <th>{t('wiring.pinTable.notes', { ns: 'workspace' })}</th>
              </tr>
            </thead>
            <tbody>
              {project.pinout.map((pin, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{pin.pinMicro}</strong>
                  </td>
                  <td>
                    <span style={{ color: project.accentColor, fontWeight: 600 }}>
                      {pin.pinSensor}
                    </span>
                  </td>
                  <td>{pin.sensor}</td>
                  <td>
                    <span className={styles.wireBadge}>
                      <span
                        className={styles.wireColorDot}
                        style={{ backgroundColor: pin.wireColor }}
                      />
                      {pin.wireColor}
                    </span>
                  </td>
                  <td>{pin.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lista de Componentes de Hardware */}
      <div>
        <h3 className={styles.sectionTitle}>
          <Cpu size={16} />
          <span>{t('wiring.componentsList', { ns: 'workspace' })}</span>
        </h3>
        <div className={styles.componentsGrid}>
          {project.components.map((comp, idx) => (
            <div key={idx} className={styles.componentCard}>
              <div className={styles.componentName}>
                <span>{comp.name}</span>
                <span className={styles.componentQty}>
                  {t('wiring.quantity', { ns: 'workspace', count: comp.quantity })}
                </span>
              </div>
              <div className={styles.componentRole}>{comp.role}</div>
              <div className={styles.componentDesc}>{comp.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Avisos e Cuidados Elétricos */}
      {project.circuitWarnings.length > 0 && (
        <div className={styles.warningsBox}>
          <div className={styles.warningsTitle}>
            <AlertTriangle size={18} />
            <span>{t('wiring.warnings', { ns: 'workspace' })}:</span>
          </div>
          <ul className={styles.warningsList}>
            {project.circuitWarnings.map((warn, idx) => (
              <li key={idx}>{warn}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
