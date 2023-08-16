# README.md

## Zoom WebSocket Integration for Real-Time Event Monitoring

This nodeJS application allows you to authenticate using Zoom's Server to Server OAuth, fetch members from a specific Zoom group, and then listen for specific events related to these members using WebSockets.

### Prerequisites

Ensure the following npm packages are installed:

- `axios`
- `ws`
- `dotenv`

### Configuration

1. Clone the repository from Github
```
git clone https://github.com/ojusave/zoom-custom-event-listener.git
cd zoom-custom-event-listener
```

2. Create a `.env` file in the root directory with the following:

```
clientID=YOUR_ZOOM_CLIENT_ID
clientSecret=YOUR_ZOOM_CLIENT_SECRET
account_id=YOUR_ZOOM_ACCOUNT_ID
subscription_id=YOUR_ZOOM_SUBSCRIPTION_ID
groupID=YOUR_ZOOM_GROUP_ID
```

### How it Works

1. **Authentication**:
    - The module uses the provided Zoom client ID and secret to generate an OAuth access token for server-to-server communication.
  
2. **Fetching Group Members**:
    - With the generated access token, it fetches member details of a specific Zoom group using `api.zoom.us/v2/groups/{groupId}/members`.
    - Extracted User IDs are stored for later use.

3. **WebSocket Connection**:
    - A WebSocket connection is established with Zoom to receive real-time events.
    - Periodic heartbeat messages are sent to maintain the connection.
    - The module listens for specific events:
      - On detecting a `meeting.started` event, if the `host_id` matches any stored User ID, the meeting UUID is captured.
      - If the event names are `meeting.participant_qos_summary` or `meeting.participant_data_summary` events, and if the meeting UUID matches the stored UUID, the event details are logged to the console.

### Usage

Simply import and invoke the `zoomWebsocketHandler` function in your application. The module automatically handles the setup and event monitoring.

---

**Note**: Always ensure your credentials in the `.env` file are kept private and secure. Avoid exposing them in the source code or any public repositories.