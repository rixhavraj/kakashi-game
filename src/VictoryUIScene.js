import Phaser from 'phaser'
import { BaseLevelScene } from './BaseLevelScene'
import { screenSize } from './gameConfig.json'
import { isMobileDevice } from './device.js'

export class VictoryUIScene extends Phaser.Scene {
  constructor() {
    super({
      key: "VictoryUIScene",
    })
  }

  init(data) {
    this.currentLevelKey = data.currentLevelKey
  }

  create() {
    this.isTransitioning = false
    this.isMobile = isMobileDevice()

    // Pause main game scene
    this.scene.pause(this.currentLevelKey)
    
    // Create semi-transparent black overlay
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    this.add.rectangle(screenWidth / 2, screenHeight / 2, screenWidth, screenHeight, 0x000000, 0.7)
    
    // Victory text
    this.victoryText = this.add.text(screenWidth / 2, screenHeight / 2 - 50, 'STAGE CLEAR!', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '64px',
      fill: '#00ff00',
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5, 0.5)
    
    // Next level prompt
    this.nextLevelText = this.add.text(screenWidth / 2, screenHeight / 2 + 50, this.isMobile ? 'TAP FOR NEXT STAGE' : 'PRESS ENTER FOR NEXT STAGE', {
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

    this.nextLevelButton = this.add.rectangle(screenWidth / 2, screenHeight / 2 + 50, 430, 64, 0xffffff, 0.12)
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

    const currentScene = this.scene.get(this.currentLevelKey)
    if (currentScene?.backgroundMusic) {
      currentScene.backgroundMusic.stop()
    }

    // Play click sound effect
    this.sound.play("ui_click_sound", { volume: 0.3 })
    
    // Get next level
    const nextLevelKey = currentScene.getNextLevelScene()
    
    if (nextLevelKey) {
      // Stop current scene and start next level
      this.scene.stop(this.currentLevelKey)
      this.scene.stop("UIScene")
      this.scene.stop()
      this.scene.start(nextLevelKey)
    } else {
      // If no next level, return to title screen
      this.scene.stop(this.currentLevelKey)
      this.scene.stop("UIScene")
      this.scene.stop()
      this.scene.start("TitleScreen")
    }
  }
}
