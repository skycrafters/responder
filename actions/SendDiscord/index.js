Promise = require('bluebird');
const { JSONPath } = require('jsonpath-plus');
const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');
// const { IncomingWebhook } = require('@slack/webhook')
const { Webhook } = require('discord-webhook-node');
const Handlebars = require('handlebars');
const Configuration = require(`${process.cwd()}/models/configuration.js`);
const config = new Configuration([__dirname]).values;
const fetch = require('node-fetch')
///////

// const hook = new Webhook("YOUR WEBHOOK URL");

// const IMAGE_URL = 'https://homepages.cae.wisc.edu/~ece533/images/airplane.png';
// hook.setUsername('Discord Webhook Node Name');
// hook.setAvatar(IMAGE_URL);

// hook.send("Hello there!");

///////
module.exports = async (action, flow) => {
  // using the Slack action default config
  let webhookURL = config.webhookURL;

  if (action.webhookURL) {
    // using the action-specific config
    webhookURL = action.webhookURL;
  }

  // const webhook = new Webhook(webhookURL);

  return Promise.mapSeries(flow.findings, async (finding) => {
    const message = buildMessage(finding, action, flow);
    try {
      console.log(`___________________ _____________`);
      console.log('                                               ');
      console.log('                                               ');
      // console.log(`config is: ${JSON.stringify(config)}`)
      // console.log(message.blocks[0].text.text)
      // console.log(`finding is: ${JSON.stringify(finding)}`)
      console.log('                                               ');
      console.log('                                               ');
      // console.log(`action is: ${JSON.stringify(action)}`)
      console.log('                                               ');
      console.log('                                               ');
      // console.log(`flow is: ${JSON.stringify(flow)}`)
      // console.log(`message is: ${message.blocks[0].text.text}`)
      console.log(
        `sendDDD----action------------------\n ${JSON.stringify(
          action
        )} and the dirname ${__dirname}`
      );

      console.log('                                               ');

      console.log(`message is:::: ${JSON.stringify(message)}`);
      console.log('                                               ');

      // webhook.setUsername(message.username);
      // webhook.setAvatar(message.avatar_url);

      // await webhook.send(message.content);

      console.log('message -------BLOCKS', message.blocks);
      // await webhook.send(JSON.stringify(message))
      await fetch(webhookURL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },

        //make sure to serialize your JSON body
        body: JSON.stringify(message),
      }).then((response) => {
        console.log('sussfully posted our fetch...',response);
        //do something awesome that makes the world a better place
      });

      // await webhook.send(message.blocks[0].text.text)
      return true;
    } catch (error) {
      console.error(error);
      console.log('Sending discord message failed');
      return false;
    }
  });
};

const buildMessage = (finding, action, flow) => {
  const message = {};

  if (
    action.template &&
    fs.existsSync(`${__dirname}/templates/${action.template}.yml`)
  ) {
    const template = Handlebars.compile(
      fs.readFileSync(`${__dirname}/templates/${action.template}.yml`, 'utf8')
    );

    const result = yaml.load(
      template(
        {
          finding,
          action,
          flow,
        },
        {
          // security
          // not recommended, but can't find a better way for now
          allowProtoPropertiesByDefault: true,
        }
      )
    );
    console.log('the result is.......', JSON.stringify(result));
    return result;
  }

  let blocks = [];

  if (typeof action.message === 'string' || action.message.header) {
    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: action.message.header || action.message,
      },
    });
  } else {
    blocks = blocks.concat(
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: finding.ruleTitle,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: finding.message,
        },
      }
    );
  }

  if (action.message.values) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: action.message.values
          .map((value) => {
            const result = JSONPath({
              path: value.value,
              json: flow,
            });
            return `*${value.label}*: ${result}`;
          })
          .join('\n'),
      },
    });
  }

  return {
    blocks,
  };
};
