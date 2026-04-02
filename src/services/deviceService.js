/**
 * Device detection utilities
 */

/**
 * Returns true if the current device is likely a phone/tablet.
 * Uses both screen width and touch capability.
 */
export function isMobileDevice() {
  return (
    window.innerWidth < 1024 ||
    ('ontouchstart' in window && window.innerWidth < 1280)
  )
}

/**
 * Returns true if the viewport is narrow enough that the map
 * drawing interface would be unusable.
 */
export function isMapUnusable() {
  return window.innerWidth < 768
}
