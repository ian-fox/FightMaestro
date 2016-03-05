var beatMap = [];
var startTime = 0;
var MAP_LENGTH = 50000; // length of the beatmap in ms
var FONT = "share-regular,'Arial Narrow',sans-serif";
var CANVAS_WIDTH= 900; // width of canvas
var MS_PER_BEAT = 1000; 
var CANVAS_HEIGHT= 900; // width of canvas
var CAR_IMAGE=0;
var LINE_HEIGHT = 100; // height of a single "line" of incoming gestures
var START_DELAY = 3000; // delay until the game starts var MS_PER_BEAT = 1000; 
var badguys= ["fist", "lighting", "fireball"];
var lanes = 3;
var guides = [];// set of horizontal line guides for showing incoming jazz


function Beat(hitTime, gesture, lane) {
    //Create a Shape DisplayObject.
    this.enemy= new createjs.Bitmap("res/car.png");
    this.enemy.scaleY=0.3;
    this.enemy.scaleX=0.3;
    //Add Shape instance to stage display list.
    stage.addChild(this.enemy);
    //Update stage will render next frame
    this.hitTime= hitTime;
    this.gesture = gesture;
    this.lane = lane;
    this.enemy.y = 200 + 100*lane;
    this.enemy.x = CANVAS_WIDTH + 2000;//offscreen hack
    this.setX = function () {
        if (this.enemy.x > -500){
            this.enemy.x = 200+ startTime + this.hitTime - new Date().getTime();
        }
    }
    this.setX();
}

function drawGuides(){
    if (guides.length > 0){
        guides.length =0;
    }
    for (var i = 2; i<= 2+badguys.length; i+=badguys.length ){ 
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


function generateMap () {
    if (!beatMap.length) {
        for (var i =0; i < MAP_LENGTH; i+=MS_PER_BEAT* Math.max(Math.random()*3,1)){
            var lane= Math.floor(Math.random() * lanes);
            var type= Math.floor(Math.random() * lanes);
            var beat = new Beat (i + START_DELAY, badguys[type], lane);
            beatMap.push(beat);
        }
    }
}

function drawBeats () {
    beatMap.forEach(function (entry) {
        entry.setX();
    });
    stage.update();
}


function init () {
    var canvas = document.getElementById("canvas");
    stage = new createjs.Stage("canvas");
    function resizeCanvas (){
        canvas.width=window.innerWidth-20;
        canvas.height=window.innerHeight-20;
        CANVAS_WIDTH=canvas.width;
        CANVAS_HEIGHT=canvas.height;
        drawGuides();
    }
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas, false);

    //Create a stage by getting a reference to the canvas
    startTime = new Date().getTime();
    generateMap();
    //drawBackground();
    drawGuides();
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", drawBeats);
}

function onPose(gesture) {
    console.log(gesture);
}

window.onload = init;
