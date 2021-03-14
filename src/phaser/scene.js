import Phaser from "phaser";
import NeoImg from "../assets/Neo.png";
import caveTiles from "../assets/tiles/mainlev_build.png";
import Map_Example from "../assets/tiles/map_test.json";
import platform from "../assets/platform.png"
const gameState = {};

export default class playGame extends Phaser.Scene {
  constructor() {
    super({ key: 'playGame' });
    // this.light = null
    // this.renderTexture = null
  }
  
  preload() {
    this.load.crossOrigin = "anonymous";
    this.load.image("Neo", NeoImg);
    this.load.image("caveTiles", caveTiles);
    this.load.tilemapTiledJSON("map_example", Map_Example);
    this.load.image("platform", platform)
    this.load.image('mask', 'src/assets/mask1.png');
  //   this.load.scenePlugin({
  //     key: "IlluminatedJS",
  //     url: "path/to/illuminated.p3.js",
  //     sceneKey: "illuminated"
  // });
  }

  create() {
    //Creates the background and wall layers for example map
    const map = this.make.tilemap({ key: "map_example" });
    const tileset = map.addTilesetImage("cave", "caveTiles");
    const bg = map.createStaticLayer("Background_test", tileset);//bglayer
    const wallsLayer = map.createStaticLayer("Walls", tileset);
    
    // //for lighting - can't get walls working, stops neo loading?
    // this.cover = this.physics.add.sprite(200, 50, "Neo").setScale(.1);
    // this.cover.setTint(0x4bf542)
    // const wallsLayerCover = map.createStaticLayer("Walls", tileset);
    // wallsLayerCover.setTint(0x4bf542)

    wallsLayer.setCollisionByProperty({ collides: true });//why does this set collision and not the collider below?
    //Debug to show collision outlines in the tiles
    const debugGraphics = this.add.graphics().setAlpha(0.7);

    //commented out the yellow wall tire layer, seems like it's only for visualizing the walls?
    // wallsLayer.renderDebug(debugGraphics, {
    //   tileColor: null,
    //   collidingTileColor: new Phaser.Display.Color(243, 234, 48, 65),
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    // });

    gameState.Neo = this.physics.add.sprite(100, 50, "Neo").setScale(0.05);
    
    //Code to reduce Neo hit box size
    gameState.Neo.body.setSize(
      gameState.Neo.width * 0.5,
      gameState.Neo.height * 0.5
    );

    gameState.cursors = this.input.keyboard.createCursorKeys();
    /* Glowing has disappeared that the moment adding in the map

    gameState.graphics = this.add.graphics({
      x: (gameState.Neo.x - gameState.Neo.width / 2) - 242,
      y: (gameState.Neo.y - gameState.Neo.height / 2) -16
    })
    .fillStyle(0xffff00, 0.2)
    // .setTexture(Neo, undefined, 1)
    .fillCircle(gameState.Neo.x, gameState.Neo.y, gameState.Neo.width / 15, gameState.Neo.height / 15)

    this.tweens.add({
      targets: gameState.graphics,
      alpha: 0,
      ease: 'Cubic.easeOut',  
      duration: 1000,
      repeat: -1,
      yoyo: true
    })
    */
    //lighting attempt with method 3

    //const platform = this.add.sprite(200, 50,'platform')
    const spotlight = this.make.sprite({
      x: 100,
      y: 50,
      key: 'mask',
      add: false
    });
    bg.mask = new Phaser.Display.Masks.BitmapMask(this, spotlight);
    wallsLayer.mask = new Phaser.Display.Masks.BitmapMask(this, spotlight);

    this.input.on('Neomove', function () {

        spotlight.x = gameState.Neo.x;
        spotlight.y = gameState.Neo.y;
        

    });

    

    this.tweens.add({
        targets: spotlight,
        alpha: 0,
        duration: 2000,
        ease: 'Sine.easeInOut',
        loop: -1,
        yoyo: true
    });


    // //for lighting attempt 2 using plugin
    // this.lamps = [];

    // const lamp = this.illuminated.createLamp(
    // 150, 
    // 170, {
    //     distance: 200,
    //     diffuse: 0.8,
    //     color: "rgba(255, 255, 255, 0.9)", // 0.2
    //     radius: 0,
    //     samples: 1,
    //     angle: 0,
    //     roughness: 0
    // });


    // this.lamps.push(lamp);

    // const mask = this.illuminated.createDarkMask(this.lamps, {
    //     width: 800,
    //     height: 600,
    // }, "rgba(0, 0, 0, 0.2)");


    // const recObject = this.illuminated.createRectangleObject(0, 0, 16, 24);

    // for (let i = 0; i < this.lamps.length; i ++) {

    //   this.lamps[i].createLighting([recObject]);
    // }



    // //for lighting
    // const width = this.cover.width
		// const height = this.cover.height
    // const rt = this.make.renderTexture({
		// 	width,
		// 	height,
		// 	add: false
		// })

		// const maskImage = this.make.image({
		// 	x: 200,
		// 	Y: 50,
		// 	key: rt.texture.key,
		// 	add: false
		// })
    // this.cover.mask = new Phaser.Display.Masks.BitmapMask(this, maskImage)
		// this.cover.mask.invertAlpha = true

		// // reveal.mask = new Phaser.Display.Masks.BitmapMask(this, maskImage)

		// //this defines the size/shape of light circle, the 1 at the end represents intensity at max, 0 min
    // this.light = this.add.circle(0, 0, 30, 0x000000, 1)
		// this.light.visible = false


		// // //this assigns the pointer handler to the pointer moving, we would do same but for neo
		// this.input.on(Phaser.Input.Events.POINTER_MOVE, this.handlePointerMove, this)

		// this.renderTexture = rt

    // //end of for lighting

    //Adds collision factors so far just new and wallsLayer
    this.physics.add.collider(gameState.Neo, wallsLayer);
  }

  // //follows pointer around, can change to follow neo
  // handlePointerMove(pointer)
  // {
  //   const x = pointer.x - this.cover.x + this.cover.width * 0.5
  //   const y = pointer.y - this.cover.y + this.cover.height * 0.5

  //   this.renderTexture.clear()
  //   this.renderTexture.draw(this.light, x, y)
  // }

  update() {
    //Changed new to use velocity instead of changing location so that he hits walls
    const speed = 100;
    if (gameState.cursors.left.isDown) {

      gameState.Neo.setVelocity(-speed, 0);
      //spotlight.setVelocity(-speed, 0);
      //spotlight.x -= 3
      //neoMove()
      // gameState.graphics.x -= 3;
    } else if (gameState.cursors.right.isDown) {
      gameState.Neo.setVelocity(speed, 0);
      //spotlight.setVelocity(speed, 0);
      //spotlight.x += 3
      //neoMove()
      if (gameState.Neo.x > 800) {
        this.scene.stop('playGame');
        this.scene.start('scene2');
      }
      // gameState.graphics.x += 3;
    } else if (gameState.cursors.up.isDown) {
      gameState.Neo.setVelocity(0, -speed);
      //spotlight.setVelocity(0, -speed);
      //spotlight.y -= 3
      //neoMove()
      // gameState.graphics.y -= 3;
    } else if (gameState.cursors.down.isDown) {
      gameState.Neo.setVelocity(0, speed);
      //spotlight.setVelocity(0, speed);
      //spotlight.y += 3
      //neoMove()
      // gameState.graphics.y += 3;

      //Else to stop movement when no longer pressing an arrow key
    } else {
      gameState.Neo.setVelocity(0, 0);
      //spotlight.setVelocity(0, 0);

    }

    // const neoMove = function() {
    //   console.log("am i here?")
    //   setInterval(() => {
    //     spotlight.x = gameState.Neo.x;
    //     spotlight.y = gameState.Neo.y;
    //   }, 100)
    // }
    // neoMove()
    
  }

}
