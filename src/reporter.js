"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomReportSlack = void 0;
var axios_1 = require("axios");
var CustomReportSlack = /** @class */ (function () {
    function CustomReportSlack(options) {
        if (options === void 0) { options = {
            projectName: '',
            webhookUrl: null,
            buildUrl: null,
            buildNumber: '0',
            triggerBy: null
        }; }
        var _a, _b, _c, _d;
        this.passedTest = 0;
        this.failedTest = 0;
        this.flakyTest = 0;
        this.testDuration = '0';
        this.slackUrl = (_a = options.webhookUrl) !== null && _a !== void 0 ? _a : null;
        this.projectName = options.projectName;
        this.buildUrl = (_b = options.buildUrl) !== null && _b !== void 0 ? _b : null;
        this.triggerBy = (_c = options.triggerBy) !== null && _c !== void 0 ? _c : null;
        this.buildNumber = (_d = options.buildNumber) !== null && _d !== void 0 ? _d : '0';
    }
    CustomReportSlack.prototype.onBegin = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.slackUrl) {
                    console.log("Report will not sent to the Slack due to invalid webhook URL");
                }
                return [2 /*return*/];
            });
        });
    };
    CustomReportSlack.prototype.onTestEnd = function (test, result) {
        return __awaiter(this, void 0, void 0, function () {
            var testMaxRetry;
            return __generator(this, function (_a) {
                testMaxRetry = test.retries;
                if (testMaxRetry == 0 || (testMaxRetry > 0 && result.retry == 0 && result.status == 'passed')) {
                    console.log("".concat(test.title, " - ").concat(result.status));
                    if (result.status == 'passed') {
                        this.passedTest += 1;
                    }
                    else {
                        this.failedTest += 1;
                    }
                }
                else if (testMaxRetry > 0 && result.retry > 0 && result.status == 'passed') {
                    console.log("".concat(test.title, " - ").concat(result.status));
                    this.flakyTest += 1;
                }
                else if (testMaxRetry > 0 && result.retry == testMaxRetry && result.status == 'failed') {
                    console.log("".concat(test.title, " - ").concat(result.status));
                    this.failedTest += 1;
                }
                return [2 /*return*/];
            });
        });
    };
    CustomReportSlack.prototype.onEnd = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            var durationInSec, durationInMins;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        durationInSec = Number((result.duration * 0.001).toFixed(2));
                        durationInMins = "".concat(Math.floor(durationInSec / 60).toFixed(0), "m ").concat((durationInSec % 60).toFixed(2), "s");
                        this.testDuration = durationInMins;
                        return [4 /*yield*/, this.sendReportToSlack()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CustomReportSlack.prototype.sendReportToSlack = function () {
        return __awaiter(this, void 0, void 0, function () {
            var testBuildUrl, userWhoTrigger, bodyBlocks, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        testBuildUrl = {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "Build number #".concat(this.buildNumber)
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
                        userWhoTrigger = {
                            "type": "context",
                            "elements": [
                                {
                                    "type": "plain_text",
                                    "text": "Run by: ".concat(this.triggerBy),
                                    "emoji": false
                                }
                            ]
                        };
                        bodyBlocks = {
                            "blocks": [
                                {
                                    "type": "header",
                                    "text": {
                                        "type": "plain_text",
                                        "text": "".concat(this.projectName, " Testing Result"),
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
                                            "text": ":white_check_mark: ".concat(this.passedTest, " passed"),
                                            "emoji": true
                                        },
                                        {
                                            "type": "plain_text",
                                            "text": ":bangbang: ".concat(this.flakyTest, " flaky"),
                                            "emoji": true
                                        },
                                        {
                                            "type": "plain_text",
                                            "text": ":x: ".concat(this.failedTest, " failed"),
                                            "emoji": true
                                        }
                                    ]
                                },
                                {
                                    "type": "context",
                                    "elements": [
                                        {
                                            "type": "plain_text",
                                            "text": ":clock1: ".concat(this.testDuration),
                                            "emoji": true
                                        }
                                    ]
                                }
                            ]
                        };
                        if (this.buildUrl)
                            bodyBlocks['blocks'].push(testBuildUrl);
                        if (this.triggerBy)
                            bodyBlocks['blocks'].push(userWhoTrigger);
                        if (!this.slackUrl) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.post(this.slackUrl, bodyBlocks)];
                    case 2:
                        _a.sent();
                        console.log('Success to send report');
                        return [2 /*return*/];
                    case 3:
                        error_1 = _a.sent();
                        console.log("Failed to send report. Error: ".concat(error_1.message));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return CustomReportSlack;
}());
exports.CustomReportSlack = CustomReportSlack;
