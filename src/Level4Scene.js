import { BaseLevelScene } from './BaseLevelScene.js'
import { KakashiPlayer } from './KakashiPlayer.js'

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
    this.mapWidth = 35 * 64
    this.mapHeight = 20 * 64
  }

  createPlayer() {
    this.player = new KakashiPlayer(this, 2 * 64, 18 * 64)
  }

  createEnemies() {
    this.addEnemy(10 * 64, 17 * 64)
    this.addEnemy(15 * 64, 12 * 64)
    this.addEnemy(18 * 64, 16 * 64)
    this.addEnemy(24 * 64, 15 * 64)
    this.addEnemy(29 * 64, 13.45 * 64)
    this.addEnemy(31 * 64, 17 * 64)
  }

  getObstacleDefinitions() {
    return [
      { x: 8 * 64, y: 19 * 64, width: 96, height: 44 },
      { x: 14 * 64, y: 14.5 * 64, width: 128, height: 44 },
      { x: 22 * 64, y: 17.2 * 64, width: 96, height: 44 },
      { x: 29 * 64, y: 13.8 * 64, width: 128, height: 44 },
    ]
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
    this.map = this.make.tilemap({ key: "level2_map" })
    this.forestGroundTileset = this.map.addTilesetImage("forest_ground", "forest_ground")
    this.groundLayer = this.map.createLayer("ground", this.forestGroundTileset, 0, 0)
    this.groundLayer.setCollisionByExclusion([-1])
  }

  createDecorations() {
    this.decorations.add(this.add.image(4 * 64, 18 * 64, "trees_variant_1").setOrigin(0.5, 1).setScale(0.6))
    this.decorations.add(this.add.image(12 * 64, 17 * 64, "rocks_variant_2").setOrigin(0.5, 1).setScale(0.5))
    this.decorations.add(this.add.image(20 * 64, 14 * 64, "trees_variant_3").setOrigin(0.5, 1).setScale(0.55))
    this.decorations.add(this.add.image(26 * 64, 16 * 64, "wooden_post_variant_1").setOrigin(0.5, 1).setScale(0.25))
    this.decorations.add(this.add.image(33 * 64, 18 * 64, "grass_variant_1").setOrigin(0.5, 1).setScale(0.3))
  }
}
