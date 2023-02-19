// Titles: https://omdbapi.com/?s=thor&page=1&apikey=${api_key}
// details: http://www.omdbapi.com/?i=tt3896198&apikey=${api_key}

// Document elements
const root = document.documentElement;
const movieSearchBox = document.getElementById("movie-search-box");
const historyGrid = document.getElementById("history-grid");
const searchList = document.getElementById("search-list");
const resultGrid = document.getElementById("result-grid");
const videoGrid = document.getElementById("video-grid");
let watchGrid;

// Settings elements
const themeSwitch = document.getElementById("theme-checkbox");
const dynamicSwitch = document.getElementById("dynamic-checkbox");
const langSelector = document.getElementById("language-selector");

// The apis I'll be using
const omdb_api = "https://omdbapi.com";
const consumetapi = "https://c.delusionz.xyz/movies/flixhq";
const mysubsApi = "https://mysubs-api.vercel.app";

// multiple api keys to avoid hitting the daily limit of 3000
let imdb_keys = ["b5cff164", "89a9f57d", "73a9858a"];
const api_key = imdb_keys[Math.floor(Math.random() * imdb_keys.length)]; //random api key

// initailize history and create if not exist
const history = JSON.parse(localStorage.getItem("history"));
if (history == null) {
  localStorage.setItem("history", JSON.stringify([]));
}

// check if preferences are saved if not null
const currentTheme = localStorage.getItem("theme")
  ? localStorage.getItem("theme")
  : null;

const isDynamic = localStorage.getItem("dynamic")
  ? localStorage.getItem("dynamic")
  : null;

let subLang = localStorage.getItem("language")
  ? localStorage.getItem("language")
  : null;

// always select the value from localstorage if it exists
if (currentTheme) {
  document.documentElement.setAttribute("data-theme", currentTheme);
  if (currentTheme == "light") {
    themeSwitch.checked = true;
  }
}

if (isDynamic == true) {
  dynamicSwitch.checked = true;
}

if (subLang) {
  langSelector.value = subLang;
}

// when switch is checked change to the selected theme
function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }
}

// *NOTE: note working; rn.
function switchDynamic(e) {
  if (e.target.checked) {
    localStorage.setItem("dynamic", true);
  } else {
    localStorage.setItem("dynamic", false);
  }
}

function switchLanguage(e) {
  subLang = e.target.value;
  localStorage.setItem("language", subLang);
}

themeSwitch.addEventListener("change", switchTheme, false);
dynamicSwitch.addEventListener("change", switchDynamic, false);
langSelector.addEventListener("change", switchLanguage);

// index.html?id={value}
const imdb_id = findGetParameter("id");
if (imdb_id == "clear_hist") {
  localStorage.setItem("history", JSON.stringify([]));
} else if (imdb_id != null) {
  displayMovieDetails(imdb_id);
} else {
  loadHistory();
}

function findGetParameter(parameterName) {
  var result = null,
    tmp = [];
  location.search
    .substr(1)
    .split("&")
    .forEach(function (item) {
      tmp = item.split("=");
      if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
  return result;
}

// change root properties to poster average color
async function material_you(img, theme) {
  if (dynamicSwitch.checked == true) {
    return;
  }

  const fac = new FastAverageColor();
  fac.getColorAsync(img, { algorithm: "sqrt" }).then((color) => {
    root.style.setProperty("--primary-color", color.hex);
    if (theme == "light") {
      changeProperty("--background-color", color.hex, 83);
      changeProperty("--light-background-color", color.hex, 70);
      changeProperty("--md-background-color", color.hex, 70);
    } else {
      changeProperty("--background-color", color.hex, -98);
      changeProperty("--light-background-color", color.hex, -80);
      changeProperty("--md-background-color", color.hex, -80);
    }
  });
}

function changeProperty(property, color, hueValue) {
  root.style.setProperty(property, LightenDarkenColor(color, hueValue));
}

// make color lighter or darker
function LightenDarkenColor(color, amount) {
  return (
    "#" +
    color
      .replace(/^#/, "")
      .replace(/../g, (color) =>
        (
          "0" +
          Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)
        ).substr(-2)
      )
  );
}

// load and display history items from localstorage
function loadHistory() {
  historyGrid.innerHTML = "";

  const history = JSON.parse(localStorage.getItem("history"));
  let i = 0;
  history.forEach((movie) => {
    i += 1;

    const progressDiv = `
      <div class="progress-background">
      <div style="width:${movie.progress}%;background-color:${movie.color}" class="progress-foreground"></div>
      ${movie.progress}%</div>`;

    historyGrid.innerHTML += `
      <div class="history-item" onclick="location.href='./index.html?id=${
        movie.id
      }'" style="background: linear-gradient(45deg, ${
      movie.color
    }, var(--light-background-color))">
            <img src="${movie.poster}"></img>
            <div><h3>${movie.title}</h3>
            <span>${movie.time}</span>
            <span>${movie.season == undefined ? "" : movie.season + ": "}${
      movie.episode == undefined ? "" : movie.episode
    }</span>
            ${movie.progress == undefined ? "" : progressDiv}
      </div>
            <div class="remove-history" onClick="removeHistory('${
              movie.id
            }')">X</div>
      </div>
      `;
  });
}

// search the api for user input after done typing
function findMovies() {
  //on keyup, start the countdown
  let typingTimer; //timer identifier
  let doneTypingInterval = 600; //time in ms (5 seconds)
  movieSearchBox.addEventListener("keyup", () => {
    clearTimeout(typingTimer);
    if (movieSearchBox.value) {
      typingTimer = setTimeout(search_list, doneTypingInterval);
    }
  });
}

// show or hide the search results
function search_list() {
  let searchTerm = movieSearchBox.value.trim();
  if (searchTerm.length > 0) {
    searchList.classList.remove("hide-search-list");
    loadMovies(searchTerm);
  } else {
    searchList.classList.add("hide-search-list");
  }
}

// load movies from API
async function loadMovies(searchTerm) {
  const URL = `${omdb_api}/?s=${searchTerm}&page=1&apikey=${api_key}`;
  const res = await fetch(`${URL}`);
  const data = await res.json();
  if (data.Response == "True") displayMovieList(data.Search);
}

// display search results
function displayMovieList(movies) {
  searchList.innerHTML = "";
  for (let idx = 0; idx < movies.length; idx++) {
    let movieListItem = document.createElement("div");
    movieListItem.dataset.id = movies[idx].imdbID; // setting movie id in  data-id
    movieListItem.classList.add("search-list-item");

    if (movies[idx].Poster != "N/A") moviePoster = movies[idx].Poster;
    else moviePoster = "image_not_found.png";

    movieListItem.innerHTML = `
        <div class = "search-item-thumbnail">
            <img src = "${moviePoster}">
        </div>
        <div class = "search-item-info">
            <h3>${movies[idx].Title}</h3>
            <p>${movies[idx].Year}</p>
        </div>
        `;
    searchList.appendChild(movieListItem);
  }
  loadMovieDetails();
}

function loadMovieDetails() {
  const searchListMovies = searchList.querySelectorAll(".search-list-item");
  searchListMovies.forEach((movie) => {
    movie.addEventListener("click", () => {
      // console.log(movie.dataset.id);
      searchList.classList.add("hide-search-list");
      movieSearchBox.value = "";
      const imdb_id = movie.dataset.id;
      const url = `./index.html?id=${imdb_id}`;
      window.location.href = url;
      displayMovieDetails(imdb_id);
    });
  });
}

async function displayMovieDetails(imdb_id) {
  document.getElementsByClassName("wrapper")[0].style.visibility = "hidden";
  const result = await fetch(`${omdb_api}/?i=${imdb_id}&apikey=${api_key}`);
  const details = await result.json();

  if (currentTheme) {
    material_you(details.Poster, currentTheme);
  } else {
    material_you(details.Poster, "dark");
  }

  function switchTheme(e) {
    if (e.target.checked) {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
      material_you(details.Poster, "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      material_you(details.Poster, "dark");
    }
  }

  themeSwitch.addEventListener("change", switchTheme, false);

  resultGrid.innerHTML = `
    <div class = "movie-poster">
        <img src = "${
          details.Poster != "N/A"
            ? details.Poster.replace("._V1_SX300", "._V1_SX800")
            : "image_not_found.png"
        }" alt = "movie poster">
    </div>
    <div class = "movie-info">
        <h3 class = "movie-title">${details.Title}</h3>
        <ul class = "movie-misc-info">
            <li class = "year">${details.Year}</li>
            <li class = "rated">${details.Rated}</li>
            <li class = "released"><b><i class= "fas fa-star"></i></b> ${
              details.imdbRating
            }</li>
        </ul>
        <p class = "genre"><b>Genre:</b> ${details.Genre}</p>
        <p class = "writer"><b>Writer:</b> ${details.Writer}</p>
        <p class = "actors"><b>Actors: </b>${details.Actors}</p>
        <p class = "plot"><b>Plot:</b> ${details.Plot}</p>
        <p class = "language"><b>Language:</b> ${details.Language}</p>
        <p class = "awards"><b><i class = "fas fa-award"></i></b> ${
          details.Awards
        }</p>
        <div class="watch-grid" id="watch-grid"></div>
    </div>
    `;

  document.getElementsByClassName("wrapper")[0].style.visibility = "visible";
  watchGrid = document.getElementById("watch-grid");

  if (details.Type == "movie") {
    watchGrid.innerHTML = `<button id="watch-movie">Watch</button>`;
    const watchButton = document.getElementById("watch-movie");

    watchButton.addEventListener("click", () => {
      watch_movie(details.Title, details.Year);
      addHistory(details, "movie");
    });
  } else {
    watch_series(details.Title, details);
  }
}

function addHistory(details, type, season, episode) {
  const history = JSON.parse(localStorage.getItem("history"));
  const currentDate = new Date();
  const datetime = currentDate.toLocaleString();

  const exist = history.filter(function (el) {
    return el.id == imdb_id;
  });

  // if entry does not exist in history
  if (exist.length == 0) {
    const new_entry = {
      title: details.Title,
      poster: details.Poster,
      id: imdb_id,
      color: getComputedStyle(root).getPropertyValue("--primary-color"),
      time: datetime,
    };
    if (type == "tv-show") {
      new_entry.season = season;
      new_entry.episode = episode;
    }
    history.push(new_entry);
    localStorage.setItem("history", JSON.stringify(history));
  } else {
    // update current history item with updated values
    const history = JSON.parse(localStorage.getItem("history"));
    const index = history.findIndex((x) => x.id == imdb_id);
    history[index].time = datetime;
    history[index].season = season;
    history[index].episode = episode;
    localStorage.setItem("history", JSON.stringify(history));
  }
}

function removeHistory(id) {
  window.event.stopPropagation();
  const remaining_items = history.filter(function (el) {
    return el.id != id;
  });
  localStorage.setItem("history", JSON.stringify(remaining_items));

  loadHistory();
}

// get arabic subtitles for movies and tv-shows
async function get_sub(imdb_id) {
  const season_select = document.getElementById("seasons-selector");
  const episode_select = document.getElementById("episodes-selector");
  let subtitles;
  const links = [];

  if (subLang == null) {
    subLang = "Arabic";
  }

  if (season_select) {
    const season = String(season_select.selectedIndex + 1).padStart(2, 0);
    const episode = String(episode_select.selectedIndex + 1).padStart(2, 0);
    subtitles = await get_body(
      `${mysubsApi}/search/${imdb_id}?lang=${subLang}&s=${season}&e=${episode}`
    );
  } else {
    subtitles = await get_body(
      `${mysubsApi}/search/${imdb_id}?lang=${subLang}`
    );
  }

  subtitles = JSON.parse(subtitles);
  console.log(subtitles.length);
  for (var i = 0; i < subtitles.length; i++) {
    links.push({
      src: `${mysubsApi}/get/${subtitles[i].id}`,
      kind: "captions",
      label: `${subLang}-${i + 1} (mysubs)`,
    });
  }

  // it return an array of subtitle links
  return links;
}

async function get_body(url) {
  const res = await fetch(url);
  const body = await res.text();
  return body;
}

async function watch_movie(title, year) {
  const history = JSON.parse(localStorage.getItem("history"));
  const index = history.findIndex((x) => x.id == imdb_id);

  const result = await fetch(`${consumetapi}/${title}`);
  const movieDetails = await result.json();

  const match = movieDetails.results.filter(function (el) {
    return el.title == title && el.releaseDate == year;
  });

  if (match == null) {
    return null;
  }

  const id = match[0].id.split("-").pop();
  display_video(id, match[0].id);
}

async function watch_series(title, details) {
  const history = JSON.parse(localStorage.getItem("history"));
  const index = history.findIndex((x) => x.id == imdb_id);

  const result = await fetch(`${consumetapi}/${title}`);
  const movieDetails = await result.json();

  const match = movieDetails.results.filter(function (el) {
    return el.title == title && el.type == "TV Series";
  });

  const watchLink = await fetch(`${consumetapi}/info?id=${match[0].id}`);
  const json = await watchLink.json();
  const media_id = json.id;
  const seasons = json.episodes.pop().season;

  const season_select = document.createElement("select");
  season_select.name = "Seasons";
  season_select.id = "seasons-selector";

  for (var i = 0; i < seasons; i++) {
    var option = document.createElement("option");
    option.value = i + 1;
    option.text = "Season " + (i + 1);
    season_select.appendChild(option);
  }

  const episode_select = document.createElement("select");
  episode_select.name = "episodes";
  episode_select.id = "episodes-selector";
  season_select.onchange = on_season_change;

  function on_season_change() {
    document.getElementById("episodes-selector").innerHTML = "";
    let episodes = json.episodes.filter(function (el) {
      return el.season == season_select.value;
    });

    for (var i = 0; i < episodes.length; i++) {
      var option = document.createElement("option");
      option.value = episodes[i].id;
      option.text = episodes[i].title;
      episode_select.appendChild(option);
    }
  }

  episode_select.onchange = on_episode_change;

  let episode_id = "";
  function on_episode_change() {
    episode_id = episode_select.value;
  }

  const watch_button = document.createElement("button");
  watch_button.innerHTML = "Watch";
  watch_button.id = "watch-button";

  watchGrid.appendChild(season_select);
  watchGrid.appendChild(episode_select);
  watchGrid.appendChild(watch_button);
  on_season_change();
  on_episode_change();

  // automatically select the last watched episode
  if (history[index]) {
    if (history[index].season) {
      for (var i = 0; i < season_select.options.length; i++) {
        if (season_select.options[i].text == history[index].season) {
          season_select.selectedIndex = i;
          break;
        }
      }
      on_season_change();
      on_episode_change();
      for (var i = 0; i < episode_select.options.length; i++) {
        if (episode_select.options[i].text === history[index].episode) {
          episode_select.selectedIndex = i;
          break;
        }
      }
      // if the episode is nearly done automatically select the next one
      // but only if it is not the last episode in season
      if (history[index].progress >= 95) {
        if (episode_select.options.length - 1 != episode_select.selectedIndex) {
          episode_select.selectedIndex = episode_select.selectedIndex + 1;
        }
      }
    }
  }

  document.getElementById("watch-button").addEventListener("click", () => {
    on_episode_change();
    display_video(episode_id, media_id);
    se_selected = season_select.options[season_select.selectedIndex].text;
    ep_selected = episode_select.options[episode_select.selectedIndex].text;
    addHistory(details, "tv-show", se_selected, ep_selected);
  });
}

async function display_video(episodeId, mediaId) {
  const watchLink = await fetch(
    `${consumetapi}/watch?episodeId=${episodeId}&mediaId=${mediaId}&source=vidcloud`
  );

  const json = await watchLink.json();
  videoGrid.innerHTML = `<video id="video_1" class="video-js"></video><br>
    <div style="display:flex;justify-content:space-between"><code>Download M3u8:</code><code>ffmpeg -i "https://...m3u8?..." output.mp4</code></div>`;

  let sources = [];
  for (let i = 0; i < json.sources.length; i++) {
    let source = json.sources[i];
    sources.push({
      src: source.url,
      label: source.quality,
      type: "application/x-mpegURL",
    });
    videoGrid.innerHTML += `
        <button onClick="navigator.clipboard.writeText('${source.url}')">${source.quality}</button>
    `;
  }

  const subtitles = await get_sub(imdb_id);

  let languages = ["English", `${subLang}`];
  const filtered = json.subtitles.filter((x) => {
    return languages.find((y) => x.lang.startsWith(y));
  });
  for (let i = 0; i < filtered.length; i++) {
    subtitles.push({
      src: filtered[i].url,
      kind: "captions",
      label: filtered[i].lang,
    });
  }

  console.log(sources);
  let options = {
    playbackRates: [0.5, 1, 1.5, 2],
    controlBar: {
      volumePanel: {
        inline: false,
        volumeControl: {
          vertical: true,
        },
      },
      children: [
        "playToggle",
        "progressControl",
        "currentTimeDisplay",
        "timeDivider",
        "durationDisplay",
        "volumePanel",
        "playbackRateMenuButton",
        "captionsButton",
        "qualitySelector",
        "fullscreenToggle",
      ],
    },
    controls: true,
    fluid: true,
    sources: sources,
    tracks: subtitles,
  };

  const video_el = document.getElementById("video_1");
  const player = videojs(video_el, options);

  // player settings and plugins
  player.landscapeFullscreen();
  player.volume(0.5);
  player.hotkeys({
    volumeStep: 0.1,
    seekStep: 10,
    enableModifiersForNumbers: false,
  });
  player.mobileUi({
    touchControls: {
      seekSeconds: 10,
      tapTimeout: 300,
      disableOnEnd: false,
    },
  });

  // Makes progress bar draggable.
  const SeekBar = videojs.getComponent("SeekBar");

  SeekBar.prototype.getPercent = function getPercent() {
    const time = this.player_.currentTime();
    const percent = time / this.player_.duration();
    return percent >= 1 ? 1 : percent;
  };

  SeekBar.prototype.handleMouseMove = function handleMouseMove(event) {
    let newTime = this.calculateDistance(event) * this.player_.duration();
    if (newTime === this.player_.duration()) {
      newTime = newTime - 0.1;
    }
    this.player_.currentTime(newTime);
    this.update();
  };

  // add arabic subtitles from mysubs-api
  const history = JSON.parse(localStorage.getItem("history"));
  const index = history.findIndex((x) => x.id == imdb_id);
  const timestamp = history[index].timestamp;

  // jump to saved timestamp
  if (timestamp) {
    player.currentTime(timestamp);
  }

  // save the timestamp through DB polling (every 20s)
  setInterval(() => {
    const previousTimestamp = history[index].timestamp
      ? history[index].timestamp
      : 0;

    if (player.paused() == false) {
      if (previousTimestamp !== player.currentTime()) {
        history[index].timestamp = player.currentTime();
        history[index].progress = Math.round(
          (player.currentTime() / player.duration()) * 100
        );
      }
      localStorage.setItem("history", JSON.stringify(history));
    }
  }, 20000);
}

window.addEventListener("click", (event) => {
  if (event.target.className != "form-control") {
    searchList.classList.add("hide-search-list");
  }
});
