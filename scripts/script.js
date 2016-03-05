var beatMap = [];
var startTime = 0;
var MAP_LENGTH = 50000; // length of the beatmap in ms
var FONT = "share-regular,'Arial Narrow',sans-serif";
var CANVAS_WIDTH= 900; // width of canvas
var MS_PER_BEAT = 1000; 
var CANVAS_HEIGHT= 900; // width of canvas
var LINE_HEIGHT = 100; // height of a single "line" of incoming gestures
var START_DELAY = 3000; // delay until the game starts var MS_PER_BEAT = 1000; 
var gestures = ["fist", "shield", "lighting", "fireball"];
var guides = [];// set of horizontal line guides for showing incoming jazz

function Beat(hitTime, gesture) {
    //Create a Shape DisplayObject.
    this.car= new createjs.Bitmap("res/car.png");
    this.car.scaleY=0.3;
    this.car.scaleX=0.3;
    //Add Shape instance to stage display list.
    stage.addChild(this.car);
    //Update stage will render next frame
    this.hitTime= hitTime;
    this.gesture = gesture;
    this.car.y = 200+ 100 * gestures.indexOf(gesture);
    this.car.x = 20000;//offscreen hack
    this.setX = function () {
        if (this.car.x > -500){
            this.car.x = 200+ startTime + this.hitTime - new Date().getTime();
        }
    }
    this.setX();
}

function drawGuides(){
    for (var i = 1; i < (gestures.length +2); ++i ){ 
        var rect = new createjs.Shape();
        var color = (i == 1 || i == 5) ? "white" : "yellow";
        rect.graphics.beginFill(color).drawRect(0,92+i*LINE_HEIGHT, CANVAS_WIDTH, 5);
        stage.addChild(rect);
        guides.push(rect);

    }

}

function drawBackground(){
    var rect = new createjs.Shape();
    rect.graphics.beginFill("#444444").drawRect(0,200, CANVAS_WIDTH, 5*LINE_HEIGHT);
    //stage.addChild(rect);
}

function generateMap () {
    if (!beatMap.length) {
        for (var i =0; i < MAP_LENGTH; i+=MS_PER_BEAT* Math.max(Math.random(),0.5)){
            var num = Math.floor(Math.random() * 4);
            var beat = new Beat (i + START_DELAY, gestures[num]);
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
    //Create a stage by getting a reference to the canvas
    stage = new createjs.Stage("canvas");
    startTime = new Date().getTime();
    generateMap();
    drawBackground();
    drawGuides();
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", drawBeats);
}

function onPos(gesture) {
    console.log(gesture);
}

window.onload = init;
