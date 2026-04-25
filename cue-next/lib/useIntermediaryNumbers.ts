'use client';

import { useState, useEffect } from 'react';

const KEY = 'cue_show_intermediary';

export function useIntermediaryNumbers(): [boolean, (v: boolean) => void] {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(localStorage.getItem(KEY) === 'true');
    } catch {}
  }, []);

  function set(v: boolean) {
    setShow(v);
    try { localStorage.setItem(KEY, String(v)); } catch {}
  }

  return [show, set];
}

// Formats an LP display string respecting the toggle.
// 28/1 is always shown as-is regardless of the toggle.
export function fmtLP(lp: number, display: string, show: boolean): string {
  if (display === '28/1') return '28/1';
  return show ? display : String(lp);
}

// For stored display strings (e.g. from DB) where we only have the string, not lp number.
// Strips the "/raw" suffix when show=false, keeps "28/1" always.
export function fmtLPStr(display: string, show: boolean): string {
  if (display === '28/1') return '28/1';
  if (show) return display;
  const slash = display.indexOf('/');
  return slash !== -1 ? display.slice(0, slash) : display;
}
