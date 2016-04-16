import test from 'ava';
import { handler as Skill } from '..';
import { Request } from 'alexa-annotations';

test('LaunchRequest', t => {
  const event = Request.launchRequest().build();

  return Skill(event).then(response => {
    t.deepEqual(response, {
      version: '1.0',
      response: {
        shouldEndSession: false,
        outputSpeech: { type: 'PlainText', text: 'Welcome to Social Media! Would you like to know what\'s trending at the moment?' }
      }
    });
  });
});

test.skip('Trending intent', t => {
  const event = Request.intent('Trending').build();

  return Skill(event).then(response => {
    console.log(JSON.stringify(response, null, 2));
    t.deepEqual(response, {
      version: '1.0',
      response: {
        shouldEndSession: true,
        outputSpeech: { type: 'PlainText', text: 'Hello world' }
      }
    });
  });
});
