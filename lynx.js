var dgram = require("dgram");
var udpServer = dgram.createSocket("udp4");
var http = require('http');
var fs = require('fs');
var io = require('socket.io');

var htmlPage;
var jsonResults;
var tempResults = '';
var finalResults = '';
udpServer.on("message", function (msg, rinfo) { 
    if(rinfo.size == 536){
        tempResults = tempResults + msg.toString();
    } 
    else{
        finalResults = tempResults + msg.toString();
        
            r = finalResults.split(';');
            for (var i = 0; i < r.length; i++) {          
                var tmp = r[i].length;
                if (tmp == 14 || tmp == 0){
                    r.splice(i,1);
                }
                else {
                    //console.log(r[i]);
                    r[i]= r[i].split(',');
                    
                }
            }
            jsonResults = JSON.stringify(r);
        tempResults ='';
    }
});

udpServer.on("listening", function () {
  var address = udpServer.address();
  console.log("UDP server listening " + address.address + ":" + address.port);
});
udpServer.bind(43278);


/*  
** Webserver and sockets.io
*/
var htmlPage;

fs.readFile('lynx.html', function(error, data){
    if (error){
        throw error;
    }
    else{
        htmlPage = data;
    }
});


var htmlServer = http.createServer(function(request, response) {
    response.writeHeader(200, {"Content-Type": "text/html"});
    response.end(htmlPage);
});

htmlServer.listen(8000)
var serv_io = io.listen(htmlServer, { log: false });

serv_io.sockets.on('connection', function(socket){
    //send data to client
    setInterval(function(){
        socket.send(jsonResults);
    }, 1000);
});