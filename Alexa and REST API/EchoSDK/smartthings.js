
var AUTH = "Bearer e11809fb-153e-4181-9e56-ac6e5a7b1a04"  // change to use your oauth bearer UUID
var SMARTAPP = "https://graph-na02-useast1.api.smartthings.com:443/api/smartapps/installations/73e0d970-d5ce-498f-8942-5e75b996094c" // change to use your oauth endpoint

var request = require('request');
var welcomeText = "Please ask for help if you're not sure what to say.";
var repromptText = "What else can I do for you?";


exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and replace application.id with yours
         * to prevent other voice applications from using this function.
         */
        
        //if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.ENDPOINTUUID") {
        //    context.fail("Invalid Application ID");
        //}
        

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                        context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        }  else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                         context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);

            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
                + ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the app without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
                + ", sessionId=" + session.sessionId);
    getWelcomeResponse(callback);
}

/** 
 * Called when the user specifies an intent for this application.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
                + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

	switch (intentName) {
        case "GetHelp":
            getHelp(intent, session, callback);
            break;
        case "GetLightNames":
            getLightNames(intent, session, callback);
            break;
        case "ControlLight":
            controlLight(intent, session, callback);
            break;
        case "AllDone":
            sayGoodbye(intent, session, callback);
            break;
		case "SetModeIntent":
        	setMode(intent, session, callback);
			break;
		case "WhatsMyModeIntent":
	        getMode(intent, session, callback);
			break;
		case "DoPhraseIntent":
        	doPhrase(intent, session, callback);
			break;
		case "ListPhrasesAndModes":
	        listPhrasesAndModes(intent, session, callback);
			break;
		case "StatusIntent":
	        getStatus(intent, session, callback);
	        break;
	    case "GetLightsStatus":
	        getLightsOn(intent, session, callback);
	        break;
	    case "GetTemperatureIntent":
	        getTemperatureIntent(intent, session, callback);
	        break;
	    case "GetHumidityIntent":
	        getHumidityIntent(intent, session, callback);
	        break;
	    case "GetThermostatModeIntent":
	        getThermostatModeIntent(intent, session, callback);
	        break;
	    case "SetThermostatModeIntent":
	        setThermostatModeIntent(intent, session, callback);
	        break;
	    case "SetAirOnIntent":
	        setAirIntent(intent, session, callback ,"cool");
	        break;
	    case "SetHeatOnIntent":
	        setAirIntent(intent, session, callback, "heat");
	        break;
	    case "SetAirOffIntent":
	        setAirIntent(intent, session, callback, "off");
	        break;
	    case "GetDoorStatus":
	        getDoorStatus(intent, session, callback);
	        break;

		default:	
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the app returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
                + ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

/**
 * Helpers that build all of the responses.
 */
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    console.log("In speechlet response");
    return {
        
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    }
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    }
}

function sayGoodbye(intent, session, callback) {
    var cardTitle = "Bye Bye Smart Home";
    //var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "Ok, goodbye!";
    
    callback(sessionAttributes, 
                 buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}


// make GET calls into WebAPI
function GetViaSmartThingsREST(endpoint, cb) {
		request({"headers": {"Content-Type": "application/json", "Authorization": AUTH},
                 "uri": SMARTAPP + "/" + endpoint, method: "GET", followRedirect:true }, cb);
}

// make PUT calls into WebAPI
function PutViaSmartThingsREST(endpoint, bodyStr, cb) {
  		request({"headers": {"Content-Type": "application/json", "Authorization": AUTH},
                 "uri": SMARTAPP + "/" + endpoint, method: "PUT", body: bodyStr, followRedirect:true}, cb);
}


function getThermostatModeIntent(intent, session, callback)
{
    var cardTitle = "Get Smart Home Thermostat Mode";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";

    console.log("In getThermostatModeIntent");
    GetViaSmartThingsREST("thermostatMode", function (err, res, body) {
        try {
            console.log("In getThermostatModeIntent 2");
            var jdetails = JSON.parse(body);
            console.log(jdetails);

            var d = jdetails[0];           
        }
        catch (e) {
            console.log(e);
            console.log(body);
        }
        speechOutput = "The thermostat is set to " + d.value + ".";

        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

    });
    

}
// get the current mode from ST
function getMode(intent, session, callback) {
    var cardTitle = "Get Smart Home Mode";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    GetViaSmartThingsREST("mode", function (err, res, body) {
        // console.log("SUCCESS: ", err);
        var mode = "unknown"
        try {
            var jmodes = JSON.parse(body);
            mode = jmodes.mode;
    			} catch (e) {
            console.log(e);
            console.log(body);
                }
            
        speechOutput = "The house is in " + mode + " mode right now.";
            
        callback(sessionAttributes, 
                buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            
    });
}

// get list of phrases from ST
function listPhrasesAndModes(intent, session, callback) {
    var cardTitle = "Get All Smart Home Modes and Phrases";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";


        GetViaSmartThingsREST("mode", function (err, res, body) {
            var modes = []
            var phrases = []
            var modesString = null;
            var phraseString = null;
            try {
                var jmodes = JSON.parse(body);
                modes = jmodes.modes;
                modes.sort();
                phrases = jmodes.phrases;
                phrases.sort();
    			 } catch (e) {
                console.log(e);
                console.log(body);
                 }
                 
            for (var i = 0; i < modes.length; i++) {
                if (modesString != null) modesString += ", " + modes[i];
                            else modesString = modes[i];
            }
            for (i = 0; i < phrases.length; i++) {
                if (phraseString != null) phraseString += ", " + phrases[i];
                            else phraseString = phrases[i];
            }
            
            speechOutput = "The possible modes are: " + fixlist(modesString, modes.length) + ". The possible phrases are:"+ fixlist(phraseString, phrases.length)+ ".";
            
            callback(sessionAttributes, 
                 buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            
        });
}

// get list of light names from ST
function getLightNames(intent, session, callback) {
    var cardTitle = "Get All Smart Home Lights";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    console.log("In Here");

    GetViaSmartThingsREST("switches", function (err, res, body) {
            console.log("In Here 2");
            var lightsString = null;
            var devices = [];
        try {
            console.log("In Here 3");
                var jbody = JSON.parse(body);
                devices = jbody;
                console.log(jbody);
                devices.sort();
                console.log(devices);
    			 } catch (e) {
                console.log(e);
                console.log(body);
                 }
            var lightcnt = 0;     
            for (var i = 0; i < devices.length; i++) {
               
                    lightcnt++;
                    var name = devices[i].name;
                    console.log(name);
                    if (lightsString != null) lightsString += ", " + name;
                            else lightsString = name;
                
            }
            
            speechOutput = "The light names are: " + fixlist(lightsString, lightcnt) + ".";
            
            callback(sessionAttributes, 
                 buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            
        });
}

// set the mode to the closest matching mode 
function controlLight(intent, session, callback) {
    var cardTitle = "Control Smart Home Light";
    var lightSlot = intent.slots.LightName;
    var onSlot = intent.slots.LightOn;
    var dimSlot = intent.slots.Dimmer;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    
    speechOutput = "I heard: " + lightSlot.value + ", " + onSlot.value + ", " + dimSlot.value + ".";
    callback(sessionAttributes, 
                 buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

// get help
// execute Smart Home Phrase
function getHelp(intent, session, callback) {
    var cardTitle = "Execute Smart Home Help";
    var phraseSlot = intent.slots.MoreHelp;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    

    var phraseval = null;
    if (phraseSlot) 
        phraseval = phraseSlot.value;
    if (phraseval) {
        speechOutput = "I can help you with " + phraseval + "."
    } else {
        speechOutput = "you can say tell smart home to, or ask smart home to. . \
        I know how do to lots of things, ask for detailed help by saying, help with lights, \
        help with doors, help with locks, help with phrases, or help with status."
    }
    callback(sessionAttributes, 
                 buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
} 

// set the mode to the closest matching mode 
function setMode(intent, session, callback) {
    var cardTitle = "Set Smart Home Mode";
    var modeSlot = intent.slots.Mode;
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";
    
    var modeval = null;
    if (modeSlot) {
        modeval = modeSlot.value;
       
        PutViaSmartThingsREST("mode", JSON.stringify({mode: modeval},
                               undefined, 0), function (err, res, body) {
            speechOutput = "I set the house to " + modeval + " mode.";
            callback(sessionAttributes, 
                 buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        });
        
    } else {
        speechOutput = "I'm not sure what mode you want, please try again";
            callback(sessionAttributes, 
                 buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
}

// set the mode to the closest matching mode 
function setAirIntent(intent, session, callback, mode) {
    var cardTitle = "Set Air Mode";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";
    console.log("In setAirOnIntent");

    var modeval = mode;
    console.log("In modeslot")
    PutViaSmartThingsREST("thermostatMode", JSON.stringify({ mode: modeval },
                            undefined, 0), function (err, res, body) {
                                speechOutput = "I set the thermostat to " + modeval + " mode.";
                                callback(sessionAttributes,
                                    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
                            });


}
// set the mode to the closest matching mode 
function setThermostatModeIntent(intent, session, callback) {
    var cardTitle = "Set Thermostat Mode";
    var modeSlot = intent.slots.ThermostatMode;
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";
    console.log("In setThermostatMode");

    var modeval = null;
    if (modeSlot) {
        modeval = modeSlot.value;
        console.log("In modeslot")
        PutViaSmartThingsREST("thermostatMode", JSON.stringify({ mode: modeval },
                               undefined, 0), function (err, res, body) {
                                   speechOutput = "I set the thermostat to " + modeval + " mode.";
                                   callback(sessionAttributes,
                                        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
                               });

    } else {
        speechOutput = "I'm not sure what mode you want, please try again";
        callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
}

// execute Smart Home Phrase
function doPhrase(intent, session, callback) {
    var cardTitle = "Execute Smart Home Phrase";
    var phraseSlot = intent.slots.Phrase;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    

    var phraseval = null;
    if (phraseSlot) {
        phraseval = phraseSlot.value;
       
        PutViaSmartThingsREST("mode", JSON.stringify({phrase: phraseval},
                               undefined, 0), function (err, res, body) {
    	       speechOutput = "I executed the phrase " + phraseval + ".";
               callback(sessionAttributes, 
                 buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

        });       
    } else {
        speechOutput = "I'm not sure what mode you want, please try again";
            callback(sessionAttributes, 
                 buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
}

function getHumidityIntent(intent, session, callback) {
    var cardTitle = "Get Our Home Humdity";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";
    console.log("In getHumidityIntent");
    GetViaSmartThingsREST("humidity", function (err, res, body) {
        try {
            var jdetails = JSON.parse(body);
            console.log(jdetails);

            var d = jdetails[0];

            speechOutput = "The current humidity is " + d.value + " percent.";
        }
        catch (e) {
            console.log(e);
            console.log(body);
        }

        callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

    });
}

function getTemperatureIntent(intent, session, callback) {
    var cardTitle = "Get Our Home Temperature";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";
    console.log("In getTemperatureIntent");
    GetViaSmartThingsREST("temperature", function (err, res, body) {
        try {
            var jdetails = JSON.parse(body);
            console.log(jdetails);
            
            var d = jdetails[0];

            speechOutput = "The current temperature is " + d.value + " degrees";
        }
        catch (e) {
            console.log(e);
            console.log(body);
        }

        callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

    });
}

// get list of light names from ST
function getLightsOn (intent, session, callback) {
    var cardTitle = "Get All Smart Home Lights";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";
    var divewaylightsString = "";
    console.log("In Here");

    GetViaSmartThingsREST("switches", function (err, res, body) {
        var lights = 0;
        var lightsOn = 0;
        var lightsString = null;
        var drivewayLights = false;

        console.log("In GetViaSmartThingsREST");

        try {
            var jdetails = JSON.parse(body);
            console.log(jdetails);
            var devices = jdetails;
            for (var i = 0 ; i < devices.length; i++) {
                var d = devices[i];

                switch (d.name) {

                    case "Kitchen Lights":
                    case "Overhead Lights":
                    case "Fireplace Lights":
                        console.log("In switch");
                        lights++;
                        if (d.value == "on") {
                            lightsOn++;
                            if (lightsString != null) lightsString += ", " + d.name;
                            else lightsString = d.name;
                        }
                        break;
                    case "Driveway Lights":
                        console.log("Driveway Lights");
                        if (d.value == "on") {
                            drivewayLights = true;
                        }
                }

                console.log(lights);
                console.log(lightsOn);
                
            }
            if (lights > 0) {
                if (lightsOn > 0) {
                    if (lights == lightsOn) {
                        speechOutput += "All lights are on ";
                        if (drivewayLights) {
                            speechOutput += ", including the Driveway Lights."
                        }
                        else {
                            speechOutput += ".";
                        }
                    }
                    else {
                        speechOutput += "The " + fixlist(lightsString, lightsOn) + ((lightsOn > 1) ? " are" : " is") + " On. ";
                        if (drivewayLights)
                            speechOutput += "The Driveway Lights are also on.";
                    }
                }
                else {
                    speechOutput += "All lights are off ";
                    if (drivewayLights)
                        speechOutput += ", except the driveway lights, which are on."
                    else
                        speechOutput += ".";
                }
            }

        }
        catch (e) {
            console.log(e);
            console.log(body);
        }
        
        callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        
    });

}
function getDoorStatus(intent, session, callback) {

    var cardTitle = "Get Door Status";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    GetViaSmartThingsREST("doors", function (err, res, body) {
        var doors = 0;
        var doorsOpen = 0;
        var doorString = null;
        console.log("In GetViaSmartThingsREST");

        try{
            var jdetails = JSON.parse(body);
            var devices = jdetails;
            for (var i = 0 ; i < devices.length; i++) {
                var d = devices[i];
                console.log(d);
                switch (d.name) {

                    case "Back Door":
                    case "Front Door":
                    case "Door To Garage":
                    case "Bedroom Door":
                        doors++;
                        if (d.value == "open") {
                            doorsOpen++;
                            if (doorString != null) doorString += ", " + d.name;
                            else doorString = d.name;
                        }
                        break;
                }
            }
            if (doors > 0) 
            { 
                if (doorsOpen > 0) 
                {
                    if (doors == doorsOpen) 
                    {
                        speechOutput += "All doors are open. ";
                    }
                    else 
                        speechOutput += "The " + fixlist(doorString, doorsOpen) + ((doorsOpen > 1) ? " are" : " is") + " Open. ";
                } 
                else speechOutput += "All doors are closed. ";
            }
        }
        
        catch (e) {
            console.log(e);
            console.log(body);
        }
        callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

    });
}
/*
function getLightsStatus(intent, session, callback) {

    var cardTitle = "Get Lights Status";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "moo";

    GetViaSmartThingsREST("switches", function (err, res, body) {
        var lights = 0;
        var lightsOn = 0;
        var lightsString = null;
        console.log("In GetViaSmartThingsREST");

        try{
            var jdetails = JSON.parse(body);
            var devices = jdetails;
            for(var i = 0 ; i < devices.length; i++)
            {
                var d = devices[i];

                switch(d.name)
                {

                    case "Kitchen Lights":
                    case "Overhead Lights":
                    case "Fireplace Lights":
                        lights++;
                        if(d.value == "on")
                        {
                            lightsOn++;
                            if (lightsString != null) lightsString += ", " + d.name;
                            else lightsS = d.name;
                        }
                        break;
                }

                if (lights > 0) 
                { 
                    if (lightsOn > 0) 
                    {
                        if (lights == lightsOn) 
                        {
                            speechOutput += "All lights are on. ";
                        }
                        else 
                            speechOutput += "The " + fixlist(lightsString, lightsOn) + ((lightsOn > 1) ? " are" : " is")+ " On. ";
                    } 
                    else speechOutput += "All lights are off. ";
                }
            }
        }
        catch (e) {
            console.log(e);
            console.log(body);
        }
        callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

    });
}
*/    

// get the full blown status!
function getStatus(intent, session, callback) {
    var cardTitle = "Get Smart Home Status";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    GetViaSmartThingsREST("status", function (err, res, body) {
        console.log("In moo");
            var mode = "unknown"
            var doors = 0;
            var unlockedDoors = 0;
            var contacts = 0;
            var opencontacts = 0;
            var motion = 0;
            var moving = 0;
            var lights = 0
            var onlights = 0;
            var garage = 0;
            var opengarage = 0;
            var thermostats = 0;
            var heating = 0;
            var doorlockString = null;
            var contactOpenString = null;
            var motionString = null;
            var heatingString = null;
            var garageString = null;
            var mode = "unknown";
            var tempcount = 0;
            var temp = 0;
            var tempString = null;
            var humidityString = null;
            var thermostatModeString = null;
            var coolingSetpointString = null;
            
            console.log(body);
        try {
            console.log("In moo 2");
                var jdetails = JSON.parse(body);
                //mode = jdetails.mode;
                var devices = jdetails;
                for (var i = 0; i < devices.length; i++) {
                    var d = devices[i];

                    switch (d.name) {
                        case "Temperature":
                            tempString = d.value;
                            break;
                        case "humidity":
                            humidityString = d.value;
                            break;
                        case "coolingSetpoint":
                            coolingSetpointString = d.value;
                            break;
                        case "Kitchen Lights":
                        case "Overhead Lights":
                        case "Fireplace Lights":
                            lights++;
                            if (d.value == "on") onlights++;
                            break;
                        case "Z-Wave Lock":
                        doors++;
                        if (d.state.lock != "locked") {
                            unlockedDoors++;
                            if (doorlockString != null) doorlockString += ", " + d.label;
                            else doorlockString = d.label;
                        }
                        break;
                        case "Front Door":
                        case "Back Door":
                        case "Door to Garage":
                        case "Bedroom Door":
                        {
                            contacts++;
                            if (d.value != "closed") {
                                opencontacts++;
                                if (contactOpenString != null) contactOpenString += ", " + d.name;
                                else contactOpenString = d.name;
                            }
                            break;
                        }
                        case  "Z-Wave Motion Sensor":
                        case  "Back Deck Stairs":
                        case "SmartSense Motion/Temp Sensor":
                        motion++
                        if (d.state.motion != "inactive") {
                            moving++
                            if (motionString != null) motionString += ", " + d.label;
                            else motionString = d.label;
                        }
                        break;
                        case "Z-Wave Garage Door Opener":
                        garage++;
                        if (d.state.door != "closed") {
                            opengarage++;
                            if (garageString != null) garageString += ", " + d.label;
                            else garageString = d.label;
                        }

                        break;
                        case "thermostatMode":
                            thermostatModeString = d.value;                        
                        break;
                    }
                    
                }
    			 } catch (e) {
                console.log(e);
                console.log(body);
                 }
                 
            
                speechOutput = "Here's what's happening in the house right now: The average temperature inside is " + tempString + ", and the humidity is "+ humidityString + " percent. ";
                speechOutput += "The thermostat mode is set to " + thermostatModeString + ", with a setpoint of " + coolingSetpointString + ". ";
            
            if (doors > 0) { 
                if (unlockedDoors > 0) {
                    if (doors == unlockedDoors) speechOutput += "All doors are unlocked. "
                    else speechOutput += "The " + fixlist(doorlockString, unlockedDoors) + ((unlockedDoors > 1) ? " are" : " is")+ " unlocked. ";
                } else speechOutput += "All doors are locked. "
            }
            
            if (contacts > 0) { 
                if (opencontacts > 0) {
                    if (contacts == opencontacts) speechOutput += "All doors and windows are open. "
                    else speechOutput += "The " +fixlist(contactOpenString, opencontacts) + ((opencontacts > 1) ? " are" : " is") + " open. ";
                } else speechOutput += "All doors and windows are closed. "
            }

            if (motion > 0) { 
                if (moving > 0) {
                    if (motion == moving) speechOutput += "All sensors seeing motion. "
                    else speechOutput += fixlist(motionString, moving)  +((moving > 1)? " are" : " is") + " detecting motion. ";
                } else speechOutput += "No motion is detected anywhere. "
            }
            
            if (lights > 0) { 
                if (onlights > 0) {
                    if (lights == onlights) speechOutput += "All lights are on. "
                    else speechOutput += onlights + " light" +((moving > 1)? "s are" : " is") +" on. ";
                } else speechOutput += "All lights are off. "
            }

            if (thermostats > 0) { 
                if (heating > 0) {
                    if (thermostats == heating) speechOutput += "All furnaces are on. "
                    else speechOutput += fixlist(heatingString, heating) + " "+ ((heating > 1) ? "are" : "is")+" on. ";
                } else speechOutput += "All furnaces are off. "
            }

            if (garage > 0) { 
                if (opengarage > 0) {
                    if (garage == opengarage) speechOutput += ((garage == 1 ) ? "The" : "All") + " garage door" +  ((garage == 1 ) ? " is" : "s are")  + " open. "
                    else speechOutput += fixlist(garageString, opengarage) + " is on. ";
                } else speechOutput +=  ((garage == 1 ) ? "The" : "All") + " garage door" +  ((garage == 1 ) ? " is" : "s are")  + " closed. "
            }

            callback(sessionAttributes, 
                 buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            
        });
}

// helper function, for making lists sound right
function fixlist(listString, count) {
        var find = ", ";
        var index = listString.lastIndexOf(", ");

        if (index >= 0) {
            return listString.substring(0, index) + ((count >1 ) ? ", and " : " and ") + listString.substring(index + ", ".length);
        }

        return listString;
 
}

/** 
 * Functions that control the app's behavior.
 */
function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Ready to control the house, " + welcomeText;
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = welcomeText;
    var shouldEndSession = false;

    callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

