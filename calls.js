// using SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
var helper = require('sendgrid').mail;
const yaml = require('yamljs');
const zip = require('lodash/zip');
const {people} = yaml.load('schedule.yaml');
const shuffle = require('shuffle-array');

function getEmail(name) {
  const email = people[name];
  return new helper.Email(email, name);
}

function createEmail(from, first, second) {
  console.log(`email: ${first} ${second}`);
  let mail = new helper.Mail();
  mail.setFrom(getEmail(from));
  mail.setSubject(subject);

  const content = new helper.Content('text/plain', getBody(first, second));

  mail.addContent(content);

  personalization = new helper.Personalization();
  personalization.addTo(getEmail(first));

  if (second) {
    personalization.addTo(getEmail(second));
  }

  mail.addPersonalization(personalization);

  return mail;
}

function sendEmail(from, first, second) {
  const mail = createEmail(from, first, second);
  const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });

  sg.API(request, function(error, response) {
    console.log(response.statusCode, response.body, response.headers);
    if (error) {
      console.log(error);
    }
  });
}

const subject = `Weekly Mixer`;

function getBody(first, second) {
  if (!second) {
    const firstLine = `Hey ${first}, this week you have not been paired with anyone.`;
    const secondLine = `Feel free to treat this week as a wild card week and schedule a call with anyone you would like.`;
    return `${firstLine}\n\n${secondLine}`;
  }

  const firstLine = `Hey ${first} ${second},`;
  const secondLine = `You've been paired this week! Feel free to reach out and schedule a time to talk.`;
  return `${firstLine}\n\n${secondLine}`;
}

const list = shuffle(Object.keys(people), {copy: true});
let firstHalf = list.slice(0, list.length / 2 + 1);
let secondHalf = list.slice(list.length / 2 + 1);

const pairs = zip(firstHalf, secondHalf);

pairs.forEach(([first, second]) => {
  sendEmail('Jason', first, second);
});
