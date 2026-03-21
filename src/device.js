const COARSE_POINTER_QUERY = "(pointer: coarse)"
const MAX_MOBILE_VIEWPORT_EDGE = 900

export function isTouchDevice() {
  if (typeof window === "undefined") {
    return false
  }

  return Boolean(window.matchMedia?.(COARSE_POINTER_QUERY).matches)
}

export function isMobileDevice() {
  if (typeof window === "undefined") {
    return false
  }

  const minViewportEdge = Math.min(window.innerWidth, window.innerHeight)
  return isTouchDevice() && minViewportEdge <= MAX_MOBILE_VIEWPORT_EDGE
}

export function isPortraitViewport() {
  if (typeof window === "undefined") {
    return false
  }

  return window.innerHeight > window.innerWidth
}
