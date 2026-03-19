/// <reference types="@types/google.maps" />

declare global {
  interface Window {
    google?: typeof google;
  }
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let _mapsLoadPromise: Promise<unknown> | null = null;

export function loadMapScript() {
  if (window.google?.maps) return Promise.resolve(null);
  if (_mapsLoadPromise) return _mapsLoadPromise;
  _mapsLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(null); return; }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geometry`;
    script.async = true;
    script.onload = () => {
      resolve(null);
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      _mapsLoadPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });
  return _mapsLoadPromise;
}
