// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
/*Author : Sai Bhargav */

const fs = require('fs');
const {
    MessageFactory,
    InputHints
} = require('botbuilder');
const {
    LuisRecognizer
} = require('botbuilder-ai');
const {
    ComponentDialog,
    DialogSet,
    DialogTurnStatus,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
const {
    APICall
} = require('./getIPLData');
const {
    QnAMaker
} = require('./qnaMaker');

const constant = require('./const');
const {
    ReadJSON
} = require("./readJSON")
var logger = require('./logger.js').getLogger('MainDialog');
// logger.debug("Collecting logs");
const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const uQuery = {};
class MainDialog extends ComponentDialog {
    constructor(luisRecognizer) {
        super('MainDialog');
        if (!luisRecognizer) throw new Error('[MainDialog]: Missing parameter \'luisRecognizer\' is required');
        this.luisRecognizer = luisRecognizer;

        // Define the main dialog and its related components.
        this.addDialog(new TextPrompt('TextPrompt')).addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.introStep.bind(this),
            this.actStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }
    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }
    /**
     * First step in the waterfall dialog. Prompts the user for a command.
     */
    async introStep(stepContext) {
        if (!this.luisRecognizer.isConfigured) {
            // const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            // await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            logger.FATAL(this.introStep, `LUIS is not configured`)
            return await stepContext.next();
        }
        const messageText = stepContext.options.restartMsg ? stepContext.options.restartMsg : constant.StartDialog;
        const promptMessage = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt('TextPrompt', {
            prompt: promptMessage
        });
    }
    /**
     * Second step in the waterfall.  This will use LUIS to attempt to extract the information.
     * Then, it hands off to the child dialog to collect any remaining details if needed.
     */
    async actStep(stepContext) {
        let Details = {};
        var sText = "";
        var luisResult;
        uQuery.text = stepContext.context._activity.text;
        logger.info(this.actStep, `User's Query (uQuery.text) : ${uQuery.text}`)

        //Assigning default as userlanguage(userLang) to uQuery : Default - English
        uQuery.userLang = constant.langEN;
        luisResult = await this.luisRecognizer.executeLuisQuery(stepContext.context);
        if (!this.luisRecognizer.isConfigured) {
            return await stepContext.beginDialog(Details);
        }
        var fresponse;
        console.log("going inside switch")
        // Call LUIS and gather any potential details. 
        switch (LuisRecognizer.topIntent(luisResult)) {

            case 'None':
                console.log("User Query: ", luisResult.luisResult['query'])
                fresponse = await QnAMaker.getAns(`${luisResult.luisResult['query']}`)
                console.log("bot response: ", fresponse)
                await stepContext.context.sendActivity(fresponse);
                break;
            case 'pom':
                if (Object.keys(luisResult.luisResult['prediction'].entities).length <= 1) {
                    console.log("POM: ", luisResult.luisResult['prediction'].entities)
                    await stepContext.context.sendActivity(`Please enter your query with team1 vs team2 and season`);
                } else if (luisResult.luisResult['prediction'].entities['teams'][0] && luisResult.luisResult['prediction'].entities['teams'][1] && luisResult.luisResult['prediction'].entities['datetimeV2'][0]['values'][0].timex) {
                    let userSeason = luisResult.luisResult['prediction'].entities['datetimeV2'][0]['values'][0].timex
                    let team1 = luisResult.luisResult['prediction'].entities['teams'][0]
                    let team2 = luisResult.luisResult['prediction'].entities['teams'][1]
                    let res = await ReadJSON.pomResponse(userSeason, team1, team2)
                    await stepContext.context.sendActivity(res);
                }
                console.log("here i am in POM")
                break;
            case 'tos':
                if (Object.keys(luisResult.luisResult['prediction'].entities).length <= 1) {
                    console.log("POM: ", luisResult.luisResult['prediction'].entities)
                    await stepContext.context.sendActivity(`Please enter your query with team1 vs team2 and season`);
                } else if (luisResult.luisResult['prediction'].entities['teams'][0] && luisResult.luisResult['prediction'].entities['teams'][1] && luisResult.luisResult['prediction'].entities['datetimeV2'][0]['values'][0].timex) {
                    let userSeason = luisResult.luisResult['prediction'].entities['datetimeV2'][0]['values'][0].timex
                    let team1 = luisResult.luisResult['prediction'].entities['teams'][0]
                    let team2 = luisResult.luisResult['prediction'].entities['teams'][1]
                    let res = await ReadJSON.tossResponse(userSeason, team1, team2)
                    await stepContext.context.sendActivity(res);
                }
                console.log("here i am in tos")
                break;
            case 'winner':
                if (Object.keys(luisResult.luisResult['prediction'].entities).length <= 1) {
                    console.log("POM: ", luisResult.luisResult['prediction'].entities)
                    await stepContext.context.sendActivity(`Please enter your query with team1 vs team2 and season`);
                } else if (luisResult.luisResult['prediction'].entities['teams'][0] && luisResult.luisResult['prediction'].entities['teams'][1] && luisResult.luisResult['prediction'].entities['datetimeV2'][0]['values'][0].timex) {
                    let userSeason = luisResult.luisResult['prediction'].entities['datetimeV2'][0]['values'][0].timex
                    let team1 = luisResult.luisResult['prediction'].entities['teams'][0]
                    let team2 = luisResult.luisResult['prediction'].entities['teams'][1]
                    let res = await ReadJSON.winnerResponse(userSeason, team1, team2)
                    await stepContext.context.sendActivity(res);
                }
                console.log("here i am in winner")
                break;
        }

        return await stepContext.next();
    }
    async finalStep(stepContext) {
        // Restart the main dialog with a different message the second time around

        return await stepContext.replaceDialog(this.initialDialogId, {
            restartMsg: constant.restartEN
        });

    }
}

module.exports.MainDialog = MainDialog;