interface ImportMetaEnv {
    readonly VITE_NATS_ADDRESS: string;
    readonly VITE_NATS_PORT: string;
    readonly VITE_NATS_USER: string;
    readonly VITE_NATS_PASSWORD: string;
    readonly VITE_BASE_HEARTBEAT_TOPIC: string;
    readonly VITE_BASE_OBJECT_CHANGED_TOPIC: string;
    readonly VITE_USER_APP_TOPIC: string;
    readonly VITE_UI_APP_TOPIC: string;
    readonly VITE_BASE_HEARTBEAT_TIMEOUT: string;
    readonly VITE_DEFAULT_LANGUAGE: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}