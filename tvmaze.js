"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");
const TVMAZE_BASE_URL = "http://api.tvmaze.com/";
const GENERIC_IMAGE_URL = 'https://tinyurl.com/tv-missing'


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  let response = await axios.get(
    `${TVMAZE_BASE_URL}search/shows`,
    { params: { q: searchTerm } }
  );
  console.log("response =", response);

  let shows = response.data.map((showAndScore) => ({
    id: showAndScore.show.id,
    name: showAndScore.show.name,
    summary: showAndScore.show.summary,
    image: (showAndScore.show.image !== null
      ? showAndScore.show.image.original
      : GENERIC_IMAGE_URL)
  }));

  console.log("shows: ", shows);
  return shows;

    // {
    //   id: 1767,
    //   name: "The Bletchley Circle",
    //   summary:
    //     `<p><b>The Bletchley Circle</b> follows the journey of four ordinary
    //        women with extraordinary skills that helped to end World War II.</p>
    //      <p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their
    //        normal lives, modestly setting aside the part they played in
    //        producing crucial intelligence, which helped the Allies to victory
    //        and shortened the war. When Susan discovers a hidden code behind an
    //        unsolved murder she is met by skepticism from the police. She
    //        quickly realises she can only begin to crack the murders and bring
    //        the culprit to justice with her former friends.</p>`,
    //   image:
    //       "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
    // }
}


/** Given list of shows, create markup for each and add to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    // console.log("show image url: ", show.image);
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);
      // console.log("show div code: ", show);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  //$episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(showId) {
  let response = await axios.get(
    `${TVMAZE_BASE_URL}shows/${showId}/episodes`
  );
  console.log("episode response =", response);

  let episodes = response.data.map((episodeData) => ({
    id: episodeData.id,
    name: episodeData.name,
    season: episodeData.season,
    number: episodeData.number
  }));

  console.log("episodes: ", episodes);
  return episodes;
}

/** Given list of episodes, create markup for each and add to DOM */

function populateEpisodes(episodes) {

  for (let episode of episodes) {
    console.log("episode: ",episode);
    const $episode = $(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`);
    console.log("episode li: ", episodeLi, "typeof episodeLi", typeof episodeLi);

    $episodesList.append($episode);
  }
}

async function searchForEpisodesAndDisplay(showId) {
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

$showsList.on("click", function (evt) {
  searchForEpisodesAndDisplay(evt.target.data);
});
