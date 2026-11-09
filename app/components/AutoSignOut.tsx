'use client';

import { useEffect, useRef } from "react";
import { getSession, signOut } from "next-auth/react";

// Default inactivity timeout is 30 minutes (customizable via NEXT_PUBLIC_AUTO_SIGNOUT_MINUTES)
const TIMEOUT_MINUTES = Number(process.env.NEXT_PUBLIC_AUTO_SIGNOUT_MINUTES) || 30;
const INACTIVITY_MS = TIMEOUT_MINUTES * 60 * 1000;

export default function AutoSignOut() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    let removeListeners: (() => void) | null = null;

    async function initActivityTracker() {
      try {
        const session = await getSession();
        if (!isSubscribed || !session?.user) {
          return;
        }

        function triggerAutoSignOut() {
          void signOut({ callbackUrl: "/auth?reason=timeout" });
        }

        function resetTimer() {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          timerRef.current = setTimeout(triggerAutoSignOut, INACTIVITY_MS);
        }

        // Start initial inactivity countdown
        resetTimer();

        // Standard user interaction events to refresh countdown
        const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
        const handleActivity = () => {
          resetTimer();
        };

        events.forEach((evt) => {
          window.addEventListener(evt, handleActivity, { passive: true });
        });

        removeListeners = () => {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          events.forEach((evt) => {
            window.removeEventListener(evt, handleActivity);
          });
        };
      } catch (err) {
        console.error("AutoSignOut initialization error:", err);
      }
    }

    void initActivityTracker();

    return () => {
      isSubscribed = false;
      if (removeListeners) {
        removeListeners();
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return null;
}

