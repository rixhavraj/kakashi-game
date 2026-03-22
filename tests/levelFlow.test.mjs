import test from 'node:test'
import assert from 'node:assert/strict'

import {
  LEVEL_ORDER,
  getLevelNumberFromSceneKey,
  getNextLevelSceneKey,
  getVictoryUiContent,
  isLastLevelSceneKey,
} from '../src/levelFlow.mjs'

test('level order includes level 7 as the final level', () => {
  assert.equal(LEVEL_ORDER.at(-1), 'Level7Scene')
})

test('level 4 progresses into level 5', () => {
  assert.equal(getNextLevelSceneKey('Level4Scene'), 'Level5Scene')
  assert.equal(isLastLevelSceneKey('Level4Scene'), false)
})

test('level 5 leads into the deeper stages', () => {
  assert.equal(getNextLevelSceneKey('Level5Scene'), 'Level6Scene')
  assert.equal(isLastLevelSceneKey('Level5Scene'), false)
})

test('level 6 progresses into the new finale', () => {
  assert.equal(getNextLevelSceneKey('Level6Scene'), 'Level7Scene')
  assert.equal(isLastLevelSceneKey('Level6Scene'), false)
})

test('level 7 is treated as the final level', () => {
  assert.equal(getNextLevelSceneKey('Level7Scene'), null)
  assert.equal(isLastLevelSceneKey('Level7Scene'), true)
})

test('victory UI content changes for the final level', () => {
  const level6Content = getVictoryUiContent('Level6Scene', false)
  const level7Content = getVictoryUiContent('Level7Scene', false)

  assert.equal(level6Content.headline, 'STAGE CLEAR!')
  assert.equal(level6Content.promptText, 'PRESS ENTER FOR NEXT STAGE')
  assert.equal(level6Content.nextLevelKey, 'Level7Scene')

  assert.equal(level7Content.headline, 'VICTORY!')
  assert.equal(level7Content.promptText, 'PRESS ENTER TO RETURN TO MENU')
  assert.equal(level7Content.nextLevelKey, null)
  assert.equal(level7Content.subheading, 'Level 7 complete. Peace restored to the Hidden Leaf!')
})

test('level number is derived from the scene key', () => {
  assert.equal(getLevelNumberFromSceneKey('Level7Scene'), 7)
  assert.equal(getLevelNumberFromSceneKey('UnknownScene'), 1)
})
