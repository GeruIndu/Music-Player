let currentSong = new Audio();
let songs = [];
let volume = currentSong.volume;
let flag = 1;
let currentFolder;

function formatSecondsToMinutes(seconds) {
  seconds = Math.max(0, Math.floor(Number(seconds)));

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSong(folder) {
  let a = await fetch(`http://albal.bijit.xyz/songs/${folder}/`);
  currentFolder = folder;
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let sng = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < sng.length; index++) {
  	const element = sng[index];
  	if (element.href.endsWith(".mp3")) {
    	// Extract the song name from the href
    	const songName = element.href.split("/").pop();
    	// Construct the new URL
    	const updatedUrl = `http://albal.bijit.xyz/songs/${folder}/${songName}`;
  		songs.push(updatedUrl);
  	}
  }


  let ul = document.querySelector(".song-list").getElementsByTagName("ul")[0];
  ul.innerHTML = "";
  // Add all songs to UI
  for (const ele of songs) {
    ul.innerHTML += `<li class="rounded c-p">
                            <img class="invert" src="Icons/music.svg" alt="">
                            <div class="info">
                                <div class="song-name">${ele.split(`songs/${
                                  currentFolder}/`)[1]}</div>
                                <div>Indra</div>
                            </div>
                            <span class="c-p">Play now</span>
                            <img class="invert c-p" src="Icons/play.svg" alt="">
                        </li>`;
  }

  // Attach an event on all song
  Array.from(
    document.querySelector(".song-list").getElementsByTagName("li"),
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playSong(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });
}

function playSong(track) {
  currentSong.src = `http://albal.bijit.xyz/songs/${currentFolder}/` + track;
  currentSong.play();
  play.src = "Icons/pause.svg";
  document.querySelector(".song-info").innerHTML = track;
  document.querySelector(".song-duration").innerHTML = "00.00 / 00.00";
}

// Dynamically create card according to folder
async function dynamicCardCreation() {
  let cardContainer = document.querySelector(".cardContainer");
  let a = await fetch(`songs/`);
  let response = await a.text();

  // Create a temporary div to parse the response
  let div = document.createElement("div");
  div.innerHTML = response;

  // Extract all <a> tags
  let anchors = div.querySelectorAll('a');
  let array = Array.from(anchors);
  
  for (let i = 0; i < array.length; i++) {
    const e = array[i];

    // Check if the corresponding alt attribute is "[DIR]"
    let iconElement = e.previousElementSibling; // Check the previous sibling for the icon
    if (iconElement && iconElement.getAttribute("alt") === "[DIR]") {
      let folder = e.getAttribute("href").replace(/\/$/, ""); // Remove trailing slash if present

      // Fetch info.json from the folder
      let folderInfo = await fetch(`http://albal.bijit.xyz/songs/${folder}/info.json`);
      let response = await folderInfo.json();

      // Dynamically create a card for the folder
      cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card p-1 rounded">
          <button class="play-btn">
            <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24"
              class="Svg-sc-ytk21e-0 bneLcE">
              <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
              </path>
            </svg>
          </button>
          <img class="rounded" src="http://albal.bijit.xyz/songs/${folder}/cover.jpeg" alt="">
          <h3 class="pt-1">${response.info}</h3>
          <p class="pt-1">${response.description}</p>
        </div>`;
    }
  }

  // Add event listeners for song playback
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async () => {
      await getSong(`${e.dataset.folder}`);
    });
  });
}


(async function main() {
  await getSong("viral");
  currentSong.src = songs[0];

  dynamicCardCreation();

  // Attach an event on play-bar on play button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "Icons/pause.svg";
      document.querySelector(".song-info").innerHTML = currentSong.src.split(
        `songs/${currentFolder}/`,
      )[1];
      document.querySelector(".song-duration").innerHTML = "00.00 / 00.00";
    } else {
      currentSong.pause();
      play.src = "Icons/play.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-duration").innerHTML = `
        ${formatSecondsToMinutes(currentSong.currentTime)} / ${formatSecondsToMinutes(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
    if (currentSong.paused) {
      play.src = "Icons/play.svg";
    }
  });

  // Attach a event on seek-bar
  document.querySelector(".underline").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event on menu button
  document.querySelector(".menu").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // add an event on close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-200%";
  });

  // add an event on previous button
  prev.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src);
    if (index >= 1) {
      playSong(songs[index - 1].split(`songs/${currentFolder}/`)[1]);
    }
  });

  // add an event on next button
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src);
    if (index < songs.length) {
      playSong(songs[index + 1].split(`songs/${currentFolder}/`)[1]);
    }
  });

  // Add event on volume
  document.querySelector(".vol").addEventListener("change", (e) => {
    currentSong.volume = e.target.value / 100;
    volume = currentSong.volume;
  });

  // add an event on volume icon ans silent icon
  vol_icon.addEventListener("click", () => {
    if (flag) {
      currentSong.volume = 0;
      vol_icon.src = "Icons/silent.svg";
      flag = 0;
      document.querySelector(".vol").value = 0;
    } else {
      currentSong.volume = volume;
      document.querySelector(".vol").value = volume * 50;
      vol_icon.src = "Icons/volume.svg";
      flag = 1;
    }
  });
})();

