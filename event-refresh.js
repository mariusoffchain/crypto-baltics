// Refresh open tabs without rebuilding the site. Background timers may be throttled.
export function watchEventDates(refresh) {
  refresh();
  const timer = setInterval(refresh, 30_000);
  const visible = () => {
    if (!document.hidden) refresh();
  };
  document.addEventListener("visibilitychange", visible);
  window.addEventListener("pageshow", refresh);
  window.addEventListener("focus", refresh);
  return () => {
    clearInterval(timer);
    document.removeEventListener("visibilitychange", visible);
    window.removeEventListener("pageshow", refresh);
    window.removeEventListener("focus", refresh);
  };
}
