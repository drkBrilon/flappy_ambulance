let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);
let ambulance;
let obstacles;
let redCrosses;
let score = 0;
let scoreText;
let highScore = 0;
let highScoreText;
let soundHorn, soundAlarm;
let gameOver = false;

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('ambulance', 'assets/ambulance.png');
    this.load.image('redCross', 'assets/red_cross.png');
    this.load.image('pipe', 'assets/pipe.png');
    this.load.audio('horn', 'assets/horn.mp3');
    this.load.audio('alarm', 'assets/alarm.mp3');
}

function create() {
    this.add.image(400, 300, 'background');
    ambulance = this.physics.add.sprite(100, 300, 'ambulance');
    ambulance.setCollideWorldBounds(true);
    this.input.on('pointerdown', () => ambulance.setVelocityY(-200));
    obstacles = this.physics.add.group();
    redCrosses = this.physics.add.group();
    this.time.addEvent({ delay: 2000, callback: addObstacle, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 1500, callback: addRedCross, callbackScope: this, loop: true });
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
    highScore = localStorage.getItem('highScore') || 0;
    highScoreText = this.add.text(16, 50, `Highscore: ${highScore}`, { fontSize: '24px', fill: '#fff' });
    soundHorn = this.sound.add('horn');
    soundAlarm = this.sound.add('alarm');
    this.physics.add.collider(ambulance, obstacles, endGame, null, this);
    this.physics.add.overlap(ambulance, redCrosses, collectRedCross, null, this);
}

function update() {
    if (gameOver) return;
    if (ambulance.y >= 600 || ambulance.y <= 0) {
        endGame();
    }
}

function addObstacle() {
    let gap = Phaser.Math.Between(150, 400);
    let pipeTop = obstacles.create(800, gap - 200, 'pipe');
    let pipeBottom = obstacles.create(800, gap + 200, 'pipe');
    pipeTop.setVelocityX(-200);
    pipeBottom.setVelocityX(-200);
    pipeTop.setImmovable(true);
    pipeBottom.setImmovable(true);
}

function addRedCross() {
    let y = Phaser.Math.Between(100, 500);
    let redCross = redCrosses.create(800, y, 'redCross');
    redCross.setVelocityX(-200);
}

function collectRedCross(ambulance, redCross) {
    redCross.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
    soundHorn.play();
}

function endGame() {
    gameOver = true;
    this.physics.pause();
    ambulance.setTint(0xff0000);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        soundAlarm.play();
    }
    highScoreText.setText(`Highscore: ${highScore}`);
    this.add.text(300, 250, 'Game Over! Tap to Restart.', { fontSize: '32px', fill: '#fff' });
    this.input.once('pointerdown', () => this.scene.restart());
}
