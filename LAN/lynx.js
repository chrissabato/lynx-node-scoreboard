/*  
************************************
** Node.js requirments            **
************************************
*/
var dgram = require("dgram");
var udpResultsServer = dgram.createSocket("udp4");
var udpTimeServer = dgram.createSocket("udp4");
var http = require('http');
var fs = require('fs');
var io = require('socket.io');



// Defining some variables
var htmlPage;
var jsonResults;
var tempResults = '';
var finalResults = '';
var time = '0.0';
var r = new Array();

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
    }
});


/*  
************************************
** UDP Time Server                **
************************************
*/

// start UDP server listening on port 43279
udpTimeServer.on("listening", function () {
    var address = udpTimeServer.address();
    console.log("UDP server listening on port: " + address.port);
});
udpTimeServer.bind(43279);

// process datagram
udpTimeServer.on("message", function (clock, rinfo) { 
    
   time = clock.toString();
   time = time.trim();
   r[0]=time;
    
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
        jsonResults = JSON.stringify(r);        // convert final array into a json string
        socket.send(jsonResults);               // sent json results via socket
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

