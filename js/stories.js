"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {

  const hostName = story.getHostName(story.url);

  let icon;  // had to add icons for if there are no current users
  // could also put the generating icon logic into another function

  if (currentUser) {
    icon = currentUser.isStoryInFavorites(story) ? "bi bi-heart-fill" : "bi bi-heart";
  }
  else {
    icon = "bi bi-heart";
  }
  // need quotes around attribute in html string literal,
  //  because the actual string doesn't include the quotes
  return $(`
      <li id="${story.storyId}">
      <div class="story-top-row">
      <div> <span class="star">
      <i class="${icon}"></i>
      </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small></div>
      <div> <span><i class="bi bi-trash3-fill"></i></span></div>


        </div>


      </li>
    `);
}
// <small class="story-user">posted by ${story.username}</small>

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** addStoryToPage:  adds new story to page using form inputs */

async function addStoryToPage(evt) {
  evt.preventDefault();

  const author = $('#create-author').val();
  const title = $('#create-title').val();
  const url = $('#create-url').val();

  const story = await storyList.addStory(currentUser, { author, title, url });

  $allStoriesList.prepend(generateStoryMarkup(story));
  $navSubmit.css({ 'display': 'hidden' });
}

$newStoryForm.on('submit', addStoryToPage);



/** toggleFavoriteIcon: toggles the favorite icon state
 *  between solid and outline */
// try toggleClass
function toggleFavoriteIcon(evt) {
  // if ($(evt.target).hasClass('bi-heart')) {
  //   $(evt.target).attr('class', 'bi bi-heart-fill');
  //   // return true;
  // }
  // else {
  //   $(evt.target).attr('class', 'bi bi-heart');
  //   // return false;
  // }

  $(evt.target).toggleClass("bi-heart bi-heart-fill");
}

/** favoriteClickHandler: handles clicking the favorite icon  */

async function favoriteClickHandler(evt) {

  const storyId = $(evt.target).closest('li').attr('id');
  // no ned to pass storylist
  const story = Story.getStoryById(storyList, storyId);

  // If true, need to add to data, else take away from data

  const isNotFavorite = currentUser.isStoryInFavorites(story);
  // console.log(isNotFavorite);
  if (!isNotFavorite) {
    await currentUser.addFavorite(story);
  } else {
    await currentUser.removeFavorite(story);
  }

  toggleFavoriteIcon(evt);
}
/** handles clicking on and off a favorite  */
$('ol.stories-list').on('click', 'i', favoriteClickHandler);




