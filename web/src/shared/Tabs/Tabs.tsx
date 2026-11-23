import { useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import './Tabs.css';

export type Tab = { label: string; content: ReactNode };

export function Tabs({ label, tabs }: { label: string; tabs: Tab[] }) {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    const next = (index + tabs.length) % tabs.length;
    setSelected(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, number> = {
      ArrowLeft: selected - 1,
      ArrowRight: selected + 1,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    select(moves[event.key]);
  };

  return (
    <div className="tabs">
      <div
        role="tablist"
        aria-label={label}
        className="tabs-list"
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-selected={index === selected}
            aria-controls={`${id}-panel-${index}`}
            tabIndex={index === selected ? 0 : -1}
            className="tabs-tab"
            onClick={() => setSelected(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.label}
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          tabIndex={0}
          hidden={index !== selected}
          className="tabs-panel"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
