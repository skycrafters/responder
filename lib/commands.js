const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')
const yaml = require('js-yaml')

const performAction = (action, flow) => {
  let run
  if (action.command) {
    if (!fs.existsSync(path.resolve('./actions/', action.command))) {
      return Promise.reject(`Module ${action.command} does not exist`)
    }
    run = require(path.resolve('./actions/', action.command))
  } else if (action.rule) {
    const ruleName = flow.rule.rule
    const provider = flow.rule.provider

    if (!fs.existsSync(path.resolve(__dirname, '../rules/', provider, ruleName))) {
      return Promise.reject(`Module ${ruleName} does not exist`)
    }

    const rule = require(path.resolve(__dirname, '../rules/', provider, ruleName))

    if (action.rule === 'check') {
      if (!rule.check) {
        return Promise.reject(
					`Check function ${ruleName} does not exist`
        )
      }

      run = rule.check
    }

    if (action.rule === 'remediate') {
      if (!rule.remediate) {
        console.error(
          'Remediate function is not set for %s %s',
          ruleName
        )
        return Promise.reject(
					`Remediate function ${ruleName} does not exist`
        )
      }

      run = rule.remediate
    }
  } else {
    console.log('Undefined action to perform')
    return Promise.reject('Undefined action to perform')
  }

  console.log('Stating:', action.command || action.rule)
  return run(action, flow)
    .then((result) => {
      console.log('Finishing:', action.command || action.rule)
      if (!result) {
        throw new Error(`${action.command || action.rule} did not return the expected value`)
      }
    })
    .catch((error) => {
      console.log('Error with:', action.command || action.rule)
      console.log(error)
      console.log(error.message)
      throw new Error('Skipping...')
    })
}

module.exports.captureEvent = (event, ruleflow) => {
  if (!path.resolve(__dirname, './rules/AWS/', ruleflow.rule)) {
    console.log(__dirname, './rules/AWS/', ruleflow.rule)
    console.log('Rule %s not found', ruleflow.rule)
    throw new Error(`Rule ${ruleflow.rule} not found`)
  }

  const rule = require(path.resolve('./rules/AWS/', ruleflow.rule))
  return rule.capture(event)
}

module.exports.runSequence = (flow) => {
  if (flow.rule.sequential) {
    return Promise.mapSeries(flow.rule.sequential, (action) => {
      return performAction(action, flow)
    }).catch((error) => {
      console.log('Flow aborted')
      console.log(error)
      console.log(error.message)
    })
  }

  if (flow.rule.parallel) {
    return Promise.map(flow.rule.parallel, (action) => {
      return performAction(action, flow).catch((error) => {
        console.log('Error in parallel flow')
        console.log(error.message)
        console.log(error)
      })
    })
  }
}
