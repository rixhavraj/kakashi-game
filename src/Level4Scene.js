import { BaseLevelScene } from './BaseLevelScene.js'
import { KakashiPlayer } from './KakashiPlayer.js'
import { SoundNinja } from './SoundNinja.js'

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
    // 5 enemies on rooftops
    const enemy1 = new SoundNinja(this, 10 * 64, 18 * 64)
    this.enemies.add(enemy1)
    
    const enemy2 = new SoundNinja(this, 16 * 64, 14 * 64)
    this.enemies.add(enemy2)
    
    const enemy3 = new SoundNinja(this, 23 * 64, 10 * 64)
    this.enemies.add(enemy3)
    
    const enemy4 = new SoundNinja(this, 34 * 64, 15 * 64)
    this.enemies.add(enemy4)
    
    const enemy5 = new SoundNinja(this, 42 * 64, 17 * 64)
    this.enemies.add(enemy5)
  }

  createBackground() {
    let backgroundKey = "konoha_village_background"
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
    const post1 = this.add.image(4 * 64, 16 * 64, "wooden_post_variant_1").setOrigin(0.5, 1).setScale(0.25)
    this.decorations.add(post1)
    
    const bush1 = this.add.image(17 * 64, 14 * 64, "bushes_variant_1").setOrigin(0.5, 1).setScale(0.4)
    this.decorations.add(bush1)
    
    const rock1 = this.add.image(29 * 64, 12 * 64, "rocks_variant_1").setOrigin(0.5, 1).setScale(0.5)
    this.decorations.add(rock1)
    
    const tree1 = this.add.image(35 * 64, 15 * 64, "trees_variant_3").setOrigin(0.5, 1).setScale(0.6)
    this.decorations.add(tree1)
    
    const grass1 = this.add.image(43 * 64, 17 * 64, "grass_variant_1").setOrigin(0.5, 1).setScale(0.3)
    this.decorations.add(grass1)
  }
}
