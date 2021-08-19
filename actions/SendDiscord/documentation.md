# Send Discord action


This action aims to create an easy way to [format](https://birdie0.github.io/discord-webhooks-guide/discord_webhook.html) and send alerts as Discord messages.

## Quick Links
[Initial setup](#configuration)

[Testing](#testing)

[Usage](#usage)

[Examples](#usage-examples)

[Templating](#templating)

<p>&nbsp;</p>

## Configuration

  

1. The first step is making sure that you have enabled webhooks on your discord channel. For more information read [Making a discord webhook](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)

  

2. Now that you've setup webhooks on your discord channel, navigate to `config-default.yml` in the /actions/SendDiscord/ directory of this repository. 
Replace the value of `webhookURL` from the 'place-holder URL' to the actual webhook URL that you received when you enabled webhooks on your discord channel.

  

3. Now deploy **Responder** to finalize your changes.


	```

	npm run deploy

	```
4. You should now be able receive  custom **Responder** alerts on your discord channel!
	
  <p>&nbsp;</p>

## Testing
You might want to test **Responder** to make sure all of your alerts are set up, [configured](#usage) , and arriving as expected. This can be done locally which will save you from having to re-deploy **Responder** every single time you want to change/test a configuration. 
To do this just cd to the main directory, and run the index.js file with node. 
```
	node index.js
```

Remember, the testing is local. So in order to apply the changes you've made to the cloud (e.g. your AWS account), **you must re-deploy once you have finished testing.**
```
	npm run deploy
```

<p>&nbsp;</p>

## Usage

The Discord integration can be used in a two different ways. 

1. First you are able to send custom messages (Simple message, Simple header, Header and values), by editing the `actions.yml` file located in main directory of this repository. 

2. Additionally you can utilize templates. By default **Responder** comes with a prebuilt template for AWS. However, in the future we hope to add templates for other platforms. 

<p>&nbsp;</p>

## Usage Examples
<p>&nbsp;</p>

### Simple message example:

A simple text message can be specified by configuring a value for the `message` property in the `actions.yml` file.

```

- rule: TheRuleName

sequential:

...

- command: SendDiscord

message: "Write your custom message here"

...

```

  

### Simple header example:

A simple header message can be created by adding a value to the `header` property in the `actions.yml` file.

```

- rule: TheRuleName

sequential:

...

- command: SendDiscord

message:

header: "Write your custom header here"

...

```

  

### Header and values example:

A Header and Values message can be created by adding a value to the `header` property, as well as adding / configuring the `values` property in the `actions.yml` file. 

Values are a JSONPath of the [context object]()

```

- rule: TheRuleName

sequential:

...

- command: SendDiscord

message:

header: "e.g. Root has logged in"

values:

- label: "e.g. Account"

value: "$.event.rawEvent.account"

- label: "e.g. From"

value: "$.event.rawEvent.detail.sourceIPAddress"

...

```

  

### Templates example:

It's easy to specify a template as well. This will provide more advanced formatting options. This is also done in the `actions.yml` file. 
As mentioned above, **Responder** comes with a prebuilt template for AWS. 
The `aws-event` template is preconfigured so it can be used with no further setup. But remember the template is just a starting point so feel free to customize it to suit your needs!
[Check out the templating section](#templating) 


```

- rule: TheRuleName

sequential:

...

- command: SendSlack

template: aws-event

...

```

<p>&nbsp;</p>

## Templating

Existing templates are located in the `responder/actions/SendDiscord/templates` directory. The name of the template is the file itself. 
The existing templates were built referencing this: [Discord webhooks formatting](https://birdie0.github.io/discord-webhooks-guide/discord_webhook.html) 






