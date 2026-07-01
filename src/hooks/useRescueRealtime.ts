import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getWsUrl } from "@/lib/ws-url";

/** Subscribe to rescue status updates for a tracking code or admin list. */
export function useRescueRealtime(
  topic: string | null,
  onUpdate: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled || !topic) return;

    const socket = new SockJS(getWsUrl());
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(topic, () => onUpdate());
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [topic, onUpdate, enabled]);
}

/** Demo tracking codes that exist in seed data. */
export const RESCUE_DEMO_CODES = ["RP-2026-0001", "RP-2026-0002", "RP-2026-0003"] as const;
