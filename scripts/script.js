var enemies = [];
var startTime = 0;
var FONT = "share-regular,'Arial Narrow',sans-serif";
var CANVAS_WIDTH= 900; // width of canvas
var CANVAS_HEIGHT= 900; // width of canvas
var LINE_HEIGHT = 25; // height of a single "line" of incoming gestures
var ENEMY_SCREEN_CROSS_TIME = 1000; // time taken by an enemy crossing the scren
var PROJECTILE_SCREEN_CROSS_TIME = 1000; //time taken by a projectile crossing the screen
var ANIMATION_SPEED = {
    player: 0.03,
    fireball: 0.025,
    rock: 0.01,
    lightning: 0.02
};
var V_OFFSET =0;
var START_DELAY = 3000+ENEMY_SCREEN_CROSS_TIME; // delay until the game starts var MS_PER_BEAT = 1000; 
var types= ["rock", "lightning", "fireball"];
var oldestEnemy = 0; // keeps track of the oldest enemy in enemies
var lanes = 3; // lanes of attack
var guides = [];// set of horizontal line guides for showing incoming jazz
var score = 0; 
var scoreElt; //element to store the Score div
var lives = 3;
var livesElt;
var player; 
var projectiles = []; //array of players on the screen
var stage;
var background;
var parallax;
var enemySheets = {
    rock : new createjs.SpriteSheet({
        images: ['./res/rock.png'],
        frames: {
            width: 100, 
            height: 100
        },
        animations: {
            walk: {
                frames: [0, 1, 2, 3],
                speed: ANIMATION_SPEED.rock,
                next: "walk"
            },
            die: {
                frames: [12, 13, 14, 15],
                speed: ANIMATION_SPEED.rock
            }
        }
    }),
    fireball : new createjs.SpriteSheet({
        images: ['./res/fire.png'],
        frames: {
            width: 100, 
            height: 100
        },
        animations: {
            walk: {
                frames: [0, 1, 2, 3, 4],
                speed: ANIMATION_SPEED.fireball,
                next: "walk"
            },
            die: {
                frames: [11, 12, 13, 14, 15],
                speed: ANIMATION_SPEED.fireball
            }
        }
    }),
    lightning : new createjs.SpriteSheet({
        images: ['./res/lightning.png'],
        frames: {
            width: 100, 
            height: 100
        },
        animations: {
            walk: {
                frames: [0, 1, 2, 3, 4],
                speed: ANIMATION_SPEED.lightning,
                next: "walk"
            },
            die: {
                frames: [12, 13, 14, 15],
                speed: ANIMATION_SPEED.lightning
            }
        }
    })
}

/////////////////////////////////////////////////
// GRAPHICS 
/////////////////////////////////////////////////
function initScore () {
    score = 0;
    scoreElt=document.getElementById("score");
    scoreElt.innerHTML = score;
}

function changeScore(delta) {
    score += delta;
    scoreElt.innerHTML = score;
}

function initLives () {
    livesElt=document.getElementById("lives");
    lives = 3;
    livesElt.innerHTML = lives;
}

function changeLives(delta) {
    lives += delta;
    livesElt.innerHTML= lives;
    if (lives==0)
        gameOver();
}

/////////////////////////////////////////////////
// PLAYER 
/////////////////////////////////////////////////
function Character() {
    this.lane = 1;
    this.sheet = new createjs.SpriteSheet({
            images: ['./res/character.png'],
            frames: {
                width: 100, 
                height: 100
            },
            animations: {
                walk: {
                    frames: [0, 1, 2, 3, 14],
                    speed: ANIMATION_SPEED.player,
                    next: "walk"
                },
                shoot: {
                    frames: [4, 5, 6, 8],
                    speed: ANIMATION_SPEED.player,
                    next: "walk"
                },
                die: {
                    frames: [9, 10, 11, 12, 13],
                    speed: ANIMATION_SPEED.player
                }
            }
        });
    this.sprite = new createjs.Sprite(this.sheet);
    this.sprite.x = 25;
    this.sprite.y = V_OFFSET + 10 + 2 * LINE_HEIGHT;
    this.looseLife = function () {
        changeLives(-1);
    }
    this.setY = function() {
        this.sprite.y = V_OFFSET + 10 + LINE_HEIGHT* (this.lane + 1);
    }
    // Add Shape instance to stage display list.
    stage.addChild(this.sprite);
    this.sprite.gotoAndPlay("walk");
    // Update stage will render next frame
    this.draw = function() {
        stage.update();
    }
    this.remove = function () {
        stage.removeChild(this.sprite);
    }

    this.checkCollision = function () {
        var first = getFirstEnemyByLane(lane);
        var intersection = ndgmr.checkPixelCollision(this.sprite, first.enemy.enemy);
        if (intersection) {
            first.enemy.kill(1);
            return true;
        } else {
            return false;
        }
    }

    this.shoot = function() {
        this.sprite.gotoAndPlay("shoot");
    }
}

function initPlayer() {
    if (player){
        player.remove();
        delete player;
    }
    player = new Character();
}

/////////////////////////////////////////////////
// PROJECTILES
/////////////////////////////////////////////////

function Projectile (lane, type){
    this.lane = lane;
    this.type = type;

    this.type= type;
    this.lane = lane;
    this.lastUpdate = new Date().getTime();
    this.sheet = new createjs.SpriteSheet({
            images: ['./res/attacks.png'],
            frames: {
                width: 50, 
                height: 50
            },
            animations: {
                fireball: {
                    frames: [3, 4],
                    speed: 0.05,
                    next: "fireball"
                },
                lightning: {
                    frames: [0, 1],
                    speed: 0.05,
                    next: "lightning"
                },
                rock: {
                    frames: [2],
                    speed: 0.05
                }
            }
        });
    this.proj = new createjs.Sprite(this.sheet);
    
    // Animation
    this.proj.gotoAndPlay(types[this.type]);

    this.proj.scaleX=2;
    this.proj.scaleY=2;
    this.proj.x = player.sprite.x+40;
    this.proj.y = player.sprite.y;
    stage.addChild(this.proj);

    this.remove = function () {
        stage.removeChild(this.proj);
    }
    this.update= function () {
        this.proj.x += CANVAS_WIDTH * (new Date().getTime() - this.lastUpdate)/PROJECTILE_SCREEN_CROSS_TIME;
        this.lastUpdate = new Date().getTime();
    }
    this.checkCollision=function() {
        var first = getFirstEnemyByLane(lane);
        var intersection = ndgmr.checkPixelCollision(this.proj, first.enemy.enemy);
        if (intersection) {
            if (first.enemy.type == this.type){
                first.enemy.kill(1);
            }
            return true;
        } else {
            return false;
        }
    }
}

function drawProjectiles() {
    projectiles = projectiles.filter(function (entry) {
        entry.update();
        var collision = entry.checkCollision();
        if (collision || entry.proj.x>CANVAS_WIDTH+300){
            entry.remove();
            return false;
        }
        return true;
    });
    stage.update();
}

function createProjectile(type) {
    var proj = new Projectile(player.lane, type);
    projectiles.push(proj);
}

/////////////////////////////////////////////////
// ENEMY RELATED STUFF
/////////////////////////////////////////////////
function Enemy(hitTime, type, lane) {
    this.enemy = new createjs.Sprite(enemySheets[types[type]]);
    stage.addChild(this.enemy);
    this.enemy.gotoAndPlay("walk");
    //Update stage will render next frame
    this.hitTime= hitTime;
    this.type= type;
    this.dead = false;
    this.lane = lane;
    this.enemy.y = V_OFFSET + 10 + LINE_HEIGHT * (lane + 1);
    this.enemy.x = CANVAS_WIDTH + 2000;//offscreen hack
    this.remove = function () {
        stage.removeChild(this.enemy);
    }
    this.setX = function () {
        if (this.enemy.x >-150){
            this.enemy.x =CANVAS_WIDTH *  (startTime + this.hitTime - new Date().getTime())/ENEMY_SCREEN_CROSS_TIME;
        } else {
            this.dead=true;
            changeLives(-1);
            this.remove();
        }
    }
    this.setX();;
    // call this if this beat is killed
    this.kill = function (scoreChange) {
        this.dead=true;
        this.enemy.gotoAndPlay("die");
        changeScore(scoreChange);
        setTimeout(this.remove.bind(this), 200);
    }
}
function getFirstEnemyByLane(lane) {
    for (var i = 0; i < enemies.length; i ++) {
        if (enemies[i].lane == lane){
            return {enemy:enemies[i], index:i};
        }
    }
    return null;
}

function generateEnemy() {
    var lane= Math.floor(Math.random() * lanes);
    var type= Math.floor(Math.random() * types.length);
    var time = Math.max(2000, Math.floor(Math.random() * 4000));
    if (oldestEnemy == 0) {
        oldestEnemy = START_DELAY;
    } else {
        oldestEnemy += time;
    }
    var beat = new Enemy (oldestEnemy, type, lane);
    return beat;
}

function initEnemies () {
    enemies=enemies.filter(function (entry) {
        entry.remove();
        return false;
    });
    oldestEnemy=0;
    for (var i =0; i < 10; i++){
        enemies.push(generateEnemy());
    }
}

function drawEnemies () {
    if (enemies.length < 10){
        enemies.push(generateEnemy());
    }
    enemies = enemies.filter(function (entry) {
        entry.setX();
        if (entry.dead)
            return false;
        return true;
    });
    stage.update();
}

/////////////////////////////////////////////////
// BACKGROUND
/////////////////////////////////////////////////
function Background() {
    this.file = document.createElement("img");
    this.file.onload = "draw";
    this.file.src="res/background.png"
    this.sprites = [];

    this.draw = function() {
        for (i = 0 ; i < this.sprites.length; i++) {
            this.sprites[i].x -= 2;
            if (this.sprites[i].x < -1313) this.sprites[i].x += 1313*(this.sprites.length);
        }
        stage.update();
    };

    this.resize = function() {
        this.sprites = [];
        for (i = 0; i < CANVAS_WIDTH + 1313; i+= 1313) {
            this.sprites.push(new createjs.Bitmap(this.file));
            this.sprites[this.sprites.length - 1].x = i;
            this.sprites[this.sprites.length - 1].y = V_OFFSET;
            stage.addChild(this.sprites[this.sprites.length - 1]);
        }
    };
}

function Parallax() {
    this.file = document.createElement("img");
    this.file.onload = "draw";
    this.file.src="res/parallax.png"
    this.sprites = [];

    this.draw = function() {
        for (i = 0 ; i < this.sprites.length; i++) {
            this.sprites[i].x -= 1;
            if (this.sprites[i].x < -512) this.sprites[i].x += 512*(this.sprites.length);
        }
        stage.update();
    };

    this.resize = function() {
        this.sprites = [];
        for (i = 0; i < CANVAS_WIDTH + 512; i+= 512) {
            this.sprites.push(new createjs.Bitmap(this.file));
            this.sprites[this.sprites.length - 1].x = i;
            this.sprites[this.sprites.length - 1].y = V_OFFSET;
            stage.addChild(this.sprites[this.sprites.length - 1]);
        }
    };
}



/////////////////////////////////////////////////
// INTERACTION WITH MYO 
/////////////////////////////////////////////////
function onPose(gesture) {
    switch(gesture) {
        case "move_left":
            if (player.lane > 0) player.lane--;
            player.setY();
            break;
        case "move_right":
            if (player.lane < 2) player.lane++;
            player.setY();
            break;
        default:
            player.shoot.bind(player)();
            setTimeout(function() {
                createProjectile(types.indexOf(gesture));
            }, 400);
    }
}

/////////////////////////////////////////////////
// GAME LOGIC
/////////////////////////////////////////////////

function gameOver() {
    createjs.Ticker.removeAllEventListeners();
    var elt = document.createElement("DIV");
    var text = document.createTextNode("Game Over Man");
    text.id="gameOverText";
    elt.appendChild(text);
    elt.id="gameOver";
    elt.style="font-size:64pt";
    document.body.appendChild(elt);

    createjs.Ticker.removeAllEventListeners();
    setTimeout(function () {
        document.body.removeChild(elt);
    }.bind(this), 2000);
    setTimeout(initGame, 2000);
}

function initGame() {
    // BEGIN GAME STATE INITIALIZATION
    startTime = new Date().getTime();
    initScore();
    initLives();
    initEnemies();
    initPlayer();
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", player.draw.bind(player));
    createjs.Ticker.addEventListener("tick", drawEnemies);
    createjs.Ticker.addEventListener("tick", drawProjectiles);
    createjs.Ticker.addEventListener("tick", parallax.draw.bind(parallax));
    createjs.Ticker.addEventListener("tick", background.draw.bind(background));
}

function init () {
    var canvas = document.getElementById("canvas");
    stage = new createjs.Stage("canvas");
    stage.scaleX = 4;
    stage.scaleY = 4;
    background = new Background();
    parallax = new Parallax();
    function resizeCanvas (){
        canvas.width=window.innerWidth-20;
        canvas.height=window.innerHeight-150;
        CANVAS_WIDTH=0.25*canvas.width;
        CANVAS_HEIGHT=0.25*canvas.height;
        parallax.resize.bind(parallax)();
        background.resize.bind(background)();
    }
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas, false);

    initGame();
}

window.onload = init;
