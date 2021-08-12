const Promise = require('bluebird')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const crypto = require('crypto')
const AWS = require('aws-sdk')
AWS.config.setPromisesDependency(Promise)
const EC2 = new AWS.EC2()
const SecretsManager = new AWS.SecretsManager()
const SSMSecretName = 'CloudResponderSecret'

const Configuration = require(`${process.cwd()}/models/configuration.js`)

const createSecret = async (regions) => {
  const key = await SecretsManager.getRandomPassword({
    PasswordLength: 20,
    ExcludePunctuation: true
  }).promise().then((data) => data.RandomPassword)
  await SecretsManager.createSecret({
    Description: 'Cloud Responder API Key',
    Name: SSMSecretName,
    SecretString: key
  }).promise().catch(async (error) => {
    if (error.code !== 'ResourceExistsException') {
      throw error
    }
    return await SecretsManager.updateSecret({
      SecretId: SSMSecretName,
      SecretString: key
    }).promise()
  }).then((secret) => {
    // console.log(secret)
    // throw err
    return SecretsManager.replicateSecretToRegions({
      SecretId: SSMSecretName,
      ForceOverwriteReplicaSecret: true,
      AddReplicaRegions: regions.filter(region => region !== 'us-east-1').map((region) => {
        return {
          // KmsKeyId: "alias",
          Region: region
        }
      })
    }).promise()
  })
}

const getRegions = () => {
  return EC2.describeRegions({})
    .promise()
    .then((data) => data.Regions)
    .map((region) => {
      return region.RegionName
    })
    .filter((region) => region !== 'ap-northeast-3')
}

const deployServerless = (region) => {
  return new Promise((resolve, reject) => {
    console.log('sls deploy --region ' + region)
    exec('sls deploy --region ' + region, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        reject(error)
        return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        reject(stderr)
        return
      }
      console.log(stdout)
      resolve(stdout)
    })
  })
}

const getHTTPEndpoint = async () => {
  const CloudFormation = new AWS.CloudFormation({ region: 'us-east-1' })
  return CloudFormation.describeStacks({
    StackName: 'cloud-responder-dev'
  })
    .promise()
    .then((stacks) => stacks.Stacks[0].Outputs)
    .filter((output) => output.OutputKey === 'ServiceEndpoint')
    .get(0)
    .then((output) => `${output.OutputValue}/capture`)
}

const deployEventBridgeRule = async (region, endpoint) => {
  console.log('Deploying stack in ', region)

  const stackName = 'cloud-responder-eventbridge'
  const CloudFormation = new AWS.CloudFormation({ region: region })
  const pendingStates = [
    'CREATE_IN_PROGRESS',
    'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS',
    'UPDATE_IN_PROGRESS',
    'DELETE_IN_PROGRESS'
  ]
  const errorStates = [
    'CREATE_FAILED',
    'ROLLBACK_FAILED',
    'UPDATE_ROLLBACK_FAILED'
  ]

  const checkCompletion = () => {
    return CloudFormation.describeStacks({
      StackName: stackName
    })
      .promise()
      .then((data) => data.Stacks[0].StackStatus)
      .then((status) => {
        if (pendingStates.includes(status)) {
          return Promise.delay(2000).then(checkCompletion)
        }
        console.log('[%s] done', region)
        return Promise.resolve()
      })
  }

  const stackExists = await CloudFormation.describeStacks({
    StackName: stackName
  })
    .promise()
    .then((data) => {
      return data.Stacks.length > 0
    })
    .catch((error) => {
      return false
    })

  if (!stackExists) {
    console.log('Stack does not exist in %s, creating', region)
    return CloudFormation.createStack({
      StackName: stackName,
      TemplateBody: fs.readFileSync('aws-eventbridge.yml', 'utf8'),
      Capabilities: ['CAPABILITY_NAMED_IAM'],
      Parameters: [
        {
          ParameterKey: 'TargetEndpoint',
          ParameterValue: endpoint
        },
        {
          ParameterKey: 'ForceUpdateToken',
          ParameterValue: Math.random().toString(36).substring(7)
        }
      ]
    })
      .promise()
      .then(checkCompletion)
  }

  const stackStatus = await CloudFormation.describeStacks({
    StackName: stackName
  })
    .promise()
    .then((data) => data.Stacks[0].StackStatus)

  if (stackExists && errorStates.includes(stackStatus)) {
    console.log(
      'Stack already exits in %s but in %s status, deleting',
      region,
      stackStatus
    )
    return CloudFormation.deleteStack({
      StackName: stackName
    })
      .promise()
      .then(checkCompletion)
      .then(() => {
        return deployEventBridgeRule(region, endpoint)
      })
  } else {
    console.log('Stack already exits in %s, updating', region)
    return CloudFormation.updateStack({
      StackName: stackName,
      TemplateBody: fs.readFileSync('aws-eventbridge.yml', 'utf8'),
      Capabilities: ['CAPABILITY_NAMED_IAM'],
      Parameters: [
        {
          ParameterKey: 'TargetEndpoint',
          ParameterValue: endpoint
        },
        {
          ParameterKey: 'ForceUpdateToken',
          ParameterValue: Math.random().toString(36).substring(7)
        }
      ]
    })
      .promise()
      .catch((error) => {
        if (
          error.code === 'ValidationError' &&
					error.message === 'No updates to perform.'
        ) {
          console.log('[%s] %s continuing...', region, error.message)
          return
        }
        throw error
      })
      .then(checkCompletion)
  }
};

(async () => {
  const regions = await getRegions()
  console.log('here are our regions: ', regions)
  await createSecret(regions)

  await deployServerless('us-east-1')
  const endpoint = await getHTTPEndpoint()

  await Promise.map(regions, (region) => {
    return deployEventBridgeRule(region, endpoint)
  })
})()
