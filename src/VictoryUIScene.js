import Phaser from 'phaser'
import { screenSize } from './gameConfig.json'
import { isMobileDevice } from './device.js'
import { getVictoryUiContent } from './levelFlow.mjs'

export class VictoryUIScene extends Phaser.Scene {
  constructor() {
    super({
      key: "VictoryUIScene",
    })
  }

  init(data) {
    this.currentLevelKey = data.currentLevelKey
    this.nextSceneKeyOverride = data?.nextSceneKeyOverride ?? null
    this.isFinalLevel = this.nextSceneKeyOverride === "GameCompleteUIScene"
  }

  create() {
    this.isTransitioning = false
    this.isMobile = isMobileDevice()
    this.currentScene = this.scene.get(this.currentLevelKey)
    const victoryContent = getVictoryUiContent(this.currentLevelKey, this.isMobile)
    this.isLastLevel = victoryContent.isLastLevel
    this.nextLevelKey = victoryContent.nextLevelKey

    // Pause main game scene
    this.scene.pause(this.currentLevelKey)
    
    // Create semi-transparent black overlay
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    this.add.rectangle(screenWidth / 2, screenHeight / 2, screenWidth, screenHeight, 0x000000, 0.7)
    
    const headline = victoryContent.headline
    const headlineColor = victoryContent.headlineColor
    const promptText = victoryContent.promptText
    const subheading = victoryContent.subheading
    
    // Victory text
<<<<<<< HEAD
    this.victoryText = this.add.text(screenWidth / 2, screenHeight / 2 - 50, this.isFinalLevel ? 'FINAL STAGE CLEAR!' : 'STAGE CLEAR!', {
=======
    this.victoryText = this.add.text(screenWidth / 2, screenHeight / 2 - (this.isLastLevel ? 90 : 50), headline, {
>>>>>>> d5ccfcceaeea4153817e189d8df5fa4011f90ad4
      fontFamily: 'RetroPixel, monospace',
      fontSize: '64px',
      fill: headlineColor,
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5, 0.5)

    if (subheading) {
      this.subheadingText = this.add.text(screenWidth / 2, screenHeight / 2 - 10, subheading, {
        fontFamily: 'RetroPixel, monospace',
        fontSize: '32px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      }).setOrigin(0.5, 0.5)
    }
    
    const ctaText = this.isFinalLevel
      ? (this.isMobile ? 'TAP TO VIEW ENDING' : 'PRESS ENTER TO VIEW ENDING')
      : (this.isMobile ? 'TAP FOR NEXT STAGE' : 'PRESS ENTER FOR NEXT STAGE')

    // Next level prompt
<<<<<<< HEAD
    this.nextLevelText = this.add.text(screenWidth / 2, screenHeight / 2 + 50, ctaText, {
=======
    this.nextLevelText = this.add.text(screenWidth / 2, screenHeight / 2 + 70, promptText, {
>>>>>>> d5ccfcceaeea4153817e189d8df5fa4011f90ad4
      fontFamily: 'RetroPixel, monospace',
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5, 0.5)
    
    // Add blinking animation
    this.tweens.add({
      targets: this.nextLevelText,
      alpha: 0.3,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })

    this.nextLevelButton = this.add.rectangle(screenWidth / 2, screenHeight / 2 + 70, 450, 64, 0xffffff, 0.12)
      .setStrokeStyle(3, 0xffffff, 0.45)
      .setInteractive()
    this.nextLevelButton.on('pointerdown', () => {
      this.goToNextLevel()
    })

    this.nextLevelText.setDepth(this.nextLevelButton.depth + 1)
    this.nextLevelText.setInteractive()
    this.nextLevelText.on('pointerdown', () => {
      this.goToNextLevel()
    })
    
    // Setup input listeners
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.onKeyDown = (event) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        this.goToNextLevel()
      }
    }
    this.input.keyboard.on('keydown', this.onKeyDown)
    this.nativeKeyDown = (event) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        this.goToNextLevel()
      }
    }
    window.addEventListener('keydown', this.nativeKeyDown)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.onKeyDown)
      window.removeEventListener('keydown', this.nativeKeyDown)
    })
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.goToNextLevel()
    }
  }

  goToNextLevel() {
    if (this.isTransitioning) {
      return
    }

    this.isTransitioning = true

    if (this.currentScene?.backgroundMusic) {
      this.currentScene.backgroundMusic.stop()
    }

    // Play click sound effect
    this.sound.play("ui_click_sound", { volume: 0.3 })

    // Handle final level override (launch credits UI instead of another level)
    if (this.nextSceneKeyOverride === "GameCompleteUIScene") {
      this.scene.stop("UIScene")
      this.scene.launch("GameCompleteUIScene", {
        currentLevelKey: this.currentLevelKey,
      })
      this.scene.stop()
      return
    }
    
<<<<<<< HEAD
    // Get next level
    const nextLevelKey = currentScene?.getNextLevelScene()
    
    if (nextLevelKey) {
=======
    if (this.nextLevelKey) {
>>>>>>> d5ccfcceaeea4153817e189d8df5fa4011f90ad4
      // Stop current scene and start next level
      this.scene.stop(this.currentLevelKey)
      this.scene.stop("UIScene")
      this.scene.start(this.nextLevelKey)
    } else {
      // If no next level, return to title screen
      this.scene.stop(this.currentLevelKey)
      this.scene.stop("UIScene")
      this.scene.start("TitleScreen")
    }
  }
}
