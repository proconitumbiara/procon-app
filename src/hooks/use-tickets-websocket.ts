"use client";

import { useEffect, useMemo, useRef } from "react";

import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime";

import { usePusherChannel } from "./use-pusher-channel";

type TicketUpdateCallback = () => void;

export function useTicketsWebSocket(onTicketUpdate: TicketUpdateCallback) {
  const callbackRef = useRef(onTicketUpdate);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  callbackRef.current = onTicketUpdate;

  const scheduleUpdate = useMemo(
    () => () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => {
        callbackRef.current();
      }, 150);
    },
    [],
  );

  const handlers = useMemo(
    () => ({
      [REALTIME_EVENTS.ticketCreated]: scheduleUpdate,
      [REALTIME_EVENTS.ticketUpdated]: scheduleUpdate,
      [REALTIME_EVENTS.ticketsChanged]: scheduleUpdate,
    }),
    [scheduleUpdate],
  );

  usePusherChannel(REALTIME_CHANNELS.tickets, handlers);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);
}
