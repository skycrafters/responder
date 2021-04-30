# Responder

The Responder aims to listen to multiple event sources and provides a simple way to determine how to respond to them.

### Set up

Make sure the current CLI profile is set up with admin priviledges to your target AWS account

Install the [Serverless Framework](https://github.com/serverless/serverless#readme)

```
npm install -g serverless
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
sls deploy
```
