export default {
    natsAddress: import.meta.env.VITE_NATS_ADDRESS,
    natsPort: import.meta.env.VITE_NATS_PORT,
    natsUser: import.meta.env.VITE_NATS_PORT,
    natsPwd: import.meta.env.VITE_NATS_PASSWORD,
    heartbeatTopic: import.meta.env.VITE_BASE_HEARTBEAT_TOPIC,
    objectChangedTopic: import.meta.env.VITE_BASE_OBJECT_CHANGED_TOPIC,
    userAppTopic: import.meta.env.VITE_USER_APP_TOPIC,
    uiAppTopic: import.meta.env.VITE_UI_APP_TOPIC,
};