# Responder

The Responder aims to listen to multiple event sources and provides a simple way to determine how to respond to them.

### Local set up

Make sure the current CLI profile is set up with admin priviledges to your target AWS account

Install the [Serverless Framework](https://github.com/serverless/serverless#readme) globally

```
npm install -g serverless
```

Install all the dependencies

```
npm install
```

### Getting started

To get started, start taking a look at the actions.yml, you will find a file that is composed of flows.
A flow is a combination of a rule, and actions. A rule is a piece of logic that will capture or detect a specific event of interest. For instance, somebody has logged in, a resource has been created, etc. An action defines how to react to this event; it can be sending a Slack message, waiting, sending emails, check soething, etc.

#### AWS Use cases

By default the projects comes with a few handy detection rules that are presented below. These rules can be disabled.

- *Root has Logged in*<br />
This flow will detect any login that the Root accounts makes, it will send a Slack message to notify anyone or anyteam of such event

- *Suspicious log in hour*<br />
An IAM has logged in outside of the specified work hours, it will send a Slack message to notify anyone or anyteam of such event

- *Suspicious log in from an unknown IP address*<br />
An IAM has logged in outside of the specified IP addresses, it will send a Slack message to notify anyone or anyteam of such event

### Deploy

```
npm run deploy
```
This will:
- Create APIKey in SecretsManager in us-east-1 and its replicas in all enabled regions, this key will be used to secure the events that are sent from various regions to the Cloud Responder (installed in us-east-1)
- Deploy the Serverless Cloud Responder application in us-east-1
- Deploy this EventBridge [CloudFormation template](aws-eventbridge.md) into every region

### Remove

```
npm run remove
```

This will:
- Remove the EventBridge CloudFormation stacks in all regions
- Remove the Serverless app
- Remove the APIKey from SecretsManager in every region

## How it works

### On AWS

*The EventBridge Rules*
On AWS, the installation creates a Rule on EventBridge. This rule capture CloudTrail events and send these events to a Target.
The Target is an API Connection that sends the event to the Cloud Responder via a HTTP request.
Because the EventBridge is region specific, it has to be done in every region.

*The Serverless app*
The serverless app exposes a HTTP endpoint that will receive POST requests sent by the API Connections installed in all regions. The the KeyPOST requests are authenticated via an APIKey tha is shared between the API Connection and the Serverless HTTP endpoint (API Gateway). An Authorizer (Lambda function) will authenticate the request by checking the API Key. Once authenticated the detection/capture sequence can start.

### Anywhere

*Detection/Capture sequence*
The capture sequence, is a rule that is going to be run again the incoming event. The rule checks if the event is of interest. The rule must return an array of findings if the the event is of interest. Returning one or more findings will start a flow sequence.

*The flow sequence*
A flow sequence will start when a finding has been discoverd, it a series of actions that can be taken sequentially or in parallel.