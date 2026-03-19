/// <reference types="@types/google.maps" />

declare global {
  interface Window {
    google?: typeof google;
    gm_authFailure?: () => void;
  }
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let _mapsLoadPromise: Promise<unknown> | null = null;
let _authFailed = false;

export const MAPS_AUTH_FAILURE_EVENT = "maps:auth-failure";

const AUTH_ERROR_MSG =
  "Google Maps API key is restricted for this domain. Please allow this domain in your Google Cloud Console key settings, or remove referrer restrictions for development.";

// Google Maps calls this global when the key is invalid or referrer is blocked.
// This fires AFTER the script loads, so we dispatch a custom event instead of
// relying on a stored reject callback (which is already cleared by then).
window.gm_authFailure = () => {
  _authFailed = true;
  _mapsLoadPromise = null;
  window.dispatchEvent(new CustomEvent(MAPS_AUTH_FAILURE_EVENT, { detail: AUTH_ERROR_MSG }));
};

// Google Maps throws a non-Error object for RefererNotAllowedMapError, which
// the runtime reports as an uncaught exception and crashes the app. Intercept
// it in the capture phase and prevent it from propagating.
window.addEventListener(
  "error",
  (e) => {
    // Google Maps auth errors are non-Error objects (e.error is undefined/null)
    // fired synchronously during Maps API initialization.
    if (!e.error && (e.message === "" || e.message === undefined)) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  },
  true // capture phase — runs before React's error boundary
);

export function isMapsAuthFailed(): boolean {
  return _authFailed;
}

export function loadMapScript(): Promise<unknown> {
  if (_authFailed) {
    return Promise.reject(new Error(AUTH_ERROR_MSG));
  }
  if (!API_KEY) {
    return Promise.reject(new Error("VITE_GOOGLE_MAPS_API_KEY is not set"));
  }
  if (window.google?.maps) return Promise.resolve(null);
  if (_mapsLoadPromise) return _mapsLoadPromise;

  _mapsLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(null); return; }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geometry`;
    script.async = true;
    script.onload = () => resolve(null);
    script.onerror = () => {
      _mapsLoadPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  return _mapsLoadPromise;
}
