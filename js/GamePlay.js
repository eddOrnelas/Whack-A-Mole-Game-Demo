/* global MainGameContainer */
MainGameContainer.GamePlay = function (game) { };

MainGameContainer.GamePlay.prototype = {
  // Game Objects or Groups
  bgMusic: undefined,
  buttons: {
    cursors: undefined,
    startButton: undefined,
    restartButton: undefined,
  },
  ui: {
    timeLabel: undefined,
    scoreLabel: undefined,
    livesLabel: undefined,
    startLabel: undefined,
    restartLabel: undefined,
  },
  sounds: {
    coin: undefined,
  },
  events: {
    // throwItems: undefined,
  },
  gameState: 'preparing',
  mainMenuBackground: undefined,
  timeCount: 0,
  livesCount: 3,
  scoreCount: 0,
  gameLevel: 0,
  enemies: undefined,
  holes: [
    { x: 80, y: 96 },
    { x: 144, y: 192 },
    { x: 240, y: 96 },
    { x: 80, y: 288 },
    { x: 172, y: 384 },
    { x: 240, y: 288 },
    { x: 80, y: 480 },
    { x: 144, y: 576 },
    { x: 240, y: 480 },
  ],
  holes2: [
    { x: 64, y: 96 },
    { x: 128, y: 192 },
    { x: 224, y: 96 },
    { x: 64, y: 288 },
    { x: 160, y: 384 },
    { x: 224, y: 288 },
    { x: 64, y: 480 },
    { x: 128, y: 576 },
    { x: 224, y: 480 },
  ],
  xMargin: 20,
  yMargin: -16,
  preload: function () { },
  shutdown: function () {
    this.game.world.removeAll();
    // reset everything
    this.resetAll();
  },
  create: function () {
    this.game.time.advancedTiming = true;

    // set game world size
    this.game.world.setBounds(0, 0, 360, 640);

    // BG image
    this.mainMenuBackground = this.add.sprite(this.xMargin, 0, 'game_bg');

    // init sounds
    this.initSounds();

    // init ui
    this.addUIElements();

    // set lives
    this.livesCount = 3;

    // start body Groups
    this.enemies = this.game.add.group();

    // start button
    var style = {
      font: '22px Arial',
      fill: '#FFFFFF',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2,
    };
    this.buttons.startButton = this.game.add.button(this.game.world.centerX - 85, this.game.world.centerY, 'preloaderBar', this.startGame, this, 2, 1, 0);
    this.ui.startLabel = this.game.add.text(this.game.world.centerX - 25, this.game.world.centerY + 10, 'START', style);

  },
  update: function () {
    this.updateUI();
    var self = this;

    if (self.gameState === 'playing') {
      this.enemies.forEach(function (enemy) {
        if (enemy.input.pointerOver()
          && (self.game.input.activePointer.leftButton.isDown || self.game.input.pointer1.isDown)
          && self.gameState === 'playing') {
          if (enemy.type === 'bomb') {
            self.sounds.hit.play();
            self.livesCount = 0;
            enemy.destroy();
            self.gameState = 'gameOver';
            self.gameOverState();
          } else {
            self.enemyDestroy(enemy);
          }
        }
      });
    }
  },
  initSounds() {
    this.sounds.coin = this.game.add.audio('coin');
    this.sounds.smash = this.game.add.audio('confirm');
    this.sounds.hit = this.game.add.audio('error');
    this.sounds.mushrom = this.game.add.audio('loadsave');
  },
  startGame() {
    this.buttons.startButton.destroy();
    this.ui.startLabel.visible = false;
    this.gameState = 'playing';

    // game music
    this.bgMusic = this.game.add.audio('blue_beat');
    this.bgMusic.volume = 0.2;
    this.bgMusic.loop = true;
    this.bgMusic.play();

    var self = this;

    this.events.throwItems = self.game.time.events.loop(Phaser.Timer.SECOND * 2.5, function () {
      if (self.gameState === 'playing') {
        self.showEnemies();
      }
    }, self);

    self.showEnemies();
  },
  showEnemies() {
    this.gameLevel += 1;
    var totalEnemies = 0;

    if (this.gameLevel >= 1 && this.gameLevel <= 3) {
      totalEnemies = 1;
    } else if (this.gameLevel >= 4 && this.gameLevel <= 6) {
      totalEnemies = 2;
    } else if (this.gameLevel >= 7 && this.gameLevel <= 9) {
      totalEnemies = 3;
    } else if (this.gameLevel >= 10 && this.gameLevel <= 13) {
      totalEnemies = 4;
    } else {
      totalEnemies = 5;
    }

    var self = this;
    var openSpaces = JSON.parse(JSON.stringify(this.holes));

    for (var x = 0; x < totalEnemies; x++) {
      var position = Math.floor((Math.random() * openSpaces.length));
      var openSpace = openSpaces[position];
      openSpaces.splice(position, 1);
      self.createEnemy(openSpace.x, openSpace.y);
    }
  },
  createEnemy(xPos, yPos) {
    var randomNumber = Math.floor((Math.random() * 100));
    var spriteType = '';
    if (randomNumber >= '80') {
      spriteType = 'bomb';
    } else {
      spriteType = 'mole';
    }

    var sprite = this.enemies.create(xPos + this.xMargin, yPos + this.yMargin, spriteType);
    sprite.type = spriteType;
    sprite.state = 'spawing';
    sprite.inputEnabled = true;
    sprite.anchor.setTo(0.5, 0.5);
    sprite.alpha = 0;

    var tweenA = this.game.add.tween(sprite).to({ alpha: 1 }, 1000, 'Linear');
    var tweenB = this.game.add.tween(sprite).to({ alpha: 0.10 }, 1000, 'Linear');
    setTimeout(function() {
      sprite.destroy();
    }, 2500);
    tweenA.chain(tweenB);
    tweenA.start();

    return sprite;
  },
  enemyDestroy(enemy) {
    this.sounds.smash.play();
    this.scoreCount += 100;
    enemy.destroy();
  },
  addUIElements() {
    // set text label style
    var style = {
      font: '16px Arial',
      fill: '#FFFFFF',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2,
    };

    // add labels/texts
    this.ui.scoreLabel = this.game.add.text(50, 5, 'Score: ' + this.scoreCount, style);
    this.ui.scoreLabel.fixedToCamera = true;
    // this.ui.livesLabel = this.game.add.text(200, 5, 'Lives: ' + this.livesCount, style);
    // this.ui.livesLabel.fixedToCamera = true;
  },
  updateUI() {
    this.ui.scoreLabel.setText('Score: ' + this.scoreCount);
    // this.ui.livesLabel.setText('Lives: ' + this.livesCount);
  },
  gameOverState() {
    window.console.log('gameOverState');
    var style = {
      font: '22px Arial',
      fill: '#FFFFFF',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2,
    };

    this.buttons.restartButton = this.game.add.button(this.game.world.centerX - 85, this.game.world.centerY, 'preloaderBar', this.restartGame, this, 2, 1, 0);
    this.ui.restartLabel = this.game.add.text(this.game.world.centerX - 45, this.game.world.centerY + 10, 'RESTART', style);
    this.bgMusic.stop();
    this.game.time.events.remove(this.events.drawSlash);
    this.game.time.events.remove(this.events.throwItems);
    this.enemies.removeAll();
  },
  restartGame() {
    this.buttons.restartButton.destroy();
    this.ui.restartLabel.visible = false;
    this.game.physics.arcade.isPaused = false;
    this.bgMusic.play();
    this.livesCount = 3;
    this.scoreCount = 0;
    this.gameLevel = 0;
    this.gameState = 'playing';

    const self = this;
    this.events.throwItems = self.game.time.events.loop(Phaser.Timer.SECOND * 2, function () {
      if (self.gameState === 'playing') {
        self.showEnemies();
      }
    }, self);

    self.showEnemies();
  },
  render() {
    this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
    var self = this;
    // this.enemies.forEach(function (item) {
      // self.game.debug.body(item);
    // });

  },
};
