import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
//import { connect, wsconnect } from '@nats-io/transport-node'
import { connect } from "nats.ws";
import { Heartbeat } from '@/generated/orion_common'
import { getStatusStore } from './StatusStore';
import ConnectionInformation from '@/models/ConnectionInformation';

// https://github.com/nats-io/nats.js/blob/main/core/README.md
// https://github.com/nats-io/nats.ws



export const getHeartbeatStore = defineStore('heartbeatStore', () => {

    let heartbeatMap = new Map<string, Heartbeat[]>();
    const statusStore = getStatusStore();
    const canLogin = ref<boolean>(false)
    const uiConnected = ref<boolean>(false);
    const userConnected = ref<boolean>(false);

    async function init() {
        const server = "ws://" + import.meta.env.VITE_NATS_ADDRESS + ":" + import.meta.env.VITE_NATS_PORT;
        try {
            //console.log(`connecting to ${server} as ${import.meta.env.VITE_NATS_USER}`)
            // , user: import.meta.env.VITE_NATS_USER, pass: import.meta.env.VITE_NATS_PASSWORD
            const connection = await connect({ servers: server, user: import.meta.env.VITE_NATS_USER, pass: import.meta.env.VITE_NATS_PASSWORD });
            const sub = connection.subscribe(import.meta.env.VITE_BASE_HEARTBEAT_TOPIC + ".*");
            (async () => {
                for await (const m of sub) {
                    //console.log(`[${sub.getSubject()}]: ${m.string()}`);
                    const heartBeat = m.json<Heartbeat>();
                    if (heartBeat.appName.toLowerCase() == 'orion.user') {
                        userConnected.value = true;
                    } else if (heartBeat.appName.toLowerCase() == 'orion.ui') {
                        uiConnected.value = true;
                    }
                    if (uiConnected.value == true && userConnected.value == true) {
                        statusStore.statusMessage = 'Connected';
                        canLogin.value = true;
                    }
                    if (heartbeatMap.has(heartBeat.appName.toLowerCase())) {
                        let arr = heartbeatMap.get(heartBeat.appName.toLowerCase());
                        arr?.push(heartBeat);
                        heartbeatMap.set(heartBeat.appName.toLowerCase(), arr!);
                    } else {
                        let arr: Heartbeat[] = [heartBeat];
                        heartbeatMap.set(heartBeat.appName.toLowerCase(), arr!);
                    }
                }
            })();

        } catch (err) {
            console.log(err);
            console.log(`error connecting to ${JSON.stringify(server)} - ${JSON.stringify(err)}`);
            statusStore.setError(`error connecting to ${JSON.stringify(server)} - ${JSON.stringify(err)}`);
        }
    }

    function isAvailable(app: string) {
        //let subject: string = import.meta.env.VITE_BASE_HEARTBEAT_TOPIC + "." + app.toLowerCase();
        let arr: Heartbeat[] | undefined = heartbeatMap.get(app.toLowerCase());
        if (arr == undefined) {
            return false;
        }
        let timeout: number = Number(import.meta.env.VITE_BASE_HEARTBEAT_TIMEOUT);
        let latestHeartbeat = arr[arr.length - 1];
        if (Number(latestHeartbeat?.currentTime) < (new Date().getTime() - (timeout * 1000))) {
            return false;
        }

        return true;
    }

    function getBestSuitedConnection(app: string) {
        //let subject: string = import.meta.env.VITE_BASE_HEARTBEAT_TOPIC + "." + app.toLowerCase();
        let arr: Heartbeat[] | undefined = heartbeatMap.get(app.toLowerCase());
        if (arr == undefined) {
            return undefined;
        }
        let best = arr[0];
        for (const hb of arr) {
            if (Number(hb.allocBytes) < Number(best?.allocBytes)) {
                best = hb;
            }
        }

        return new ConnectionInformation(best?.hostAddress!, String(best?.port!));
    }

    return { init, isAvailable, getBestSuitedConnection, canLogin }
})