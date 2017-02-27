//This is my first chat bot built with Microsoft bot framework and Luis.Ai, it is used in conjuction with the Microsoft bot-framework chat emulator

var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/0af4e97f-9d66-42c8-993f-43143831e34a?subscription-key=c05bd5d363b54a3cafbc5bf2e66abb80&verbose=true');
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
//=========================================================
// Bots Dialogs
//=========================================================

//Greet client if not yet greeted already
function greet(session){
    session.send('DISCLAIMER: I AM NOT A REAL DOCTOR, This application is not intended to be a substitute for professional medical advice, diagnosis or treatment. Always seek the advice of your physician or other qualified health care provider with any questions you may have regarding a medical condition or treatment.');
    session.send('Hello I am Dr LUIS, I am an intelligent AI that can help diagnose any ailments you may have. Simply tell me about any symptoms you are experiencing and I will do my best to assist you.');
    session.userData.greeted = true;
}

// Set entities into userData by symptom and location
function setEntities(session, args){
    console.log(args);
    if(args){
        for(var i = 0 ; i < args.entities.length; i++){
            if(args.entities[i].type == 'location'){
                session.userData.location = args.entities[i].entity;
            }
            if(args.entities[i].type == 'symptoms'){
                session.userData.symptom = args.entities[i].entity;
            }
        }
    }
}

//Text response if location entity was set but no symptom was recognized
function locationText(session){
    builder.Prompts.text(session, 'I see you are experiencing problems with your %s, can you tell me what symptom you are experiencing?', session.userData.location);
    console.log(results.response);
}

//Text response repeating symptom and location, link to outside resource
function symptomText(session){
    session.send('If you are experiencing '+ session.userData.symptom +' in your '+ session.userData.location +' please click the following link for more information: http://www.webmd.com/search/2/results?query=' + session.userData.symptom + '%20' + session.userData.location);
    session.userData.location = null;
    session.userData.symptom = null;
    
}

function errorText(session){
    session.send('Sorry I dont understand your request, please rephrase your issue');
}
bot.dialog('/', intents);

intents.matches('head',[
    function(session, args){
        if(!session.userData.greeted){
            greet(session);
        }
        setEntities(session, args);
        if(!session.userData.location){
            session.beginDialog('/location');
        }
        if(!session.userData.symptom){
            session.beginDialog('/symptom');
        }
    },
    function(session, args){
            symptomText(session);
    }
]);

intents.matches('torso',[
    function(session, args){
        if(!session.userData.greeted){
            greet(session);
        }
        console.log(args);
        setEntities(args);
        if(!session.userData.location){
            session.beginDialog('/location');
        }
        if(!session.userData.symptom){
            session.beginDialog('/symptom');
        }
    },
    function(session, args){
        symptomText(session);
    }
]);

intents.matches('arm',[
    function(session, args){
        if(!session.userData.greeted){
            greet(session);
        }
        setEntities(args);
        if(!session.userData.location){
            session.beginDialog('/location');
        }
        if(!session.userData.symptom){
            session.beginDialog('/symptom');
        }
    },
    function(session, args){
        symptomText(session);
    }
]);

intents.matches('leg',[
    function(session, args){
        if(!session.userData.greeted){
            greet(session);
        }
        setEntities(args);
        if(!session.userData.location){
            session.beginDialog('/location');
        }
        if(!session.userData.symptom){
            session.beginDialog('/symptom');
        }
    },
    function(session, args){
        symptomText(session);
    }
]);


intents.matches('None', function(session, args){
    if(!session.userData.greeted){
        greet(session);
    }  
    session.send('Sorry I did not understand your request');
})

intents.matches('greeting', function(session, args){
    if(!session.userData.greeted){
        greet(session);
    }  
    session.send('Greetings, What issues are you having?');
})

bot.dialog('/symptom', [
    function (session) {
        builder.Prompts.text(session, 'I see you are experiencing problems with your ' + session.userData.location + ', can you tell me what symptom you are experiencing?');
    },
    function (session, results) {
        session.userData.symptom = results.response;
        session.endDialog();
    }
])
bot.dialog('/location', [
    function (session) {
        builder.Prompts.text(session, 'I cant understand your phrase, can you tell me where you are experiencing your symptom?');
    },
    function (session, results) {
        session.userData.location = results.response;
        session.beginDialog('/symptom');
    }
])

