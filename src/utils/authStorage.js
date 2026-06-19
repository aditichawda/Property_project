export async function clearAppStorage() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.clear();
  } catch {}
  try {
    window.sessionStorage.clear();
  } catch {}
  try {
    if ("caches" in window) {
      const cacheNames = await window.caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => window.caches.delete(cacheName)),
      );
    }
  } catch {}
}
