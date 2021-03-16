import Phaser from "phaser";
import { NeoMovment } from "./helper/movement_functions";
import { parallaxBackground } from "./helper/backgrounds";

const gameState = {};

export default class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: 'Level1' });
  }
    

  // 
  create() {
    
    //Creates the Parallax Background
    const width = this.scale.width
    const height = this.scale.height
    const bgOne = this.add.image(0, height, 'BG1')
    .setOrigin(0, 1)
    .setScrollFactor(0.25)
    const bgTwo = this.add.image(width, height, 'BG1')
    .setOrigin(0, 1)
    .setScrollFactor(0.25)
    const bgThree = this.add.image(0, height + height, 'BG1')
    .setOrigin(0, 1)
    .setScrollFactor(0.25)
    const bgFour = this.add.image(width, height + height, 'BG1')
    .setOrigin(0, 1)
    .setScrollFactor(0.25)
    
    //Loads the Walls and features layers of the level
    const map = this.make.tilemap({ key: "LVL1" });
    const tileset = map.addTilesetImage("lvl1_cave", "caveTiles");
    const bgWalls = map.createLayer("Background_Walls(non-colide)", tileset);
    const wallsLayer = map.createLayer("Walls", tileset);
    wallsLayer.setCollisionByProperty({ collides: true });

    //Renders main character
    gameState.Neo = this.physics.add.sprite(300, 250, "Neo").setScale(0.09);
    //Code to reduce Neo hit box size
    gameState.Neo.body.setSize(
      gameState.Neo.width * 0.5,
      gameState.Neo.height * 0.5
    );

    //camera bound to Neo and set ranges for best viewing
    this.cameras.main.setBounds(0, 0, 3200, 1400)
    this.cameras.main.startFollow(gameState.Neo, true, 0.5, 0.5)

    gameState.cursors = this.input.keyboard.createCursorKeys();

    //Adds collision factors so far just new and wallsLayer
    this.physics.add.collider(gameState.Neo, wallsLayer);

    

    //lighting
    //this creates a spotlight
    gameState.spotlight = this.make.sprite({
      x: 300,
      y: 250,
      key: 'mask',
      add: false,
      scale: 2
    });

    //these two mask the walls and some objects so they can be revealed by the gameState.spotlight
    bgWalls.mask = new Phaser.Display.Masks.BitmapMask(this, gameState.spotlight);
    wallsLayer.mask = new Phaser.Display.Masks.BitmapMask(this, gameState.spotlight);
    bgOne.mask = new Phaser.Display.Masks.BitmapMask(this, gameState.spotlight);
    bgTwo.mask = new Phaser.Display.Masks.BitmapMask(this, gameState.spotlight);
    bgThree.mask = new Phaser.Display.Masks.BitmapMask(this, gameState.spotlight);
    bgFour.mask = new Phaser.Display.Masks.BitmapMask(this, gameState.spotlight);

    //this animates the gameState.spotlight to flicker
    this.tweens.add({
        targets: gameState.spotlight,
        alpha: 0,
        duration: 2000,
        ease: 'Sine.easeInOut',
        loop: -1,
        yoyo: true
    });
    

    //energy emitter
      //still need to figure out:
        //stop looping the particle...
        //generate multiple particles, or one/two that get reused
        //have particles start/end follow map, or go whole length of map
          //figured out x/y starting positions, can randomize, but not follow camera yet
    const curveArr = [ 50, 300, 164, 246, 274, 342, 412, 257, 522, 341, 664, 264 ]
    const curveArr2 = [ 100, 350, 214, 296, 324, 392, 462, 307, 572, 391, 714, 314, 418, 515, 420, 608, 246, 635, 462, 307, 572, 391, 714, 314 ]
    const curve = new Phaser.Curves.Spline(curveArr);

    


    //I want to make 3 different energy functions, for 3 different point values
    //then I can loop over the function to create them? or try the method below this...
    const highEnergy = {quantity: 350}
    const medEnergy = {quantity: 425}
    const lowEnergy = {quantity: 500}
    const randomX = Math.floor(Math.random() * 100)
    const randomY = Math.floor(Math.random() * 100)
    const firstEnergy = {x: 0, y: -100}
    const secondEnergy = {x: 0, y: 50}
    const thirdEnergy = {x: 0, y: 200}

  const createEnergy = function(particleType, startPoint) {
    particles.createEmitter({
      frame: { cycle: false },
      scale: { start: 0.04, end: 0 },
      blendMode: 'ADD',
      emitZone: { type: 'edge', source: curve, quantity: particleType.quantity, yoyo: false },
      x: startPoint.x,
      y: startPoint.y,
      frequency: 0
    });
  }

  const hitTest = {
    contains: function (x,y) {
    
      const hit = gameState.Neo.body.hitTest(x,y);
      if (hit) {
        console.log('you got one!')
        energyCreator.explode()
        //createEnergy3.pause()
      }
      return hit;
    }
  }

  //const particleSpeed = Math.floor(Math.random() * 500) + 270
  const particles = this.add.particles('energyBall');
  

  const createEnergy2 = function(particleType, startPoint) {
    particles.createEmitter({
      frame: { cycle: false },
      scale: { start: 0.04, end: 0 },
      blendMode: 'ADD',
      emitZone: { type: 'edge', source:curve, quantity: particleType.quantity, yoyo: false },
      x: startPoint.x,
      y: startPoint.y,
      deathZone: {type: 'onEnter', source: hitTest}
    });
  }
    
    

  const createEnergy3 = function(particleType, startPoint) {
    particles.createEmitter({
      frame: { cycle: false },
      scale: { start: 0.04, end: 0 },
      blendMode: 'ADD',
      emitZone: { type: 'edge', source:curve, quantity: particleType.quantity, yoyo: false },
      x: startPoint.x,
      y: startPoint.y,
      quantity: 1,
      deathZone: { type: 'onEnter', source: hitTest }
      
    });
  }


    // createEnergy3(lowEnergy, firstEnergy)
    // createEnergy3(medEnergy, secondEnergy)
    // createEnergy3(highEnergy, thirdEnergy)
  const energyCreator = particles.createEmitter({
    frame: { cycle: false },
    scale: { start: 0.04, end: 0 },
    blendMode: 'ADD',
    emitZone: { type: 'edge', source:curve, quantity: 350, yoyo: false },
    x: 10,
    y: 50,
    quantity: 1,
    deathZone: { type: 'onEnter', source: hitTest }
    
});
    
  }

  

  update() {
     NeoMovment(gameState)
     //Conditional to load Level 2
     if (gameState.Neo.y > 1375) {
      this.scene.stop('Level1');
      this.scene.start('Level2');
    }



    function NeoMoves() {
      console.log('spotlight interval runs');
      gameState.spotlight.x = gameState.Neo.x;
      gameState.spotlight.y = gameState.Neo.y;
    
  }

  }
}