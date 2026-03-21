import test from 'node:test'
import assert from 'node:assert/strict'

import {
  LEVEL_ORDER,
  getLevelNumberFromSceneKey,
  getNextLevelSceneKey,
  getVictoryUiContent,
  isLastLevelSceneKey,
} from '../src/levelFlow.mjs'

test('level order includes level 5 as the final level', () => {
  assert.equal(LEVEL_ORDER.at(-1), 'Level5Scene')
})

test('level 4 progresses into level 5', () => {
  assert.equal(getNextLevelSceneKey('Level4Scene'), 'Level5Scene')
  assert.equal(isLastLevelSceneKey('Level4Scene'), false)
})

test('level 5 is treated as the final level', () => {
  assert.equal(getNextLevelSceneKey('Level5Scene'), null)
  assert.equal(isLastLevelSceneKey('Level5Scene'), true)
})

test('victory UI content changes for the final level', () => {
  const level4Content = getVictoryUiContent('Level4Scene', false)
  const level5Content = getVictoryUiContent('Level5Scene', false)

  assert.equal(level4Content.headline, 'STAGE CLEAR!')
  assert.equal(level4Content.promptText, 'PRESS ENTER FOR NEXT STAGE')
  assert.equal(level4Content.nextLevelKey, 'Level5Scene')

  assert.equal(level5Content.headline, 'VICTORY!')
  assert.equal(level5Content.promptText, 'PRESS ENTER TO RETURN TO MENU')
  assert.equal(level5Content.nextLevelKey, null)
})

test('level number is derived from the scene key', () => {
  assert.equal(getLevelNumberFromSceneKey('Level5Scene'), 5)
  assert.equal(getLevelNumberFromSceneKey('UnknownScene'), 1)
})
