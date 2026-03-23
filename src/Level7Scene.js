import { BaseLevelScene } from './BaseLevelScene.js'
import { KakashiPlayer } from './KakashiPlayer.js'
import { PainBoss } from './PainBoss.js'

export class Level7Scene extends BaseLevelScene {
  constructor() {
    super({ key: 'Level7Scene' })
  }

  create() {
    this.createBaseElements()
    this.createWindCurrents()
    this.createGoalBeacon()

    this.backgroundMusic = this.sound.add('ninja_adventure_theme', { volume: 0.78, loop: true })
    this.backgroundMusic.play()
  }

  update() {
    this.baseUpdate()
    this.animateGoalBeacon()
  }

  setupMapSize() {
    this.mapWidth = 40 * 64
    this.mapHeight = 20 * 64
  }

  createBackground() {
    const backgroundKey = 'forest_background'
    const bgImage = this.add.image(0, 0, backgroundKey).setOrigin(0, 0)
    const bgScale = this.mapHeight / bgImage.height
    bgImage.setScale(bgScale)
    const scaledBgWidth = bgImage.width * bgScale
    const repeats = Math.ceil(this.mapWidth / scaledBgWidth)

    for (let i = 0; i < repeats; i++) {
      this.add.image(i * scaledBgWidth, 0, backgroundKey)
        .setOrigin(0, 0)
        .setScale(bgScale)
        .setScrollFactor(0.22)
        .setTint(0xcfe5ff)
    }

    this.add.rectangle(0, 0, this.mapWidth, this.mapHeight, 0x0b1630, 0.2)
      .setOrigin(0, 0)
      .setScrollFactor(0)
  }

  createTileMap() {
    this.map = this.make.tilemap({ key: 'level7_map' })
    this.mountainTileset = this.map.addTilesetImage('mountain_tileset', 'mountain_tileset')
    this.groundLayer = this.map.createLayer('Ground', this.mountainTileset, 0, 0)

    if (!this.groundLayer) {
      console.warn('[Level7] Ground layer missing from tilemap.')
    } else {
      this.groundLayer.setCollisionByExclusion([-1])
    }

    this.mapObjects = this.map.getObjectLayer('Objects')?.objects ?? []
  }

  createDecorations() {
    const decor = [
      { key: 'trees_variant_1', x: 1, y: 18, scale: 1 },
      { key: 'bushes_variant_2', x: 11, y: 17.3, scale: 0.44 },
      { key: 'rocks_variant_1', x: 16, y: 16.5, scale: 0.5 },
      { key: 'trees_variant_3', x: 22, y: 13.2, scale: 0.64 },
      { key: 'grass_variant_1', x: 28, y: 18.1, scale: 0.32 },
      { key: 'wooden_post_variant_1', x: 34, y: 15.5, scale: 0.26 },
      { key: 'rocks_variant_2', x: 37, y: 12.2, scale: 0.48 },
    ]

    decor.forEach((item) => {
      const decoration = this.add.image(item.x * 64, item.y * 64, item.key)
        .setOrigin(0.5, 1)
        .setScale(item.scale)
      this.decorations.add(decoration)
    })
  }

  createPlayer() {
    const spawn = this.getObjectByName('SpawnPoint')
    const fallback = { x: 4 * 64, y: 17 * 64 }
    const { x, y } = spawn ? this.toWorldPosition(spawn) : fallback
    this.player = new KakashiPlayer(this, x, y)
  }

  createEnemies() {
    const enemyObjects = this.getObjectsByType('enemy')
    if (enemyObjects.length) {
      enemyObjects.forEach((obj) => {
        const pos = this.toWorldPosition(obj)
        this.addEnemy(pos.x, pos.y)
      })
    } else {
      ;[
        { x: 9, y: 16.5 },
        { x: 14, y: 13.2 },
        { x: 20, y: 12.5 },
        { x: 27, y: 10.5 },
        { x: 32, y: 8.4 },
      ].forEach((pos) => this.addEnemy(pos.x * 64, pos.y * 64))
    }

    const goal = this.getObjectByName('Goal')
    const bossPos = goal ? this.toWorldPosition(goal) : { x: 35 * 64, y: 6.5 * 64 }
    this.painBoss = new PainBoss(this, bossPos.x, bossPos.y - 32, { healthBonus: 120 })
    this.enemies.add(this.painBoss)
  }

  createWindCurrents() {
    this.windZones = []
    const zoneConfigs = [
      { x: 23 * 64, y: 9 * 64, width: 6 * 64, height: 4 * 64, boost: { x: 120, y: -260 } },
      { x: 33 * 64, y: 6 * 64, width: 4 * 64, height: 5 * 64, boost: { x: -80, y: -300 } },
    ]

    zoneConfigs.forEach((cfg) => {
      const overlay = this.add.rectangle(cfg.x, cfg.y, cfg.width, cfg.height, 0x7dd9ff, 0.25)
        .setOrigin(0.5, 0.5)
      const zone = this.add.zone(cfg.x, cfg.y, cfg.width, cfg.height)
      this.physics.add.existing(zone, true)
      this.physics.add.overlap(this.player, zone, () => {
        if (!this.player.isDead) {
          this.player.body.velocity.x += cfg.boost.x
          this.player.body.velocity.y = cfg.boost.y
        }
      })
      this.windZones.push({ overlay })
    })
  }

  createGoalBeacon() {
    const goal = this.getObjectByName('Goal')
    if (!goal) return
    const pos = this.toWorldPosition(goal)
    this.goalBeacon = this.add.rectangle(pos.x, pos.y - 64, 80, 120, 0xfff199, 0.25)
      .setStrokeStyle(3, 0xffae00, 0.7)
    this.goalParticles = this.add.particles(0, 0, 'dust_effect', {
      x: pos.x,
      y: pos.y - 64,
      speedY: { min: -40, max: -140 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.4, end: 0 },
      lifespan: 1400,
      quantity: 2,
      blendMode: 'ADD'
    })
  }

  animateGoalBeacon() {
    if (this.goalBeacon) {
      this.goalBeacon.alpha = 0.3 + 0.15 * Math.sin(this.time.now * 0.004)
    }
  }

  getObjectByName(name) {
    return this.mapObjects?.find((obj) => obj.name === name)
  }

  getObjectsByType(type) {
    return this.mapObjects?.filter((obj) => obj.type === type) ?? []
  }

  toWorldPosition(obj) {
    const width = obj.width ?? 0
    const height = obj.height ?? 0
    return {
      x: obj.x + width / 2,
      y: obj.y - height / 2,
    }
  }
}
