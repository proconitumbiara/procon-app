"use client";

import { useEffect, useState } from "react";

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
}

export default function AttendanceDurationTimer({
  createdAt,
}: {
  createdAt: Date | string;
}) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const startMs = (() => {
    const ms = new Date(createdAt).getTime();
    return Number.isNaN(ms) ? null : ms;
  })();

  if (startMs === null) return <span>-</span>;

  const diff = now - startMs;
  return <span>{formatDuration(diff)}</span>;
}

