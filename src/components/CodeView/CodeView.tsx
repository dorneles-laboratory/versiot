import React, { useState } from 'react';
import { IoTProject } from '../../types/project';
import styles from './CodeView.module.css';

interface CodeViewProps {
  project: IoTProject;
}

export const CodeView: React.FC<CodeViewProps> = ({ project }) => {
  const [copied, setCopied] = useState(false);
  const { firmware } = project;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(firmware.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([firmware.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = firmware.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>
            <span>💻</span> Firmware C++ / Arduino IDE — {project.shortName}
          </h2>
          <p className={styles.subtitle}>
            Baud Rate recomendado: <strong>{project.defaultBaud} bps</strong> · Arquivo: <code>{firmware.filename}</code>
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnAction} onClick={handleCopy}>
            <span>{copied ? '✅' : '📋'}</span>
            {copied ? 'Copiado!' : 'Copiar Código'}
          </button>
          <button className={`${styles.btnAction} ${styles.btnPrimary}`} onClick={handleDownload}>
            <span>💾</span> Baixar Arquivo .ino
          </button>
        </div>
      </div>

      {/* Bibliotecas Necessárias */}
      {firmware.libraries.length > 0 && (
        <div className={styles.librariesSection}>
          <div className={styles.libTitle}>
            <span>📚</span> Bibliotecas Necessárias (Arduino IDE Library Manager)
          </div>
          <div className={styles.libList}>
            {firmware.libraries.map((lib, idx) => (
              <div key={idx} className={styles.libItem}>
                <div className={styles.libName}>
                  {lib.name} {lib.author && <span style={{ opacity: 0.7 }}>por {lib.author}</span>}
                </div>
                <div className={styles.libGuide}>{lib.installGuide}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bloco de Código */}
      <div className={styles.codeBox}>
        <div className={styles.codeTopBar}>
          <span>{firmware.filename}</span>
          <span>C++ (Arduino / ESP32)</span>
        </div>
        <pre className={styles.codeContent}>
          <code>{firmware.code}</code>
        </pre>
      </div>
    </div>
  );
};
