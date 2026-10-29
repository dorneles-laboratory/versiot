import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseWebSerialOptions {
  baudRate: number;
  onLineReceived: (line: string) => void;
  onLog: (text: string, type: 'rx' | 'tx' | 'sys') => void;
  onError?: (errorMsg: string) => void;
}

export function useWebSerial({
  baudRate,
  onLineReceived,
  onLog,
  onError,
}: UseWebSerialOptions) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [hasWebSerialSupport, setHasWebSerialSupport] = useState<boolean>(true);

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const keepReadingRef = useRef<boolean>(false);

  // Monitora suporte à Web Serial API e desconexão física de hardware
  useEffect(() => {
    if (typeof window === 'undefined' || !('serial' in navigator) || !navigator.serial) {
      setHasWebSerialSupport(false);
      return;
    }

    const handleDeviceDisconnect = (event: Event) => {
      const customEvent = event as Event & { port?: SerialPort };
      if (!portRef.current || (customEvent.port && customEvent.port === portRef.current)) {
        console.warn('Dispositivo USB desconectado fisicamente.');
        onLog('Dispositivo USB desconectado fisicamente da porta.', 'sys');
        onError?.('O dispositivo USB foi desconectado fisicamente da porta.');
        disconnect();
      }
    };

    const handleDeviceConnect = () => {
      console.info('Dispositivo USB detectado.');
      onLog('Dispositivo USB detectado na porta.', 'sys');
    };

    navigator.serial.addEventListener('disconnect', handleDeviceDisconnect);
    navigator.serial.addEventListener('connect', handleDeviceConnect);

    return () => {
      navigator.serial?.removeEventListener('disconnect', handleDeviceDisconnect);
      navigator.serial?.removeEventListener('connect', handleDeviceConnect);
    };
  }, [onError, onLog]);

  /**
   * Desconecta e fecha a porta serial de forma segura
   */
  const disconnect = useCallback(async () => {
    keepReadingRef.current = false;

    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch {
        /* ignora erro de cancelamento prévio */
      }
      try {
        readerRef.current.releaseLock();
      } catch {
        /* ignora */
      }
      readerRef.current = null;
    }

    if (portRef.current) {
      try {
        await portRef.current.close();
      } catch {
        /* ignora se já fechada */
      }
      portRef.current = null;
    }

    setIsConnected(false);
    onLog('Porta serial desconectada.', 'sys');
  }, [onLog]);

  /**
   * Solicita e conecta a uma porta USB
   */
  const connect = useCallback(async () => {
    if (!('serial' in navigator) || !navigator.serial) {
      const msg = 'Seu navegador não suporta a Web Serial API. Utilize o Google Chrome ou Edge.';
      onError?.(msg);
      return false;
    }

    if (portRef.current) {
      await disconnect();
    }

    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate });

      portRef.current = port;
      keepReadingRef.current = true;
      setIsConnected(true);
      onLog(`Porta serial aberta com sucesso em ${baudRate} bps.`, 'sys');

      if (!port.readable) {
        throw new Error('A porta serial selecionada não possui stream legível.');
      }

      const reader = port.readable.getReader();
      readerRef.current = reader;

      const decoder = new TextDecoder('utf-8');
      let lineBuffer = '';

      // Loop assíncrono de leitura de pacotes
      (async () => {
        try {
          while (keepReadingRef.current) {
            const { value, done } = await reader.read();
            if (done) break;

            if (value) {
              lineBuffer += decoder.decode(value, { stream: true });

              // Previne estouro de memória caso chegue lixo sem quebra de linha
              if (lineBuffer.length > 2048) {
                lineBuffer = lineBuffer.slice(-512);
              }

              const lines = lineBuffer.split(/\r?\n/);
              lineBuffer = lines.pop() ?? '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed) {
                  onLog(trimmed, 'rx');
                  onLineReceived(trimmed);
                }
              }
            }
          }
        } catch (readErr: unknown) {
          if (keepReadingRef.current) {
            console.warn('Erro na leitura da porta serial:', readErr);
          }
        } finally {
          await disconnect();
        }
      })();

      return true;
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'NotFoundError') {
        console.info('Seleção de porta serial cancelada pelo usuário.');
      } else if (error.name === 'NetworkError' || error.message?.includes('open')) {
        const msg = 'A porta serial já está aberta ou ocupada por outro programa (ex: Arduino IDE).';
        onError?.(msg);
        onLog(msg, 'sys');
      } else {
        const msg = `Falha na conexão serial: ${error.message}`;
        onError?.(msg);
        onLog(msg, 'sys');
      }
      await disconnect();
      return false;
    }
  }, [baudRate, disconnect, onError, onLineReceived, onLog]);

  /**
   * Envia comando raw pela serial
   */
  const send = useCallback(
    async (command: string) => {
      onLog(command, 'tx');

      if (portRef.current && portRef.current.writable) {
        try {
          const encoder = new TextEncoder();
          const writer = portRef.current.writable.getWriter();
          await writer.write(encoder.encode(command + '\n'));
          writer.releaseLock();
        } catch (err) {
          console.error('Erro ao escrever na porta serial:', err);
          const msg = `Erro no envio: ${(err as Error).message}`;
          onLog(msg, 'sys');
          onError?.(msg);
        }
      }
    },
    [onError, onLog]
  );

  return {
    isConnected,
    hasWebSerialSupport,
    connect,
    disconnect,
    send,
  };
}
