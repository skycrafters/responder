const path = require('path')

const ipRangeCheck = require('ip-range-check')

const Rule = require(`${process.cwd()}/models/rule.js`)

const rule = new Rule({
  name: path.basename(path.dirname(__filename)),
  provider: 'AWS'
})

rule.capture = (event, context) => {
  const findings = []
  if (context.config.trustedIPs && !ipRangeCheck(event.detail.sourceIPAddress, context.config.trustedIPs)) {
    findings.push({
      message: `User ${event.initiator} logged into the AWS console from an untrusted IP address ${event.initiatingIP}`
    })
  }
  return findings
}

module.exports = rule
