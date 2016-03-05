window.onkeydown = function(event) { // use keydown until we get myo to cooperate
  if (!event.type === "keydown") return; // we only want keydown events

  switch(event.code) {
    case "KeyA":
      onPose("fist");
      break;
    case "KeyS":
      onPose("shield");
      break;
    case "KeyD":
      onPose("lightning");
      break;
    case "KeyF":
      onPose("fireball");
      break;
    default:
      break;
  }
}