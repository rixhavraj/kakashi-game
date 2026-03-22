import { chromium } from 'playwright-core'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE_URL = 'http://127.0.0.1:4175/'

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

async function waitForScene(sceneKey) {
  await page.waitForFunction((key) => window.__game?.scene?.isActive(key) === true, sceneKey, {
    timeout: 30000,
  })
}

async function fastForwardLevel(sceneKey) {
  await page.evaluate((key) => {
    const game = window.__game
    const scene = game.scene.getScene(key)
    scene.enemies.children.entries.slice().forEach((enemy) => enemy.destroy())
    scene.checkEnemiesDefeated()
  }, sceneKey)

  await page.waitForFunction((key) => {
    const game = window.__game
    if (!game?.scene?.isActive('VictoryUIScene')) return false
    const victory = game.scene.getScene('VictoryUIScene')
    return victory?.currentLevelKey === key
  }, sceneKey, { timeout: 10000 })
}

async function readVictoryState() {
  return page.evaluate(() => {
    const game = window.__game
    const victory = game.scene.getScene('VictoryUIScene')
    return {
      activeScenes: game.scene.getScenes(true).map((scene) => scene.sys.settings.key),
      currentLevelKey: victory?.currentLevelKey ?? null,
      isLastLevel: victory?.isLastLevel ?? false,
      nextLevelKey: victory?.nextLevelKey ?? null,
      promptText: victory?.nextLevelText?.text ?? null,
      headline: victory?.victoryText?.text ?? null,
      subheading: victory?.subheadingText?.text ?? null,
    }
  })
}

async function advanceFromVictory() {
  await page.click('canvas')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(500)
}

try {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  await page.evaluate(async () => {
    window.__game = (await import('/src/main.js')).default
  })

  await waitForScene('TitleScreen')
  console.log('TitleScreen active')

  await page.evaluate(() => {
    const game = window.__game
    game.scene.stop('TitleScreen')
    game.scene.start('Level4Scene')
  })

  await waitForScene('Level4Scene')
  console.log('Level4Scene active')

  await fastForwardLevel('Level4Scene')
  const level4Victory = await readVictoryState()
  console.log('Victory after Level4:', JSON.stringify(level4Victory, null, 2))

  await advanceFromVictory()
  await waitForScene('Level5Scene')
  console.log('Level5Scene active')

  await fastForwardLevel('Level5Scene')
  const level5Victory = await readVictoryState()
  console.log('Victory after Level5:', JSON.stringify(level5Victory, null, 2))

  await advanceFromVictory()
  await waitForScene('Level6Scene')
  console.log('Level6Scene active')

  await fastForwardLevel('Level6Scene')
  const level6Victory = await readVictoryState()
  console.log('Victory after Level6:', JSON.stringify(level6Victory, null, 2))

  await advanceFromVictory()
  await waitForScene('Level7Scene')
  console.log('Level7Scene active')

  await fastForwardLevel('Level7Scene')
  const level7Victory = await readVictoryState()
  console.log('Victory after Level7:', JSON.stringify(level7Victory, null, 2))

  await advanceFromVictory()
  await page.waitForFunction(() => window.__game?.scene?.isActive('GameCompleteUIScene') === true, null, {
    timeout: 10000,
  })
  console.log('GameCompleteUIScene active')

  await advanceFromVictory()
  await waitForScene('TitleScreen')
  console.log('Returned to TitleScreen after Level7 victory')
} finally {
  await browser.close()
}
