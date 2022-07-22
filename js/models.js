"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";


/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName(url) {
    return new URL(url).hostname;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, newStoryValues) {

    const url = `${BASE_URL}/stories`;
    const data = {
      token: user.loginToken,
      story: {
        author: newStoryValues.author,
        title: newStoryValues.title,
        url: newStoryValues.url
      }
    };

    const response = await axios.post(url, data);
    const story = new Story(response.data.story);

    this.stories.unshift(story);
    user.ownStories.unshift(story);
    return story;
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      const { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  // https://hack-or-snooze-v3.herokuapp.com/users/username/favorites/storyId
  // will send a axios.post() request that includes username and story id of favorited
  // use the response to add 

  /** Add story to user's favorites when favorited */
  async addFavorite(story) {
    await axios.post(`${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
    {token: this.loginToken});

    //  this.favorites = [...response.data.user.favorites];
    // this.favorites.unshift(response.data.user.favorites[response.data.user.favorites.length -1]);
    this.favorites.unshift(story);

  }

  /** Remove story from user's favorites when unfavorited */
  async removeFavorite(story) {
    await axios.delete(`${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
    {data: {token: this.loginToken}});   // needed the extra data: syntax for axios.delete()

    this.favorites.splice(this.favorites.indexOf(story), 1);  // both versions work

    // this.favorites.splice(this.favorites.findIndex(e => e.storyId === story.storyId), 1);
  }
}

/* TODO: add star icon on generateStoryMarkup on stories.js (line 22)

  TODO: figure out which icons have been clicked (parent's id) 
          change icon when clicked/not clicked

  TODO: add the favorites tab/button to the navbar

  TODO: show favorites list when favorites tab/button is clicked
          and hide everything else

  TODO: may want to add a static method to the Story class to get an arbitrary story by ID
*/