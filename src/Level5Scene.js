import { BaseLevelScene } from './BaseLevelScene.js'
import { KakashiPlayer } from './KakashiPlayer.js'
import { SoundNinja } from './SoundNinja.js'

export class Level5Scene extends BaseLevelScene {
  constructor() {
    super({ key: 'Level5Scene' })
  }

  create() {
    this.createBaseElements()
    this.createObstacles()

    this.backgroundMusic = this.sound.add('ninja_adventure_theme', { volume: 0.6, loop: true })
    this.backgroundMusic.play()
  }

  update() {
    this.baseUpdate()

    if (this.hazardOverlay) {
      this.hazardOverlay.alpha = 0.2 + 0.08 * Math.sin(this.time.now * 0.007)
    }
  }

  setupMapSize() {
    this.mapWidth = 45 * 64
    this.mapHeight = 20 * 64
  }

  createPlayer() {
    this.player = new KakashiPlayer(this, 2 * 64, 17 * 64)
  }

  createEnemies() {
    const positions = [
      { x: 9, y: 17 },
      { x: 16, y: 13 },
      { x: 22, y: 15 },
      { x: 28, y: 12 },
      { x: 34, y: 17 },
      { x: 38, y: 14 },
      { x: 41, y: 16 },
    ]

    positions.forEach((pos) => {
      const enemy = new SoundNinja(this, pos.x * 64, pos.y * 64)
      this.enemies.add(enemy)
    })
  }

  createBackground() {
    let backgroundKey = 'konoha_village_background'
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
  }

  createTileMap() {
    this.map = this.make.tilemap({ key: 'level2_map' })
    this.forestGroundTileset = this.map.addTilesetImage('forest_ground', 'forest_ground')
    this.groundLayer = this.map.createLayer('ground', this.forestGroundTileset, 0, 0)
    this.groundLayer.setCollisionByExclusion([-1])
  }

  createDecorations() {
    const decorData = [
      { key: 'trees_variant_1', x: 4, y: 16, scale: 0.6 },
      { key: 'bushes_variant_2', x: 10, y: 16.9, scale: 0.4 },
      { key: 'rocks_variant_2', x: 18, y: 15.5, scale: 0.5 },
      { key: 'trees_variant_3', x: 26, y: 13.5, scale: 0.6 },
      { key: 'wooden_post_variant_1', x: 32, y: 11.5, scale: 0.24 },
      { key: 'grass_variant_1', x: 36, y: 17.2, scale: 0.3 },
    ]

    decorData.forEach((item) => {
      const deco = this.add.image(item.x * 64, item.y * 64, item.key)
        .setOrigin(0.5, 1)
        .setScale(item.scale)
      this.decorations.add(deco)
    })
  }

  createObstacles() {
    this.movingPlatform = this.physics.add.sprite(22 * 64, 11.5 * 64, 'rocks_variant_2')
      .setScale(0.5)
      .setAllowGravity(false)
      .setImmovable(true)

    this.physics.add.collider(this.player, this.movingPlatform)
    this.physics.add.collider(this.enemies, this.movingPlatform)

    this.tweens.add({
      targets: this.movingPlatform,
      x: 32 * 64,
      duration: 2800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    })

    this.hazardOverlay = this.add.rectangle(29 * 64, 19 * 64, 11 * 64, 1.2 * 64, 0xff6600, 0.2)
      .setOrigin(0.5, 0.5)

    this.hazardArea = this.add.zone(29 * 64, 19 * 64, 11 * 64, 1.2 * 64)
    this.physics.add.existing(this.hazardArea, true)
    this.physics.add.overlap(this.player, this.hazardArea, this.onHazardHit, null, this)

    this.lastHazardHitTime = 0
  }

  onHazardHit(player) {
    const now = this.time.now
    if (now - this.lastHazardHitTime < 900) return

    this.lastHazardHitTime = now

    if (player.isInvulnerable || player.isDead) return
    player.takeDamage(20)
    player.setTint(0xff4500)

    this.time.delayedCall(180, () => {
      if (player && !player.isDead) player.clearTint()
    })
  }
}
