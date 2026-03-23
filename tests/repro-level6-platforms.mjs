import assert from 'node:assert/strict'
import { bootGame, launchBrowserPage, startScene } from './browserHarness.mjs'

const { browser, page } = await launchBrowserPage()

try {
  await bootGame(page)
  await startScene(page, 'Level6Scene')

  const results = await page.evaluate(async () => {
    const scene = window.__game.scene.getScene('Level6Scene')
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
    const player = scene.player
    const activeEnemies = scene.enemies.children.entries.filter((enemy) => enemy.active && enemy !== scene.painBoss)

    activeEnemies.slice(1).forEach((enemy) => enemy.destroy())

    const landingChecks = []

    const getTargets = () => ([
      ...scene.floatingPlatforms.getChildren().map((platform, index) => ({
        label: `floating-${index}`,
        body: platform.body,
        x: platform.x,
      })),
      ...scene.approachPlatforms.getChildren().map((platform, index) => ({
        label: `approach-${index}`,
        body: platform.body,
        x: platform.x,
      })),
      {
        label: 'boss-arena',
        body: scene.bossArenaVisual.body,
        x: scene.bossArenaVisual.x,
      },
    ])

    for (const target of getTargets()) {
      player.setPosition(target.x, target.body.top - player.body.halfHeight - 2)
      player.body.setVelocity(0, 0)
      await wait(target.label.startsWith('floating-') ? 300 : 700)

      landingChecks.push({
        label: target.label,
        blockedDown: player.body.blocked.down,
        touchingDown: player.body.touching.down,
        supportGap: player.body.bottom - target.body.top,
        overlapWidth: Math.min(player.body.right, target.body.right) - Math.max(player.body.left, target.body.left),
      })
    }

    const movingPlatform = scene.movingPlatforms[0]
    player.setPosition(movingPlatform.collider.x, movingPlatform.collider.body.top - player.body.halfHeight - 2)
    player.body.setVelocity(0, 0)
    await wait(300)

    const initialRelativeX = player.x - movingPlatform.collider.x
    const initialPlayerX = player.x
    const initialPlatformX = movingPlatform.collider.x
    await wait(1400)

    const enemy = activeEnemies[0]
    const enemySupport = scene.approachPlatforms.getChildren()[1]
    enemy.setPosition(enemySupport.x, enemySupport.body.top - enemy.body.halfHeight - 6)
    enemy.body.setVelocity(0, 0)
    await wait(900)

    return {
      landingChecks,
      movingPlatform: {
        platformDeltaX: movingPlatform.collider.x - initialPlatformX,
        playerDeltaX: player.x - initialPlayerX,
        relativeShift: Math.abs((player.x - movingPlatform.collider.x) - initialRelativeX),
        blockedDown: player.body.blocked.down,
      },
      enemySupport: {
        blockedDown: enemy.body.blocked.down,
        canAdvanceRight: enemy.canAdvance('right'),
      },
    }
  })

  console.log('Level6 platform repro:', JSON.stringify(results, null, 2))

  for (const landing of results.landingChecks) {
    const hasGeometricSupport = Math.abs(landing.supportGap) <= 4 && landing.overlapWidth > 20
    assert.equal(
      landing.blockedDown || landing.touchingDown || hasGeometricSupport,
      true,
      `${landing.label} should support the player`
    )
    assert.ok(Math.abs(landing.supportGap) <= 10, `${landing.label} support gap should stay tight`)
    assert.ok(landing.overlapWidth > 20, `${landing.label} should overlap the player horizontally`)
  }

  assert.ok(Math.abs(results.movingPlatform.platformDeltaX) >= 12, 'moving platform should actually move during the carry check')
  assert.equal(results.movingPlatform.blockedDown, true, 'player should remain grounded on the moving platform')
  assert.ok(
    Math.abs(results.movingPlatform.playerDeltaX) >= Math.abs(results.movingPlatform.platformDeltaX) * 0.6,
    'player should be carried by the moving platform'
  )
  assert.ok(results.movingPlatform.relativeShift <= 24, 'player should stay aligned to the moving platform')

  assert.equal(results.enemySupport.canAdvanceRight, true, 'enemy support detection should include custom platforms')
} finally {
  await browser.close()
}
