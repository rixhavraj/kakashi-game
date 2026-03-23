const COARSE_POINTER_QUERY = "(pointer: coarse)"
const MAX_MOBILE_VIEWPORT_EDGE = 1100
const MOBILE_USER_AGENT_PATTERN =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Silk|Kindle/i

function getNavigator() {
  if (typeof navigator !== "undefined") {
    return navigator
  }

  return undefined
}

function getMaxTouchPoints() {
  const nav = getNavigator()
  return Number(nav?.maxTouchPoints ?? nav?.msMaxTouchPoints ?? 0)
}

function hasMobileUserAgent() {
  const nav = getNavigator()
  return MOBILE_USER_AGENT_PATTERN.test(nav?.userAgent ?? "")
}

export function isTouchDevice() {
  if (typeof window === "undefined") {
    return false
  }

  const hasCoarsePointer = Boolean(window.matchMedia?.(COARSE_POINTER_QUERY).matches)
  const hasTouchEventSupport = "ontouchstart" in window

  return hasCoarsePointer || hasTouchEventSupport || getMaxTouchPoints() > 0
}

export function isMobileDevice() {
  if (typeof window === "undefined") {
    return false
  }

  const minViewportEdge = Math.min(window.innerWidth, window.innerHeight)
  return hasMobileUserAgent() || (isTouchDevice() && minViewportEdge <= MAX_MOBILE_VIEWPORT_EDGE)
}

export function isPortraitViewport() {
  if (typeof window === "undefined") {
    return false
  }

  return window.innerHeight > window.innerWidth
}
