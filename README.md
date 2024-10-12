
# Slack Report for Playwright Automation

This is one of a custom reporter that made for Playwright (in TypeScript/JavaScript) to send the automation report to Slack using Incoming Webhook.


## Installation

This custom reporter not yet published to NPM, please do intall directly from GitHub repository by command.

Before install the custom reporter, please be sure to use:
- Node `v18.20.4` or above
- Playwright `v1.48.0` or above

```bash
npm install "git@github.com:indraaristya/playwright-slack-report.git#v1.0.0"
```
And the reporter is ready to use after installation complete!


## Usage

The custom reporter need some parameters to passing.
| Parameter     | Description |
| --------      | ------- |
| webhookUrl    | The incoming webhook URL of the Slack Application     |
| projectName   | Project name to define the automation running for which project   |
| triggerBy     | Identify the author/actor who run the test    |
| buildUrl      | URL of the build IF the test run in pipeline  |
| buildNumber   | # build in pipeline |


## Examples

Before try to add the configuration, do not forget to allow Incoming Webhook in the Slack Application, and generate the webhook.

Read the documentation of [Sending Message using Webhook](https://api.slack.com/messaging/webhooks).

After installation completed and Slack webhook ready, simply add the custom report into your `playwright.config.ts`

```typecript
...,
reporter: [
  ['playwright-slack-report', { 
      webhookUrl: process.env.SLACK_URL,
      projectName: 'Personal Project',
      triggerBy: process.env.TRIGGERED_BY,
      buildUrl: process.env.BUILD_URL,
      buildNumber: process.env.BUILD_NUMBER,
  }]
],
...
```

Do not forget to add the value of parameters as mentioned above in your environment variable or you might want to hard-code the value; _it's up to you_.

If the test running in Github Action, you might use this sample to passing the build URL, build number, and the actor who run the test by following this command.
```bash
BUILD_URL=${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }} BUILD_NUMBER=${{ github.run_number }} TRIGGERED_BY=${{ github.actor }} SLACK_URL=${{ secrets.SLACK_URL }} npx playwright test
```
Please note from the sample above, the `SLACK_URL` is saved in the Github Secret. 


## Screenshots

![Sample Report](https://i.ibb.co.com/Pj0rVM1/image.png)

