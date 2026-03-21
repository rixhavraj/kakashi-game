import Phaser from 'phaser'
import { BaseLevelScene } from './BaseLevelScene.js'
import { screenSize } from './gameConfig.json'
import { isMobileDevice, isPortraitViewport } from './device.js'

export class UIScene extends Phaser.Scene {
  constructor() {
    super({
      key: "UIScene",
    })

    this.touchPointerBindings = new Map()
  }

  create() {
    this.isMobile = isMobileDevice()
    this.isPortraitBlocked = false

    // Create health bar
    this.createHealthBar()
    
    // Create control hints
    this.createControlsHint()
    
    // Track the currently active level scene dynamically so the health bar
    // follows the active player across all levels and restarts.
    this.gameScene = null
    this.refreshGameScene()

    if (this.isMobile) {
      this.createMobileControls()
      this.createOrientationOverlay()
      this.registerTouchReleaseHandlers()
      this.updateMobileLayout()
    }

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.releaseAllTouchBindings()
    })
  }

  createHealthBar() {
    const screenWidth = screenSize.width.value
    
    // Health bar background
    this.healthBarBg = this.add.graphics()
    this.healthBarBg.fillStyle(0x000000, 0.5)
    this.healthBarBg.fillRect(20, 20, 200, 20)
    
    // Health bar
    this.healthBar = this.add.graphics()
    
    // Health text
    this.healthText = this.add.text(25, 22, 'HEALTH', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '16px',
      fill: '#ffffff'
    })
  }

  createControlsHint() {
    if (this.isMobile) {
      return
    }

    const screenWidth = screenSize.width.value
    
    // Show control hints in top right
    this.controlsHint = this.add.text(screenWidth - 20, 20, 
      'J: Punch  K: Kick  L: Chidori', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '14px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(1, 0)
  }

  updateHealthBar(healthPercentage) {
    // Clear and redraw health bar
    this.healthBar.clear()
    
    // Choose color based on health percentage
    let color = 0x00ff00 // Green
    if (healthPercentage < 30) {
      color = 0xff0000 // Red
    } else if (healthPercentage < 60) {
      color = 0xffff00 // Yellow
    }
    
    this.healthBar.fillStyle(color)
    this.healthBar.fillRect(22, 22, (196 * healthPercentage / 100), 16)
  }

  refreshGameScene() {
    this.gameScene = BaseLevelScene.LEVEL_ORDER
      .map((sceneKey) => this.scene.get(sceneKey))
      .find((scene) => scene && scene.scene.isActive() && scene.player)
      || null
  }

  createMobileControls() {
    this.touchButtons = {}

    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    const dPadBaseX = 170
    const dPadBaseY = screenHeight - 120
    const actionBaseX = screenWidth - 180
    const actionBaseY = screenHeight - 120

    this.touchControlsContainer = this.add.container(0, 0).setDepth(100)

    this.touchButtons.left = this.createControlButton(dPadBaseX - 70, dPadBaseY, 42, '<')
    this.touchButtons.jump = this.createControlButton(dPadBaseX, dPadBaseY - 70, 42, '^')
    this.touchButtons.right = this.createControlButton(dPadBaseX + 70, dPadBaseY, 42, '>')

    this.touchButtons.punch = this.createControlButton(actionBaseX - 95, actionBaseY + 12, 42, 'P')
    this.touchButtons.kick = this.createControlButton(actionBaseX, actionBaseY - 56, 42, 'K')
    this.touchButtons.chidori = this.createControlButton(actionBaseX + 95, actionBaseY + 12, 42, 'C')

    Object.values(this.touchButtons).forEach((button) => {
      this.touchControlsContainer.add(button.background)
      this.touchControlsContainer.add(button.label)
    })

    this.bindHoldButton(this.touchButtons.left, "left")
    this.bindHoldButton(this.touchButtons.jump, "jump")
    this.bindHoldButton(this.touchButtons.right, "right")
    this.bindTapButton(this.touchButtons.punch, "punch")
    this.bindTapButton(this.touchButtons.kick, "kick")
    this.bindTapButton(this.touchButtons.chidori, "chidori")
  }

  createControlButton(x, y, radius, label) {
    const background = this.add.circle(x, y, radius, 0x0f172a, 0.35)
      .setStrokeStyle(4, 0xffffff, 0.35)
      .setScrollFactor(0)
      .setDepth(100)
      .setInteractive()

    const labelText = this.add.text(x, y, label, {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '28px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(101)

    return {
      background,
      label: labelText,
      isPressed: false,
    }
  }

  bindHoldButton(button, direction) {
    button.background.on('pointerdown', (pointer) => {
      if (this.isPortraitBlocked) {
        return
      }

      const controller = this.getActiveInputController()
      if (!controller) {
        return
      }

      controller.setTouchDirection(direction, true)
      this.touchPointerBindings.set(pointer.id, {
        action: direction,
        button,
        controller,
      })
      this.setButtonPressed(button, true)
    })
  }

  bindTapButton(button, action) {
    button.background.on('pointerdown', () => {
      if (this.isPortraitBlocked) {
        return
      }

      const controller = this.getActiveInputController()
      if (!controller) {
        return
      }

      controller.queueTouchAction(action)
      this.flashButton(button)
    })
  }

  createOrientationOverlay() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value

    this.orientationOverlay = this.add.container(0, 0).setDepth(200).setVisible(false)
    this.orientationOverlay.add(
      this.add.rectangle(screenWidth / 2, screenHeight / 2, screenWidth, screenHeight, 0x000000, 0.82)
    )
    this.orientationOverlay.add(
      this.add.text(screenWidth / 2, screenHeight / 2 - 30, 'ROTATE DEVICE', {
        fontFamily: 'RetroPixel, monospace',
        fontSize: '42px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
      }).setOrigin(0.5, 0.5)
    )
    this.orientationOverlay.add(
      this.add.text(screenWidth / 2, screenHeight / 2 + 30, 'Play in landscape mode for touch controls', {
        fontFamily: 'RetroPixel, monospace',
        fontSize: '22px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
      }).setOrigin(0.5, 0.5)
    )
  }

  registerTouchReleaseHandlers() {
    this.input.on('pointerup', (pointer) => {
      this.releaseTouchPointer(pointer.id)
    })

    this.input.on('gameout', () => {
      this.releaseAllTouchBindings()
    })
  }

  releaseTouchPointer(pointerId) {
    const binding = this.touchPointerBindings.get(pointerId)
    if (!binding) {
      return
    }

    binding.controller.setTouchDirection(binding.action, false)
    this.setButtonPressed(binding.button, false)
    this.touchPointerBindings.delete(pointerId)
  }

  releaseAllTouchBindings() {
    this.touchPointerBindings.forEach((binding) => {
      binding.controller.setTouchDirection(binding.action, false)
      this.setButtonPressed(binding.button, false)
    })

    this.touchPointerBindings.clear()
  }

  setButtonPressed(button, pressed) {
    button.isPressed = pressed
    button.background.setScale(pressed ? 0.94 : 1)
    button.background.setFillStyle(0x0f172a, pressed ? 0.58 : 0.35)
    button.label.setScale(pressed ? 0.94 : 1)
  }

  flashButton(button) {
    this.setButtonPressed(button, true)

    this.time.delayedCall(120, () => {
      this.setButtonPressed(button, false)
    })
  }

  getActiveInputController() {
    return this.gameScene?.inputController ?? null
  }

  updateMobileLayout() {
    if (!this.isMobile) {
      return
    }

    this.isPortraitBlocked = isPortraitViewport()

    const controller = this.getActiveInputController()
    if (controller) {
      controller.setTouchEnabled(!this.isPortraitBlocked)
    }

    if (this.isPortraitBlocked) {
      this.releaseAllTouchBindings()
    }

    if (this.touchControlsContainer) {
      this.touchControlsContainer.setVisible(!this.isPortraitBlocked && Boolean(controller))
    }

    if (this.orientationOverlay) {
      this.orientationOverlay.setVisible(this.isPortraitBlocked)
    }
  }

  update() {
    if (!this.gameScene || !this.gameScene.scene.isActive() || !this.gameScene.player) {
      this.refreshGameScene()
    }

    if (this.isMobile) {
      this.updateMobileLayout()
    }

    // Update health display
    if (this.gameScene && this.gameScene.player) {
      const healthPercentage = this.gameScene.player.getHealthPercentage()
      this.updateHealthBar(healthPercentage)
    }
  }
}
