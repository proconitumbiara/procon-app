"use client";

import Pusher from "pusher-js";
import { useEffect, useRef } from "react";

type TicketUpdateCallback = () => void;

export function useTicketsWebSocket(onTicketUpdate: TicketUpdateCallback) {
  const callbackRef = useRef(onTicketUpdate);

  useEffect(() => {
    callbackRef.current = onTicketUpdate;
  }, [onTicketUpdate]);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      activityTimeout: 25000,
      pongTimeout: 15000,
    });

    const channel = pusher.subscribe("tickets");

    const handleUpdate = () => {
      callbackRef.current();
    };

    channel.bind("ticket-created", handleUpdate);
    channel.bind("ticket-updated", handleUpdate);

    return () => {
      channel.unbind("ticket-created", handleUpdate);
      channel.unbind("ticket-updated", handleUpdate);
      pusher.unsubscribe("tickets");
      pusher.disconnect();
    };
  }, []);
}
