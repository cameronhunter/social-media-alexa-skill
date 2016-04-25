import { Skill, Launch, Intent, SessionEnded } from 'alexa-annotations';
import Response, { say } from 'alexa-response';
import Twitter, { Errors, Location } from './twitter';
import TwitterConfig from '../config/twitter.config.js';

@Skill
export default class SocialMedia {

  constructor(attributes, client = new Twitter(TwitterConfig), max = 10) {
    this.client = client;
    this.max = max;
  }

  @Launch
  launch() {
    return Response.build({
      ask: 'Welcome to social bird! I can tell you what\'s trending on social media, what location would you like to hear about?',
      reprompt: 'Would you like to know what\'s trending world wide?'
    });
  }

  @Intent('Trending', 'TrendingCity', 'TrendingPlace', 'AMAZON.YesIntent')
  trending(slots) {
    const { city, state, place } = slots;
    return this.findLocation(city, state, place).then(
      location => this.getTrendingTopics(location),
      error => error === Errors.LocationNotFound ? this.noTrendsResponse(city || state || place) : Promise.reject(error)
    ).catch(error => {
      console.error(error);
      return say('I\'m having difficulty finding what\'s trending. Please try again later.');
    });
  }

  @Intent('TrendingWorldwide')
  worldwide() {
    return this.getTrendingTopics(Location.Worldwide);
  }

  @Intent('Snark')
  snark() {
    return say('I don\'t know, probably something that happened last year.');
  }

  @Intent('AMAZON.HelpIntent')
  help() {
    return Response.build({
      ask: 'I can tell you what\'s trending on social media. Would you like to know what\'s trending world wide?',
      reprompt: 'Would you like to hear about what is trending?'
    });
  }

  @SessionEnded
  @Intent('AMAZON.CancelIntent', 'AMAZON.StopIntent', 'AMAZON.NoIntent', 'Nowhere')
  stop() {
    return say('Goodbye!');
  }

  getTrendingTopics(location) {
    return Promise.resolve(location).then(place => {
      return Promise.all([place, this.client.getTrendingTopics({ id: place.woeid })]);
    }).then(([place, [response]]) => {
      const trends = response.trends.slice(0, this.max);
      const numberOfTrends = trends.length;
      const trendsSentence = trends.map(t => t.name).reduce((state, trend, i) => (
        `${state}, ${(i === numberOfTrends - 1) ? 'and, ' : ''}${trend}`
      ));

      const placeName = [place.name, place.country].filter(Boolean).join(', ');
      const intro = place.woeid == 1 ? 'Here are the top world wide trends' : `Here are the top trends for ${placeName}`;
      return Response.build({
        ask: `${intro}. ${trendsSentence}. Where else would you like to hear trends for?`,
        reprompt: 'Where would you like to hear trends for?'
      });
    }).catch(error => {
      return error === Errors.EmptyResult ? this.noTrendsResponse(location.name) : Promise.reject(error);
    });
  }

  noTrendsResponse(location) {
    return Response.build({
      ask: `I couldn't find trends for "${location}". Would you like to hear what's trending world wide?`,
      reprompt: 'Would you like to hear what\'s trending world wide?'
    });
  }

  findLocation(city, state, place) {
    return !(city || state || place) ? Promise.resolve(Location.Worldwide) : this.client.findLocation(city, state, place);
  }

}
