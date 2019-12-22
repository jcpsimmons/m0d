const AudioContext = new (window.AudioContext || window.webkitAudioContext)();
var analyser = AudioContext.createAnalyser();

analyser.fftSize = 2048;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Float32Array(bufferLength);

var filter = AudioContext.createBiquadFilter();
filter.type = "bandpass";
filter.frequency.value = 80;
filter.Q.value = 10;

const setPos = (elementID, posObj) => {
  // posObj must be in format: { x: 1, y: 2, z: 3 }
  entity = document.querySelector(`#${elementID}`);
  entity.setAttribute("position", posObj);
};

setInterval(() => {
  analyser.getFloatFrequencyData(dataArray);
  var total = dataArray.reduce((a, b) => Math.abs(a) + Math.abs(b));
  var average = total / analyser.fftSize;
  console.log(average / 10);
  setPos("PsyGoo", { x: 2, y: average / 3 - 22, z: -5 });
}, 10);

const audioElement = document.querySelector("audio");

const track = AudioContext.createMediaElementSource(audioElement);

audioElement.play();

track.connect(filter);
filter.connect(analyser);
track.connect(AudioContext.destination);

// var AudioContext = window.AudioContext || window.webkitAudioContext;

// var audioCtx = new AudioContext();

// var oscillator = audioCtx.createOscillator();
// var gainNode = audioCtx.createGain();

// oscillator.connect(gainNode);
// gainNode.connect(audioCtx.destination);
// oscillator.start();
