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

try {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  await page.evaluate(async () => {
    window.__game = (await import('/src/main.js')).default
  })

  await page.waitForFunction(() => window.__game?.scene?.isActive('TitleScreen') === true, null, {
    timeout: 30000,
  })

  console.log('TitleScreen active')

  await page.evaluate(() => {
    const game = window.__game
    game.scene.stop('TitleScreen')
    game.scene.start('Level4Scene')
  })

  await page.waitForFunction(() => window.__game?.scene?.isActive('Level4Scene') === true, null, {
    timeout: 30000,
  })

  console.log('Level4Scene active')

  await page.evaluate(() => {
    const game = window.__game
    const level4 = game.scene.getScene('Level4Scene')
    level4.enemies.children.entries.slice().forEach((enemy) => enemy.destroy())
    level4.checkEnemiesDefeated()
  })

  await page.waitForFunction(() => window.__game?.scene?.isActive('VictoryUIScene') === true, null, {
    timeout: 10000,
  })

  const preEnterState = await page.evaluate(() => {
    const game = window.__game
    const victory = game.scene.getScene('VictoryUIScene')
    return {
      activeScenes: game.scene.getScenes(true).map((scene) => scene.sys.settings.key),
      currentLevelKey: victory.currentLevelKey,
      isLastLevel: victory.isLastLevel,
      nextLevelKey: victory.nextLevelKey,
      promptText: victory.nextLevelText?.text ?? null,
    }
  })

  console.log('Victory before Enter:', JSON.stringify(preEnterState, null, 2))

  await page.click('canvas')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(1000)

  const postEnterState = await page.evaluate(() => {
    const game = window.__game
    return {
      activeScenes: game.scene.getScenes(true).map((scene) => scene.sys.settings.key),
      level5Active: game.scene.isActive('Level5Scene'),
      victoryActive: game.scene.isActive('VictoryUIScene'),
    }
  })

  console.log('After Enter:', JSON.stringify(postEnterState, null, 2))

  if (!postEnterState.level5Active) {
    await page.evaluate(() => {
      const game = window.__game
      const victory = game.scene.getScene('VictoryUIScene')
      victory.goToNextLevel()
    })
    await page.waitForTimeout(1000)

    const directTransitionState = await page.evaluate(() => {
      const game = window.__game
      return {
        activeScenes: game.scene.getScenes(true).map((scene) => scene.sys.settings.key),
        level5Active: game.scene.isActive('Level5Scene'),
      }
    })

    console.log('After direct goToNextLevel():', JSON.stringify(directTransitionState, null, 2))
  }

  await page.waitForFunction(() => window.__game?.scene?.isActive('Level5Scene') === true, null, {
    timeout: 10000,
  })

  console.log('Level5Scene active')

  await page.evaluate(() => {
    const game = window.__game
    const level5 = game.scene.getScene('Level5Scene')
    level5.enemies.children.entries.slice().forEach((enemy) => enemy.destroy())
    level5.checkEnemiesDefeated()
  })

  await page.waitForFunction(() => window.__game?.scene?.isActive('VictoryUIScene') === true, null, {
    timeout: 10000,
  })

  const finalVictoryState = await page.evaluate(() => {
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

  console.log('Final victory state:', JSON.stringify(finalVictoryState, null, 2))

  await page.click('canvas')
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => window.__game?.scene?.isActive('TitleScreen') === true, null, {
    timeout: 10000,
  })

  console.log('Returned to TitleScreen after level 5 victory')
} finally {
  await browser.close()
}
