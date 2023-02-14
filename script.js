// Titles: https://omdbapi.com/?s=thor&page=1&apikey=${api_key}
// details: http://www.omdbapi.com/?i=tt3896198&apikey=${api_key}
const root = document.documentElement;
const movieSearchBox = document.getElementById("movie-search-box");
const historyGrid = document.getElementById("history-grid");
const searchList = document.getElementById("search-list");
const resultGrid = document.getElementById("result-grid");
const videoGrid = document.getElementById("video-grid");
//const consumetapi = "https://api.consumet.org/movies/flixhq";
const consumetapi = "https://api.consumet.org/meta/tmdb";
let watchGrid;

let imdb_keys = ["b5cff164", "89a9f57d", "73a9858a"];

const api_key = imdb_keys[Math.floor(Math.random() * imdb_keys.length)];

const history = JSON.parse(localStorage.getItem("history"));
if (history == null) {
  localStorage.setItem("history", JSON.stringify([]));
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

const imdb_id = findGetParameter("id");
if (imdb_id == "clear_hist") {
  localStorage.setItem("history", JSON.stringify([]));
} else if (imdb_id != null) {
  displayMovieDetails(imdb_id);
} else {
  loadHistory();
}

const themeSwitch = document.getElementById("theme-checkbox");
const dynamicSwitch = document.getElementById("dynamic-checkbox");

const currentTheme = localStorage.getItem("theme")
  ? localStorage.getItem("theme")
  : null;

if (currentTheme) {
  document.documentElement.setAttribute("data-theme", currentTheme);
  if (currentTheme == "light") {
    themeSwitch.checked = true;
  }
}

const isDynamic = localStorage.getItem("dynamic")
  ? localStorage.getItem("dynamic")
  : null;

if (isDynamic == true) {
  dynamicSwitch.checked = true;
}

function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }
}
themeSwitch.addEventListener("change", switchTheme, false);

function switchDynamic(e) {
  if (e.target.checked) {
    localStorage.setItem("dynamic", true);
  } else {
    localStorage.setItem("dynamic", false);
  }
  console.log("change");
}
dynamicSwitch.addEventListener("change", switchDynamic, false);

function LightenDarkenColor(color, amount) {
  if (color[0] == "#") {
    color = color.slice(1);
  }
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

async function material_you(img, theme) {
  if (dynamicSwitch.checked == true) {
    return;
  }
  console.log(dynamicSwitch.checked);

  const fac = new FastAverageColor();

  fac.getColorAsync(img, { algorithm: "sqrt" }).then((color) => {
    root.style.setProperty("--primary-color", color.hex);

    if (theme == "light") {
      root.style.setProperty(
        "--background-color",
        LightenDarkenColor(color.hex, 83)
      );
      root.style.setProperty(
        "--light-background-color",
        LightenDarkenColor(color.hex, 70)
      );
      root.style.setProperty(
        "--md-background-color",
        LightenDarkenColor(color.hex, 70)
      );
    } else if (theme == "dark") {
      root.style.setProperty(
        "--background-color",
        LightenDarkenColor(color.hex, -98)
      );
      root.style.setProperty(
        "--light-background-color",
        LightenDarkenColor(color.hex, -80)
      );
      root.style.setProperty(
        "--md-background-color",
        LightenDarkenColor(color.hex, -80)
      );
    }
  });
}

function loadHistory() {
  historyGrid.innerHTML = "";
  const history = JSON.parse(localStorage.getItem("history"));

  console.log(history);
  if (history) {
    let i = 0;
    history.forEach((movie) => {
      i += 1;
      console.log(movie.title);

      historyGrid.innerHTML += `
      <div class="history-item" onclick="location.href='./index.html?id=${
        movie.id
      }'" style="background-color: ${movie.color}">
            <img src="${movie.poster}"></img>
            <div><h3>${movie.title}</h3>
            <span>${movie.time}</span>
            <span>${movie.season == undefined ? "" : movie.season + ": "}${
        movie.episode == undefined ? "" : movie.episode
      }</span></div>
            <div class="remove-history" onClick="removeHistory('${
              movie.id
            }')">X</div>
      </div>
      `;
    });
  }
}

// load movies from API
async function loadMovies(searchTerm) {
  const URL = `https://omdbapi.com/?s=${searchTerm}&page=1&apikey=${api_key}`;
  const res = await fetch(`${URL}`);
  const data = await res.json();
  // console.log(data.Search);
  if (data.Response == "True") displayMovieList(data.Search);
}

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

  function search_list() {
    let searchTerm = movieSearchBox.value.trim();
    if (searchTerm.length > 0) {
      searchList.classList.remove("hide-search-list");
      loadMovies(searchTerm);
    } else {
      searchList.classList.add("hide-search-list");
    }
  }
}

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
  const result = await fetch(
    `https://www.omdbapi.com/?i=${imdb_id}&apikey=${api_key}`
  );
  const details = await result.json();

  //if (details.Poster != "N/A"){
  // details.Poster = details.Poster.replace("._V1_SX300", "._V1_SX800")
  //}

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
    watchGrid.innerHTML = `
        <button id="watch-movie">Watch</button>
      `;
    const watchButton = document.getElementById("watch-movie");
    watchButton.addEventListener("click", () => {
      watch_movie(details.Title, details.Year);
      addHistory(details, "movie");
      console.log(history);
    });
  } else {
    watch_series(details.Title, details);
  }
}
function addHistory(details, type, season, episode) {
  const history = JSON.parse(localStorage.getItem("history"));
  var currentdate = new Date();
  var datetime =
    currentdate.getDate() +
    "/" +
    String((currentdate.getMonth() + 1)).padStart(2, '0') +
    "/" +
    currentdate.getFullYear() +
    " @ " +
    String(currentdate.getHours()).padStart(2, '0') +
    ":" +
    String(currentdate.getMinutes()).padStart(2, '0');

  if (history) {
    const exist = history.filter(function (el) {
      return el.id == imdb_id;
    });
    if (exist.length == 0) {
      if (type == "tv-show") {
        history.push({
          title: details.Title,
          poster: details.Poster,
          id: imdb_id,
          color: getComputedStyle(document.documentElement).getPropertyValue(
            "--primary-color"
          ),
          time: datetime,
          season: season,
          episode: episode,
        });
      } else {
        history.push({
          title: details.Title,
          poster: details.Poster,
          id: imdb_id,
          color: getComputedStyle(document.documentElement).getPropertyValue(
            "--primary-color"
          ),
          time: datetime,
        });
      }
      localStorage.setItem("history", JSON.stringify(history));
    } else {
      // NOTE: UPDATE EXISTING ENTRIE
      const index = history.findIndex((x) => x.id == imdb_id);
      console.log("exists!");
      history[index].time = datetime;
      history[index].season = season;
      history[index].episode = episode;
      localStorage.setItem("history", JSON.stringify(history));
    }
  } else if (history == null) {
    localStorage.setItem("history", JSON.stringify([]));
  }
}

function removeHistory(id) {
  window.event.stopPropagation();
  console.log("remove!");
  let history = JSON.parse(localStorage.getItem("history"));
  if (history) {
    history = history.filter(function (el) {
      return el.id != id;
    });
    localStorage.setItem("history", JSON.stringify(history));

    loadHistory();
  }
}

async function watch_movie(title, year) {
  const result = await fetch(`${consumetapi}/${title}`);
  const movieDetails = await result.json();

  const match = movieDetails.results.filter(function (el) {
    return el.title == title && el.releaseDate == year;
  });

  if (match == null) {
    return null;
  }
  // const id = match[0].id.split("-").pop();
  let id = match[0].id;
  const res = await fetch(`${consumetapi}/info/${id}?type=${match[0].type}`);
  const json = await res.json();
  id = json.id.split("-").pop();

  console.log(id, json.id);
  //display_video(id, match[0].id);
  display_video(id, json.id);
}

async function watch_series(title, details) {
  const result = await fetch(`${consumetapi}/${title}`);
  const movieDetails = await result.json();

  const match = movieDetails.results.filter(function (el) {
    return el.title == title && el.type == "TV Series";
  });

  //const watchLink = await fetch(`${consumetapi}/info?id=${match[0].id}`);
  const watchLink = await fetch(
    `${consumetapi}/info/${match[0].id}?type=${match[0].type}`
  );
  console.log(`${consumetapi}/info/${match[0].id}?type=${match[0].type}`);
  const json = await watchLink.json();
  const media_id = json.id;
  const seasons = json.seasons.pop().season;
  console.log(seasons);

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
  episode_select.id = "episodes_selector";
  season_select.onchange = on_season_change;

  function on_season_change() {
    document.getElementById("episodes_selector").innerHTML = "";
    let episodes = json.seasons.filter(function (el) {
      return el.season == season_select.value;
    });
    episodes = episodes[0].episodes;
    console.log(episodes);
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

  document.getElementById("watch-button").addEventListener("click", () => {
    display_video(episode_id, media_id);
    se_selected = season_select.options[season_select.selectedIndex].text;
    ep_selected = episode_select.options[episode_select.selectedIndex].text;
    addHistory(details, "tv-show", se_selected, ep_selected);
  });
}

async function display_video(episodeId, mediaId) {
  //const watchLink = await fetch(
  // `${consumetapi}/watch?episodeId=${episodeId}&mediaId=${mediaId}&source=vidsrc`
  //);
  const watchLink = await fetch(
    `${consumetapi}/watch/${episodeId}?id=${mediaId}`
  );
  console.log(watchLink);
  const json = await watchLink.json();
  videoGrid.innerHTML = `<video id="video_1" class="video-js vjs-matrix"></video><br>
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

  console.log(sources)

  let captions = [];
  let languages = ["Arabic", "Spanish", "English", "German"];
  for (let i = 0; i < json.subtitles.length; i++) {
    let caption = json.subtitles[i];
    console.log(languages.find((x) => caption.lang.startsWith(x)));
    if (languages.find((x) => caption.lang.startsWith(x))) {
      captions.push({
        src: caption.url,
        kind: "captions",
        label: caption.lang,
      });
    }
  }

  console.log(captions);
  let options = {
    controlBar: {
      children: [
        "playToggle",
        'currentTimeDisplay',
        "progressControl",
        'durationDisplay',
        "volumePanel",
        "captionsButton",
        "qualitySelector",
        "fullscreenToggle",
      ],
    },
    controls: true,
    fluid: true,
    html5: { nativeTextTracks: false },
    vhs: { overrideNative: true },
    sources: sources,
    tracks: captions,
  };

  const video_el = document.getElementById("video_1");

  videojs(video_el, options);
}

window.addEventListener("click", (event) => {
  if (event.target.className != "form-control") {
    searchList.classList.add("hide-search-list");
  }
});
