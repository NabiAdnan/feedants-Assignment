export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const day = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return { day, time };
}

/**
 * Computes a d/h/m/s breakdown between `target` and `now`.
 * Both are ISO strings; callers pass server-synced `now` (see
 * useServerClock) rather than trusting the device clock.
 */
export function getCountdownParts(targetIso, nowMs) {
  const targetMs = new Date(targetIso).getTime();
  let diff = Math.max(targetMs - nowMs, 0);

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  diff -= days * 24 * 60 * 60 * 1000;
  const hours = Math.floor(diff / (60 * 60 * 1000));
  diff -= hours * 60 * 60 * 1000;
  const minutes = Math.floor(diff / (60 * 1000));
  diff -= minutes * 60 * 1000;
  const seconds = Math.floor(diff / 1000);

  const pad = (n) => String(n).padStart(2, '0');
  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: targetMs - nowMs <= 0,
    label: `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`,
  };
}
