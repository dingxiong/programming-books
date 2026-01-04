# Messaging & Chat

## Background Knowledge

### Apple APN and Google FCM

You may wonder for real-time messaging systems such as iMessage and slack, how
do them push notifications to the mobile user? You can maintain a websocket
when the user is actively using the app, but what happens when the user is
offline or the app is running in the background? The answer is Apple APN (Apple
Push Notifications) service and Android FCM (Firebase Cloud Messaging).

Apple and Google built a large distributed push notification service with edge
network support. Every Apple/Android device maintains persistent connection to
APN or FCM. When there is no notification, this socket connection is idle and
uses little resource. When there is notification, this socket is waked up and
shows the message on your phone. This design scales because one socket per
device.
