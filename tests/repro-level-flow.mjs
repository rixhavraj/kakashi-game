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

async function waitForScene(sceneKey, timeout = 30000) {
  await page.waitForFunction((key) => window.__game?.scene?.isActive(key) === true, sceneKey, {
    timeout,
  })
}

async function startScene(sceneKey) {
  await page.evaluate((key) => {
    const game = window.__game
    for (const scene of game.scene.getScenes(true)) {
      game.scene.stop(scene.sys.settings.key)
    }
    game.scene.start(key)
  }, sceneKey)
  await waitForScene(sceneKey)
  console.log(`${sceneKey} active`)
}

async function clearSceneEnemies(sceneKey) {
  await page.evaluate((key) => {
    const game = window.__game
    const scene = game.scene.getScene(key)
    scene.enemies.children.entries.slice().forEach((enemy) => enemy.destroy())
    scene.checkEnemiesDefeated()
  }, sceneKey)
}

async function advanceVictory(expectedLevelKey, expectedNextLevelKey, expectedHeadline = 'STAGE CLEAR!') {
  await waitForScene('VictoryUIScene', 10000)

  const victoryState = await page.evaluate(() => {
    const game = window.__game
    const victory = game.scene.getScene('VictoryUIScene')
    return {
      activeScenes: game.scene.getScenes(true).map((scene) => scene.sys.settings.key),
      currentLevelKey: victory.currentLevelKey,
      isLastLevel: victory.isLastLevel,
      nextLevelKey: victory.nextLevelKey,
      promptText: victory.nextLevelText?.text ?? null,
      headline: victory.victoryText?.text ?? null,
    }
  })

  console.log('Victory state:', JSON.stringify(victoryState, null, 2))

  if (victoryState.currentLevelKey !== expectedLevelKey) {
    throw new Error(`Expected VictoryUIScene currentLevelKey=${expectedLevelKey}, got ${victoryState.currentLevelKey}`)
  }

  if (victoryState.nextLevelKey !== expectedNextLevelKey) {
    throw new Error(`Expected VictoryUIScene nextLevelKey=${expectedNextLevelKey}, got ${victoryState.nextLevelKey}`)
  }

  if (victoryState.headline !== expectedHeadline) {
    throw new Error(`Expected VictoryUIScene headline=${expectedHeadline}, got ${victoryState.headline}`)
  }

  await page.click('canvas')
  await page.keyboard.press('Enter')
}

try {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  await page.evaluate(async () => {
    window.__game = (await import('/src/main.js')).default
  })

  await waitForScene('TitleScreen')
  console.log('TitleScreen active')
  await startScene('Level5Scene')
  await clearSceneEnemies('Level5Scene')
  await advanceVictory('Level5Scene', 'Level6Scene')
  await waitForScene('Level6Scene', 10000)
  console.log('Transitioned to Level6Scene')

  await clearSceneEnemies('Level6Scene')
  await advanceVictory('Level6Scene', 'Level7Scene')
  await waitForScene('Level7Scene', 10000)
  const level7State = await page.evaluate(() => {
    const level7 = window.__game.scene.getScene('Level7Scene')
    return {
      groundLayerName: level7.groundLayer?.layer?.name ?? null,
      enemyCount: level7.enemies?.children?.entries?.filter((enemy) => enemy.active).length ?? null,
    }
  })
  if (level7State.groundLayerName !== 'Ground') {
    throw new Error(`Expected Level7Scene ground layer to load, got ${level7State.groundLayerName}`)
  }
  console.log('Transitioned to Level7Scene')

  await clearSceneEnemies('Level7Scene')
  await advanceVictory('Level7Scene', null, 'VICTORY!')
  await waitForScene('TitleScreen', 10000)
  console.log('Returned to TitleScreen after level 7 victory')
} finally {
  await browser.close()
}
