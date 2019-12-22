const beginMedia = () => {
  document.querySelector("head").innerHTML +=
    '<audio controls loop autoplay style="display:none"> <source src="audio/audioFiles/trance.wav" type="audio/wav" /> </audio>';
  document.querySelector("#PlayButton").style.display = "none";
  document.querySelector("#SceneOne").style.display = "block";
};

export default beginMedia;
