import test from 'node:test'
import assert from 'node:assert/strict'

import { isMobileDevice, isPortraitViewport, isTouchDevice } from '../src/device.js'

function withMockedBrowserEnvironment({ windowValue, navigatorValue }, fn) {
  const originalWindowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window')
  const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator')

  Object.defineProperty(globalThis, 'window', {
    value: windowValue,
    configurable: true,
    writable: true,
  })

  Object.defineProperty(globalThis, 'navigator', {
    value: navigatorValue,
    configurable: true,
    writable: true,
  })

  try {
    fn()
  } finally {
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, 'window', originalWindowDescriptor)
    } else {
      delete globalThis.window
    }

    if (originalNavigatorDescriptor) {
      Object.defineProperty(globalThis, 'navigator', originalNavigatorDescriptor)
    } else {
      delete globalThis.navigator
    }
  }
}

test('touch detection uses maxTouchPoints as a fallback', () => {
  withMockedBrowserEnvironment(
    {
      windowValue: {
        innerWidth: 430,
        innerHeight: 932,
        matchMedia: () => ({ matches: false }),
      },
      navigatorValue: {
        maxTouchPoints: 5,
        userAgent: 'Mozilla/5.0',
      },
    },
    () => {
      assert.equal(isTouchDevice(), true)
      assert.equal(isMobileDevice(), true)
    }
  )
})

test('tablet-sized touch screens still count as mobile controls targets', () => {
  withMockedBrowserEnvironment(
    {
      windowValue: {
        innerWidth: 1180,
        innerHeight: 820,
        matchMedia: () => ({ matches: true }),
      },
      navigatorValue: {
        maxTouchPoints: 10,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',
      },
    },
    () => {
      assert.equal(isMobileDevice(), true)
      assert.equal(isPortraitViewport(), false)
    }
  )
})

test('desktop browsers remain non-mobile without touch support', () => {
  withMockedBrowserEnvironment(
    {
      windowValue: {
        innerWidth: 1440,
        innerHeight: 900,
        matchMedia: () => ({ matches: false }),
      },
      navigatorValue: {
        maxTouchPoints: 0,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    },
    () => {
      assert.equal(isTouchDevice(), false)
      assert.equal(isMobileDevice(), false)
      assert.equal(isPortraitViewport(), false)
    }
  )
})
