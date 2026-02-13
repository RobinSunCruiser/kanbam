'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RECONNECT_DELAY_MS } from '../constants';

export function useBoardSync(boardUid: string) {
  const router = useRouter();
  const esRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const connect = () => {
      esRef.current = new EventSource(`/api/board/${boardUid}/events`);

      esRef.current.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'refresh') {
          router.refresh();
        }
      };

      esRef.current.onerror = () => {
        esRef.current?.close();
        reconnectRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      };
    };

    connect();

    return () => {
      esRef.current?.close();
      clearTimeout(reconnectRef.current);
    };
  }, [boardUid, router]);
}
