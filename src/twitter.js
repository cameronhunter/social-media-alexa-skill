import { Twitter } from 'twitter-node-client';

const Worldwide = { woeid: 1, name: 'Worldwide' };

const normalize = (...args) => args.filter(Boolean).map(_ => _.toLowerCase());
const match = (value, ...fields) => !!value ? normalize(...fields).indexOf(value.toLowerCase()) : -1;

export default class TwitterClient {

  constructor(config) {
    this.client = new Twitter(config);
  }

  getTrendingTopics(options) {
    return this._fetch('/trends/place.json', { id: Worldwide.woeid, exclude: 'hashtags', ...options });
  }

  getAvailableTrendsLocations() {
    return this._fetch('/trends/available.json');
  }

  findLocation(city, state, other) {
    return !(city || state || other) ? Promise.resolve(Worldwide) : this.getAvailableTrendsLocations().then(response => {
      const location = response.filter(place => {
        const matches = [
          match(city, place.name),
          match(state, place.name, place.country),
          match(other, place.name, place.country, place.countryCode)
        ];

        return Math.max(...matches) >= 0;
      });

      return location[0] || Promise.reject(`Location "${location}" not found`);
    }).catch(error => {
      this._log('error', 'getLocationId', error);
      return Worldwide;
    });
  }

  _fetch(endpoint, params = {}) {
    this._log('info', 'fetch', endpoint, params);
    return new Promise((resolve, reject) => {
      return this.client.getCustomApiCall(endpoint, params, reject, response => resolve(JSON.parse(response)));
    }).catch(error => {
      this._log('error', 'fetch', endpoint, params, error);
      return Promise.reject(error);
    });
  }

  _log(level, ...args) {
    console[level]('[Twitter]', ...args);
  }

}
