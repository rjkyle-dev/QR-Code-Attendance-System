const WebSocket = require('ws');
const axios = require('axios');

const PORT = 8080;
const wsServer = new WebSocket.Server({ port: PORT });

const LARAVEL_API_BASE = 'http://localhost:8000/api/fingerprint';

wsServer.on('connection', (socket) => {

    socket.on('message', async (msg) => {
        try {
            const data = JSON.parse(msg);

            wsServer.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });

        } catch (err) {
        }
    });
});
