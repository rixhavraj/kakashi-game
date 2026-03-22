import Phaser from 'phaser'
import { LEVEL_ORDER } from './levelFlow.mjs'

const isDevBuild = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV
const fallbackHostnames = ['localhost', '127.0.0.1']

function isLevelSkipEnabled() {
  if (isDevBuild) return true
  if (typeof window !== 'undefined') {
    if (fallbackHostnames.includes(window.location.hostname)) return true
    return window.localStorage?.getItem('enableLevelSkip') === 'true'
  }
  return false
}

const registeredScenes = new WeakSet()

export function enableDeveloperLevelSkip(scene) {
  if (!scene || !scene.input?.keyboard) return false
  if (!isLevelSkipEnabled()) return false
  if (registeredScenes.has(scene)) return true

  const handler = (event) => {
    const isTrigger = (event.ctrlKey || event.metaKey) && event.key?.toLowerCase() === 'l'
    if (!isTrigger) return
    event.preventDefault()
    openLevelPrompt(scene)
  }

  scene.input.keyboard.on('keydown', handler)
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.input.keyboard?.off('keydown', handler)
  })

  registeredScenes.add(scene)
  return true
}

function openLevelPrompt(scene) {
  const levelList = LEVEL_ORDER.map((key, idx) => `${idx + 1}. ${key}`).join('\n')
  const response = window.prompt(
    'DEV LEVEL SKIP\nEnter a level number or scene key to jump directly to it:\n' + levelList,
    ''
  )

  if (!response) return
  const trimmed = response.trim()
  let chosenKey = null

  const parsedNumber = Number.parseInt(trimmed, 10)
  if (!Number.isNaN(parsedNumber) && LEVEL_ORDER[parsedNumber - 1]) {
    chosenKey = LEVEL_ORDER[parsedNumber - 1]
  } else {
    chosenKey = LEVEL_ORDER.find((key) => key.toLowerCase() === trimmed.toLowerCase()) ?? null
  }

  if (!chosenKey) {
    console.warn('[DevSkip] Unknown level selection:', response)
    return
  }

  jumpToScene(scene, chosenKey)
}

function jumpToScene(scene, targetKey) {
  const manager = scene.scene
  if (!manager) return

  if (manager.isActive('UIScene')) {
    manager.stop('UIScene')
  }

  const originKey = scene.getSceneKey?.() ?? scene.sys.settings.key
  if (originKey && manager.isActive(originKey)) {
    manager.stop(originKey)
  }

  manager.start(targetKey)
}
