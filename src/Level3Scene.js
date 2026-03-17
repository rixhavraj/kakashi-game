import { BaseLevelScene } from './BaseLevelScene.js'
import { KakashiPlayer } from './KakashiPlayer.js'
import { SoundNinja } from './SoundNinja.js'

export class Level3Scene extends BaseLevelScene {
  constructor() {
    super({ key: "Level3Scene" })
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
    this.mapWidth = 40 * 64
    this.mapHeight = 20 * 64
  }

  createPlayer() {
    this.player = new KakashiPlayer(this, 2 * 64, 17 * 64)
  }

  createEnemies() {
    // 5 enemies on different platforms
    const enemy1 = new SoundNinja(this, 8 * 64, 15 * 64)
    this.enemies.add(enemy1)
    
    const enemy2 = new SoundNinja(this, 13 * 64, 13 * 64)
    this.enemies.add(enemy2)
    
    const enemy3 = new SoundNinja(this, 19 * 64, 16 * 64)
    this.enemies.add(enemy3)
    
    const enemy4 = new SoundNinja(this, 25 * 64, 11 * 64)
    this.enemies.add(enemy4)
    
    const enemy5 = new SoundNinja(this, 15 * 64, 17 * 64)
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
    this.map = this.make.tilemap({ key: "level3_map" })
    this.forestGroundTileset = this.map.addTilesetImage("forest_ground", "forest_ground")
    this.groundLayer = this.map.createLayer("ground", this.forestGroundTileset, 0, 0)
    this.groundLayer.setCollisionByExclusion([-1])
  }

  createDecorations() {
    const tree1 = this.add.image(3 * 64, 17 * 64, "trees_variant_1").setOrigin(0.5, 1).setScale(0.6)
    this.decorations.add(tree1)
    
    const post1 = this.add.image(9 * 64, 15 * 64, "wooden_post_variant_1").setOrigin(0.5, 1).setScale(0.25)
    this.decorations.add(post1)
    
    const bush1 = this.add.image(14 * 64, 13 * 64, "bushes_variant_2").setOrigin(0.5, 1).setScale(0.4)
    this.decorations.add(bush1)
    
    const rock1 = this.add.image(19 * 64, 16 * 64, "rocks_variant_2").setOrigin(0.5, 1).setScale(0.5)
    this.decorations.add(rock1)
    
    const tree2 = this.add.image(31 * 64, 14 * 64, "trees_variant_2").setOrigin(0.5, 1).setScale(0.6)
    this.decorations.add(tree2)
    
    const grass1 = this.add.image(38 * 64, 17 * 64, "grass_variant_1").setOrigin(0.5, 1).setScale(0.3)
    this.decorations.add(grass1)
  }
}
