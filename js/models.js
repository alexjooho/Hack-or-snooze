"use strict";
// TODO: hide delete and trash icons if not logged in
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
  /** getStoryById:  returns Story instance, from a StoryList object
   * and Story id
    */
  static getStoryById(storyList, storyId) {  // it makes us need a storyList parameter
    console.log(storyList.stories);
    return storyList.stories.find(story => story.storyId === storyId);
  }

  // this is to get a story by using a given id and searching through the storyList
  // variable data
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
  /** remove a story form the serve and reload stories */
  static async deleteStories(storyId) {
    //https://hack-or-snooze-v3.herokuapp.com/stories/storyId
    console.log(currentUser.loginToken);
    await axios.delete(`${BASE_URL}/stories/${storyId}`,
      { data: { token: currentUser.loginToken } });   // needed the extra data: syntax for axios.delete()
    // StoryList.getStories();
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
      { token: this.loginToken });

    // could've done axios() and just added method to make it so we don't need
    // two functions for post and delete

    //  this.favorites = [...response.data.user.favorites];
    // this.favorites.unshift(response.data.user.favorites[response.data.user.favorites.length -1]);
    this.favorites.unshift(story);

  }

  /** Remove story from user's favorites when unfavorited */
  async removeFavorite(story) {
    await axios.delete(`${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      { data: { token: this.loginToken } });   // needed the extra data: syntax for axios.delete()

    this.favorites = this.favorites.filter(e => e.storyId !== story.storyId);

    //this.favorites.splice(this.favorites.indexOf(story), 1);  // both versions work

    // this.favorites.splice(this.favorites.findIndex(e => e.storyId === story.storyId), 1);
    // we should use .filter() instead

    // we could technically just use the data from the API as our favorites list,
    // since it returns the data with the user and its properties
  }

  /** remove story from all stories */

  isStoryInFavorites(story) {
    return this.favorites.some(x => x.storyId === story.storyId);

    // for (let fav of this.favorites) {
    //  if (fav.storyId === story.storyId) return true;
    // }
    // we could use some() instead

    // return false;

    // WHY doesn't this work?
    // return this.favorites.includes(story);
    // because it is looking for an object with a different reference point
    // this.favorites.indexOf(story) worked because in our addFavorite, we unshifted
    // reference to object
  }
  /** check if story is on ownStories array return bool */
  isOwnStory(story) {
    return this.ownStories.some(x => x.storyId === story.storyId);


  }
}