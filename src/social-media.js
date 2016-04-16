import { Skill, Launch, Intent } from 'alexa-annotations';
import Response, { say, ask } from 'alexa-response';
import Twitter from './twitter';
import TwitterConfig from '../config/twitter.config.js';

@Skill
export default class SocialMedia {

  constructor(attributes, client = new Twitter(TwitterConfig)) {
    this.client = client;
  }

  @Launch
  launch() {
    return ask('Welcome to Social Media! Would you like to know what\'s trending at the moment?');
  }

  @Intent('Trending', 'AMAZON.YesIntent')
  trending() {
    return this.client.getTrendingTopics().then(([response]) => {
      const numberOfTrends = response.trends.length;
      const trends = response.trends.map(t => t.name).reduce((state, trend, i) => (
        `${state}, ${(i === numberOfTrends - 1) ? 'and, ' : ''}${trend}`
      ));

      return say(`Here are the top trends. ${trends}`);
    });
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
