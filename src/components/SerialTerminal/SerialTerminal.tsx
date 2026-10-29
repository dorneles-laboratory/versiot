import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Trash2, Pause, Play, ScrollText } from 'lucide-react';
import { IoTProject } from '../../types/project';
import styles from './SerialTerminal.module.css';

export interface SerialLogEntry {
  id: number;
  time: string;
  text: string;
  type: 'rx' | 'tx' | 'sys';
}

interface SerialTerminalProps {
  project: IoTProject;
  logs: SerialLogEntry[];
  baudRate: number;
  onBaudRateChange: (baud: number) => void;
  onSendRaw: (command: string) => void;
  onClearLogs: () => void;
}

export const SerialTerminal: React.FC<SerialTerminalProps> = ({
  project,
  logs,
  baudRate,
  onBaudRateChange,
  onSendRaw,
  onClearLogs,
}) => {
  const { t } = useTranslation(['workspace', 'common']);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [inputText, setInputText] = useState('');
  const terminalWindowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (autoScroll && !isPaused && terminalWindowRef.current) {
      terminalWindowRef.current.scrollTop = terminalWindowRef.current.scrollHeight;
    }
  }, [logs, autoScroll, isPaused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendRaw(inputText.trim());
    setInputText('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>
            <span>📟</span> {t('terminal.title', { ns: 'workspace' })}
          </h2>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            {t('terminal.subtitle', { ns: 'workspace' })} ({baudRate} bps)
          </span>
        </div>

        <div className={styles.controls}>
          <select
            className={styles.baudSelect}
            value={baudRate}
            onChange={(e) => onBaudRateChange(Number(e.target.value))}
          >
            <option value={9600}>9600 baud</option>
            <option value={19200}>19200 baud</option>
            <option value={38400}>38400 baud</option>
            <option value={57600}>57600 baud</option>
            <option value={115200}>115200 baud</option>
          </select>

          <button
            className={`${styles.btnControl} ${autoScroll ? styles.btnActive : ''}`}
            onClick={() => setAutoScroll((prev) => !prev)}
          >
            <ScrollText size={14} />
            <span>{t('terminal.autoscroll', { ns: 'workspace' })}: {autoScroll ? 'ON' : 'OFF'}</span>
          </button>

          <button
            className={`${styles.btnControl} ${isPaused ? styles.btnActive : ''}`}
            onClick={() => setIsPaused((prev) => !prev)}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
            <span>{isPaused ? t('terminal.resume', { ns: 'workspace' }) : t('terminal.pause', { ns: 'workspace' })}</span>
          </button>

          <button className={styles.btnControl} onClick={onClearLogs}>
            <Trash2 size={14} />
            <span>{t('terminal.clear', { ns: 'workspace' })}</span>
          </button>
        </div>
      </div>

      <div className={styles.hint}>
        <strong>{t('code.payloadFormat', { ns: 'workspace' })} [{project.shortName}]:</strong>{' '}
        <code>{project.samplePayload}</code>
      </div>

      <div ref={terminalWindowRef} className={styles.terminalWindow}>
        {logs.length === 0 ? (
          <div className={styles.lineEmpty}>
            {t('terminal.waiting', { ns: 'workspace' })}
          </div>
        ) : (
          logs.map((entry) => (
            <div key={entry.id} className={styles.terminalLine}>
              <span className={styles.timeTag}>[{entry.time}]</span>
              <span
                className={styles.lineContent}
                style={{
                  color:
                    entry.type === 'tx'
                      ? '#38bdf8'
                      : entry.type === 'sys'
                      ? '#f59e0b'
                      : '#00ff88',
                }}
              >
                {entry.type === 'tx' && '> '}
                {entry.text}
              </span>
            </div>
          ))
        )}
      </div>

      <form className={styles.inputBar} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.inputField}
          placeholder={t('terminal.sendPlaceholder', { ns: 'workspace' })}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className={styles.btnSend}>
          <Send size={14} style={{ marginRight: '6px' }} />
          <span>{t('terminal.send', { ns: 'workspace' })}</span>
        </button>
      </form>
    </div>
  );
};
