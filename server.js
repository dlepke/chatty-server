const express = require('express');
const WebSocket = require('ws');
const { Server, OPEN } = WebSocket;
const uuid = require('uuid/v4');
 

const PORT = 3001;
 

const server = express()
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', () => console.log(`Listening on ${ PORT }`));
 

const wss = new Server({ server }); //maybe change this to { server: app } ???

function broadcast(payload) { //this is just the function declaration to be used later 
  const message = JSON.stringify(payload);
  wss.clients.forEach(client => {
    if(client.readyState !== OPEN) { return; }

    client.send(message);
  })
}
 

wss.on('connection', (ws) => {
  console.log('Client connected');
  const clientInfoOnConnection = {
    numClients: wss.clients.size,
    type: 'clientCount'
  };
  broadcast(clientInfoOnConnection);

  ws.on('message', (messageJSON) => {
    const message = JSON.parse(messageJSON); //this parses the JSON string that contains the new message info
    const id = uuid();
    message.id = id;

    broadcast({ message }); //this is where the new message gets sent to everyone
  });
 
  ws.on('close', () => {
    console.log('Client disconnected');
    const clientInfoOnClose = {
      numClients: wss.clients.size,
      type: 'clientCount'
    };
    broadcast(clientInfoOnClose);
  })
});