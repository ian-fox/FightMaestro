var enemies = [];
var startTime = 0;
var FONT = "share-regular,'Arial Narrow',sans-serif";
var CANVAS_WIDTH= 900; // width of canvas
var CANVAS_HEIGHT= 900; // width of canvas
var LINE_HEIGHT = 100; // height of a single "line" of incoming gestures
var V_OFFSET =100;
var START_DELAY = 3000; // delay until the game starts var MS_PER_BEAT = 1000; 
var types= ["rock", "lighting", "fireball"];
var oldestEnemy = 0; // keeps track of the oldest enemy in enemies
var lanes = 3; // lanes of attack
var guides = [];// set of horizontal line guides for showing incoming jazz
var score = 0; 
var scoreElt; //element to store the Score div
var player; 
var projectiles = []; //array of players on the screen

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

function drawGuides(){
    if (guides.length > 0){
        guides.length =0;
    }
    for (var i = 1; i<= 1+lanes; i+=3){
        var rect = new createjs.Shape();
        rect.graphics.beginFill("black").drawRect(0,i*LINE_HEIGHT, CANVAS_WIDTH, 5);
        stage.addChild(rect);
        guides.push(rect);
    }
}


/////////////////////////////////////////////////
// PLAYER 
/////////////////////////////////////////////////
function Character() {
    this.lane = 1;
    this.health = 100;
    this.animation = "idle";
    this.frame = 0;
    this.sheet = new createjs.SpriteSheet({
            images: ['./res/char.png'],
            frames: {
                width: 100, 
                height: 100
            },
            animations: {
                idle: {
                    frames: [0, 1, 2, 3],
                    speed: 0.05
                },
                shoot: {
                    frames: [4, 5, 6, 8],
                    speed: 0.125
                },
                die: {
                    frames: [9, 10, 11, 12, 13],
                    speed: 0.125
                }
            }
        });
    this.sprite = new createjs.Sprite(this.sheet);
    this.sprite.x = 100;
    this.sprite.y = 200;
    this.setY = function() {
        this.sprite.y = V_OFFSET+ LINE_HEIGHT* this.lane;
    }
    // Add Shape instance to stage display list.
    stage.addChild(this.sprite);
    this.sprite.gotoAndPlay("idle");
    // Update stage will render next frame
    this.draw = function() {
        this.frame++;
        console.log(this.frame);
        console.log(this.animation);
        if ((this.animation === "idle" || this.animation === "shoot") && this.frame > 119) {
            this.frame = 0;
            this.animation = "idle";
            this.sprite.gotoAndPlay("idle");
        }
        stage.update();
    }
}

/////////////////////////////////////////////////
// PROJECTILES
/////////////////////////////////////////////////

function Projectile (lane, type){
    this.lane = lane;
    this.type = type;
    /* IMAGE HANDLING IAN DO THIS PART
    var image="res/";
    switch (types.indexOf(type)){
        case 0:
            image += "rock.png";
            break;
        case 1:
            image += "lightning.png";
            break;
        case 2:
            image += "fireball.png";
            break;
    }
    this.enemy= new createjs.Bitmap(image);
    */
    this.type= type;
    this.lane = lane;

    this.proj = new createjs.Shape();
    this.proj.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
    this.proj.x = player.x+100;
    this.proj.y = player.y+50;
    stage.addChild(this.proj);

    this.remove = function () {
        stage.removeChild(this.proj);
    }

}

function handleGesture(gesture) {
    //var proj = new Projectile(player.lane, bad
}

/////////////////////////////////////////////////
// ENEMY RELATED STUFF
/////////////////////////////////////////////////
function Enemy(hitTime, type, lane) {
    //Create a Shape DisplayObject.
    var image="res/";
    switch (types.indexOf(type)){
        case 0:
            image += "fist.png";
            break;
        case 1:
            image += "lightning.png";
            break;
        case 2:
            image += "fireball.png";
            break;
    }
    this.enemy= new createjs.Bitmap(image);
    //Add Shape instance to stage display list.
    stage.addChild(this.enemy);
    //Update stage will render next frame
    this.hitTime= hitTime;
    this.type= type;
    this.dead = false;
    this.lane = lane;
    this.enemy.y = V_OFFSET+ 100*lane;
    this.enemy.x = CANVAS_WIDTH + 2000;//offscreen hack
    this.remove = function () {
        stage.removeChild(this.enemy);
    }
    this.setX = function () {
        if (this.enemy.x > -200){
            this.enemy.x =startTime + this.hitTime - new Date().getTime();
        } else {
            this.kill(-1);
        }
    }
    this.setX();
    // call this if this beat is killed
    this.kill = function (scoreChange) {
        this.dead=true;
        changeScore(scoreChange);
        setTimeout(this.remove.bind(this), 200);
        var ref = getFirstEnemyByLane(this.lane).enemy;
        enemies=enemies.filter(function (entry) {
            if (ref === entry)
                return false;
            return true;
        });
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
    var time = Math.max(1000, Math.floor(Math.random() * 2000));
    if (oldestEnemy == 0) {
        oldestEnemy = START_DELAY;
    } else {
        oldestEnemy += time;
    }
    var beat = new Enemy (oldestEnemy, types[type], lane);
    return beat;
}

function generateMap () {
    for (var i =0; i < 20; i++){
        enemies.push(generateEnemy());
    }
}

function drawEnemies () {
    if (enemies.length < 20){
        enemies.push(generateEnemy());
    }
    enemies.forEach(function (entry) {
        //console.log(entry.hitTime - new Date().getTime());
        //console.log(entry);
        entry.setX();
    });
    stage.update();
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
            handleGesture(gesture);
    }
}

/////////////////////////////////////////////////
// INITIALIZATION
/////////////////////////////////////////////////
function init () {
    var canvas = document.getElementById("canvas");
    stage = new createjs.Stage("canvas");
    function resizeCanvas (){
        canvas.width=window.innerWidth-20;
        canvas.height=window.innerHeight-150;
        CANVAS_WIDTH=canvas.width;
        CANVAS_HEIGHT=canvas.height;
        drawGuides();
    }
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas, false);

    // BEGIN GAME STATE INITIALIZATION
    startTime = new Date().getTime();
    player = new Character();
    initScore();
    generateMap();
    drawGuides();
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", player.draw.bind(player));
    createjs.Ticker.addEventListener("tick", drawEnemies);
}

window.onload = init;
