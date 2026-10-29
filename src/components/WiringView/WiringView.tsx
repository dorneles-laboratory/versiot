import React from 'react';
import { IoTProject } from '../../types/project';
import styles from './WiringView.module.css';

interface WiringViewProps {
  project: IoTProject;
}

export const WiringView: React.FC<WiringViewProps> = ({ project }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span>🔌</span> Esquema de Ligação & Pinagem — {project.shortName}
        </h2>
        <p className={styles.subtitle}>
          Conecte os módulos conforme a tabela abaixo antes de energizar a porta USB do microcontrolador.
        </p>
      </div>

      {/* Tabela de Pinagem */}
      <div>
        <h3 className={styles.sectionTitle}>
          <span>📌</span> Tabela de Conexões Pino a Pino
        </h3>
        <div className={styles.tableContainer}>
          <table className={styles.pinTable}>
            <thead>
              <tr>
                <th>Pino Microcontrolador</th>
                <th>Pino no Sensor</th>
                <th>Módulo / Sensor</th>
                <th>Cor do Jumper Recomendada</th>
                <th>Observações Elétricas</th>
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
          <span>🧰</span> Lista de Componentes Necessários
        </h3>
        <div className={styles.componentsGrid}>
          {project.components.map((comp, idx) => (
            <div key={idx} className={styles.componentCard}>
              <div className={styles.componentName}>
                <span>{comp.name}</span>
                <span className={styles.componentQty}>{comp.quantity}x</span>
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
            <span>⚠️</span> Dicas & Cuidados Elétricos Importantes:
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
