import { Skill, Launch, Intent } from 'alexa-annotations';
import Response, { say, ask } from 'alexa-response';
import Twitter from './twitter';
import TwitterConfig from '../config/twitter.config.js';

@Skill
export default class SocialMedia {

  constructor(attributes, client = new Twitter(TwitterConfig), max = 10) {
    this.client = client;
    this.max = max;
  }

  @Launch
  launch() {
    return ask('Welcome to Social Media! Would you like to know what\'s trending at the moment?');
  }

  @Intent('Trending', 'TrendingCity', 'TrendingState', 'TrendingPlace', 'AMAZON.YesIntent')
  trending(slots) {
    const { city, state, place } = slots;
    return this.client.findLocation(city, state, place).then(place => {
      return Promise.all([place, this.client.getTrendingTopics({ id: place.woeid })]);
    }).then(([place, [response]]) => {
      const trends = response.trends.slice(0, this.max);
      const numberOfTrends = trends.length;
      const trendsSentence = trends.map(t => t.name).reduce((state, trend, i) => (
        `${state}, ${(i === numberOfTrends - 1) ? 'and, ' : ''}${trend}`
      ));

      const placeName = [place.name, place.country].filter(Boolean).join(', ');
      const intro = place.woeid == 1 ? 'Here are the top world wide trends' : `Here are the top trends for ${placeName}`;
      return say(`${intro}. ${trendsSentence}`);
    }).catch(error => {
      console.error('[SocialMedia]', error, slots);
      return say('I\'m having difficulty finding what\'s trending. Please try again later.');
    });
  }

  @Intent('Snark')
  snark() {
    return say('I don\'t know, probably something that happened last year.');
  }

  @Intent('AMAZON.HelpIntent')
  help() {
    return Response.build({
      ask: 'I can tell you what\'s trending on Social Media. Would you like to know what\'s trending at the moment?',
      reprompt: 'Would you like to hear about what is trending?'
    });
  }

  @Intent('AMAZON.CancelIntent', 'AMAZON.StopIntent', 'AMAZON.NoIntent')
  stop() {
    return say('Goodbye!');
  }

}
