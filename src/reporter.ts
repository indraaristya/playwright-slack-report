import { Reporter, TestCase, TestResult, FullResult } from "@playwright/test/reporter";
import axios from 'axios'

interface CustomOptions {
  projectName: string | "";
  webhookUrl: string | null;
  buildUrl: string | null;
  buildNumber: string | '0';
  triggerBy: string | null;
}

export class CustomReportSlack implements Reporter {
  private projectName: string | "";
  private slackUrl: string | null;
  private buildUrl: string | null;
  private buildNumber: string | '0';
  private triggerBy: string | null;

  private passedTest: number = 0;
  private failedTest: number = 0;
  private flakyTest: number = 0;
  private testDuration: string = '0';

  constructor(options: CustomOptions = {
    projectName: '',
    webhookUrl: null,
    buildUrl: null,
    buildNumber: '0',
    triggerBy: null
  }) {
    this.slackUrl = options.webhookUrl ?? null
    this.projectName = options.projectName
    this.buildUrl = options.buildUrl ?? null
    this.triggerBy = options.triggerBy ?? null
    this.buildNumber = options.buildNumber ?? '0'
  }

  async onBegin() {
    if (!this.slackUrl) {
      console.log("Report will not sent to the Slack due to invalid webhook URL")
    }
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    const testMaxRetry = test.retries;
    if (testMaxRetry == 0 || (testMaxRetry > 0 && result.retry == 0 && result.status == 'passed')) {
      console.log(`${test.title} - ${result.status}`)
      if (result.status == 'passed') {
        this.passedTest += 1
      } else {
        this.failedTest += 1
      }
    } else if (testMaxRetry > 0 && result.retry > 0 && result.status == 'passed') {
      console.log(`${test.title} - ${result.status}`)
      this.flakyTest += 1
    } else if (testMaxRetry > 0 && result.retry == testMaxRetry && result.status == 'failed') {
      console.log(`${test.title} - ${result.status}`)
      this.failedTest += 1
    }
  }

  async onEnd(result: FullResult) {
    const durationInSec = Number((result.duration * 0.001).toFixed(2))
    const durationInMins = `${Math.floor(durationInSec/60).toFixed(0)}m ${(durationInSec % 60).toFixed(2)}s`
    this.testDuration = durationInMins;
    await this.sendReportToSlack();
  }

  async sendReportToSlack() {
    const testBuildUrl = {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `Build number #${this.buildNumber}`
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Report",
          "emoji": true
        },
        "value": "go_to_report",
        "url": this.buildUrl,
        "action_id": "button-action"
      }
    };

    const userWhoTrigger = {
      "type": "context",
      "elements": [
        {
          "type": "plain_text",
          "text": `Run by: ${this.triggerBy}`,
          "emoji": false
        }
      ]
    }

    const bodyBlocks: any = {
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": `${this.projectName} Testing Result`,
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
              "text": `:white_check_mark: ${this.passedTest} passed`,
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": `:bangbang: ${this.flakyTest} flaky`,
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": `:x: ${this.failedTest} failed`,
              "emoji": true
            }
          ]
        },
        {
          "type": "context",
          "elements": [
            {
              "type": "plain_text",
              "text": `:clock1: ${this.testDuration}`,
              "emoji": true
            }
          ]
        }
      ]
    }

    if (this.buildUrl) bodyBlocks['blocks'].push(testBuildUrl);
    if (this.triggerBy) bodyBlocks['blocks'].push(userWhoTrigger);
    
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