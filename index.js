const axios = require('axios');
const WebSocket = require('ws');
require('dotenv').config();

let zoomWebSocket = null;
let memberIds = []; 
let meetingIds = []; 

async function zoomWebsocketHandler(data, frontendWss) {
    const { clientID, clientSecret, account_id, subscription_id } = data;

    if (!clientID || !clientSecret || !account_id || !subscription_id) {
        throw new Error('Missing required fields in request data.');
    }

    const authString = Buffer.from(`${clientID}:${clientSecret}`).toString('base64');
    let response = await axios.post(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${account_id}`, {}, {
        headers: {
            Authorization: 'Basic ' + authString
        }
    });

    let access_token = response.data.access_token;

    const groupId = process.env.groupID;
    response = await axios.get(`https://api.zoom.us/v2/groups/${groupId}/members`, {
        headers: {
            Authorization: 'Bearer ' + access_token
        }
    });

    if (response.data.members && response.data.members.length > 0) {
        memberIds = response.data.members.map(member => member.id);
    }

    if (zoomWebSocket && zoomWebSocket.readyState === WebSocket.OPEN) {
        zoomWebSocket.close();
    }

    zoomWebSocket = new WebSocket(`wss://ws.zoom.us/ws?subscriptionId=${subscription_id}&access_token=${access_token}`);

    zoomWebSocket.on('open', () => {
        const heartbeatMessage = {
            module: "heartbeat"
        };

        setTimeout(() => {
            setInterval(() => {
                zoomWebSocket.send(JSON.stringify(heartbeatMessage));
            }, 55000);
        }, 55000);
    });

    zoomWebSocket.on('message', (data) => {
        const stringData = data.toString();
        
        if (stringData.startsWith('{') || stringData.startsWith('[')) {
            try {
                const outerParsedData = JSON.parse(data);

                if (typeof outerParsedData.content === 'string' && (outerParsedData.content.startsWith('{') || outerParsedData.content.startsWith('['))) {
                    const innerParsedData = JSON.parse(outerParsedData.content);

                    if (innerParsedData.event === "meeting.started" && memberIds.includes(innerParsedData.payload.object.host_id)) {
                        meetingIds.push(innerParsedData.payload.object.uuid);
                    } else if ((innerParsedData.event === "meeting.participant_qos_summary" || innerParsedData.event === "meeting.participant_data_summary") && meetingIds.includes(innerParsedData.payload.object.uuid)) {
                        console.log(`Received QoS Summary for Meeting UUID: ${innerParsedData.payload.object.uuid}:\n`, JSON.stringify(innerParsedData, null, 2));

                    }
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        }
    });
}

module.exports = zoomWebsocketHandler;
zoomWebsocketHandler({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    account_id: process.env.account_id,
    subscription_id: process.env.subscription_id
});
