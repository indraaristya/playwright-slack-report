import { Reporter, TestCase, TestResult } from "@playwright/test/reporter";
import axios from 'axios'

interface CustomOptions {
  webhookUrl: string | null;
}

export class CustomReportSlack implements Reporter {
  private slackUrl: string | null;
  private passedTest: number = 0;
  private failedTest: number = 0;
  // private flakyTest: number = 0;

  constructor(options: CustomOptions = {
    webhookUrl: null
  }) {
    this.slackUrl = options.webhookUrl ?? null
  }

  async onBegin() {
    if (!this.slackUrl) {
      console.log("Report will not sent to the Slack due to invalid webhook URL")
    }
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    const testMaxRetry = test.retries;
    if ((testMaxRetry > 0 && result.retry == testMaxRetry) || (testMaxRetry == 0)) {
      if (result.status == 'passed') {
        this.passedTest += 1
      } else {
        this.failedTest += 1
      }
    }
  }

  async onEnd() {
    await this.sendReportToSlack();
  }

  async sendReportToSlack() {
    const bodyBlocks = {
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "Testing Result",
            "emoji": true
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "plain_text",
              "text": ":white_check_mark: 3 passed",
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": ":bangbang: 2 flaky",
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": ":x: 1 failed",
              "emoji": true
            }
          ]
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "Build number #1"
          },
          "accessory": {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Report",
              "emoji": true
            },
            "value": "go_to_report",
            "url": "https://google.com",
            "action_id": "button-action"
          }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "This is a section block with a button."
          },
          "accessory": {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Job Build",
              "emoji": true
            },
            "value": "go_to_build",
            "url": "https://google.com",
            "action_id": "button-action"
          }
        },
        {
          "type": "context",
          "elements": [
            {
              "type": "plain_text",
              "text": "Run by: user",
              "emoji": false
            }
          ]
        }
      ]
    }

    if (this.slackUrl) {
      try {
        await axios.post(this.slackUrl, bodyBlocks)
        console.log('Success to send report')
        return;
      } catch (error: any) {
        console.log(`Failed to send report. Error: ${error.message}`)
      }
    }
  }
}