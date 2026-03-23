import { bootGame, launchBrowserPage, startScene, waitForScene } from './browserHarness.mjs'

const { browser, page } = await launchBrowserPage()

async function clearSceneEnemies(sceneKey) {
  await page.evaluate((key) => {
    const game = window.__game
    const scene = game.scene.getScene(key)
    scene.enemies.children.entries.slice().forEach((enemy) => enemy.destroy())
    scene.checkEnemiesDefeated()
  }, sceneKey)
}

async function advanceVictory(expectedLevelKey, expectedNextLevelKey, expectedHeadline = 'STAGE CLEAR!') {
  await waitForScene(page, 'VictoryUIScene', 10000)

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
  await page.waitForTimeout(500)
}

async function returnFromGameComplete() {
  await waitForScene(page, 'GameCompleteUIScene', 10000)
  await page.click('canvas')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(500)
}

try {
  await bootGame(page)
  await startScene(page, 'Level4Scene')

  await clearSceneEnemies('Level4Scene')
  await advanceVictory('Level4Scene', 'Level5Scene')
  await waitForScene(page, 'Level5Scene', 10000)
  console.log('Transitioned to Level5Scene')

  await clearSceneEnemies('Level5Scene')
  await advanceVictory('Level5Scene', 'Level6Scene')
  await waitForScene(page, 'Level6Scene', 10000)
  console.log('Transitioned to Level6Scene')

  await clearSceneEnemies('Level6Scene')
  await advanceVictory('Level6Scene', 'Level7Scene')
  await waitForScene(page, 'Level7Scene', 10000)
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
  await advanceVictory('Level7Scene', null, 'FINAL STAGE CLEAR!')
  await returnFromGameComplete()
  await waitForScene(page, 'TitleScreen', 10000)
  console.log('Returned to TitleScreen after level 7 completion')
} finally {
  await browser.close()
}
