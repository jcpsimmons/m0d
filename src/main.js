import beginMedia from "./util/launchLogic.js";
import beginAudioSequence from "./audio/audio.js";

const main = e => {
  beginMedia();
  beginAudioSequence();
};

// necessary to go out of module scope
window.main = main;
