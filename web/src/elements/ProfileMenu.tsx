import type { AuthError } from '@supabase/supabase-js';
import { useEffect, useRef, useState, type FocusEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { ACCOUNT_ROUTE_PATH } from './router.constants';
import { useUser } from './session';
import './ProfileMenu.css';

export function ProfileMenu() {
  const user = useUser();
  const [error, setError] = useState<AuthError | null>(null);

  async function signOut() {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    setError(error);
  }

  if (user) {
    return <Menu onSignOut={signOut} />;
  }

  return (
    error && (
      <p role="alert" className="profile-menu-error">
        {error.message}
      </p>
    )
  );
}

function Menu({ onSignOut }: { onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current!.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current!.focus();
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }

  return (
    <div ref={menuRef} className="profile-menu" onBlur={onBlur}>
      <button
        ref={buttonRef}
        type="button"
        className="profile-menu-button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        Profile
      </button>
      {open && (
        <ul className="profile-menu-items">
          <li>
            <Link
              to={ACCOUNT_ROUTE_PATH}
              className="profile-menu-item"
              onClick={() => setOpen(false)}
            >
              Account
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="profile-menu-item"
              onClick={onSignOut}
            >
              Sign out
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
