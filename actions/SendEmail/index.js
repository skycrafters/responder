const Promise = require('bluebird')

const AWS = require('aws-sdk')
const SNS = new AWS.SNS({})
const STS = new AWS.STS({})

const Configuration = require(`${process.cwd()}/models/configuration.js`)
const config = (new Configuration([__dirname])).values

module.exports = async (action, flow) => {
  const AWSAccountId = await STS.getCallerIdentity({}).promise().then(data => data.Account)

  return Promise.mapSeries(flow.findings, (finding) => {
    let emailBody = `${finding.message} \nSeverity: ${finding.severity}`
    emailBody += '\n----------\n'
    emailBody += JSON.stringify(finding, null, 2)
    emailBody += '\n----------\n'
    emailBody += JSON.stringify(flow.event, null, 2)

    const topicARN = `arn:aws:sns:${process.env.AWS_REGION}:${AWSAccountId}:${config.EmailTopicName}`

    return SNS.publish({
      TopicArn: topicARN,
      Subject: action.subject || finding.ruleTitle,
      Message: emailBody
    })
      .promise()
      .then(() => {
        console.log('Email successfully sent')
        return true
      })
      .catch((error) => {
        console.log(error)
        return false
      })
  })
}
