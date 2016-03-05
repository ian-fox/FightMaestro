var beatMap = [];
var startTime = 0;
var MAP_LENGTH = 20000; // length of the beatmap in ms
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
    this.circle = new createjs.Shape();
    this.circle.graphics.beginFill("red").drawCircle(0, 0, 40);
    //Set position of Shape instance.
    //Add Shape instance to stage display list.
    stage.addChild(this.circle);
    //Update stage will render next frame
    this.hitTime= hitTime;
    this.gesture = gesture;
    this.circle.y = 200+ 100 * gestures.indexOf(gesture);
    this.circle.x = 20000;//offscreen hack
    this.setX = function () {
        if (this.circle.x > -500){
            this.circle.x = 200+ startTime + this.hitTime - new Date().getTime();
        }
    }
    this.setX();
}

function drawGuides(){
    for (var i = 1; i < (gestures.length +2); ++i ){ 
        var rect = new createjs.Shape();
        rect.graphics.beginFill("black").drawRect(0,50+ i*LINE_HEIGHT, CANVAS_WIDTH, 5);
        stage.addChild(rect);
        guides.push(rect);

        if (i-1 < gestures.length) {
            var text = new createjs.Text("hello", "20px Arial", "#ff7700");
            text.textBaseline="middle";
            text.lineWidth=100;
            text.x = 20;
            text.y=20;
            text.maxWidth=1000;
            console.log(text);
            stage.addChild(rect);
        }

    }

}

function generateMap () {
    if (!beatMap.length) {
        for (var i =0; i < MAP_LENGTH; i+=MS_PER_BEAT){ 
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
    drawGuides();
    createjs.Ticker.addEventListener("tick", drawBeats);
}

function onPos(gesture) {
    console.log(gesture);
}

window.onload = init;
