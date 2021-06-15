const path = require('path')

Promise = require('bluebird')

const AWS = require('aws-sdk')
const EC2 = new AWS.EC2({
  region: 'us-east-1'
})

const Rule = require(`${process.cwd()}/models/rule.js`)

const rule = new Rule({
  name: path.basename(path.dirname(__filename)),
  provider: 'AWS'
})

rule.capture = (event, context) => {
  const findings = []
  if (!isValid(event.detail.requestParameters.instanceType, context.config)) {
    findings.push({
      message: `Unauthorized [${event.detail.requestParameters.instanceType}] instance has been launched`,
      meta: {
        instanceType: event.detail.requestParameters.instanceType
      },
      resources: event.detail.responseElements.instancesSet.items.map(
        (instance) => instance.instanceId
      )
    })
  }
  return findings
}

rule.check = async (action, flow) => {
  const finding = flow.findings.find(
    (finding) => finding.ruleName === flow.rule.rule
  )
  try {
    const instances = await EC2.describeInstanceStatus({
      InstanceIds: finding.resources
    }).promise()
    const areInstancesRunning = instances.InstanceStatuses.some(
      (instance) => instance.InstanceState.Code === 16 || instance.InstanceState.Code === 0
    )
    if (areInstancesRunning) {
      return true
    }
    console.log('Specified instances are not running')
    return false
  } catch (error) {
    console.log(error)
    console.log(error.message)
    console.log(`The instance ${finding.resources} no longer exists`)
    return false
  }
}

rule.remediate = async (action, flow) => {
  console.log('Checking running instances')
  const finding = flow.findings.find(
    (finding) => finding.ruleName === flow.rule.rule
  )
  try {
    const instances = await EC2.terminateInstances({
      InstanceIds: finding.resources
    }).promise()
    return true
  } catch (error) {
    console.log(error)
    console.log(error.message)
    console.log(`The instance ${finding.resources} no longer exists`)
    return false
  }
}

module.exports = rule

const isValid = (instanceType, configuration) => {
  const isInvalidInstance = configuration.blackListedInstances.find(
    (rule) => {
      return instanceType.match(rule)
    }
  )
  if (isInvalidInstance) {
    return false
  }
  const isValidInstance = configuration.whiteListedInstances.find((rule) => {
    return instanceType.match(rule)
  })
  if (isValidInstance) {
    return true
  }
  return false
}
