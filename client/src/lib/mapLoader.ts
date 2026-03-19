/// <reference types="@types/google.maps" />

declare global {
  interface Window {
    google?: typeof google;
    gm_authFailure?: () => void;
  }
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let _mapsLoadPromise: Promise<unknown> | null = null;
let _authFailureReject: ((err: Error) => void) | null = null;

// Google Maps calls this global when the key is invalid or referrer is blocked
window.gm_authFailure = () => {
  _mapsLoadPromise = null;
  if (_authFailureReject) {
    _authFailureReject(
      new Error(
        "Google Maps failed to authenticate. The API key may be restricted — ensure this domain is allowed in your Google Cloud Console key settings."
      )
    );
    _authFailureReject = null;
  }
};

export function loadMapScript() {
  if (!API_KEY) {
    return Promise.reject(new Error("VITE_GOOGLE_MAPS_API_KEY is not set"));
  }
  if (window.google?.maps) return Promise.resolve(null);
  if (_mapsLoadPromise) return _mapsLoadPromise;
  _mapsLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(null); return; }
    _authFailureReject = reject;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geometry`;
    script.async = true;
    script.onload = () => {
      _authFailureReject = null;
      resolve(null);
    };
    script.onerror = () => {
      _mapsLoadPromise = null;
      _authFailureReject = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });
  return _mapsLoadPromise;
}
