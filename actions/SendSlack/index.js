Promise = require('bluebird')
const { JSONPath } = require('jsonpath-plus')
const yaml = require('js-yaml')
const path = require('path')
const fs = require('fs')
const { IncomingWebhook } = require('@slack/webhook')
const Handlebars = require('handlebars')
const Configuration = require(`${process.cwd()}/models/configuration.js`)
const config = (new Configuration([__dirname])).values

module.exports = async (action, flow) => {
  // using the Slack action default config
  let webhookURL = config.webhookURL

  if (action.webhookURL) {
    // using the action-specific config
    webhookURL = action.webhookURL
  }

  const webhook = new IncomingWebhook(webhookURL)

  return Promise.mapSeries(flow.findings, async (finding) => {
    const message = buildMessage(finding, action, flow)
    try {
      await webhook.send(message)
      console.log('Sent Sack message successfully')
      return true
    } catch (error) {
      console.error(error)
      console.log('Sending Slack message failed')
      return false
    }
  })
}

const buildMessage = (finding, action, flow) => {
  const message = {}

  if (action.template && fs.existsSync(`${__dirname}/templates/${action.template}.yml`)) {
    const template = Handlebars.compile(fs.readFileSync(`${__dirname}/templates/${action.template}.yml`, 'utf8'))

    const result = yaml.load(template({
      finding,
      action,
      flow
    }, {
      // security
      // not recommended, but can't find a better way for now
      allowProtoPropertiesByDefault: true
	  		}
    ))

    return result
  }

  let blocks = []

  if (typeof action.message === 'string' || action.message.header) {
    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: action.message.header || action.message
      }
    })
  } else {
    blocks = blocks.concat({
      type: 'header',
      text: {
        type: 'plain_text',
        text: finding.ruleTitle
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'plain_text',
        text: finding.message
      }
    })
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
              json: flow
            })
            return `*${value.label}*: ${result}`
          })
          .join('\n')
      }
    })
  }

  return {
    blocks
  }
}
