"use client";

import { useMemo, useRef } from "react";

import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime";

import { usePusherChannel } from "./use-pusher-channel";

type TicketUpdateCallback = () => void;

export function useTicketsWebSocket(onTicketUpdate: TicketUpdateCallback) {
  const callbackRef = useRef(onTicketUpdate);

  callbackRef.current = onTicketUpdate;

  const handlers = useMemo(
    () => ({
      [REALTIME_EVENTS.ticketCreated]: () => callbackRef.current(),
      [REALTIME_EVENTS.ticketUpdated]: () => callbackRef.current(),
      [REALTIME_EVENTS.ticketsChanged]: () => callbackRef.current(),
    }),
    [],
  );

  usePusherChannel(REALTIME_CHANNELS.tickets, handlers);
}
