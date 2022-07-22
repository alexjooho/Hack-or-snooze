"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  evt.preventDefault();
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** navSubmitClick:  Shows new story submit form*/

function navSubmitClick() {
  $('#submit-form').css({ display: 'flex' });
}

$navSubmit.on('click', navSubmitClick);


/** navFavoritesClick: shows favorites list hide */
function navFavoritesClick(evt) {
  hidePageComponents();
  putFavoritesStoriesOnPage();
}

/** Gets list of current user favorites and populates DOM. */

function putFavoritesStoriesOnPage() {

  $favStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favStoriesList.append($story);
  }

  $favStoriesList.show();
}

/**navFavoritesClick listener */

$navFavorites.on('click', navFavoritesClick);


