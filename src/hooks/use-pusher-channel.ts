"use client";

import Pusher from "pusher-js";
import { useEffect } from "react";

type HandlerMap = Record<string, (data: unknown) => void>;

export function usePusherChannel(channelName: string, handlers: HandlerMap) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) return;

    const pusher = new Pusher(key, {
      cluster,
      activityTimeout: 25000,
      pongTimeout: 15000,
    });

    const channel = pusher.subscribe(channelName);
    for (const [eventName, handler] of Object.entries(handlers)) {
      channel.bind(eventName, handler);
    }

    return () => {
      for (const [eventName, handler] of Object.entries(handlers)) {
        channel.unbind(eventName, handler);
      }
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [channelName, handlers]);
}

