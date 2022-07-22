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
  // heart-fill class
  const hostName = story.getHostName(story.url);
  return $(`
      <li id="${story.storyId}">
      <span class="star">
      <i class="bi bi-heart"></i>
      </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

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