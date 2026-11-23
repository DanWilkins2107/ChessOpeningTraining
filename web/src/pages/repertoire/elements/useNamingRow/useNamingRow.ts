import { useEffect, useRef, useState } from 'react';

// Whether the inline naming row is open. Once it has closed, focus returns to
// the button that opened it rather than falling to the page.
export function useNamingRow() {
  const [naming, setNaming] = useState(false);
  const [closed, setClosed] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (closed && !naming) opener.current?.focus();
  }, [closed, naming]);

  return {
    naming,
    closed,
    opener,
    open: () => setNaming(true),
    toggle: () => setNaming(!naming),
    close: () => {
      setNaming(false);
      setClosed(true);
    },
  };
}
