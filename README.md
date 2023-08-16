# README.md

# Disclaimer
The following sample application is a personal, open-source project shared by the app creator and not an officially supported Zoom Video Communications, Inc. Zoom Video Communications, Inc., its employees and affiliates are not responsible for the use and maintenance of this application. Please use this sample application for inspiration, exploration and experimentation at your own risk and enjoyment. You may reach out to the app creator and broader Zoom Developer community on https://devforum.zoom.us/ for technical discussion and assistance, but understand there is no service level agreement support for this application. Thank you and happy coding!

## Zoom Real-Time Custom event monitoring Event Monitoring

This nodeJS application is a good example when you want to set custom parameters not available via API to get the data that you want. This application allows you to authenticate using Zoom's Server to Server OAuth, fetch members from a specific Zoom group, and then listen for specific events related to these members using WebSockets.

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

 Here's how to obtain each of these details:

   - **clientID, clientSecret, and account_id**:
     - These can be obtained by creating a Server-to-Server OAuth app in the Zoom App Marketplace.
     - Follow the [official documentation](https://developers.zoom.us/docs/internal-apps/s2s-oauth/) to create your app.
     - After setting up your app in the marketplace, you will be provided with a `clientID` and `clientSecret`.
     - `account_id` is usually found in the App Credentials section or under the app's settings.

   - **subscription_id**:
     - This ID is generated when you create a WebSocket and subscribe to events.
     - Follow the [WebSocket documentation](https://developers.zoom.us/docs/api/rest/websockets/) for setting this up.
     - Ensure that you subscribe to the following events:
       - `meeting.started`
       - `meeting.participant_qos_summary`
       - `meeting.participant_data_summary`

   - **groupID**:
     - Navigate to your Zoom [Group Management Page](https://zoom.us/account/group#/).
     - Select the desired group name.
     - In the URL, identify the groupID. For instance, in the link `https://zoom.us/account/group#/detail/abcdefghi/detail`, the groupID is `abcdefghi`.

3. **Set Up Scopes**:
   
   Ensure that your Zoom app has the following scopes:
   - `group:read:admin`
   - `group:write:admin`

   These scopes will allow the application to read and write group information as an admin.

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

## Running the Application

After setting up, simply run:

```bash
node index.js
```

This will initiate the Zoom WebSocket Handler, authenticate with Zoom, and start listening for events.

---

**Note**: Always ensure your credentials in the `.env` file are kept private and secure. Avoid exposing them in the source code or any public repositories.
