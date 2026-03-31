"use client";

import Pusher from "pusher-js";

let pusherClientInstance: Pusher | null = null;

export function getPusherClient() {
  if (pusherClientInstance) return pusherClientInstance;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  if (!key || !cluster) return null;

  pusherClientInstance = new Pusher(key, {
    cluster,
    forceTLS: true,
    activityTimeout: 25000,
    pongTimeout: 15000,
  });

  return pusherClientInstance;
}
