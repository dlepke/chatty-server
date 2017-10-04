// server.js

const express = require('express');
const WebSocket = require('ws');
const { Server, OPEN } = WebSocket;
const uuid = require('uuid/v4');
 
// Set the port to 3001
const PORT = 3001;
 
// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', () => console.log(`Listening on ${ PORT }`));
 
// Create the WebSockets server
const wss = new Server({ server });

function broadcast(payload) {
  const message = JSON.stringify(payload);
  wss.clients.forEach(client => {
    if(client.readyState !== OPEN) { return; }

    client.send(message);
  })
}
 
// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (messageJSON) => {
    const message = JSON.parse(messageJSON);
    const id = uuid();
    message.id = id;

    broadcast({ message });
  });
 
  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => console.log('Client disconnected'));
});