/**
 * The globals gtag.js installs. Declared rather than pulled from @types/gtag.js
 * so the analytics components have types without another dependency.
 */
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export {};
