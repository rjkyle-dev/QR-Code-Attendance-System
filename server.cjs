const WebSocket = require('ws');
const axios = require('axios');

const PORT = 8080; // Use 8080 for WebSocket
const wsServer = new WebSocket.Server({ port: PORT });

const LARAVEL_API_BASE = 'http://localhost:8000/api/fingerprint'; // Adjust if needed

wsServer.on('connection', (socket) => {
    // console.log('Client connected!');

    socket.on('message', async (msg) => {
        try {
            // console.log('[WS SERVER] Received from client:', msg);
            const data = JSON.parse(msg);

            // Broadcast all messages as-is (Add Crew now has employeeid, same as Regular/Probationary)
            wsServer.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    // console.log('[WS SERVER] Broadcasting to client:', JSON.stringify(data));
                    client.send(JSON.stringify(data));
                }
            });

            // The following block is removed/commented out:
            // Do NOT forward fingerprint data to Laravel for registration/verification/identification
            // if (
            //     data.type === 'fingerprint_data' ||
            //     data.type === 'fingerprint_verification_data' ||
            //     data.type === 'fingerprint_identification_data'
            // ) {
            //     // ... code removed ...
            // }
        } catch (err) {
            // console.error('Error handling message:', err.message);
        }
    });
});

// console.log(`WebSocket server running on ws://localhost:${PORT}`);
