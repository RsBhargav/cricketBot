// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// index.js is used to setup and configure your bot
var logger = require('./dialogs/logger.js').getLogger('index');
const constant = require('./dialogs/const');
// Import required packages
const path = require('path');
const restify = require('restify');
// Import required services for bot telemetry
const {
    ApplicationInsightsTelemetryClient,
    TelemetryInitializerMiddleware
} = require('botbuilder-applicationinsights');
const {
    TelemetryLoggerMiddleware
} = require('botbuilder-core');

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const {
    BotFrameworkAdapter,
    ConversationState,
    InputHints,
    MemoryStorage,
    NullTelemetryClient,
    UserState
} = require('botbuilder');
const {
    LuisRecognizerEN
} = require('./dialogs/luisRecognizerEN');

const {
    DialogAndWelcomeBot
} = require('./bots/dialogAndWelcomeBot');
const {
    MainDialog
} = require('./dialogs/mainDialog'); // This bot's main dialog.

// Note: Ensure you have a .env file and include LuisAppId, LuisAPIKey and LuisAPIHostName.
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({
    path: ENV_FILE
});

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    // logger.fatal(`[onTurnError] unhandled error / API limit reached : ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );
    logger.trace('onTurnErrorMessage - send msg to user as to proceed further...');
    // Send a message to the user
    // let onTurnErrorMessage = 'The bot encountered an error or bug.';
    // await context.sendActivity(onTurnErrorMessage, onTurnErrorMessage, InputHints.ExpectingInput);
    // onTurnErrorMessage = 'To continue to run this bot, please fix the bot source code.';
    // if (userLang == constant.langHI) {
    //     await context.sendActivity(constant.resHI); 
    // } else {
        await context.sendActivity(constant.resEN);
    // }
    // // Clear out state
    // await conversationState.delete(context);
};

// Add telemetry middleware to the adapter middleware pipeline
var telemetryClient = getTelemetryClient(process.env.InstrumentationKey);
var telemetryLoggerMiddleware = new TelemetryLoggerMiddleware(telemetryClient, true);
var initializerMiddleware = new TelemetryInitializerMiddleware(telemetryLoggerMiddleware, true);
adapter.use(initializerMiddleware);

// Set the onTurnError for the singleton BotFrameworkAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Define state store for your bot.
// See https://aka.ms/about-bot-state to learn more about bot state.
const memoryStorage = new MemoryStorage();

// Create conversation and user state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// If configured, pass in the LuisRecognizerEN.  (Defining it externally allows it to be mocked for tests)
const {
    LuisAppId,
    LuisAPIKey,
    LuisAPIHostName
} = process.env;
const luisConfig = {
    applicationId: LuisAppId,
    endpointKey: LuisAPIKey,
    endpoint: `https://${ LuisAPIHostName }`
};

const luisRecognizer = new LuisRecognizerEN(luisConfig);

// Create the main dialog.
const dialog = new MainDialog(luisRecognizer);
dialog.telemetryClient = telemetryClient;

const bot = new DialogAndWelcomeBot(conversationState, userState, dialog);
// const bot = new StateManagementBot(conversationState, userState, dialog);



// Create HTTP server
const server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {
    logger.info('Server running on port %d', process.env.port || process.env.PORT || 3978);
    logger.info(`${ server.name } listening to ${ server.url }`);
});

// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req, res) => {
    logger.debug('inside server.post');
    // Route received a request to adapter for processing
    adapter.processActivity(req, res, async (turnContext) => {
        // route to bot activity handler.
        await bot.run(turnContext);
    });
});

// Creates a new TelemetryClient based on a instrumentation key
function getTelemetryClient(instrumentationKey) {
    if (instrumentationKey) {
        return new ApplicationInsightsTelemetryClient(instrumentationKey);
    }
    return new NullTelemetryClient();
}

// Listen for Upgrade requests for Streaming.
server.on('upgrade', (req, socket, head) => {
    // Create an adapter scoped to this WebSocket connection to allow storing session data.
    const streamingAdapter = new BotFrameworkAdapter({
        appId: process.env.MicrosoftAppId,
        appPassword: process.env.MicrosoftAppPassword
    });
    // Set onTurnError for the BotFrameworkAdapter created for each connection.
    streamingAdapter.onTurnError = onTurnErrorHandler;
    logger.info(this.onTurnError,'Error',onTurnErrorHandler);

    streamingAdapter.useWebSocket(req, socket, head, async (context) => {
        // After connecting via WebSocket, run this logic for every request sent over
        // the WebSocket connection.
        await bot.run(context);
    });
});