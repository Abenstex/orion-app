import {
  AddConfigParameterRequest,
  ConfigParameter,
  ConfigParameterDeletedEvent,
  ConfigParameterSavedEvent,
  DeleteConfigParameterRequest,
  GetConfigParameterReply,
  GetConfigParameterRequest,
  ParameterDataType,
  UpdateConfigParameterRequest,
} from "@/generated/misc";
import { connect, type Subscription } from "nats.ws";
import { defineStore } from "pinia";
import { ref } from "vue";
import { getStatusStore } from "./StatusStore";
import type ConnectionInformation from "@/models/ConnectionInformation";
import { getHeartbeatStore } from "./HeartbeatStore";
import { buildRequestHeader, getDefaultRestHeader } from "@/utils/CommUtils";
import axios from "axios";
import { useAppStore } from "./app";
import { ObjectType, ReplyHeader, SaveReply } from "@/generated/orion_common";
import { newBaseInformation } from "@/utils/Utils";

export const getConfigParameterStore = defineStore(
  "configParameterStore",
  () => {
    const parameters = ref<ConfigParameter[]>([]);
    const statusStore = getStatusStore();
    const appName: string = "orion.parameter";
    const updateSubscription: Subscription | undefined = undefined;
    const addedSubscription: Subscription | undefined = undefined;
    const deletedSubscription: Subscription | undefined = undefined;

    function replaceParameter(param: ConfigParameter) {
      const idx = parameters.value.findIndex(
        (x) => x.baseInformation?.id?.uuid === param.baseInformation?.id?.uuid
      );
      parameters.value[idx] = param;
    }

    function removeParameter(id: string) {
      const idx = parameters.value.findIndex(
        (x) => x.baseInformation?.id?.uuid === id
      );
      delete parameters.value[idx];
    }

    async function startListening() {
      await listenForDeletedEvents();
      await listenForNewParameters();
      await listenForUpdates();
    }

    async function listenForDeletedEvents() {
      const server =
        "ws://" +
        import.meta.env.VITE_NATS_ADDRESS +
        ":" +
        import.meta.env.VITE_NATS_PORT;
      try {
        //console.log(`connecting to ${server} as ${import.meta.env.VITE_NATS_USER}`, server, import.meta.env.VITE_NATS_USER)
        const connection = await connect({
          servers: server,
          user: import.meta.env.VITE_NATS_USER,
          pass: import.meta.env.VITE_NATS_PASSWORD,
        });
        const updateTopic: ConfigParameter | undefined = getCachedParameter(
          "objectDeletedEventTopic",
          "parameter"
        );
        if (updateTopic === undefined) {
          return;
        }
        const updateSubscription = connection.subscribe(
          import.meta.env.VITE_BASE_HEARTBEAT_TOPIC + ".*"
        );
        (async () => {
          for await (const m of updateSubscription) {
            const event = m.json<ConfigParameterDeletedEvent>();
            if (
              event.header?.senderId !== useAppStore().clientId &&
              event.header?.objectType === ObjectType.OT_CONFIG_PARAMETER &&
              event.id !== undefined
            ) {
              removeParameter(event.id);
            }
          }
        })();
      } catch (error) {
        console.log(error);
        console.log(
          `error connecting to ${JSON.stringify(server)} - ${JSON.stringify(
            error
          )}`
        );
        statusStore.setError(
          `error connecting to ${JSON.stringify(server)} - ${JSON.stringify(
            error
          )}`
        );
      }
    }

    async function listenForNewParameters() {
      const server =
        "ws://" +
        import.meta.env.VITE_NATS_ADDRESS +
        ":" +
        import.meta.env.VITE_NATS_PORT;
      try {
        //console.log(`connecting to ${server} as ${import.meta.env.VITE_NATS_USER}`, server, import.meta.env.VITE_NATS_USER)
        const connection = await connect({
          servers: server,
          user: import.meta.env.VITE_NATS_USER,
          pass: import.meta.env.VITE_NATS_PASSWORD,
        });
        const updateTopic: ConfigParameter | undefined = getCachedParameter(
          "objectAddedEventTopic",
          "parameter"
        );
        if (updateTopic === undefined) {
          return;
        }
        const updateSubscription = connection.subscribe(
          import.meta.env.VITE_BASE_HEARTBEAT_TOPIC + ".*"
        );
        (async () => {
          for await (const m of updateSubscription) {
            const event = m.json<ConfigParameterSavedEvent>();
            if (
              event.header?.senderId !== useAppStore().clientId &&
              event.header?.objectType === ObjectType.OT_CONFIG_PARAMETER &&
              event.parameter !== undefined
            ) {
              replaceParameter(event.parameter);
            }
          }
        })();
      } catch (error) {
        console.log(error);
        console.log(
          `error connecting to ${JSON.stringify(server)} - ${JSON.stringify(
            error
          )}`
        );
        statusStore.setError(
          `error connecting to ${JSON.stringify(server)} - ${JSON.stringify(
            error
          )}`
        );
      }
    }

    async function listenForUpdates() {
      const server =
        "ws://" +
        import.meta.env.VITE_NATS_ADDRESS +
        ":" +
        import.meta.env.VITE_NATS_PORT;
      try {
        //console.log(`connecting to ${server} as ${import.meta.env.VITE_NATS_USER}`, server, import.meta.env.VITE_NATS_USER)
        const connection = await connect({
          servers: server,
          user: import.meta.env.VITE_NATS_USER,
          pass: import.meta.env.VITE_NATS_PASSWORD,
        });
        const updateTopic: ConfigParameter | undefined = getCachedParameter(
          "objectUpdatedEventTopic",
          "parameter"
        );
        if (updateTopic === undefined) {
          return;
        }
        const updateSubscription = connection.subscribe(
          import.meta.env.VITE_BASE_HEARTBEAT_TOPIC + ".*"
        );
        (async () => {
          for await (const m of updateSubscription) {
            const event = m.json<ConfigParameterSavedEvent>();
            if (
              event.header?.senderId !== useAppStore().clientId &&
              event.header?.objectType === ObjectType.OT_CONFIG_PARAMETER &&
              event.parameter !== undefined
            ) {
              replaceParameter(event.parameter);
            }
          }
        })();
      } catch (error) {
        console.log(error);
        console.log(
          `error connecting to ${JSON.stringify(server)} - ${JSON.stringify(
            error
          )}`
        );
        statusStore.setError(
          `error connecting to ${JSON.stringify(server)} - ${JSON.stringify(
            error
          )}`
        );
      }
    }

    function getCachedParameter(key: string): ConfigParameter | undefined;
    function getCachedParameter(
      key: string,
      section: string
    ): ConfigParameter | undefined;
    function getCachedParameter(
      key: string,
      section: string,
      group: string
    ): ConfigParameter | undefined;
    function getCachedParameter(
      key: string,
      section?: string,
      group?: string
    ): ConfigParameter | undefined {
      for (const param of parameters.value) {
        if (
          section !== undefined &&
          section.toLowerCase() === param.section.toLowerCase()
        ) {
          if (
            group !== undefined &&
            group.toLowerCase() === param.group.toLowerCase()
          ) {
            if (
              param.baseInformation?.name.toLowerCase() === key.toLowerCase()
            ) {
              return param;
            }
          } else {
            if (param.baseInformation?.name === key) {
              return param;
            }
          }
        }
        if (param.baseInformation?.name === key) {
          return param;
        }
      }

      return undefined;
    }

    function newParameter(): ConfigParameter {
      return {
        baseInformation: newBaseInformation(1, ObjectType.OT_CONFIG_PARAMETER),
        section: "",
        group: "",
        dataType: ParameterDataType.PDT_STRING,
        value: "",
      };
    }

    async function saveParameter(paramater: ConfigParameter) {
      if (
        paramater.baseInformation?.id !== undefined &&
        paramater.baseInformation.id.uuid.length > 0
      ) {
        await updateParameter(paramater);
      } else {
        await addParameter(paramater);
      }
    }

    async function addParameter(parameter: ConfigParameter) {
      try {
        const connInfo: ConnectionInformation | undefined =
          getHeartbeatStore().getBestSuitedConnection(appName);
        if (connInfo == undefined) {
          getStatusStore().setError(
            `No connection found for app ${appName} to add a new parameter`
          );
          return;
        }
        const request: AddConfigParameterRequest = {
          header: buildRequestHeader(),
          parameter: parameter,
        };
        const { data } = await axios.post<SaveReply>(
          connInfo.toAddress() + "/api/v1/misc/parameters/add",
          request,
          {
            headers: getDefaultRestHeader("AddParameter"),
          }
        );
        //console.log(`SaveReply: ${JSON.stringify(data)}`);
        if (data.header!.successful) {
          parameter.baseInformation!.id!.uuid = data.uuid;
          parameters.value.push(parameter);
        } else {
          getStatusStore().setError(data.header!.errorMessage);
        }
      } catch (error) {
        console.log(`Error: ${error}`);
        if (axios.isAxiosError(error)) {
          const reply: SaveReply = error.response!.data;
          getStatusStore().setError(
            reply.header?.errorCode + " // " + reply.header?.errorMessage
          );
          return;
        } else {
          getStatusStore().setError(JSON.stringify(error));
          return;
        }
      }
    }

    async function updateParameter(parameter: ConfigParameter) {
      try {
        const connInfo: ConnectionInformation | undefined =
          getHeartbeatStore().getBestSuitedConnection(appName);
        if (connInfo == undefined) {
          getStatusStore().setError(
            `No connection found for app ${appName} to update a parameter`
          );
          return;
        }
        const request: UpdateConfigParameterRequest = {
          header: buildRequestHeader(),
          parameter: parameter,
        };
        const { data } = await axios.post<SaveReply>(
          connInfo.toAddress() + "/api/v1/misc/parameters/update",
          request,
          {
            headers: getDefaultRestHeader("UpdateParameter"),
          }
        );
        if (data.header!.successful) {
          replaceParameter(parameter);
        } else {
          getStatusStore().setError(data.header!.errorMessage);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const reply: SaveReply = error.response!.data;
          getStatusStore().setError(
            reply.header?.errorCode + " // " + reply.header?.errorMessage
          );
          return;
        } else {
          getStatusStore().setError(JSON.stringify(error));
          return;
        }
      }
    }

    async function deleteParameter(parameter: ConfigParameter) {
      try {
        const connInfo: ConnectionInformation | undefined =
          getHeartbeatStore().getBestSuitedConnection(appName);
        if (connInfo == undefined) {
          getStatusStore().setError(
            `No connection found for app ${appName} to update a parameter`
          );
          return;
        }
        const request: DeleteConfigParameterRequest = {
          header: buildRequestHeader(),
          parameterId: parameter.baseInformation!.id!.uuid,
        };
        const { data } = await axios.post<ReplyHeader>(
          connInfo.toAddress() + "/api/v1/misc/parameters/delete",
          request,
          {
            headers: getDefaultRestHeader("DeleteParameter"),
          }
        );
        if (data.successful) {
          removeParameter(parameter.baseInformation!.id!.uuid);
        } else {
          getStatusStore().setError(data.errorMessage);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const reply: ReplyHeader = error.response!.data;
          getStatusStore().setError(
            reply.errorCode + " // " + reply.errorMessage
          );
          return;
        } else {
          getStatusStore().setError(JSON.stringify(error));
          return;
        }
      }
    }

    async function getAllParameters() {
      try {
        const connInfo: ConnectionInformation | undefined =
          getHeartbeatStore().getBestSuitedConnection(appName);
        if (connInfo == undefined) {
          getStatusStore().setError(
            `No connection found for app ${appName} to load parameters`
          );
          return;
        }
        parameters.value = [];
        const request: GetConfigParameterRequest = {
          header: buildRequestHeader(),
          filters: [],
        };
        const { data } = await axios.post<GetConfigParameterReply>(
          connInfo.toAddress() + "/api/v1/misc/parameters/get",
          request,
          {
            headers: getDefaultRestHeader("GetParameters"),
          }
        );
        if (data.header!.successful) {
          parameters.value = data.parameters;
          //console.log(
          //  `Loaded parameters: ${JSON.stringify(data)}`
          //);
        } else {
          getStatusStore().setError(data.header!.errorMessage);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const reply: GetConfigParameterReply = error.response!.data;
          getStatusStore().setError(
            reply.header?.errorCode + " // " + reply.header?.errorMessage
          );
          return;
        } else {
          getStatusStore().setError(JSON.stringify(error));
          return;
        }
      }
    }

    return {
      parameters,
      getAllParameters,
      getCachedParameter,
      startListening,
      saveParameter,
      deleteParameter,
      newParameter,
    };
  }
);
