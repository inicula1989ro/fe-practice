import { useCallback, useRef, useState } from 'react';

// Shared banner behavior across pages: show a message, auto-hide it after a
// few seconds. A component just renders `banner` when it's non-null and
// calls `showBanner(message, 'success' | 'error')`.
export function useBanner() {
  const [banner, setBanner] = useState(null);
  const timeoutRef = useRef(null);

  const showBanner = useCallback((message, type) => {
    setBanner({ message, type });
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setBanner(null), 4000);
  }, []);

  return { banner, showBanner };
}
