# BlocklyProp Launcher REST API

This document provides details of the API available in the BlocklyProp Launcher. These calls are
available through a websocket interface. The client system should send API requests as JSON packet
messages as described below.

## Open Channel
When the websocket is established, this message initializes the channel that all subsequent interactions
with the APU will use.

### Message elements
**type** - Message name

**baud** - Select a baud rate that the BlocklyProp Launcher will use to communicate with attached devices.
```json
  {
    "type": "hello-browser",
    "baud": "115200"
  }
```

Example:
```javascript
  const apiUrl = 'ws://localhost:6009';
  connection = new WebSocket(apiUrl);

  // Callback executed when the connection is opened
  connection.onopen = function(event) {

  // Create a Hello message
  const wsMessage = {
        type: 'hello-browser',
        baud: '115200',
      };

  // Send the message to the API
  connection.send(JSON.stringify(wsMessage));
  };
```
##Load Propeller request
The client sends this message when it wants to download a Propeller Application to the connected
Propeller device, storing the app in either RAM or EEPROM (which is really RAM & EEPROM together)
###Message Elements
**type** - "load-prop"

**action** - "RAM" or "EEPROM"

**portPath** - target port's name (direct from the port drop-down list); wired or wireless port.

**payload** - A base-64 encoded .elf, .binary, or .eeprom data containing the Propeller Application image

**debug** - set to 'true' if a terminal is intended to connect to the Propeller after download, otherwise set to false.
```json
{
  "type": "load-prop",
  "action": "RAM",
  "portPath": "device_name",
  "payload": "D4F2A34AB...",
  "debug": "false"  
}
```

Serial Terminal communication request
Solo sends this message to open/close/transmit-to Propeller on a port at a specific baud rate
type: "serial-terminal"
action: "open", "close", or "msg" (opens port, closes port, or transmits data from Solo to Propeller over port [portPath])
portPath:  (target port's name (direct from the port drop-down list); wired or wireless port)
baudrate: (desired baud rate)
msg: (only required when action is "msg"; contains data message to transmit to Propeller)
Port List request
Solo sends this message to get a current list of ports that the Launcher sees on the system.  This causes Launcher to send the list immediately, but also starts the process of Launcher automatically sending the list every 5 seconds (no further requests needed from Solo to keep this going for the current socket session)
type: "port-list-request"
Launcher Version request
type: "hello-browser"
baudrate: (optional, defaults to 115200 but is actually unused by Launcher in this case)
Debug Clear To Send request
NOT SUPPORTED; believe the intention was to halt Launcher to Solo "serial" transmissions until Solo is ready to receive
type: "debug-cts"
This process of exploring what the communication looks like is beneficial for me too.  It was defined long ago, partly by Michele and partly by Matt, during the initial design and later websocket support design.  I've made some changes on the Client and Launcher sides, and very little changes on the BlocklyProp side; just what was needed to match.  It's starting to "come back" to me now.

    Something I think Solo (BlocklyProp too, of course) does is request the port list on a timed basis, sending more and more requests to the Launcher; however, the Launcher automatically sends the list on a timed basis once the first request for the list is made on the websocket.

    Over the websocket channel, BlocklyProp Launcher sends JSON packet messages to Solo as described below:

    Serial Terminal data (from Propeller to Solo)
Launcher sends this message to transmit from Propeller to Solo
type: "serial-terminal"
packetID: (an always-increasing ID number indicating the unique chronology of the packet's occurrence)
msg: (data from the Propeller)
Download Status message
Launcher sends this message to give status details about the download-to-Propeller progress
type: "ui-command"
action: "message-compile" (badly-named action in my opinion; may have started out meaning something else)
msg: (string of text for Solo to display on its Compile+Download dialog, reflecting Launcher's status of communication with Propeller during downloads)
