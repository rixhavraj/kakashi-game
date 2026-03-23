import { BaseLevelScene } from './BaseLevelScene.js'
import { KakashiPlayer } from './KakashiPlayer.js'
import { PainBoss } from './PainBoss.js'

export class Level6Scene extends BaseLevelScene {
  constructor() {
    super({ key: "Level6Scene" })
  }

  create() {
    this.supportBodies = []
    this.movingPlatforms = []
    this.createBaseElements()
    this.createFloatingPlatforms()
    this.createBossArenaPlatform()
    this.createApproachPlatforms()
    this.createChakraStorm()

    this.backgroundMusic = this.sound.add("ninja_adventure_theme", { volume: 0.75, loop: true })
    this.backgroundMusic.play()
  }

  update() {
    this.syncMovingPlatforms()
    this.carryMovingPlatformRiders()
    this.baseUpdate()
    this.animateStorm()
  }

  setupMapSize() {
    this.mapWidth = 56 * 64
    this.mapHeight = 22 * 64
  }

  createPlayer() {
    this.player = new KakashiPlayer(this, 4 * 64, 9 * 64)
  }

  createEnemies() {
    ;[
      { x: 9, y: 18 },
      { x: 15, y: 15 },
      { x: 21, y: 13 },
      { x: 26, y: 17 },
      { x: 32, y: 14 },
      { x: 36, y: 18 },
      { x: 42, y: 16 },
    ].forEach((pos) => {
      this.addEnemy(pos.x * 64, pos.y * 64)
    })

    this.painBoss = new PainBoss(this, 9 * 64, 12 * 64, { healthBonus: 60 })
    this.enemies.add(this.painBoss)
  }

  createBackground() {
    const backgroundKey = "forest_background"
    const bgImage = this.add.image(0, 0, backgroundKey).setOrigin(0, 0)
    const bgScale = this.mapHeight / bgImage.height
    bgImage.setScale(bgScale)
    const scaledBgWidth = bgImage.width * bgScale
    const numRepeats = Math.ceil(this.mapWidth / scaledBgWidth)

    for (let i = 0; i < numRepeats; i++) {
      this.add.image(i * scaledBgWidth, 0, backgroundKey)
        .setOrigin(0, 0)
        .setScale(bgScale)
        .setScrollFactor(0.2)
    }

    this.backgroundOverlay = this.add.rectangle(0, 0, this.mapWidth, this.mapHeight, 0x120c2b, 0.35)
      .setOrigin(0, 0)
      .setScrollFactor(0.1)
  }

  createTileMap() {
    this.map = this.make.tilemap({ key: "level6_map" })
    this.forestGroundTileset = this.map.addTilesetImage("forest_ground", "forest_ground")
    this.groundLayer = this.map.createLayer("ground", this.forestGroundTileset, 0, 0)
    this.groundLayer.setCollisionByExclusion([-1])
  }

  createDecorations() {
    const decorations = [
      { key: "trees_variant_1", x: 6, y: 18.8, scale: 0.6 },
      { key: "bushes_variant_2", x: 12, y: 17, scale: 0.45 },
      { key: "rocks_variant_2", x: 18, y: 16, scale: 0.52 },
      { key: "trees_variant_3", x: 24, y: 14, scale: 0.62 },
      { key: "grass_variant_1", x: 29, y: 18.5, scale: 0.32 },
      { key: "trees_variant_2", x: 34, y: 13, scale: 0.65 },
      { key: "wooden_post_variant_1", x: 40, y: 15, scale: 0.28 },
      { key: "rocks_variant_1", x: 54, y: 12.5, scale: 0.48 },
      { key: "bushes_variant_1", x: 51, y: 17.6, scale: 0.42 },
    ]

    decorations.forEach((item) => {
      const decoration = this.add.image(item.x * 64, item.y * 64, item.key)
        .setOrigin(0.5, 1)
        .setScale(item.scale)
      this.decorations.add(decoration)
    })
  }

  createFloatingPlatforms() {
    this.floatingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true })
    this.floatingPlatformVisuals = this.add.group()
    const platformData = [
      { x: 18 * 64, y: 11 * 64, offset: 4 * 64, duration: 3200, colliderWidth: 120, colliderHeight: 24, colliderYOffset: 6 },
      { x: 30 * 64, y: 9 * 64, offset: 5 * 64, duration: 3600, colliderWidth: 120, colliderHeight: 24, colliderYOffset: 6 },
      { x: 40 * 64, y: 7 * 64, offset: 3 * 64, duration: 2800, colliderWidth: 120, colliderHeight: 24, colliderYOffset: 6 },
    ]

    platformData.forEach((config) => {
      const visual = this.add.image(config.x, config.y, "rocks_variant_2")
        .setScale(0.48)
      this.floatingPlatformVisuals.add(visual)

      const collider = this.add.rectangle(
        config.x,
        config.y + config.colliderYOffset,
        config.colliderWidth,
        config.colliderHeight,
        0xffffff,
        0
      )
      this.physics.add.existing(collider, false)
      collider.body.setAllowGravity(false)
      collider.body.setImmovable(true)
      collider.body.setSize(config.colliderWidth, config.colliderHeight)
      collider.body.updateFromGameObject()
      this.floatingPlatforms.add(collider)
      this.registerSupportBody(collider.body)

      this.movingPlatforms.push({
        visual,
        collider,
        lastX: collider.x,
        deltaX: 0,
      })

      this.tweens.add({
        targets: [visual, collider],
        x: config.x + config.offset,
        duration: config.duration,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      })

      this.physics.add.collider(this.player, collider)
      this.physics.add.collider(this.enemies, collider)
    })
  }

  createBossArenaPlatform() {
    const platformWidth = 14 * 64
    const platformHeight = 1.4 * 64
    const platformX = 47.5 * 64
    const platformY = 17.6 * 64

    this.bossArenaVisual = this.add.rectangle(platformX, platformY, platformWidth, platformHeight, 0x2a163d, 0.45)
      .setOrigin(0.5, 0.5)
    this.bossArenaVisual.setStrokeStyle(2, 0xff8c00, 0.5)

    this.physics.add.existing(this.bossArenaVisual, true)
    this.bossArenaVisual.body.setSize(platformWidth, platformHeight)
    this.bossArenaVisual.body.updateFromGameObject()
    this.registerSupportBody(this.bossArenaVisual.body)

    this.physics.add.collider(this.player, this.bossArenaVisual)
    this.physics.add.collider(this.enemies, this.bossArenaVisual)
  }

  createApproachPlatforms() {
    this.approachPlatforms = this.physics.add.staticGroup()
    const platformDefs = [
      { x: 36.5 * 64, y: 17.5 * 64, width: 8 * 64, height: 1.2 * 64 },
      { x: 40.5 * 64, y: 15.5 * 64, width: 6 * 64, height: 1.2 * 64 },
      { x: 44.5 * 64, y: 13.3 * 64, width: 5 * 64, height: 1.2 * 64 },
      { x: 48 * 64, y: 11.5 * 64, width: 4 * 64, height: 1.2 * 64 },
    ]

    platformDefs.forEach((cfg) => {
      const colliderRect = this.add.rectangle(cfg.x, cfg.y, cfg.width, cfg.height, 0xffffff, 0)
      this.physics.add.existing(colliderRect, true)
      colliderRect.body.setSize(cfg.width, cfg.height)
      colliderRect.body.updateFromGameObject()
      this.registerSupportBody(colliderRect.body)

      const tilestrip = this.add.tileSprite(cfg.x, cfg.y, cfg.width, cfg.height + 12, 'forest_ground')
        .setOrigin(0.5, 0.5)
        .setAlpha(0.95)
      tilestrip.setDepth(this.player.depth - 1)
      this.add.rectangle(cfg.x, cfg.y, cfg.width, cfg.height + 14, 0x000000, 0.15).setDepth(tilestrip.depth - 1)

      this.physics.add.collider(this.player, colliderRect)
      this.physics.add.collider(this.enemies, colliderRect)
      this.approachPlatforms.add(colliderRect)
    })
  }

  createChakraStorm() {
    const zoneWidth = 10 * 64
    const zoneHeight = 6 * 64
    const zoneX = 42 * 64
    const zoneY = 6 * 64

    this.stormOverlay = this.add.rectangle(zoneX, zoneY, zoneWidth, zoneHeight, 0x7e00ff, 0.25)
      .setOrigin(0.5, 0.5)
      .setScrollFactor(1)

    this.chakraStormZone = this.add.zone(zoneX, zoneY, zoneWidth, zoneHeight)
    this.physics.add.existing(this.chakraStormZone, true)
    this.physics.add.overlap(this.player, this.chakraStormZone, this.handleStormDamage, null, this)
  }

  handleStormDamage(player) {
    if (!player || player.isDead || player.isInvulnerable) return
    const now = this.time.now
    if (!this.lastStormTick) {
      this.lastStormTick = now
    }
    if (now - this.lastStormTick < 600) return

    this.lastStormTick = now
    player.takeDamage(6)
    player.body.setVelocityY(-200)
    player.setTint(0xb388ff)
    this.time.delayedCall(200, () => player?.clearTint && player.clearTint())
  }

  animateStorm() {
    if (this.stormOverlay) {
      this.stormOverlay.alpha = 0.2 + 0.15 * Math.sin(this.time.now * 0.004)
    }
  }

  getSupportBodies() {
    return this.supportBodies
  }

  registerSupportBody(body) {
    if (!body || this.supportBodies.includes(body)) {
      return
    }

    this.supportBodies.push(body)
  }

  syncMovingPlatforms() {
    this.movingPlatforms.forEach((platform) => {
      platform.collider.body.updateFromGameObject()
      platform.deltaX = platform.collider.x - platform.lastX
      platform.lastX = platform.collider.x
    })
  }

  carryMovingPlatformRiders() {
    this.carryActorWithPlatforms(this.player)

    this.enemies.children.entries.forEach((enemy) => {
      if (enemy?.active) {
        this.carryActorWithPlatforms(enemy)
      }
    })
  }

  carryActorWithPlatforms(actor) {
    if (!actor?.body?.enable) {
      return
    }

    for (const platform of this.movingPlatforms) {
      if (Math.abs(platform.deltaX) < 0.05) {
        continue
      }

      if (!this.isActorStandingOnPlatform(actor, platform.collider)) {
        continue
      }

      const carryX = platform.deltaX * 0.55
      actor.x += carryX
      if (actor.body.prev) {
        actor.body.prev.x += carryX
      }
      break
    }
  }

  isActorStandingOnPlatform(actor, platformCollider) {
    const actorBody = actor?.body
    const platformBody = platformCollider?.body

    if (!actorBody?.enable || !platformBody?.enable) {
      return false
    }

    const overlapLeft = Math.max(actorBody.left, platformBody.left)
    const overlapRight = Math.min(actorBody.right, platformBody.right)
    const horizontalOverlap = overlapRight - overlapLeft
    const verticalGap = Math.abs(actorBody.bottom - platformBody.top)
    const supportThreshold = Math.min(Math.max(actorBody.width * 0.45, 24), 40)
    const isGrounded = actorBody.blocked.down || actorBody.touching.down

    return horizontalOverlap >= supportThreshold && verticalGap <= 3 && actorBody.velocity.y >= -8 && isGrounded
  }
}
