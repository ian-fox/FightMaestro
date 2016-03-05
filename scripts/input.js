window.onkeydown = function(event) { // use keydown until we get myo to cooperate
  if (!event.type === "keydown") return; // we only want keydown events

  switch(event.code) {
    case "KeyA":
      onPose("move_left");
      break;
    case "KeyS":
      onPose("move_right");
      break;
    case "KeyD":
      onPose("rock");
      break;
    case "KeyF":
      onPose("fireball");
      break;
    case "KeyG":
      onPose("lightning");
      break;
  }
}

// myo part

Myo.connect('com.myojs.poseDetector');
Myo.on('connected', function(){
  console.log('connected!', this.id);
  Myo.setLockingPolicy("none");
});

Myo.on('hard_tap',function (){
    onPose("rock");
});
Myo.on('pose', function(pose){
  switch(pose) {
    case "fist":
      onPose("lightning");
      break;
    case "fingers_spread":
      onPose("lightning");
      break;
    case "double_tap":
      onPose("fireball");
      break;
    case "wave_in":
      Myo.myos[0].arm === "left" ? onPose("move_right") : onPose("move_right");
      break;
    case "wave_out":
      Myo.myos[0].arm === "left" ? onPose("move_left") : onPose("move_left");
      break;
  }
})
