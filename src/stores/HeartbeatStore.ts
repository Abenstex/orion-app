import { Heartbeat } from '@/generated/orion_common'
// import { connect, wsconnect } from '@nats-io/transport-node'
import { connect } from 'nats.ws'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import ConnectionInformation from '@/models/ConnectionInformation'
import { getStatusStore } from './StatusStore'
import DecentSet from '@/utils/DecentSet'

// https://github.com/nats-io/nats.js/blob/main/core/README.md
// https://github.com/nats-io/nats.ws

export const getHeartbeatStore = defineStore('heartbeatStore', () => {
  const heartbeatMap = new Map<string, Heartbeat[]>()
  const detailedHeartbeatMap = new Map<string, Heartbeat[]>();
  const statusStore = getStatusStore()
  const canLogin = ref<boolean>(false)
  const uiConnected = ref<boolean>(false)
  const userConnected = ref<boolean>(false)
  const currentHeartbeats = ref<DecentSet<Heartbeat>>()
  currentHeartbeats.value = new DecentSet<Heartbeat>(
    hb => hb.appName+hb.appVersion+hb.hostAddress+hb.port
  )

  async function init () {
    const server = 'ws://' + import.meta.env.VITE_NATS_ADDRESS + ':' + import.meta.env.VITE_NATS_PORT
    try {
      console.log(`connecting to ${server} as ${import.meta.env.VITE_NATS_USER}`, server, import.meta.env.VITE_NATS_USER)
      const connection = await connect({ servers: server, user: import.meta.env.VITE_NATS_USER, pass: import.meta.env.VITE_NATS_PASSWORD })
      const sub = connection.subscribe(import.meta.env.VITE_BASE_HEARTBEAT_TOPIC + '.*');
      (async () => {
        for await (const m of sub) {
          // console.log(`[${sub.getSubject()}]: ${m.string()}`)
          const heartBeat = m.json<Heartbeat>()
          currentHeartbeats.value?.replace(heartBeat);
          if (heartBeat.appName.toLowerCase() == 'orion.user') {
            userConnected.value = true
          } else if (heartBeat.appName.toLowerCase() == 'orion.ui') {
            uiConnected.value = true
          }
          if (uiConnected.value == true && userConnected.value == true) {
            statusStore.statusMessage = 'Connected'
            canLogin.value = true
          }
          if (heartbeatMap.has(heartBeat.appName.toLowerCase())) {
            const arr = heartbeatMap.get(heartBeat.appName.toLowerCase())
            arr?.push(heartBeat)
            heartbeatMap.set(heartBeat.appName.toLowerCase(), arr!)
          } else {
            const arr: Heartbeat[] = [heartBeat]
            heartbeatMap.set(heartBeat.appName.toLowerCase(), arr!)
          }
          addDetailedHeartbeat(heartBeat);
        }
      })()
    } catch (error) {
      console.log(error)
      console.log(`error connecting to ${JSON.stringify(server)} - ${JSON.stringify(error)}`)
      statusStore.setError(`error connecting to ${JSON.stringify(server)} - ${JSON.stringify(error)}`)
    }
  }

  function uniqueKey(hb: Heartbeat): string {
    return hb.appName.toLowerCase() + hb.appVersion.toLowerCase() + hb.hostAddress + hb.port;
  }

  function addDetailedHeartbeat(hb: Heartbeat) {
    const key = uniqueKey(hb);
    if (detailedHeartbeatMap.has(key)) {
      const arr = heartbeatMap.get(hb.appName.toLowerCase());
      arr?.push(hb);
      heartbeatMap.set(key, arr!);
    } else {
      const arr: Heartbeat[] = [hb];
      heartbeatMap.set(key, arr!);
    }
  }

  function isAvailable (app: string) {
    // let subject: string = import.meta.env.VITE_BASE_HEARTBEAT_TOPIC + "." + app.toLowerCase();
    const arr: Heartbeat[] | undefined = heartbeatMap.get(app.toLowerCase())
    if (arr == undefined) {
      return false
    }
    const timeout = Number(import.meta.env.VITE_BASE_HEARTBEAT_TIMEOUT)
    const latestHeartbeat = arr.pop()
    if (Number(latestHeartbeat?.currentTime) < (Date.now() - (timeout * 1000))) {
      return false
    }

    return true
  }

  function getBestSuitedConnection (app: string) {
    // let subject: string = import.meta.env.VITE_BASE_HEARTBEAT_TOPIC + "." + app.toLowerCase();
    const arr: Heartbeat[] | undefined = heartbeatMap.get(app.toLowerCase())
    if (arr == undefined) {
      return undefined
    }
    let best = arr[0]
    for (const hb of arr) {
      if (Number(hb.allocBytes) < Number(best?.allocBytes)) {
        best = hb
      }
    }

    return new ConnectionInformation(best!.hostAddress, String(best!.port!))
  }

  return { init, isAvailable, getBestSuitedConnection, canLogin, currentHeartbeats }
})
