"use client";

import { useEffect, useRef, useCallback } from "react";

interface UsePageTrackingOptions {
  /** Override the page URL (defaults to window.location.href) */
  pageUrl?: string;
  /** Track form field interactions by field name */
  trackFields?: boolean;
  /** Authenticated user ID to associate with the session */
  userId?: string;
}

/**
 * usePageTracking
 *
 * Automatically starts a page session on mount and ends it on unmount.
 * Tracks max scroll depth during the session.
 * Optionally tracks field-level interactions (focus/blur).
 *
 * Usage:
 *   const { trackEvent, trackFieldFocus, trackFieldBlur } = usePageTracking({ trackFields: true, userId });
 */
export function usePageTracking(options: UsePageTrackingOptions = {}) {
  const { trackFields = false, userId } = options;
  const sessionIdRef   = useRef<string | null>(null);
  const startTimeRef   = useRef<number>(Date.now());
  const maxScrollRef   = useRef<number>(0);
  const formAbandoned  = useRef<boolean>(false);

  const pageUrl = options.pageUrl ?? (typeof window !== "undefined" ? window.location.href : "/");

  // ── Start session ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const referrer   = document.referrer || undefined;
    const userAgent  = navigator.userAgent;
    const deviceType = /Mobi|Android/i.test(userAgent) ? "mobile" : "desktop";

    let cancelled = false;

    fetch("/api/track/session", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, pageUrl, referrer, deviceType, userAgent }),
    })
      .then((r) => r.json())
      .then((json: { sessionId?: string }) => {
        if (!cancelled && json.sessionId) {
          sessionIdRef.current = json.sessionId;
          startTimeRef.current = Date.now();
        }
      })
      .catch(() => { /* silently ignore tracking errors */ });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Scroll tracking ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => {
      const scrolled = Math.round(
        ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
      );
      if (scrolled > maxScrollRef.current) maxScrollRef.current = scrolled;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── End session on unmount ───────────────────────────────────────
  useEffect(() => {
    return () => {
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;

      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

      // Use sendBeacon for reliability during page unload
      const payload = JSON.stringify({
        sessionId,
        exitUrl:         window.location.href,
        durationSeconds,
        maxScrollDepth:  maxScrollRef.current,
        formAbandoned:   formAbandoned.current,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track/session", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/track/session", {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    payload,
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, []);

  // ── Field tracking helpers ───────────────────────────────────────
  const trackEvent = useCallback((eventType: string, eventTarget?: string, metadata?: Record<string, unknown>) => {
    fetch("/api/track/event", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionIdRef.current,
        userId,
        eventType,
        eventTarget,
        metadata,
      }),
    }).catch(() => {});
  }, [userId]);

  const trackFieldFocus = useCallback((fieldName: string) => {
    if (!trackFields) return;
    trackEvent("field_focus", fieldName);
  }, [trackFields, trackEvent]);

  const trackFieldBlur = useCallback((fieldName: string, abandoned = false) => {
    if (!trackFields) return;
    if (abandoned) formAbandoned.current = true;
    trackEvent("field_blur", fieldName, { abandoned });
  }, [trackFields, trackEvent]);

  const markFormAbandoned = useCallback(() => {
    formAbandoned.current = true;
  }, []);

  return { trackEvent, trackFieldFocus, trackFieldBlur, markFormAbandoned };
}
