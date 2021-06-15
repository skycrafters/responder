const Rule = require(`${process.cwd()}/models/rule.js`)
const path = require('path')

const rule = new Rule({
  name: path.basename(path.dirname(__filename)),
  provider: 'AWS'
})

rule.capture = () => {
  return [{
    message: 'Suspicious activity detected, Root user has logged into the console'
  }]
}

module.exports = rule
