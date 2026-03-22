import Phaser from "phaser"
import { screenSize, debugConfig, renderConfig } from "./gameConfig.json"

// Import scenes
import { InitialLoadingScene } from './InitialLoadingScene.js'
import { TitleScreen } from './TitleScreen.js'
import { Level1Scene } from './Level1Scene.js'
import { Level2Scene } from './Level2Scene.js'
import { Level3Scene } from './Level3Scene.js'
import { Level4Scene } from './Level4Scene.js'
import { Level5Scene } from './Level5Scene.js'
import { Level6Scene } from './Level6Scene.js'
import { Level7Scene } from './Level7Scene.js'

import { UIScene } from './UIScene.js'
import { GameOverUIScene } from './GameOverUIScene.js'
import { VictoryUIScene } from './VictoryUIScene.js'
import { GameCompleteUIScene } from './GameCompleteUIScene.js'

const MIN_VIEWPORT = { width: 640, height: 360 }

function getViewportSize() {
  const width = Math.max(window.innerWidth || 0, MIN_VIEWPORT.width)
  const height = Math.max(window.innerHeight || 0, MIN_VIEWPORT.height)
  return { width, height }
}

const initialViewport = getViewportSize()
screenSize.width.value = initialViewport.width
screenSize.height.value = initialViewport.height

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: screenSize.width.value,
  height: screenSize.height.value,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 6,
  },
  physics: {
    default: "arcade",
    arcade: {
      fps: 120,
      gravity: { y: 0 }, // Default no gravity
      debug: debugConfig.debug.value,
      debugShowBody: debugConfig.debugShowBody.value,
      debugShowStaticBody: debugConfig.debugShowStaticBody.value,
      debugShowVelocity: debugConfig.debugShowVelocity.value,
    },
  },
  pixelArt: renderConfig.pixelArt.value,
  scene: [InitialLoadingScene, TitleScreen,
    Level1Scene, 
    Level2Scene, 
    Level3Scene,
    Level4Scene,
    Level5Scene,
    Level6Scene,
    Level7Scene,
    UIScene,
    VictoryUIScene,
    GameCompleteUIScene,
    GameOverUIScene],
}

const game = new Phaser.Game(config)

function handleResize() {
  const viewport = getViewportSize()
  screenSize.width.value = viewport.width
  screenSize.height.value = viewport.height
  game.scale.resize(viewport.width, viewport.height)
  if (game.canvas) {
    game.canvas.style.width = "100%"
    game.canvas.style.height = "100%"
  }
}

window.addEventListener("resize", handleResize)

export default game
