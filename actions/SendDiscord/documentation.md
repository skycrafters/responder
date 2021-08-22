# Send Discord action


This action aims to create an easy way to [format](https://birdie0.github.io/discord-webhooks-guide/discord_webhook.html) and send alerts as Discord messages.

## Quick Links
[Initial setup](#initial-setup)

[Usage](#usage)

[Examples](#usage-examples)

[Templating](#templating)

<p>&nbsp;</p>

## Initial setup

  

1. The first step is making sure that you have enabled webhooks on your discord channel. For more information read [Making a discord webhook](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks). Make sure to copy the address of your webhook. 

  

2. Now that you've setup webhooks on your discord channel, navigate to `config-default.yml` in the /actions/SendDiscord/ directory of this repository. In that file, replace the value of `webhookURL` from the 'place-holder URL' to the actual webhook URL that you received when you enabled webhooks on your discord channel.

  

3. (optional) [Configure](#usage) and [locally test](../../README.md#testing-your-configuration) your discord integration. Once you are satisfied with your configuration, re-[deploy](../../README.md#deploy) **Responder** to finalize your changes.





4. Congratulations you should now be able receive custom **Responder** alerts on your discord channel!
	
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

```yml

- rule: TheRuleName

  sequential:

...

- command: SendDiscord

  message: "Write your custom message here"

...

```

  

### Simple header example:

A simple header message can be created by adding a value to the `header` property in the `actions.yml` file.

```yml

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

```yml

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

  
<p>&nbsp;</p>
### Templates example:

It's easy to specify a template as well. This will provide more advanced formatting options. This is also done in the `actions.yml` file. 
As mentioned above, **Responder** comes with a prebuilt template for AWS. 
The `aws-event` template is preconfigured to be used "right out of the box" with no further setup. But remember the template is just a starting point so feel free to customize it to suit your needs!
[Check out the templating section](#templating) 


```yml

- rule: TheRuleName

  sequential:

...

- command: SendDiscord

  template: aws-event

...

```

<p>&nbsp;</p>

## Templating

Existing templates are located in the `actions/SendDiscord/templates` directory. The name of the template is the file itself. 
The existing templates were built referencing this: [Discord webhooks formatting](https://birdie0.github.io/discord-webhooks-guide/discord_webhook.html) 






