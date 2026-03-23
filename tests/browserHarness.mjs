import { chromium } from 'playwright-core'

export const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
export const BASE_URL = 'http://127.0.0.1:4175/'

export async function launchBrowserPage() {
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  })

  const context = await browser.newContext()
  const page = await context.newPage()

  page.on('console', (message) => {
    console.log(`[browser:${message.type()}] ${message.text()}`)
  })

  page.on('pageerror', (error) => {
    console.error(`[pageerror] ${error.message}`)
  })

  return { browser, context, page }
}

export async function waitForScene(page, sceneKey, timeout = 30000) {
  await page.waitForFunction((key) => window.__game?.scene?.isActive(key) === true, sceneKey, {
    timeout,
  })
}

export async function ensureAssetsLoaded(page, timeout = 120000) {
  await page.waitForFunction(() => {
    const game = window.__game
    return Boolean(
      game?.textures?.exists('game_title') &&
      game.textures.exists('forest_background') &&
      game.textures.exists('forest_ground') &&
      game.cache?.tilemap?.exists('level6_map') &&
      game.cache.tilemap.exists('level7_map') &&
      game.cache?.audio?.exists('ninja_adventure_theme') &&
      game.cache.audio.exists('ui_click_sound')
    )
  }, null, { timeout })
}

export async function bootGame(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => Boolean(window.__game), null, { timeout: 30000 })

  try {
    await ensureAssetsLoaded(page, 45000)
  } catch (error) {
    await page.evaluate(() => {
      const game = window.__game
      for (const scene of game.scene.getScenes(true)) {
        game.scene.stop(scene.sys.settings.key)
      }
      game.scene.start('InitialLoadingScene')
    })
    await ensureAssetsLoaded(page)
  }

  await page.evaluate(() => {
    const game = window.__game
    if (!game.scene.isActive('TitleScreen')) {
      for (const scene of game.scene.getScenes(true)) {
        game.scene.stop(scene.sys.settings.key)
      }
      game.scene.start('TitleScreen')
    }
  })

  await waitForScene(page, 'TitleScreen')
  console.log('TitleScreen active')
}

export async function startScene(page, sceneKey) {
  await page.evaluate((key) => {
    const game = window.__game
    for (const scene of game.scene.getScenes(true)) {
      game.scene.stop(scene.sys.settings.key)
    }
    game.scene.start(key)
  }, sceneKey)

  await waitForScene(page, sceneKey)
  console.log(`${sceneKey} active`)
}
