/**
 *
 * touchline adapter
 *
 *
 *  file io-package.json comments:
 *
 *  {
 *      "common": {
 *          "name":         "touchline",                // name has to be set and has to be equal to adapters folder name and main file name excluding extension
 *          "version":      "0.0.0",                    // use "Semantic Versioning"! see http://semver.org/
 *          "title":        "Roth Touchline Adapter",// Adapter title shown in User Interfaces
 *          "authors":  [                               // Array of authord
 *              "name <fabian.siebold@gmail.com>"
 *          ]
 *          "desc":         "Roth Touchline adapter",   // Adapter description shown in User Interfaces. Can be a language object {de:"...",ru:"..."} or a string
 *          "platform":     "Javascript/Node.js",       // possible values "javascript", "javascript/Node.js" - more coming
 *          "mode":         "schedule",                   // possible values "daemon", "schedule", "subscribe"
 *          "materialize":  true,                       // support of admin3
 *          "schedule":     "0 0/5 * * *"                 // cron-style schedule. Only needed if mode=schedule
 *          "loglevel":     "info"                      // Adapters Log Level
 *      },
 *      "native": {                                     // the native object is available via adapter.config in your adapters code - use it for configuration
 *          "ipAddress": "0.0.0.0",
 *      }
 *  }
 *
 */

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';
var exec = require('child_process').exec;

// you have to require the utils module and call adapter function
const utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
const XMLHttpRequest =    require(__dirname + '/lib/XMLHttpRequest'); // Get common adapter utils

// you have to call the adapter function and pass a options object
// name has to be set and has to be equal to adapters folder name and main file name excluding extension
// adapter will be restarted automatically every time as the configuration changed, e.g system.adapter.touchline.0
const adapter = new utils.Adapter('touchline');

/*Variable declaration, since ES6 there are let to declare variables. Let has a more clearer definition where 
it is available then var.The variable is available inside a block and it's childs, but not outside. 
You can define the same variable name inside a child without produce a conflict with the variable of the parent block.*/
let pollingInterval;


let imageDataDevice		= 'data:image/png;base64,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';


let devAdress = [];

let devices = {
    '99': {
        "init":false,
		"type": 'device',
        "common": {
            valid: false,
            name: 'Touchline unten',
            icon: imageDataDevice
        },
		"native": {},
        "roomUnits": {
            '0': {
                "init":false,
				"type": 'device',
                "common": {
                    name: 'Wohnzimmer hinten',
                    role: 'device',
					icon: imageDataDevice
                },
				"native": {}
            },
            '1': {
                "init":false,
				"type": 'device',
                "common": {
                    name: 'Wohnzimmer vorne',
                    role: 'device',
					icon: imageDataDevice
                },
				"native": {}
            },
            '2': {
                "init":false,
				"type": 'device',
                "common": {
                    name: 'Diele',
                    role: 'device',
					icon: imageDataDevice
                },
				"native": {}
            },
            '3': {
                "init":false,
				"type": 'device',
                "common": {
                    name: 'Küche',
                    role: 'device',
					icon: imageDataDevice
                },
				"native": {}
            },
            '4': {
                "init":false,
				"type": 'device',
                "common": {
                    name: 'Hausarbeitsraum',
                    role: 'device',
					icon: imageDataDevice
                },
				"native": {}
            },
            '5': {
                "init":false,
				"type": 'device',
                "common": {
                    name: 'Esszimmer',
                    role: 'device',
					icon: imageDataDevice
                },
				"native": {}
            }
        }
    },
    
    '60': {
        "init":false,
		"type": 'device',
        "common": {
            name: 'Touchline oben',
			icon: imageDataDevice
        },
		"native": {},
        "roomUnits": {
            '6': {
                "init":false,
				"type": 'device',
                "common": {
                    name: 'Bad',
                    role: 'device',
					icon: imageDataDevice
                },
				"native": {}
            },
            '7': {
                "init":false,
				"type": 'device',
                "common": {
                    name: 'Nico & Felix',
                    role: 'device',
					icon: imageDataDevice
                },
				"native": {}
            },
            '8': {
                "init":false,
				"type": 'device',
                "common": {
                    name: 'Schlafzimmer',
                    role: 'device',
					icon: imageDataDevice
                },
				"native": {}
            },
            '9': {
                "init":false,
				"type": 'device',
                "common": {
                    name: 'Mia',
                    role: 'device',
					icon: imageDataDevice
                },
				"native": {}
            }
        }
    }
};

 let deviceProperty = {
    "RaumTemp": {
//        "init":false,
		"type": 'state',
        "common": {
            name: 'Temperatur',
            type: 'number',
            unit: '°C',
            role: 'value',
            read: true,
            write: false,
            custom: {
              'history.0': {
                enabled: true,
                changesOnly: true,
                debounce: "1000",
                maxLength: "250",
                retention: "31536000",
                changesRelogInterval: 0,
                changesMinDelta: 0,
                aliasId: ""
              }
            }
        },
        "native": {}
    },
    "SollTemp": {
//        "init":21,
		"type": 'state',
        "common": {
            name: 'Solltemperatur',
            type: 'number',
            unit: '°C',
            role: 'value',
            read: true,
            write: true,
            min: 5,
            max: 30,
            custom: {
              'history.0': {
                enabled: true,
                changesOnly: true,
                debounce: "1000",
                maxLength: "250",
                retention: "31536000",
                changesRelogInterval: 0,
                changesMinDelta: 0,
                aliasId: ""
              }
            }
        },
        "native": {
			test1 : 0,
			test2 : 1,
			test3 : 2
		}
    },
    "OPMode": {
//        "init":0,
		"type": 'state',
        "common": {
            name: 'Mode',
            type: 'string',
            unit: '',
            role: 'value',
            read: true,
            write: true,
            states: '0:Tag;1:Nacht;2:Aus',
            min: 0,
            max: 3,
            custom: {
              'history.0': {
                enabled: true,
                changesOnly: true,
                debounce: "1000",
                maxLength: "250",
                retention: "31536000",
                changesRelogInterval: 0,
                changesMinDelta: 0,
                aliasId: ""
              }
            }
        },
        "native": {}
    },
    "WeekProg": {
//        "init":false,
		"type": 'state',
        "common": {
            name: 'Wochenprogramm',
            type: 'string',
            unit: '',
            role: '',
            read: true,
            write: true,
            states: '0:Aus;1:Programm I;2:Programm II;3:Programm III',
            min: 0,
            max: 3,
            custom: {
              'history.0': {
                enabled: true,
                changesOnly: true,
                debounce: "1000",
                maxLength: "250",
                retention: "31536000",
                changesRelogInterval: 0,
                changesMinDelta: 0,
                aliasId: ""
              }
            }
        },
        "native": {}
    },
    "TempSIUnit": {
//        "init":false,
		"type": 'state',
        "common": {
            name: 'Einheit',
            type: 'string',
            unit: '',
            role: 'unit',
            read: false,
            write: false
        },
        "native": {}
    },
    "SollTempMaxVal": {
//        "init":false,
		"type": 'state',
        "common": {
            name: 'maximale Solltemperatur',
            type: 'number',
            unit: '',
            role: 'range',
            read: false,
            write: false
        },
        "native": {}
    },
    "SollTempMinVal": {
//        "init":false,
		"type": 'state',
        "common": {
            name: 'minimale Solltemperatur',
            type: 'number',
            unit: '',
            role: 'range',
            read: false,
            write: false
        },
        "native": {}
    },
    "SollTempStepVal": {
//        "init":false,
		"type": 'state',
        "common": {
            name: 'Solltemperatur Schrittweite',
            type: 'number',
            unit: '',
            role: 'range',
            read: false,
            write: false
        },
        "native": {}
    },
    "ModeEna": {
//        "init":false,
		"type": 'state',
        "common": {
            name: 'Mode aktive',
            type: 'boolean',
            unit: '',
            role: '',
            read: false,
            write: false
        },
        "native": {}
    },
    "WeekProgEna": {
//        "init":false,
		"type": 'state',
        "common": {
            name: 'Wochenprogramm aktiv',
            type: 'boolean',
            unit: '',
            role: '',
            read: false,
            write: false
        },
        "native": {}
    },
    "RaumName": {
//        "init":false,
		"type": 'state',
        "common": {
            name: 'Raumname',
            type: 'string',
            unit: '',
            role: '',
            read: false,
            write: false
        },
        "native": {}
    },
    "KurzId": {
//        "init":false,
		"type": 'state',
        "common": {
            name: 'Kurz-Id',
            type: 'string',
            unit: '',
            role: '',
            read: false,
            write: false
        },
        "native": {}
    },
    "DevAddress": {
//        "init":false,
		"type": 'state',
        "common": {
            name: 'Device Adresse',
            type: 'string',
            unit: '',
            role: '',
            read: false,
            write: false
        },
        "native": {}
    },


 };






// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function (callback) {
    try {
        adapter.log.info('cleaned everything up...');
		adapter.setState("info.connection", {val: false, ack: true});
        callback();
    } catch (e) {
        callback();
    }
});

// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj) {
    // Warning, obj can be null if it was deleted
    adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// is called if a subscribed state changes
adapter.on('stateChange', function (id, state) {
    // Warning, state can be null if it was deleted
//    adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

    // you can use the ack flag to detect if it is status (true) or command (false)
    if (state && !state.ack) 
	{
		let value = state.val;
		let valType = id.split(".").slice(4);
        let addr = 'G' + id.split(".").slice(3,4) + '.' + valType;

		// Was wurde geaendert?
		if (valType == "SollTemp")
		{
			// Ist der Wert ausserhalb des gütligen Bereich (5-30)?
			value = Math.min(Math.max(5,value), 30);

			// Der Wert wird in Hunderstelgrad geschrieben
			value = (Math.round(value * 10) * 10);
		}
		else if (valType == "OPMode")
		{
			// Ist der Wert ausserhalb des gütligen Bereich (0-2)?
			value = Math.min(Math.max(0,value), 2);
		}
		else if (valType == "WeekProg")
		{
			// Ist der Wert ausserhalb des gütligen Bereich (0-3)?
			value = Math.min(Math.max(0,value), 3);
		}
		else 
		{
			adapter.log.error('Value \'' + valType + '\' not writable');
			return;
		}
        
        // Schreibe den neuen Wert
		adapter.log.info("Value of <" + addr + "> changed to <" + value + ">");
		writeValue(addr, value); 
		
		getData();
	}
});

// Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
adapter.on('message', function (obj) {
    if (typeof obj === 'object' && obj.message) {
        if (obj.command === 'send') {
            // e.g. send email or pushover or whatever
            console.log('send command');

            // Send response in callback if required
            if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        }
    }
});

// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function () {
    adapter.log.info("ROTH-Touchline: START ADAPTER data:", adapter.common);
	adapter.setState("info.connection", {val: false, ack: true});
    main();
	getData();
});

function main() {

    // The adapters config (in the instance object everything under the attribute "native") is accessible via
    // adapter.config:
    adapter.log.info('IP-Addresse: '       + adapter.config.ipAddress);
    adapter.log.info('Polling-Intervall: ' + adapter.config.pollingInterval);

    var devName;
    var ruName;
    var propName;
	let pollingInterval;

    adapter.log.info("ROTH-Touchline: createElements");
    for (var dev in devices) {
        devName = dev;
        adapter.log.info("ROTH-Touchline: create Device Id=" + devName);
        adapter.setObject(devName, devices[dev]);

        for (var ru in devices[dev].roomUnits) {
            ruName = devName + "." + ru;
            adapter.log.info("ROTH-Touchline: create RoomUnit Id=" + ruName);
            adapter.setObject(ruName, devices[dev].roomUnits[ru]);

            for (var prop in deviceProperty) {
                propName = ruName + "." + prop;
//                console.log("ROTH-Touchline: create Property Id=" + propName);
                adapter.setObject(propName, deviceProperty[prop]);
            }
        }
    }
    
	if (!adapter.config.pollingInterval)
	{
        adapter.log.warn("adapter.config.pollingInterval not set");
		adapter.config.pollingInterval = 5
	}

	if (adapter.config.pollingInterval < 5)
	{
		adapter.config.pollingInterval = 5
	}
	
	if (!pollingInterval) {
		pollingInterval = setInterval(function () {
			getData();
		}, adapter.config.pollingInterval * 1000);
	}
	
    // in this touchline all states changes inside the adapters namespace are subscribed
    adapter.subscribeStates('*');

    // examples for the checkPassword/checkGroup functions
    adapter.checkPassword('admin', 'iobroker', function (res) {
        console.log('check user admin pw ioboker: ' + res);
    });

    adapter.checkGroup('admin', 'admin', function (res) {
        console.log('check group user admin group admin: ' + res);
    });



}


// Average Load mit uptime auslesen
function getData() 
{
    let timeout = adapter.config.pollingInterval * 2;
    let readTouchlineData  = "python3 " + __dirname + "/exec/readTouchline.py -t " + adapter.config.ipAddress;
    
    adapter.log.info("Update values");

    exec(readTouchlineData, function(err, stdout, stderr) 
    {
        if (err) 
        {
            adapter.log.error(err);
			adapter.setState("info.connection", {val: false, ack: true});
			return;
        }
		adapter.setState("info.connection", {val: true, ack: true});

        let jsonObjects = JSON.parse(stdout);
		let numOfRUs = 0;
		
        for (var dev in devices) 
        {
            var devName = dev;
            var iDevJson = 0;
            var jsonDev;

            // Suche das Device im Json-Object
            for (; iDevJson < jsonObjects.NumberOfDevices ; iDevJson++)
            {
                if (jsonObjects.Devices[iDevJson].Id == dev) {
                    break;
                }
            }

            // Setze das JSON-Device Objekt
            jsonDev = jsonObjects.Devices[iDevJson];

            for (var ru in devices[dev].roomUnits) 
            {
                var ruName = devName + "." + ru;
                var iRUJson = 0;
                var jsonRU;

                // Suche die RU im Json-Device-Object
                for (; iRUJson < jsonDev.NumberOfRoomUnits ; iRUJson++)
                {
                    if (jsonDev.RoomUnits[iRUJson].Id == ru) {
                        break;
                    }
                }
                
                jsonRU = jsonDev.RoomUnits[iRUJson];

                adapter.setState(ruName + ".RaumName", {val: jsonRU.Name, ack: true, expire: timeout});

                adapter.setState(ruName + ".RaumTemp", {val: jsonRU.RaumTemp, ack: true, expire: timeout});
                adapter.setState(ruName + ".SollTemp", {val: jsonRU.SollTemp, ack: true, expire: timeout});
                adapter.setState(ruName + ".OPMode", {val: jsonRU.OPMode, ack: true, expire: timeout});
                adapter.setState(ruName + ".WeekProg", {val: jsonRU.WeekProg, ack: true, expire: timeout});

                adapter.setState(ruName + ".TempSIUnit", {val: jsonRU.TempSIUnit, ack: true, expire: timeout});
                adapter.setState(ruName + ".SollTempMaxVal", {val: jsonRU.SollTempMaxVal, ack: true, expire: timeout});
                adapter.setState(ruName + ".SollTempMinVal", {val: jsonRU.SollTempMinVal, ack: true, expire: timeout});
                adapter.setState(ruName + ".SollTempStepVal", {val: jsonRU.SollTempStepVal, ack: true, expire: timeout});
                adapter.setState(ruName + ".ModeEna", {val: jsonRU.OPModeEna, ack: true, expire: timeout});
                adapter.setState(ruName + ".WeekProgEna", {val: jsonRU.WeekProgEna, ack: true, expire: timeout});
                adapter.setState(ruName + ".KurzId", {val: jsonRU.KurzId, ack: true, expire: timeout});
                adapter.setState(ruName + ".DevAddress", {val: jsonRU.DevAddress, ack: true, expire: timeout});
				
				devAdress[ruName] = jsonRU.DevAddress;

            }
        }
    });
}


// Schreibe einen neuen Wert zum Touchline
// value=`curl -s -k  -X 'GET' -H 'User-Agent: SpiderControl/1.0 (iniNet-Solutions GmbH)'  "http://$ROTHIP/cgi-bin/writeVal.cgi?$1=$2"`
//                                                                                          http://192.168.10.221/cgi-bin/writeVal.cgi?G0.SollTemp=2000
function writeValue(addr, value) 
{
	var request = new XMLHttpRequest();
	var url = 'http://' + adapter.config.ipAddress + '/cgi-bin/writeVal.cgi?' + addr + '=' + value;

	request.open("GET", url);
	request.setRequestHeader('User-Agent','SpiderControl/1.0 (iniNet-Solutions GmbH)');
	request.addEventListener('load', function(event) {
	if (request.status >= 200 && request.status < 300) 
	{
	  adapter.log.info(request.responseText);
	}
	else 
	{
	  adapter.log.error(request.statusText, request.responseText);
	}
	});
	request.send();
//	adapter.log.info("url:"+ url);
}




