import Phaser from "phaser"

export class GameInputController {
  constructor(scene) {
    this.scene = scene
    this.touchEnabled = true

    this.touchDirections = {
      left: false,
      right: false,
      jump: false,
    }

    this.touchQueuedActions = {
      punch: 0,
      kick: 0,
      chidori: 0,
      confirm: 0,
    }

    this.keys = {
      W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      J: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      K: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      L: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
      UP: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      LEFT: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      RIGHT: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      ENTER: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      SPACE: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    }

    this.state = this.getDefaultState()
  }

  getDefaultState() {
    return {
      left: false,
      right: false,
      moveX: 0,
      jump: false,
      punch: false,
      kick: false,
      chidori: false,
      confirm: false,
    }
  }

  update() {
    const left =
      this.keys.A.isDown ||
      this.keys.LEFT.isDown ||
      (this.touchEnabled && this.touchDirections.left)
    const right =
      this.keys.D.isDown ||
      this.keys.RIGHT.isDown ||
      (this.touchEnabled && this.touchDirections.right)
    const jump =
      this.keys.W.isDown ||
      this.keys.UP.isDown ||
      (this.touchEnabled && this.touchDirections.jump)

    this.state = {
      left,
      right,
      moveX: left === right ? 0 : left ? -1 : 1,
      jump,
      punch: Phaser.Input.Keyboard.JustDown(this.keys.J) || this.consumeTouchAction("punch"),
      kick: Phaser.Input.Keyboard.JustDown(this.keys.K) || this.consumeTouchAction("kick"),
      chidori: Phaser.Input.Keyboard.JustDown(this.keys.L) || this.consumeTouchAction("chidori"),
      confirm:
        Phaser.Input.Keyboard.JustDown(this.keys.ENTER) ||
        Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
        this.consumeTouchAction("confirm"),
    }

    return this.state
  }

  setTouchEnabled(enabled) {
    this.touchEnabled = enabled

    if (!enabled) {
      this.resetTouchState()
    }
  }

  setTouchDirection(direction, active) {
    if (!(direction in this.touchDirections) || !this.touchEnabled) {
      return
    }

    this.touchDirections[direction] = active
  }

  queueTouchAction(action) {
    if (!(action in this.touchQueuedActions) || !this.touchEnabled) {
      return
    }

    this.touchQueuedActions[action] += 1
  }

  resetTouchState() {
    Object.keys(this.touchDirections).forEach((direction) => {
      this.touchDirections[direction] = false
    })

    Object.keys(this.touchQueuedActions).forEach((action) => {
      this.touchQueuedActions[action] = 0
    })
  }

  consumeTouchAction(action) {
    if (this.touchQueuedActions[action] > 0) {
      this.touchQueuedActions[action] -= 1
      return true
    }

    return false
  }
}
