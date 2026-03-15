import { BaseLevelScene } from './BaseLevelScene.js'
import { KakashiPlayer } from './KakashiPlayer.js'
import { SoundNinja } from './SoundNinja.js'

export class Level2Scene extends BaseLevelScene {
  constructor() {
    super({ key: "Level2Scene" })
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
    this.player = new KakashiPlayer(this, 3 * 64, 18 * 64)
  }

  createEnemies() {
    // 4 enemies spread across the level
    const enemy1 = new SoundNinja(this, 12 * 64, 17 * 64)
    this.enemies.add(enemy1)
    
    const enemy2 = new SoundNinja(this, 15 * 64, 12 * 64)
    this.enemies.add(enemy2)
    
    const enemy3 = new SoundNinja(this, 13 * 64, 15 * 64)
    this.enemies.add(enemy3)
    
    const enemy4 = new SoundNinja(this, 17 * 64, 16 * 64)
    this.enemies.add(enemy4)
  }

  createBackground() {
    let backgroundKey = "forest_background"
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
    if(this.groundLayer){ this.groundLayer.setCollisionByExclusion([-1])
    }else[
  console.log("Ground Layer not found in tilemap")]
  }

  createDecorations() {
    const tree1 = this.add.image(2 * 64, 18 * 64, "trees_variant_1").setOrigin(0.5, 1).setScale(0.6)
    this.decorations.add(tree1)
    
    const bush1 = this.add.image(6 * 64, 14 * 64, "bushes_variant_1").setOrigin(0.5, 1).setScale(0.4)
    this.decorations.add(bush1)
    
    const tree2 = this.add.image(14 * 64, 17 * 64, "trees_variant_2").setOrigin(0.5, 1).setScale(0.6)
    this.decorations.add(tree2)
    
    const rock1 = this.add.image(22 * 64, 15 * 64, "rocks_variant_1").setOrigin(0.5, 1).setScale(0.5)
    this.decorations.add(rock1)
    
    const tree3 = this.add.image(27 * 64, 10 * 64, "trees_variant_3").setOrigin(0.5, 1).setScale(0.6)
    this.decorations.add(tree3)
    
    const grass1 = this.add.image(33 * 64, 16 * 64, "grass_variant_1").setOrigin(0.5, 1).setScale(0.3)
    this.decorations.add(grass1)
  }
}
