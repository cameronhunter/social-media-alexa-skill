import { Twitter } from 'twitter-node-client';

export default class TwitterClient {

  constructor(config) {
    this.client = new Twitter(config);
  }

  getTrendingTopics(id = 1, options) {
    const params = { exclude: 'hashtags', ...options };
    return new Promise((resolve, reject) => {
      return this.client.getCustomApiCall('/trends/place.json', { ...params, id }, reject, response => resolve(JSON.parse(response)));
    });
  }

}
