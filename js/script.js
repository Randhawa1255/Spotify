console.log("running");
let currentSong = new Audio();
let songs;
let currentfolder;


function secondstomintues(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedseconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedseconds}`;
}

async function getsongs(folder) {
  let a = await fetch(`/${folder}/`);
  currentfolder = folder;
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songul = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songul.innerHTML = ""
  for (const song of songs) {
    songul.innerHTML =
      songul.innerHTML +
      ` <li><img class="invert" src="img/music-note.svg" alt="">
                            <div class="info">
                                <div>${song
        .replaceAll("%20", " ")
      }</div>
                                <div>Song Artist</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                        </li>`;
  }
  // attach a eventlistener to every song

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs

}

const playmusic = (track, pause = false) => {
  // let audio = new Audio()
  currentSong.src = `/${currentfolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track).replace(
    ".mp3",
    " "
  );
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function dispalyalbum() {
  let a = await fetch(`/song/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a")
  let cardcontainer = document.querySelector(".cardcontainer")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/song") && !e.href.includes(".htaccess")) {
      let folder = (e.href.split("/").slice(-2)[0])
      // get meta data of folder
      let a = await fetch(`/song/${folder}/info.json`);
      let response = await a.json();
      console.log(response)
      cardcontainer.innerHTML = cardcontainer.innerHTML + `
        <div  data-folder="${folder}" class="card">
            <div class="play">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="black"
                fill="black">
                <path
                  d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
            </div>
            <img src="/song/${folder}/cover.jpg" alt="" />
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`
    }
  }

  //  load the libary when click
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      console.log(item.target, item.target.value)
      songs = await getsongs(`song/${item.currentTarget.dataset.folder}`);
      playmusic(songs[0])
    })
  })
}


async function main() {
  await getsongs("song/hits");
  playmusic(songs[0], true);

  // idsplay all album on page
  dispalyalbum()

  // attach an eventlistener to play nxt and prev
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // time update func
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondstomintues(
      currentSong.currentTime
    )} / ${secondstomintues(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
  });
  // add eventlistener to seek bar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    document.querySelector(".circle").style.left = percent + "%"
    currentSong.currentTime = (currentSong.duration * percent) / 100
  })
  // add for hamburger menu
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  })
  // add for close in menu
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  })
  // add eventlistener for previous and next 
  previous.addEventListener("click", () => {
    // currentSong.pause()
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]
    )
    if ((index - 1) >= 0) {
      playmusic(songs[index - 1])
    }
  })
  next.addEventListener("click", () => {
    // currentSong.pause()
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]
    )
    if ((index + 1) < songs.length) {
      playmusic(songs[index + 1])
    }
  })

  // add event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100
    if (currentSong.volume > 0) {
      document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
    }
  })

  // add event listener to volume button to mute
  document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;

    }
    else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = .10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  })

}
main();
