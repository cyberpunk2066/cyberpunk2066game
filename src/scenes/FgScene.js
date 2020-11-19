import Player from "../entity/Player";
import Ground from "../entity/Ground";
import Enemy from "../entity/Enemy";
import Gun from "../entity/Gun";
import Laser from "../entity/Laser";

/**
 *
 * @param {Phaser.Scene} scene
 * @param {number} totalWidth
 * @param {string} texture
 * @param {number} scrollFactor
 */

export default class FgScene extends Phaser.Scene {
  constructor() {
    super("FgScene");
    this.collectGun = this.collectGun.bind(this);
    this.fireLaser = this.fireLaser.bind(this);
    this.hit = this.hit.bind(this);
  }

  preload() {
    // Preload Sprites
    // << LOAD SPRITES HERE >>
    this.load.spritesheet("josh", "assets/spriteSheets/josh.png", {
      frameWidth: 340,
      frameHeight: 460,
    });
    // this.load.image("ground", "assets/sprites/ground.png");
    this.load.image("brandon", "assets/sprites/brandon.png");
    this.load.image("gun", "assets/sprites/gun.png");
    this.load.image("laser", "assets/sprites/laserBolt.png");

    this.load.image(
      "far-buildings",
      "assets/backgrounds/cyberpunk/long/far-buildings.png"
    );
    this.load.image(
      "back-buildings",
      "assets/backgrounds/cyberpunk/long/back-buildings.png"
    );
    this.load.image(
      "foreground",
      "assets/backgrounds/cyberpunk/long/foreground.png"
    );
    this.load.image("ground", "assets/backgrounds/cyberpunk/long/ground.png");

    // Preload Sounds
    // << LOAD SOUNDS HERE >>
  }

  createGround(x, y, count, texture) {
    const w = this.textures.get(texture).getSourceImage().width;
    let wid = x;
    for (let i = 0; i < count; i++) {
      this.groundGroup.create(wid, y, texture).setScale(3.1).alpha = 0;
      wid += w;
    }
  }

  createLooped(totalWidth, texture, scrollFactor) {
    const w = this.textures.get(texture).getSourceImage().width;
    const count = Math.ceil(totalWidth / w) * scrollFactor;

    let x = -150;
    for (let i = 0; i < count; ++i) {
      const m = this.add
        .image(x, game.config.height * 0.5, texture)
        .setScale(3.1)
        .setScrollFactor(scrollFactor);
      x += m.width * 1.8;
    }
  }

  create() {
    // Create game entities
    // << CREATE GAME ENTITIES HERE >>
    const width = game.config.width;
    const height = game.config.height;
    const totalWidth = width * 20;

    //BACKROUND
    this.createLooped(totalWidth, "far-buildings", 0.08);
    this.createLooped(totalWidth, "back-buildings", 0.18);
    this.createLooped(totalWidth, "foreground", 0.23);

    //GROUND
    this.groundGroup = this.physics.add.staticGroup({ classType: Ground });
    this.createGround(0, 570, 40, "ground");

    //ENTITIES
    this.player = new Player(this, 20, 400, "josh").setScale(0.25);
    this.enemy = new Enemy(this, 600, 400, "brandon").setScale(0.25);
    this.gun = new Gun(this, 300, 400, "gun").setScale(0.25);

    //PHYSICS
    this.physics.add.collider(this.player, this.groundGroup);
    this.physics.add.collider(this.enemy, this.groundGroup);
    this.physics.add.collider(this.player, this.enemy);
    this.physics.add.collider(this.gun, this.groundGroup);
    this.lasers = this.physics.add.group({
      classType: Laser,
      runChildUpdate: true,
      allowGravity: false,
    });

    //MOVEMENT
    this.cursors = this.input.keyboard.createCursorKeys();

    //CAMERA
    // set workd bounds to allow camera to follow the player
    this.myCam = this.cameras.main;
    this.myCam.setBounds(0, 0, width * 20, height);
    this.cameras.main.startFollow(this.player);

    //COLLISIONS
    this.physics.add.overlap(
      this.player,
      this.gun,
      this.collectGun,
      null,
      this
    );
    // When the laser collides with the enemy
    this.physics.add.overlap(this.lasers, this.enemy, this.hit, null, this);

    //ANIMATIONS
    this.createAnimations();
    // Create sounds
    // << CREATE SOUNDS HERE >>
    // Create collisions for all entities
    // << CREATE COLLISIONS HERE >>
  }

  // time: total time elapsed (ms)
  // delta: time elapsed (ms) since last update() call. 16.666 ms @ 60fps
  update(time, delta) {
    // << DO UPDATE LOGIC HERE >>
    this.player.update(this.cursors);
    this.gun.update(
      time,
      this.player,
      this.cursors,
      this.fireLaser // Callback fn for creating lasers
    );
  }

  fireLaser(x, y, left) {
    // These are the offsets from the player's position that make it look like
    // the laser starts from the gun in the player's hand
    const offsetX = 56;
    const offsetY = 14;
    const laserX =
      this.player.x + (this.player.facingLeft ? -offsetX : offsetX);
    const laserY = this.player.y + offsetY;

    // Create a laser bullet and scale the sprite down
    const laser = new Laser(
      this,
      laserX,
      laserY,
      "laser",
      this.player.facingLeft
    ).setScale(0.25);
    // Add our newly created to the group
    this.lasers.add(laser);
  }

  // make the laser inactive and insivible when it hits the enemy
  hit(enemy, laser) {
    laser.setActive(false);
    laser.setVisible(false);
  }

  createAnimations() {
    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("josh", { start: 17, end: 20 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "jump",
      frames: [{ key: "josh", frame: 17 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "idleUnarmed",
      frames: [{ key: "josh", frame: 11 }],
      frameRate: 10,
    });
    this.anims.create({
      key: "idleArmed",
      frames: [{ key: "josh", frame: 6 }],
      frameRate: 10,
    });
  }

  collectGun(player, gun) {
    gun.disableBody(true, true);
    this.player.armed = true;
  }
}
