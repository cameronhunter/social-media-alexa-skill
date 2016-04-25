import { Twitter } from 'twitter-node-client';

export const Location = {
  Worldwide: { woeid: 1, name: 'Worldwide' }
};

export const Errors = {
  LocationNotFound: 0,
  LocationEmpty: 1,
  EmptyResult: 2
};

const normalize = (...args) => args.filter(Boolean).map(_ => _.toLowerCase());
const match = (value, ...fields) => !!value ? normalize(...fields).indexOf(value.toLowerCase()) : -1;

const AlphaNumeric = /[a-z]/i;
const canPronouce = (text) => AlphaNumeric.test(text);

export default class TwitterClient {

  constructor(config) {
    this.client = new Twitter(config);
  }

  getTrendingTopics(options) {
    return this._fetch('/trends/place.json', { id: Location.Worldwide.woeid, exclude: 'hashtags', ...options }).then(responses => {
      return responses.map(response => ({
        ...response,
        trends: response.trends.filter(trend => canPronouce(trend.name))
      })).filter(response => {
        return response.trends && response.trends.length;
      });
    }).then(responses => {
      return responses.length ? responses : Promise.reject(Errors.EmptyResult);
    });
  }

  getAvailableTrendsLocations() {
    return this._fetch('/trends/available.json');
  }

  findLocation(city, state, other) {
    if (!(city || state || other)) {
      return Promise.reject(Errors.LocationEmpty);
    } else {
      return this.getAvailableTrendsLocations().then(response => {
        const location = response.filter(place => {
          const matches = [
            match(city, place.name),
            match(state, place.name, place.country),
            match(other, place.name, place.country, place.countryCode)
          ];

          return Math.max(...matches) >= 0;
        });

        return location[0] || Promise.reject(Errors.LocationNotFound);
      });
    }
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
