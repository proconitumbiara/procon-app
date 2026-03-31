"use client";

import { useEffect } from "react";

import { getPusherClient } from "@/lib/pusher-client";

type HandlerMap = Record<string, (data: unknown) => void>;
const channelUsage = new Map<string, number>();

export function usePusherChannel(channelName: string, handlers: HandlerMap) {
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(channelName);
    channelUsage.set(channelName, (channelUsage.get(channelName) ?? 0) + 1);

    const onConnected = () => {
      console.debug(`[pusher] connected on channel ${channelName}`);
    };
    const onDisconnected = () => {
      console.debug(`[pusher] disconnected on channel ${channelName}`);
    };
    const onConnectionError = (error: unknown) => {
      console.error("[pusher] connection error", { channelName, error });
    };

    if (process.env.NODE_ENV !== "production") {
      pusher.connection.bind("connected", onConnected);
      pusher.connection.bind("disconnected", onDisconnected);
      pusher.connection.bind("error", onConnectionError);
    }

    for (const [eventName, handler] of Object.entries(handlers)) {
      channel.bind(eventName, handler);
    }

    return () => {
      for (const [eventName, handler] of Object.entries(handlers)) {
        channel.unbind(eventName, handler);
      }
      if (process.env.NODE_ENV !== "production") {
        pusher.connection.unbind("connected", onConnected);
        pusher.connection.unbind("disconnected", onDisconnected);
        pusher.connection.unbind("error", onConnectionError);
      }
      const nextUsage = (channelUsage.get(channelName) ?? 1) - 1;
      if (nextUsage <= 0) {
        channelUsage.delete(channelName);
        pusher.unsubscribe(channelName);
      } else {
        channelUsage.set(channelName, nextUsage);
      }
    };
  }, [channelName, handlers]);
}

