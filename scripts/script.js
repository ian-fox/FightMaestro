var beatMap = [];
var startTime = 0;
var MAP_LENGTH = 20000;
var MS_PER_BEAT = 1000;
var gestures = ["fist", "spread", "wave-in", "wave-out"];

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
    this.circle.y = 100+ 100 * gestures.indexOf(gesture);
    this.setX = function () {
        if (this.circle.x >  -500){
            this.circle.x = startTime + this.hitTime - new Date().getTime();
        }
    }
    this.setX();
}

function generateMap () {
    if (!beatMap.length) {
        for (var i =0; i < MAP_LENGTH; i+=MS_PER_BEAT){ 
            var num = Math.floor(Math.random() * 4);
            var beat = new Beat (i, gestures[num]);
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
    createjs.Ticker.addEventListener("tick", drawBeats);
}

function onPose (gesture) {
    console.log(gesture);
} 

window.onload = init;
