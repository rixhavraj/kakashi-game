import Phaser from 'phaser'
import { screenSize } from './gameConfig.json'
import { isMobileDevice } from './device.js'

export class GameOverUIScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameOverUIScene",
    })
  }

  init(data) {
    this.currentLevelKey = data.currentLevelKey
  }

  create() {
    this.isRestarting = false
    this.isMobile = isMobileDevice()

    // Pause main game scene
    this.scene.pause(this.currentLevelKey)
    
    // Create semi-transparent black overlay
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    this.add.rectangle(screenWidth / 2, screenHeight / 2, screenWidth, screenHeight, 0x000000, 0.7)
    
    // Play game over sound effect
    this.sound.play("game_over_sound", { volume: 0.3 })
    
    // Game Over text
    this.gameOverText = this.add.text(screenWidth / 2, screenHeight / 2 - 50, 'GAME OVER', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '64px',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5, 0.5)
    
    // Retry prompt
    this.retryText = this.add.text(screenWidth / 2, screenHeight / 2 + 50, this.isMobile ? 'TAP TO RETRY' : 'PRESS ENTER TO RETRY', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5, 0.5)
    
    // Add blinking animation
    this.tweens.add({
      targets: this.retryText,
      alpha: 0.3,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })

    this.retryButton = this.add.rectangle(screenWidth / 2, screenHeight / 2 + 50, 360, 64, 0xffffff, 0.12)
      .setStrokeStyle(3, 0xffffff, 0.45)
      .setInteractive()
    this.retryButton.on('pointerdown', () => {
      this.restartLevel()
    })

    this.retryText.setDepth(this.retryButton.depth + 1)
    this.retryText.setInteractive()
    this.retryText.on('pointerdown', () => {
      this.restartLevel()
    })
    
    // Setup input listeners
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.restartLevel()
    }
  }

  restartLevel() {
    if (this.isRestarting) {
      return
    }

    this.isRestarting = true

    const currentScene = this.scene.get(this.currentLevelKey)
    if (currentScene?.backgroundMusic) {
      currentScene.backgroundMusic.stop()
    }

    // Play click sound effect
    this.sound.play("ui_click_sound", { volume: 0.3 })
    
    // Stop and restart current level
    this.scene.stop(this.currentLevelKey)
    this.scene.stop("UIScene")
    this.scene.stop()
    this.scene.start(this.currentLevelKey)
  }
}
