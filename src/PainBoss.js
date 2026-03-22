import Phaser from 'phaser'
import { SoundNinja } from './SoundNinja.js'

const BASE_HEALTH_BOOST = 180
const SPECIAL_COOLDOWN = 5200
const PUSH_RADIUS = 360
const GRAVITY_PULSE_COUNT = 8

export class PainBoss extends SoundNinja {
  constructor(scene, x, y, options = {}) {
    super(scene, x, y, {
      ...options,
      healthBonus: (options.healthBonus ?? 0) + BASE_HEALTH_BOOST,
    })

    this.setTint(0xff6b00)
    this.walkSpeed *= 1.25
    this.attackRange = 150
    this.attackCooldown = Math.max(1800, this.attackCooldown * 0.55)

    this.specialCooldown = SPECIAL_COOLDOWN
    this.lastSpecialTime = 0
    this.pulseIndex = 0

    this.createPainAura()
  }

  createPainAura() {
    const auraRadius = Math.max(this.body?.width ?? 180, 180)
    this.aura = this.scene.add.circle(this.x, this.y - this.body.height * 0.5, auraRadius, 0xff8c00, 0.15)
      .setStrokeStyle(3, 0xffe38e, 0.9)
    this.aura.setDepth(this.depth - 1)
  }

  updatePainAura() {
    if (!this.aura || !this.body) return
    this.aura.x = this.x
    this.aura.y = this.y - this.body.height * 0.5
    const newRadius = 170 + 12 * Math.sin(this.scene.time.now * 0.005 + this.pulseIndex)
    this.aura.setRadius(newRadius)
  }

  update() {
    super.update()
    this.updatePainAura()

    if (!this.scene || this.isDead || this.isHurting) {
      return
    }

    const now = this.scene.time.now
    if (!this.isAttacking && now - this.lastSpecialTime >= this.specialCooldown) {
      this.castSpecialAbility()
      this.lastSpecialTime = now
    }
  }

  destroy(fromScene) {
    this.aura?.destroy()
    super.destroy(fromScene)
  }

  castSpecialAbility() {
    const ability = Phaser.Math.RND.pick(['almightyPush', 'planetaryPull'])
    if (ability === 'almightyPush') {
      this.performAlmightyPush()
    } else {
      this.performPlanetaryPull()
    }
  }

  performAlmightyPush() {
    this.scene.sound.play('ninja_slash_sound', { volume: 0.45 })
    const wave = this.scene.add.circle(this.x, this.y - this.body.height * 0.5, 40, 0xffb347, 0.35)
    wave.setDepth(this.depth + 5)
    this.scene.tweens.add({
      targets: wave,
      radius: PUSH_RADIUS,
      alpha: 0,
      duration: 820,
      ease: 'Sine.easeOut',
      onComplete: () => wave.destroy(),
    })

    const player = this.scene.player
    if (!player || !player.body || player.isDead || player.isInvulnerable) return

    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y)
    if (distance <= PUSH_RADIUS) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
      const knockback = 900
      player.body.setVelocity(Math.cos(angle) * knockback, -400)
      player.takeDamage(25)
    }
  }

  performPlanetaryPull() {
    const player = this.scene.player
    if (!player || !player.body || player.isDead) return

    const gravityWell = this.scene.add.circle(this.x, this.y - this.body.height * 0.5, 40, 0x7d5bff, 0.4)
    gravityWell.setDepth(this.depth + 2)

    let pulses = 0
    const pulseEvent = this.scene.time.addEvent({
      delay: 120,
      repeat: GRAVITY_PULSE_COUNT,
      callback: () => {
        pulses += 1
        if (!player.body || player.isDead) return

        const force = new Phaser.Math.Vector2(this.x - player.x, (this.y - this.body.height * 0.5) - player.y)
          .normalize()
          .scale(300)
        player.body.velocity.add(force)
        if (pulses % 2 === 0 && !player.isInvulnerable) {
          player.takeDamage(8)
        }
      },
      onComplete: () => {
        this.scene.tweens.add({ targets: gravityWell, alpha: 0, duration: 300, onComplete: () => gravityWell.destroy() })
      }
    })

    this.scene.time.delayedCall(pulseEvent.delay * (GRAVITY_PULSE_COUNT + 1), () => {
      if (gravityWell.active) {
        gravityWell.destroy()
      }
    })
  }
}
