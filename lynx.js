/*  
************************************
** Node.js requirments            **
************************************
*/
var dgram = require("dgram");
var udpServer = dgram.createSocket("udp4");
var http = require('http');
var fs = require('fs');
var io = require('socket.io');
var os = require( 'os' );


// Defining some variables
var htmlPage;
var jsonResults;
var tempResults = '';
var finalResults = '';


/*  
************************************
** UDP Server                     **
************************************
*/

// start UDP server listening on port 43278
udpServer.on("listening", function () {
    var address = udpServer.address();
    console.log("UDP server listening on port: " + address.port);
});
udpServer.bind(43278);

// process datagram
udpServer.on("message", function (msg, rinfo) { 
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
                //console.log(r[i]);
                r[i]= r[i].split(',');          // if line is not empty split the line bt ','
                
            }
        }
        jsonResults = JSON.stringify(r);        // convert final array into a json string
        tempResults ='';                        // reset tempResults variable to prepare for next datagram
    }
});


/*  
************************************
** Webserver and sockets.io       **
************************************
*/
var htmlPage;

// read html file to serve
fs.readFile('lynx.html', function(error, data){
    if (error){
        throw error;
    }
    else{
        htmlPage = data;
    }
});

// start webserver 
var htmlServer = http.createServer(function(request, response) {
    response.writeHeader(200, {"Content-Type": "text/html"});
    response.end(htmlPage);
});

htmlServer.listen(8000);
console.log("HTML server started on: " + getIP());

// start up socket.io for transmitting data to the webpage
var serv_io = io.listen(htmlServer, { log: false });
serv_io.sockets.on('connection', function(socket){
    //send data to client
    setInterval(function(){
        socket.send(jsonResults);
    }, 1000);
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

