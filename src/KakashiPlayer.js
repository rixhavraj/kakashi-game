import Phaser from 'phaser'
import { createTrigger } from './utils.js'
import { kakashiConfig } from './gameConfig.json'

export class KakashiPlayer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "kakashi_idle_frame1")

    // Add to scene and physics system
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Character properties
    this.scene = scene
    this.facingDirection = "right"
    this.walkSpeed = kakashiConfig.walkSpeed.value
    this.jumpPower = kakashiConfig.jumpPower.value

    // Status flags
    this.isDead = false // Dead state
    this.isPunching = false // Punching state
    this.isKicking = false // Kicking state
    this.isChidori = false // Chidori state
    this.isHurting = false // Hurt stun state
    this.isInvulnerable = false // Invulnerable state
    this.hurtingDuration = kakashiConfig.hurtingDuration.value // Hurt stun duration
    this.invulnerableTime = kakashiConfig.invulnerableTime.value // Invulnerability time
    this.chidoriCooldown = 3000
    this.lastChidoriTime = -Infinity
    
    // Attack target tracking system
    this.currentMeleeTargets = new Set() // Track currently hit targets

    // Player health system
    this.maxHealth = kakashiConfig.maxHealth.value
    this.health = this.maxHealth

    // Set physics properties
    this.body.setGravityY(kakashiConfig.gravityY.value)

    // Set collision box based on idle animation
    this.collisionBoxWidth = 324 * 0.9
    this.collisionBoxHeight = 560 * 0.9
    this.body.setSize(this.collisionBoxWidth, this.collisionBoxHeight)

    // Set character scale
    const standardHeight = 2 * 64
    this.characterScale = standardHeight / 560
    this.setScale(this.characterScale)

    // Set initial origin
    this.setOrigin(0.5, 1.0)

    // Create animations
    this.createAnimations()

    // Play idle animation
    this.play("kakashi_idle_anim")
    this.resetOriginAndOffset()

    // Create attack trigger
    this.createMeleeTrigger()

    // Initialize all sounds
    this.initializeSounds()
    
    // Effects
    this.dustEffects = [] // Changed to array to store multiple dust effects
  }

  // Initialize all sounds
  initializeSounds() {
    this.jumpSound = this.scene.sound.add("ninja_jump_sound", { volume: 0.3 })
    this.punchSound = this.scene.sound.add("punch_sound", { volume: 0.3 })
    this.kickSound = this.scene.sound.add("kick_sound", { volume: 0.3 })
    this.chidoriSound = this.scene.sound.add("chidori_sound", { volume: 0.3 })
    this.hurtSound = this.scene.sound.add("ninja_hurt_sound", { volume: 0.3 })
    this.dieSound = this.scene.sound.add("ninja_die_sound", { volume: 0.3 })
  }

  createAnimations() {
    const anims = this.scene.anims

    // Idle animation
    if (!anims.exists("kakashi_idle_anim")) {
      anims.create({
        key: "kakashi_idle_anim",
        frames: [
          {
            key: "kakashi_idle_frame1",
            duration: 800,
          },
          {
            key: "kakashi_idle_frame2",
            duration: 800,
          },
        ],
        repeat: -1,
      })
    }

    // Walk animation
    if (!anims.exists("kakashi_walk_anim")) {
      anims.create({
        key: "kakashi_walk_anim",
        frames: [
          {
            key: "kakashi_walk_frame1",
            duration: 300,
          },
          {
            key: "kakashi_walk_frame2",
            duration: 300,
          },
          {
            key: "kakashi_walk_frame3",
            duration: 300,
          },
          {
            key: "kakashi_walk_frame4",
            duration: 300,
          },
        ],
        repeat: -1,
      })
    }

    // Jump Up animation
    if (!anims.exists("kakashi_jump_up_anim")) {
      anims.create({
        key: "kakashi_jump_up_anim",
        frames: [
          {
            key: "kakashi_jump_frame1",
            duration: 200,
          }
        ],
        repeat: 0,
      })
    }

    // Jump Down animation
    if (!anims.exists("kakashi_jump_down_anim")) {
      anims.create({
        key: "kakashi_jump_down_anim",
        frames: [
          {
            key: "kakashi_jump_frame2",
            duration: 300,
          }
        ],
        repeat: 0,
      })
    }

    // Punch animation
    if (!anims.exists("kakashi_punch_anim")) {
      anims.create({
        key: "kakashi_punch_anim",
        frames: [
          {
            key: "kakashi_punch_frame1",
            duration: 50,
          },
          {
            key: "kakashi_punch_frame2",
            duration: 100,
          },
        ],
        repeat: 0,
      })
    }

    // Kick animation
    if (!anims.exists("kakashi_kick_anim")) {
      anims.create({
        key: "kakashi_kick_anim",
        frames: [
          {
            key: "kakashi_kick_frame1",
            duration: 50,
          },
          {
            key: "kakashi_kick_frame2",
            duration: 100,
          },
        ],
        repeat: 0,
      })
    }

    // Chidori animation
    if (!anims.exists("kakashi_chidori_anim")) {
      anims.create({
        key: "kakashi_chidori_anim",
        frames: [
          {
            key: "kakashi_chidori_frame1",
            duration: 100,
          },
          {
            key: "kakashi_chidori_frame2",
            duration: 200,
          },
        ],
        repeat: 0,
      })
    }

    // Die animation
    if (!anims.exists("kakashi_die_anim")) {
      anims.create({
        key: "kakashi_die_anim",
        frames: [
          {
            key: "kakashi_die_frame1",
            duration: 500,
          },
          {
            key: "kakashi_die_frame2",
            duration: 1000,
          },
        ],
        repeat: 0,
      })
    }

  }

  update(actions) {
    if (!this.body || !this.active || this.isDead || this.isPunching || this.isKicking || this.isChidori || this.isHurting) {
      return
    }

    // Handle death state
    if (!this.isDead) {
      this.handleDying()
    }

    // Handle attack state
    if (!this.isDead && !this.isPunching && !this.isKicking && !this.isChidori && !this.isHurting) {
      this.handleAttacks(actions)
    }

    // Handle movement
    if (!this.isDead && !this.isPunching && !this.isKicking && !this.isChidori && !this.isHurting) {
      this.handleMovement(actions)
    }

    // Update attack trigger
    this.updateMeleeTrigger()
  }

  handleDying() {
    if (this.health <= 0 && !this.isDead) {
      this.health = 0
      this.isDead = true
      this.body.setVelocityX(0)
      this.play("kakashi_die_anim", true)
      this.resetOriginAndOffset()
      this.dieSound.play()
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation, frame) => {
        if (animation.key === "kakashi_die_anim") {
          this.scene.scene.launch("GameOverUIScene", { 
            currentLevelKey: this.scene.sys.settings.key
          })
        }
      })
    } else if(this.y > this.scene.mapHeight + 100 && !this.isDead) { 
      this.health = 0
      this.isDead = true
      this.scene.scene.launch("GameOverUIScene", { 
        currentLevelKey: this.scene.sys.settings.key
      })
    }
  }

  handleAttacks(actions) {
    // J key punch attack
    if (actions.punch && !this.isPunching) {
      // Clear attack target records, start new attack
      this.currentMeleeTargets.clear()
      this.updateMeleeTrigger()
      this.isPunching = true
      this.body.setVelocityX(0) // Stop moving when attacking

      this.play("kakashi_punch_anim", true)
      this.resetOriginAndOffset()
      this.punchSound.play()
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation, frame) => {
        if (animation.key === "kakashi_punch_anim") {
          this.isPunching = false
          // Clear target records when attack ends
          this.currentMeleeTargets.clear()
        }
      })
    }

    // K key kick attack
    if (actions.kick && !this.isKicking) {
      // Clear attack target records, start new attack
      this.currentMeleeTargets.clear()
      this.updateMeleeTrigger()
      this.isKicking = true
      this.body.setVelocityX(0) // Stop moving when attacking

      this.play("kakashi_kick_anim", true)
      this.resetOriginAndOffset()
      this.kickSound.play()
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation, frame) => {
        if (animation.key === "kakashi_kick_anim") {
          this.isKicking = false
          // Clear target records when attack ends
          this.currentMeleeTargets.clear()
        }
      })
    }

    // L key Chidori attack
    if (actions.chidori && !this.isChidori && this.canUseChidori()) {
      // Clear attack target records, start new attack
      this.currentMeleeTargets.clear()
      this.updateMeleeTrigger()
      this.isChidori = true
      this.lastChidoriTime = this.scene.time.now

      // Chidori needs forward dash
      const dashSpeed = this.facingDirection === "right" ? 400 : -400
      this.body.setVelocityX(dashSpeed)

      // Chidori skill screen shake effect
      try {
        if (this.scene && this.scene.cameras && this.scene.cameras.main) {
          this.scene.cameras.main.shake(800, 0.015) // Duration 800ms, strength 0.015 (reduce shake amplitude)
        }
      } catch (error) {
        console.warn("Failed to shake camera for Chidori:", error)
      }

      this.play("kakashi_chidori_anim", true)
      this.resetOriginAndOffset()
      this.chidoriSound.play()
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation, frame) => {
        if (animation.key === "kakashi_chidori_anim") {
          this.isChidori = false
          this.body.setVelocityX(0) // Stop dash
          // Clear target records when attack ends
          this.currentMeleeTargets.clear()
        }
      })
    }
  }

  canUseChidori() {
    return this.scene.time.now - this.lastChidoriTime >= this.chidoriCooldown
  }

  handleMovement(actions) {
    // WASD and Arrow keys movement controls
    if (actions.moveX < 0) {
      this.body.setVelocityX(-this.walkSpeed)
      this.facingDirection = "left"
    } else if (actions.moveX > 0) {
      this.body.setVelocityX(this.walkSpeed)
      this.facingDirection = "right"
    } else {
      this.body.setVelocityX(0)
    }

    // Update facing direction
    this.setFlipX(this.facingDirection === "left")

    // Record if on ground before jump
    const wasOnFloor = this.body.blocked.down
    
    // Jump (W or UP arrow)
    if (actions.jump && this.body.blocked.down) {
      this.body.setVelocityY(-this.jumpPower)
      this.jumpSound.play()
      // Show dust effect when jumping
      this.showDustEffect()
    }

    // Detect landing, show dust effect
    if (!wasOnFloor && this.body.blocked.down && this.body.velocity.y >= 0) {
      this.showDustEffect()
    }

    // Update animation
    if (!this.body.blocked.down) {
      if (this.body.velocity.y < 0) {
        // Rising phase
        this.play("kakashi_jump_up_anim", true)
        this.resetOriginAndOffset()
      } else {
        // Falling phase
        this.play("kakashi_jump_down_anim", true)
        this.resetOriginAndOffset()
      }
    } else if (Math.abs(this.body.velocity.x) > 0) {
      // Walking
      this.play("kakashi_walk_anim", true)
      this.resetOriginAndOffset()
    } else {
      // Idle
      this.play("kakashi_idle_anim", true)
      this.resetOriginAndOffset()
    }
  }

  resetOriginAndOffset() {
    // Return corresponding origin data based on different animations
    let baseOriginX = 0.5;
    let baseOriginY = 1.0;
    const currentAnim = this.anims.currentAnim;
    if (currentAnim) {
      switch(currentAnim.key) {
        case "kakashi_idle_anim":
          baseOriginX = 0.5;
          baseOriginY = 1.0;
          break;
        case "kakashi_walk_anim":
          baseOriginX = 0.502;
          baseOriginY = 1.0;
          break;
        case "kakashi_jump_up_anim":
        case "kakashi_jump_down_anim":
          baseOriginX = 0.413;
          baseOriginY = 1.0;
          break;
        case "kakashi_punch_anim":
          baseOriginX = 0.258;
          baseOriginY = 1.0;
          break;
        case "kakashi_kick_anim":
          baseOriginX = 0.305;
          baseOriginY = 1.0;
          break;
        case "kakashi_chidori_anim":
          baseOriginX = 0.254;
          baseOriginY = 1.0;
          break;
        case "kakashi_die_anim":
          baseOriginX = 0.622;
          baseOriginY = 1.0;
          break;
        default:
          baseOriginX = 0.5;
          baseOriginY = 1.0;
          break;
      }
    }

    let animOriginX = this.facingDirection === "left" ? (1 - baseOriginX) : baseOriginX;
    let animOriginY = baseOriginY;
    
    // Set origin
    this.setOrigin(animOriginX, animOriginY);
    
    // Calculate offset to align collision box bottomCenter with animation frame origin
    this.body.setOffset(
      this.width * animOriginX - this.collisionBoxWidth / 2, 
      this.height * animOriginY - this.collisionBoxHeight
    );
  }

  takeDamage(damage) {
    if (this.isInvulnerable || this.isDead) return
    
    this.health -= damage
    this.isHurting = true
    this.isInvulnerable = true
    this.hurtSound.play()

    // Show damage number effect
    this.showDamageNumber(damage)

    // Hurt stun
    this.scene.time.delayedCall(this.hurtingDuration, () => {
      this.isHurting = false
    })

    // Flash effect during invulnerability time
    let blinkCount = 0
    const blinkInterval = this.scene.time.addEvent({
      delay: 100,
      repeat: this.invulnerableTime / 100 - 1,
      callback: () => {
        this.alpha = this.alpha === 1 ? 0.5 : 1
        blinkCount++
        if (blinkCount >= this.invulnerableTime / 100) {
          this.alpha = 1
          this.isInvulnerable = false
        }
      }
    })
  }

  getHealthPercentage() {
    return (this.health / this.maxHealth) * 100
  }

  // Create attack trigger
  createMeleeTrigger() {
    this.meleeTrigger = createTrigger(this.scene, 0, 0, 150, 120)
  }

  // Update attack trigger
  updateMeleeTrigger() {
    let triggerX = 0
    let triggerY = 0
    let triggerWidth = 150
    let triggerHeight = 120

    const playerCenterX = this.x
    const playerCenterY = this.y - this.body.height / 2

    switch(this.facingDirection) {
      case "right":
        triggerWidth = 150
        triggerHeight = 120
        triggerX = playerCenterX + triggerWidth / 2
        triggerY = playerCenterY
        break;
      case "left":
        triggerWidth = 150
        triggerHeight = 120
        triggerX = playerCenterX - triggerWidth / 2
        triggerY = playerCenterY
        break;
    }
    
    this.meleeTrigger.setPosition(triggerX, triggerY)
    this.meleeTrigger.body.setSize(triggerWidth, triggerHeight)
  }

  // Show dust effect
  showDustEffect() {
    // Create multiple small dust effects, spread left and right
    const dustCount = 3
    const baseY = this.y
    
    for (let i = 0; i < dustCount; i++) {
      const dustEffect = this.scene.add.image(this.x, baseY, "dust_effect")
      dustEffect.setScale(0.15) // Reduce size to avoid blocking character
      dustEffect.setOrigin(0.5, 1)
      
      // Random offset position
      const offsetX = (Math.random() - 0.5) * 80 // Left-right random offset
      const offsetY = Math.random() * 10 // Slight vertical offset
      dustEffect.x += offsetX
      dustEffect.y += offsetY
      
      // Add to array
      this.dustEffects.push(dustEffect)
      
      // Dust effect fade and spread animation
      this.scene.tweens.add({
        targets: dustEffect,
        alpha: 0,
        scaleX: dustEffect.scaleX * 1.5, // Spread effect
        scaleY: dustEffect.scaleY * 1.5,
        x: dustEffect.x + (offsetX > 0 ? 30 : -30), // Continue spreading to both sides
        duration: 600,
        onComplete: () => {
          if (dustEffect) {
            dustEffect.destroy()
            // Remove from array
            const index = this.dustEffects.indexOf(dustEffect)
            if (index > -1) {
              this.dustEffects.splice(index, 1)
            }
          }
        }
      })
    }
  }

  // Show damage number effect
  showDamageNumber(damage) {
    // Calculate display position (character top right)
    const offsetX = 40 + Math.random() * 20 // Top right position, plus random offset
    const offsetY = -60 - Math.random() * 20 // Above position, plus random offset
    
    // Player damage shown in red
    const color = '#ff3333'
    const fontSize = '28px'
    
    // Create damage number text
    const damageText = this.scene.add.text(
      this.x + offsetX,
      this.y + offsetY,
      `-${damage}`,
      {
        fontFamily: 'RetroPixel, monospace',
        fontSize: fontSize,
        fill: color,
        stroke: '#000000',
        strokeThickness: 4,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 4,
          fill: true
        }
      }
    ).setOrigin(0.5, 0.5)
    
    // Add bounce and fade animation
    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 80, // Fly upward
      x: damageText.x + (Math.random() - 0.5) * 40, // Slight left-right drift
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      duration: 1200,
      ease: 'Power2.easeOut',
      onComplete: () => {
        damageText.destroy()
      }
    })
    
    // Additional bounce effect
    this.scene.tweens.add({
      targets: damageText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true,
      ease: 'Back.easeOut'
    })
  }
}
