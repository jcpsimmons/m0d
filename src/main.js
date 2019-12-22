import beginMedia from "./util/launchLogic.js";
import beginAudioSequence from "./audio/audio.js";

const main = () => {
  beginMedia();
  beginAudioSequence();
};

// necessary to go out of module scope so it responds to button click
window.main = main;
