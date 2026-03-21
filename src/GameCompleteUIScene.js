import Phaser from 'phaser'
import { screenSize } from './gameConfig.json'
import { isMobileDevice } from './device.js'

export class GameCompleteUIScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameCompleteUIScene",
    })
  }

  init(data) {
    this.currentLevelKey = data.currentLevelKey
  }

  create() {
    this.isReturningToMenu = false
    this.isMobile = isMobileDevice()

    this.scene.pause(this.currentLevelKey)

    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value

    this.add.rectangle(screenWidth / 2, screenHeight / 2, screenWidth, screenHeight, 0x000000, 0.88)

    this.completeText = this.add.text(screenWidth / 2, 72, 'GAME COMPLETE!', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '54px',
      fill: '#ffd700',
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center',
    }).setOrigin(0.5, 0)

    this.subtitleText = this.add.text(screenWidth / 2, 138, 'END CREDITS', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5, 0)

    this.add.rectangle(screenWidth / 2, screenHeight / 2, screenWidth * 0.72, screenHeight * 0.58, 0xffffff, 0.06)
      .setStrokeStyle(2, 0xffffff, 0.18)

    this.skipText = this.add.text(
      screenWidth / 2,
      screenHeight - 56,
      this.isMobile ? 'TAP TO SKIP CREDITS' : 'PRESS ENTER OR SPACE TO SKIP CREDITS',
      {
        fontFamily: 'RetroPixel, monospace',
        fontSize: '22px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
      }
    ).setOrigin(0.5, 0.5)

    this.tweens.add({
      targets: this.skipText,
      alpha: 0.35,
      duration: 900,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    })

    this.createCreditsRoll(screenWidth, screenHeight)

    this.tweens.add({
      targets: this.completeText,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    })

    this.input.once('pointerdown', () => {
      this.returnToMenu()
    })

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  }

  createCreditsRoll(screenWidth, screenHeight) {
    const credits = [
      { text: 'KAKASHI GAME', size: '32px', color: '#ffd700', spacingAfter: 44 },
      { text: 'Created By', size: '22px', color: '#ffffff', spacingAfter: 10 },
      { text: 'Rixhavraj', size: '28px', color: '#7dd3fc', spacingAfter: 34 },
      { text: 'Gameplay Updates', size: '22px', color: '#ffffff', spacingAfter: 10 },
      { text: 'zabishh', size: '28px', color: '#7dd3fc', spacingAfter: 34 },
      { text: 'Built With', size: '22px', color: '#ffffff', spacingAfter: 10 },
      { text: 'Phaser 3 + Vite', size: '26px', color: '#86efac', spacingAfter: 34 },
      { text: 'Special Thanks', size: '22px', color: '#ffffff', spacingAfter: 10 },
      { text: 'Everyone who played the game', size: '24px', color: '#f9fafb', spacingAfter: 34 },
      { text: 'Thank you for playing.', size: '26px', color: '#ffd700', spacingAfter: 0 },
    ]

    this.creditsContainer = this.add.container(screenWidth / 2, screenHeight + 120)

    let offsetY = 0
    credits.forEach((entry) => {
      const creditLine = this.add.text(0, offsetY, entry.text, {
        fontFamily: 'RetroPixel, monospace',
        fontSize: entry.size,
        fill: entry.color,
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
      }).setOrigin(0.5, 0)

      this.creditsContainer.add(creditLine)
      offsetY += creditLine.height + entry.spacingAfter
    })

    const duration = Math.max(18000, credits.length * 2200)
    this.creditsContainer.y = screenHeight + 120

    this.creditTween = this.tweens.add({
      targets: this.creditsContainer,
      y: -offsetY - 120,
      duration,
      ease: 'Linear',
      onComplete: () => {
        this.skipText.setText(this.isMobile ? 'TAP TO RETURN TO MENU' : 'PRESS ENTER OR SPACE TO RETURN TO MENU')
      },
    })
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.returnToMenu()
    }
  }

  returnToMenu() {
    if (this.isReturningToMenu) {
      return
    }

    this.isReturningToMenu = true

    if (this.creditTween) {
      this.creditTween.stop()
    }

    const currentScene = this.scene.get(this.currentLevelKey)
    if (currentScene?.backgroundMusic) {
      currentScene.backgroundMusic.stop()
    }

    this.sound.play("ui_click_sound", { volume: 0.3 })

    this.scene.stop(this.currentLevelKey)
    this.scene.stop("UIScene")
    this.scene.stop()
    this.scene.start("TitleScreen")
  }
}
