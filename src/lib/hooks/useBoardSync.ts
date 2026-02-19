'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RECONNECT_DELAY_MS, SSE_ACTIVE_DURATION_MS } from '../constants';

export type SyncMode = 'active' | 'sleep';

export function useBoardSync(boardUid: string): { syncMode: SyncMode } {
  const router = useRouter();
  const [syncMode, setSyncMode] = useState<SyncMode>('active');

  // Refs survive across the effect lifecycle without triggering re-renders
  const esRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const modeRef = useRef<SyncMode>('active');

  useEffect(() => {
    const closeConnection = () => {
      esRef.current?.close();
      esRef.current = null;
      clearTimeout(reconnectRef.current);
      reconnectRef.current = undefined;
    };

    const setMode = (mode: SyncMode) => {
      modeRef.current = mode;
      setSyncMode(mode);
    };

    const enterSleep = () => {
      closeConnection();
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = undefined;
      setMode('sleep');
    };

    const startSleepTimer = () => {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = setTimeout(enterSleep, SSE_ACTIVE_DURATION_MS);
    };

    const connect = () => {
      if (esRef.current) return;

      const es = new EventSource(`/api/board/${boardUid}/events`);
      esRef.current = es;

      es.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'refresh') {
          router.refresh();
        }
      };

      es.onerror = () => {
        closeConnection();
        if (modeRef.current === 'active' && document.visibilityState === 'visible') {
          reconnectRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };

      setMode('active');
      startSleepTimer();
    };

    const wake = () => {
      router.refresh();
      connect();
    };

    const handleActivity = () => {
      if (modeRef.current === 'sleep') {
        wake();
      } else {
        startSleepTimer();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        wake();
      } else {
        enterSleep();
      }
    };

    // Start SSE connection
    connect();

    // Track user activity for inactivity timeout
    document.addEventListener('click', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleActivity);

    return () => {
      document.removeEventListener('click', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleActivity);
      closeConnection();
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = undefined;
    };
  }, [boardUid, router]);

  return { syncMode };
}
