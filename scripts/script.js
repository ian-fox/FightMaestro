var beatMap = [];
var startTime = 0;
var MAP_LENGTH = 50000; // length of the beatmap in ms
var FONT = "share-regular,'Arial Narrow',sans-serif";
var CANVAS_WIDTH= 900; // width of canvas
var MS_PER_BEAT = 1000; 
var CANVAS_HEIGHT= 900; // width of canvas
var CAR_IMAGE=0;
var LINE_HEIGHT = 100; // height of a single "line" of incoming gestures
var V_OFFSET =100;
var START_DELAY = 3000; // delay until the game starts var MS_PER_BEAT = 1000; 
var badguys= ["fist", "lighting", "fireball"];
var oldestEnemy = 0;
var lanes = 3;
var guides = [];// set of horizontal line guides for showing incoming jazz
var score = 0;
var scoreElt;
var player;

function initScore () {
    score = 0;
    scoreElt=document.getElementById("score");
    scoreElt.innerHTML = score;
}

function changeScore(delta) {
    score += delta;
    scoreElt.innerHTML = score;

}

function Beat(hitTime, type, lane) {
    //Create a Shape DisplayObject.
    var image="res/";
    switch (badguys.indexOf(type)){
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
        beatMap=beatMap.filter(function (entry) {
            if (ref === entry)
                return false;
            return true;
        });
    }
}

function Character() {
    this.lane = 1;
    this.health = 100;
    this.sprite = new createjs.Bitmap("res/char_rest.png");
    this.sprite.x = 100;
    this.sprite.y = 200;
    this.setY = function() {
        this.sprite.y = V_OFFSET+ LINE_HEIGHT* this.lane;
    }
    // Add Shape instance to stage display list.
    stage.addChild(this.sprite);
    // Update stage will render next frame
    this.draw = function() {
        stage.update();
    }
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

function getFirstEnemyByLane(lane) {
    for (var i = 0; i < beatMap.length; i ++) {
        if (beatMap[i].lane == lane){
            return {enemy:beatMap[i], index:i};
        }
    }
    return null;
}

function generateEnemy() {
    var lane= Math.floor(Math.random() * lanes);
    var type= Math.floor(Math.random() * badguys.length);
    var time = Math.max(1000, Math.floor(Math.random() * 2000));
    if (oldestEnemy == 0) {
        oldestEnemy = START_DELAY;
    } else {
        oldestEnemy += time;
    }
    var beat = new Beat (oldestEnemy, badguys[type], lane);
    return beat;
}

function generateMap () {
    for (var i =0; i < 20; i++){
        beatMap.push(generateEnemy());
    }
}

function drawBeats () {
    if (beatMap.length < 20){
        beatMap.push(generateEnemy());
    }
    beatMap.forEach(function (entry) {
        //console.log(entry.hitTime - new Date().getTime());
        //console.log(entry);
        entry.setX();
    });
    stage.update();
}


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
    createjs.Ticker.addEventListener("tick", player.draw);
    createjs.Ticker.addEventListener("tick", drawBeats);
}

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
            console.log(gesture);
    }
}

window.onload = init;
