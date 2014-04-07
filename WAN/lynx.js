/*  
************************************
** Node.js requirments            **
************************************
*/
var dgram = require("dgram");
var udpResultsServer = dgram.createSocket("udp4");
var fs = require('fs');
var io = require('socket.io');



// Defining some variables
var htmlPage;
var jsonResults;
var tempResults = '';
var finalResults = '';
var time = '0.0';
var r = new Array();

// Defining pusher variables
var Pusher = require('pusher');
var pusher = new Pusher({
    appId: '',
    key: '',
    secret: ''
});

/*  
************************************
** UDP Results Server             **
************************************
*/

// start UDP server listening on port 43278
udpResultsServer.on("listening", function () {
    var address = udpResultsServer.address();
    console.log("UDP server listening on port: " + address.port);
});
udpResultsServer.bind(43278);

// process datagram
udpResultsServer.on("message", function (msg, rinfo) { 
    // check if datagram is full (size=536)
    if(rinfo.size == 536){
        tempResults = tempResults + msg.toString();
    } 
    // datagram is not full, so this is the end of the message
    else{
        finalResults = tempResults + msg.toString();
        
        r = finalResults.split(';');            // split the final string by ';' and put in array r
        for (var i = 0; i < r.length; i++) {    // loop through each array element (result line)      
            var tmp = r[i].length;              // check size, if it's 14 it is an empty result set
            if (tmp == 14 || tmp == 0){
                r.splice(i,1);                  // if empty remove from array
            }
            else {
                r[i]= r[i].split(',');          // if line is not empty split the line bt ','               
            }
        }
        r.unshift(time);
        tempResults ='';                        // reset tempResults variable to prepare for next datagram

        jsonResults = JSON.stringify(r);        // convert final array into a json string
        pusher.trigger('results_channel', 'results', {
            "message": jsonResults
        });

        }
});


/*  
************************************
** Get Ip Addresses               **
************************************
*/
function getIP(){
    var os = require( 'os' );
    var networkConfig = os.networkInterfaces( );    
    var ipList ='';    
    for (var name in networkConfig) {
        networks = networkConfig[name];    
        for (var name in networks) {        
            details = networks[name];       
            if (details['family'] == "IPv4"){    
                ipList = ipList + details['address'] + " ";
            }
        }
    }
    return ipList;
}

