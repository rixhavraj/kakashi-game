import { BaseLevelScene } from '../BaseLevelScene.js'
import { KakashiPlayer } from '../KakashiPlayer.js'

export class Level4Scene extends BaseLevelScene {
  constructor() {
    super({ key: "Level4Scene" })
  }

  create() {
    this.createBaseElements()
    this.backgroundMusic = this.sound.add("ninja_adventure_theme", { volume: 0.6, loop: true })
    this.backgroundMusic.play()
  }

  update() {
    this.baseUpdate()
  }

  setupMapSize() {
    this.mapWidth = 45 * 64
    this.mapHeight = 20 * 64
  }

  createPlayer() {
    this.player = new KakashiPlayer(this, 3 * 64, 16 * 64)
  }

  createEnemies() {
    ;[
      { x: 10, y: 18 },
      { x: 16, y: 14 },
      { x: 23, y: 10 },
      { x: 34, y: 15 },
      { x: 42, y: 17 },
    ].forEach((pos) => {
      this.addEnemy(pos.x * 64, pos.y * 64)
    })
  }

  createBackground() {
    const backgroundKey = "konoha_village_background"
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
    this.map = this.make.tilemap({ key: "level4_map" })
    this.forestGroundTileset = this.map.addTilesetImage("forest_ground", "forest_ground")
    this.groundLayer = this.map.createLayer("ground", this.forestGroundTileset, 0, 0)
    this.groundLayer.setCollisionByExclusion([-1])
  }

  createDecorations() {
    const decorations = [
      { key: "wooden_post_variant_1", x: 4, y: 16, scale: 0.25 },
      { key: "bushes_variant_1", x: 17, y: 14, scale: 0.4 },
      { key: "rocks_variant_1", x: 29, y: 12, scale: 0.5 },
      { key: "trees_variant_3", x: 35, y: 15, scale: 0.6 },
      { key: "grass_variant_1", x: 43, y: 17, scale: 0.3 },
    ]

    decorations.forEach((item) => {
      const decoration = this.add.image(item.x * 64, item.y * 64, item.key)
        .setOrigin(0.5, 1)
        .setScale(item.scale)
      this.decorations.add(decoration)
    })
  }
}
