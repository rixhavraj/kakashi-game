export const LEVEL_ORDER = Object.freeze([
  "Level1Scene",
  "Level2Scene",
  "Level3Scene",
  "Level4Scene",
  "Level5Scene",
  "Level6Scene",
  "Level7Scene",
])

export function getNextLevelSceneKey(currentLevelKey) {
  const currentIndex = LEVEL_ORDER.indexOf(currentLevelKey)
  if (currentIndex < 0 || currentIndex >= LEVEL_ORDER.length - 1) {
    return null
  }

  return LEVEL_ORDER[currentIndex + 1]
}

export function isLastLevelSceneKey(currentLevelKey) {
  return LEVEL_ORDER.indexOf(currentLevelKey) === LEVEL_ORDER.length - 1
}

export function getLevelNumberFromSceneKey(sceneKey) {
  const levelMatch = sceneKey?.match(/\d+/)
  return levelMatch ? Number(levelMatch[0]) : 1
}

export function getVictoryUiContent(currentLevelKey, isMobile) {
  const isLastLevel = isLastLevelSceneKey(currentLevelKey)
  const levelNumber = getLevelNumberFromSceneKey(currentLevelKey)
  let subheading = null

  if (isLastLevel) {
    subheading = levelNumber >= 7
      ? "Level 7 complete. Peace restored to the Hidden Leaf!"
      : `Level ${levelNumber} complete. Congratulations, Ninja!`
  }

  return {
    isLastLevel,
    nextLevelKey: getNextLevelSceneKey(currentLevelKey),
    headline: isLastLevel ? 'VICTORY!' : 'STAGE CLEAR!',
    headlineColor: isLastLevel ? '#ffd700' : '#00ff00',
    promptText: isLastLevel
      ? (isMobile ? 'TAP TO RETURN TO MENU' : 'PRESS ENTER TO RETURN TO MENU')
      : (isMobile ? 'TAP FOR NEXT STAGE' : 'PRESS ENTER FOR NEXT STAGE'),
    subheading,
  }
}
