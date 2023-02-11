// Titles: https://omdbapi.com/?s=thor&page=1&apikey=fc1fef96
// details: http://www.omdbapi.com/?i=tt3896198&apikey=fc1fef96
const  root = document.documentElement;
const movieSearchBox = document.getElementById('movie-search-box');
const searchList = document.getElementById('search-list');
const resultGrid = document.getElementById('result-grid');
const videoGrid = document.getElementById('video-grid');
const consumetapi = "https://api.consumet.org/movies/flixhq"
let watchGrid;

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
displayMovieDetails(imdb_id)



const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');


function LightenDarkenColor(color, amount) {
    if ( color[0] == "#" ) {color = color.slice(1);}
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));

}

async function material_you(img, theme) {
    const fac = new FastAverageColor();
              
    fac.getColorAsync(img).then((color) => {
    root.style.setProperty('--primary-color', color.hex);
    
      if (theme == "light"){
          root.style.setProperty('--background-color', LightenDarkenColor(color.hex, 83))
          root.style.setProperty('--light-background-color', LightenDarkenColor(color.hex, 70))
          root.style.setProperty('--md-background-color', LightenDarkenColor(color.hex, 70))
      } else if(theme == "dark") {
          root.style.setProperty('--background-color', LightenDarkenColor(color.hex, -98))
          root.style.setProperty('--light-background-color', LightenDarkenColor(color.hex, -80))
          root.style.setProperty('--md-background-color', LightenDarkenColor(color.hex, -80))
      }

    })
}


// load movies from API
async function loadMovies(searchTerm){
    const URL = `https://omdbapi.com/?s=${searchTerm}&page=1&apikey=fc1fef96`;
    const res = await fetch(`${URL}`);
    const data = await res.json();
    // console.log(data.Search);
    if(data.Response == "True") displayMovieList(data.Search);
}

function findMovies(){
    let searchTerm = (movieSearchBox.value).trim();
    if(searchTerm.length > 0){
        searchList.classList.remove('hide-search-list');
        loadMovies(searchTerm);
    } else {
        searchList.classList.add('hide-search-list');
    }
}

function displayMovieList(movies){
    searchList.innerHTML = "";
    for(let idx = 0; idx < movies.length; idx++){
        let movieListItem = document.createElement('div');
        movieListItem.dataset.id = movies[idx].imdbID; // setting movie id in  data-id
        movieListItem.classList.add('search-list-item');
        if(movies[idx].Poster != "N/A")
            moviePoster = movies[idx].Poster;
        else 
            moviePoster = "image_not_found.png";

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

function loadMovieDetails(){
    const searchListMovies = searchList.querySelectorAll('.search-list-item');
    searchListMovies.forEach(movie => {
        movie.addEventListener('click', () => {
            // console.log(movie.dataset.id);
            searchList.classList.add('hide-search-list');
            movieSearchBox.value = "";
            const imdb_id = movie.dataset.id
            const url = `./movie.html?id=${imdb_id}`
            window.location.href = url;
            displayMovieDetails(imdb_id);
        });
    });
}

async function displayMovieDetails(imdb_id){
    const result = await fetch(`https://www.omdbapi.com/?i=${imdb_id}&apikey=fc1fef96`);
    const details = await result.json();
    
    material_you(details.Poster, "dark")
    
    function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'light');
        material_you(details.Poster, "light")
    }   
    else {
        document.documentElement.setAttribute('data-theme', 'dark');
        material_you(details.Poster, "dark")
    }    
      }

    toggleSwitch.addEventListener('change', switchTheme, false);
    
    resultGrid.innerHTML = `
    <div class = "movie-poster">
        <img src = "${(details.Poster != "N/A") ? details.Poster : "image_not_found.png"}" alt = "movie poster">
    </div>
    <div class = "movie-info">
        <h3 class = "movie-title">${details.Title}</h3>
        <ul class = "movie-misc-info">
            <li class = "year">${details.Year}</li>
            <li class = "rated">${details.Rated}</li>
            <li class = "released">${details.Type}</li>
        </ul>
        <p class = "genre"><b>Genre:</b> ${details.Genre}</p>
        <p class = "writer"><b>Writer:</b> ${details.Writer}</p>
        <p class = "actors"><b>Actors: </b>${details.Actors}</p>
        <p class = "plot"><b>Plot:</b> ${details.Plot}</p>
        <p class = "language"><b>Language:</b> ${details.Language}</p>
        <p class = "awards"><b><i class = "fas fa-award"></i></b> ${details.Awards}</p>
        <div class="watch-grid" id="watch-grid"></div>
    </div>
    `;
    

   
    watchGrid = document.getElementById('watch-grid');

    if (details.Type == "movie"){
      watchGrid.innerHTML = `
        <button id="watch-movie">Watch</button>
      ` 
      const watchButton = document.getElementById('watch-movie')
      watchButton.addEventListener('click', () => {watch_movie(details.Title, details.Year)})
    } else {
      watch_series(details.Title)
    }
    

}


async function watch_movie(title, year){
    const result = await fetch(`${consumetapi}/${title}`);
    const movieDetails = await result.json();
    
    
    const match = movieDetails.results.filter(function (el) {
      return el.title == title &&
      el.releaseDate == year
    });
    
    if (match == null){return null}
    const id = match[0].id.split('-').pop()


    display_video(id, match[0].id)
}

async function watch_series(title) {
    const result = await fetch(`${consumetapi}/${title}`);
    const movieDetails = await result.json();
    
    
    const match = movieDetails.results.filter(function (el) {
      return el.title == title &&
      el.type == "TV Series"
    });
    
    const watchLink = await fetch(`${consumetapi}/info?id=${match[0].id}`)
    const json = await watchLink.json()
    const media_id = json.id;
    const seasons = json.episodes.pop().season
    console.log(seasons);
    
    const season_select = document.createElement("select");
    season_select.name = "Seasons";
    season_select.id = "seasons-selector"
    
    
    for (var i = 0; i < seasons; i++){
        var option = document.createElement("option");
        option.value = i + 1;
        option.text = "Season " + (i + 1);
        season_select.appendChild(option);
    }  
    
    const episode_select = document.createElement("select");
    episode_select.name = "episodes";
    episode_select.id = "episodes_selector";
    season_select.onchange = on_season_change
    
    function on_season_change() {
       document.getElementById("episodes_selector").innerHTML = "";
      const episodes = json.episodes.filter(function (el) {
        return el.season == season_select.value
       });
      for (var i = 0; i < episodes.length; i++){
        var option = document.createElement("option");
        option.value = episodes[i].id;
        option.text = episodes[i].title;
        episode_select.appendChild(option);
        };
    }
    
    episode_select.onchange = on_episode_change
    
    let episode_id = ""
    function on_episode_change() {
      episode_id = episode_select.value;
    }

    const watch_button = document.createElement("button")
    watch_button.innerHTML = "Watch"
    watch_button.id = 'watch-button'


    
    watchGrid.appendChild(season_select);
    watchGrid.appendChild(episode_select);
    watchGrid.appendChild(watch_button);
    on_season_change()
    on_episode_change()
  
    
   document.getElementById('watch-button').addEventListener("click", () => {
      display_video(episode_id, media_id);
    })
}

async function display_video(episodeId, mediaId) {
    const watchLink = await fetch(`${consumetapi}/watch?episodeId=${episodeId}&mediaId=${mediaId}&source=vidsrc`)
    const json = await watchLink.json()
    videoGrid.innerHTML = '<video id="video_1" class="video-js vjs-default-skin" controls></video>'
    
    let sources = []
    for(let i = 0; i < json.sources.length; i++) {
    let source = json.sources[i];
        sources.push({
          src: source.url,
          label: source.quality,
          type: "application/x-mpegURL"
        })
    }
    
            
    let captions = []
    let languages = ["Arabic", "Spanish", "English", "German"]
    for(let i = 0; i < json.subtitles.length; i++) {
    
    
    let caption = json.subtitles[i];
    console.log(languages.find((x) => caption.lang.startsWith(x)))
    if (languages.find((x) => caption.lang.startsWith(x))){
        captions.push({
          src: caption.url,
          kind: "captions",
          label: caption.lang,
        })
    }}
    
    console.log(captions)
    let options = {
        controlBar: {
          children: [
         'playToggle',
         'progressControl',
         'volumePanel',
         'captionsButton',
         'qualitySelector',
         'fullscreenToggle',
            ],
         },
        controls: true,
        fluid: true,
        sources: sources,
        tracks: captions
      };
      
    const video_el = document.getElementById('video_1')
    

    
    videojs(video_el, options)


  
}

window.addEventListener('click', (event) => {
    if(event.target.className != "form-control"){
        searchList.classList.add('hide-search-list');
    }
});