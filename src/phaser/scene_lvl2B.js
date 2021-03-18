import Phaser from "phaser";
import { NeoMovment } from "./helper/movement_functions";
import { pause } from "./helper/pause_functions";
import { applyColourAnimations } from "./helper/colour_shift";
import { gameState } from "./scene_lvl2";

export default class Level2B extends Phaser.Scene {
  constructor() {
    super({ key: 'Level2B' });
  }

  init(data){
    console.log('init', data);
    gameState.backgroundMusic = data.backgroundMusic;
  }

  create() {
    console.log("gameState", gameState);
    gameState.timer = this.time.addEvent({
      delay: 45000, 
      paused: false
    });
    gameState.text = this.add.text(20, 420, '', { fill: "#ffffff", font: 'bold system-ui', fontSize: "14px"});
    console.log(gameState.text.font);
    gameState.text.setScrollFactor(0);
    //passes in data in object from scene 1
    //Creates the Parallax Background
    const width = this.scale.width
    const height = this.scale.height
    const bg1 = this.add.image(0, height, 'BG1')
    .setOrigin(0, 1)
    .setScrollFactor(0.25)
    const bg2 = this.add.image(width + 360, height, 'BG1')
    .setOrigin(0, 1)
    .setScrollFactor(0.25)
    const bg3 = this.add.image(0, height + height + 30, 'BG1')
    .setOrigin(0, 1)
    .setScrollFactor(0.25)
    const bg4 = this.add.image(width + 360, height + height + 30, 'BG1')
    .setOrigin(0, 1)
    .setScrollFactor(0.25)

    gameState.cursors = this.input.keyboard.createCursorKeys(); 
    gameState.shiftAvailable = false;
    gameState.overylay;
    gameState.shakeAvailable = false;
    gameState.currentState = 2; //neo is initially at index of 2
    gameState.paused = false; 

    //Renders Neo
    gameState.Neo = this.physics.add.sprite(gameState.Neo.x,gameState.Neo.y, "Neo").setScale(0.09);
    gameState.Neo.setFrame(1);
    //Code to reduce Neo hit box size
    gameState.Neo.body.setSize(
      gameState.Neo.width * 0.5,
      gameState.Neo.height * 0.5
    );

    //variables to store the rendered maps depending on color shift
  
    //Just dummy variable to load the differing layers on level 2. True is normal and false is infa-red
    
    gameState.map = this.make.tilemap({ key: "LVL2" });
      //Renders normal level
      const tileset = gameState.map.addTilesetImage("cave_lvl2", "caveTiles");
      gameState.wallsLayer3 = gameState.map.createLayer("A_Layer_Walls", tileset);
      gameState.wallsLayer3.setCollisionByProperty({ collides: true });
  

    gameState.spotlight = this.make.sprite({
      x: 2800,
      y: 25,
      key: "mask",
      add: false,
      scale: 2,
    });

    //Adds the spotlightmasking. Couldn't figure out how to modulize this for helper function
    gameState.wallsLayer3.mask = new Phaser.Display.Masks.BitmapMask(this, gameState.spotlight);
    bg1.mask = new Phaser.Display.Masks.BitmapMask(this, gameState.spotlight);
    bg2.mask = new Phaser.Display.Masks.BitmapMask(this, gameState.spotlight);
    bg3.mask = new Phaser.Display.Masks.BitmapMask(this, gameState.spotlight);
    bg4.mask = new Phaser.Display.Masks.BitmapMask(this, gameState.spotlight);
    
    gameState.boom = false;
    this.physics.add.collider(gameState.Neo, gameState.wallsLayer3, () => {
      console.log('you hit a wall!')
      this.cameras.main.shake(100, .01)
      // gameState.energy -= 0.25
      // bar.animateToFill(gameState.energy/100)
      const ouch = this.add.image(300, 225, "impact");
      ouch.setScrollFactor(0);
      if (!gameState.isPlaying)gameState.boom = true;
      setTimeout(() => {
        ouch.destroy();
      }, 2000)
    });

    const debugGraphics = this.add.graphics().setAlpha(0.7);
    gameState.wallsLayer3.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 234, 48, 65),
    faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    });

    //Renders and fades in and out the spotlight
    this.tweens.add({
      targets: gameState.spotlight,
      alpha: 0,
      duration: 2000,
      ease: "Sine.easeInOut",
      loop: -1,
      yoyo: true,
    });

    
    
    //Camera to follow Neo and set to level bounds
    this.cameras.main.setBounds(0, 0, 3200, 1600)
    this.cameras.main.startFollow(gameState.Neo, true, 0.5, 0.5)


    // gameState.boom = false;
    // this.physics.add.collider(gameState.Neo, wallsLayer2, () => {
    //   console.log('you hit a wall!')
    //   this.cameras.main.shake(100, .01)
    //   gameState.energy -= 0.25
    //   bar.animateToFill(gameState.energy/100)
    //   const ouch = this.add.image(300, 225, "impact");
    //   ouch.setScrollFactor(0);
    //   if (!gameState.isPlaying)gameState.boom = true;
    //   gameState.boom = true;
    //   setTimeout(() => {
    //     ouch.destroy();
    //   }, 2000)
    // });

    // this.physics.add.collider(gameState.Neo, wallsLayer1, () => {
    //   console.log('you hit a wall!')
    //   this.cameras.main.shake(100, .01)
    //   gameState.energy -= 0.25
    //   bar.animateToFill(gameState.energy/100)
    //   const ouch = this.add.image(300, 225, "impact");
    //   ouch.setScrollFactor(0);
    //   if (!gameState.isPlaying)gameState.boom = true;
    //   setTimeout(() => {
    //     ouch.destroy();
    //   }, 2000)
    // });

  }

  update() {
    const shiftStates = ["ultraviolet", "neoVision", "infrared"];
    pause(gameState);
    NeoMovment(gameState);
    applyColourAnimations(gameState, this.scene.scene, shiftStates);
    //rotates shift powerup sprite
    gameState.powerUp.angle += 1;

    if (gameState.timer) {
      //if shift is pressed then we can start timer
      gameState.text
      .setFill("#ffffff")
      .setText(gameState.timer.getRemainingSeconds().toFixed(1));
      gameState.timeLeft = gameState.timer.getRemainingSeconds();
    }

    if (gameState.timeLeft <= 20 && gameState.timeLeft > 10) { //30 seconds left
      console.log("less than 30 secs");
      if (!gameState.danger) {
        gameState.danger = this.add.image(300, 225, "danger1");
        //fix changing font
        gameState.text.setFontSize(26);
        console.log(gameState.text.font);
        gameState.danger.setScrollFactor(0);
        gameState.heart = this.sound.add("heart").play();
        gameState.backgroundMusic.setVolume(0.01);
        setInterval(() => {
          this.cameras.main.shake(100, .01);
        },3000);
      }
      //add heartbeat and footstep sounds
    } else if (gameState.timeLeft <= 10 && gameState.timeLeft > 0) { //10 seconds left
      console.log("less than 10 secs");
      if (!gameState.dangerOverlay) {
        gameState.dangerOverlay = this.add.image(300, 225, "redOverlay");
        gameState.dangerOverlay.setScrollFactor(0);
        this.sound.add("breathe", {volume: 0.01}).play();
        gameState.backgroundMusic.setRate(2.0).setVolume(0.01);
        clearInterval();
        setInterval(() => {
          this.cameras.main.shake(300, .02);
        },2000);
      }
    } else if (gameState.timeLeft <= 0) {
      gameState.danger.destroy();
      gameState.dangerOverlay.destroy();
      clearInterval();
      //trigger game over
    }
  

    if (gameState.s) {
      this.sound.add("sparkle", {volume: 0.5}).play();
      gameState.s = false;
    }

    if (gameState.boom) {
      gameState.isPlaying = this.sound.add("wallCollide", {volume: 0.02}).play();
      gameState.boom = false;
      setTimeout(() => {
        gameState.isPlaying = null;
      },1000)
    }
  }
}