# Messaging & Chat

## Background Knowledge

### Apple APN and Google FCM

You may wonder for real-time messaging systems such as iMessage and slack, how
do them push notifications to the mobile user? You can maintain a websocket
when the user is actively using the app, but what happens when the user is
offline or the app is running in the background? The answer is Apple APN (Apple
Push Notifications) service and Android FCM (Firebase Cloud Messaging).

Apple and Google built a large distributed push notification service with edge
network support. Every Apple/Android device maintains a persistent connection
to APN or FCM. When there is no notification, this socket is idle and uses
little resource. When there is notification, this socket is waked up and shows
the message on your phone. This design scales because one socket per device.

## Design Slack

Feature need to support

1. One to one messaging.
2. Group messaging.
3. Push notification when user is offline.
4. Show people online/offline status.

Schemas:

- `users` (id, email, ...)
- `group` (group_id)
- `group_users_association`
  - One-to-many relationship.
  - (group_id, user_id, last_read_msg_id)
- `messages` (msg_id, group_id, content, media_url, send_at)
- `devices` (device_id, user_id, is_online)

There are three players in the flow: `sender`, `slack server` and `receiver`.
The sender part is easier. Most complicated things happen on receiver side.

### How does receiver read the message?

The are two cases.

Case 1: when the user is actively using the app. The receiver already has
websocket established with the slack server. So it can receive new messages.
Whenever the user reads a message, the `last_read_msg_id` in the
`group_users_association` table is updated, so slack knows where to start to
stream next time.

Case 2: when the user is offline or not actively using slack. Slack server
pushes the message to APN or FCM. When user goes online, he/she clicks the
notification and jumps to the app. At this time, a websocket is connected, and
the slack server streams all messages from `last_read_msg_id` to the latest
message id in the current group. You notice a detail that the notification sent
to APN/FCM could be different from the message itself. Its purpose is only to
draw attention from the user. All messages are streamed once the user is inside
the app.

So the follow-up question is how slack server knows when the user is online or
offline. The answer is

```
WebSocket = proof of life
```

For a given user, when there is already a websocket connection, then it means
the user is online. Slack is definitely not a single server. The websocket may
be established in Server A, but server working on this particular group chat
may reside in server B. This is totally possible because a user can have
multiple chats going on. There are many ways to know if a websocket is already
established. We can use a distributed cache like `Redis`, or simply add a new
column `socket_machine_address` in the `devices` table. Now, the question comes
to the design question

- A group chat is handled by Sever B, but user's websocket is established in
  Server A. How does this work.

The simplest approach is to use a message broker.

### Storage layer.

All data except `messages` could be put inside a relational database. Because
of the volume of `messages`, it is better to put them in another storage.
`Dynamodb` and `TiDB` are all google choices.
