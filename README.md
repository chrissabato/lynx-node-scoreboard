lynx-node-scoreboard
====================
Node.js Web Scoreboard for FinishLynx

###Node Setup###
--------------------
+ install node.js
+ add node to PATH (windows installed doen't do this by default)
  + open cmd prompt as administrator
  + SET PATH=C:\Program Files\Nodejs;%PATH%
+ create a folder for you Node project (c:\node)
+ install socket.io node.js module 
  + must be in the same directory as the node project
  + from a command prompt
    + CD c:\node
    + npm install socket.io
    
FinishLynx Setup
--------------------
+ copy nodejs.lss into the Finishlynx directory
+ setup scoreboard in FinishLynx
  + Script: nodejs.lss
  + Code Set: Single Byte
  + Serial Port: Network (UDP)
  + Port: 43278
  + IP Address: 255.255.255.255
  + Running Time: Off
  + Results: Auto
  + Alway send place: checked
  + Paging: checked
  + Size: 24
  + Max: 24
  + Include first name: checked
  
Run Server
--------------------
+ start the node upd/http server
  + node lynx.js
