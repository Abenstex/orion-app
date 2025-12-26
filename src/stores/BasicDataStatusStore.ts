import {
  ObjectType,
  ReplyHeader,
  RequestFilter,
  SaveReply,
} from "@/generated/orion_common";
import {
  AddStatusRequest,
  DeleteStatusRequest,
  GetStatusReply,
  GetStatusRequest,
  Status,
  UpdateStatusRequest,
} from "@/generated/status";
import { newBaseInformation } from "@/utils/Utils";
import { getStatusStore } from "./StatusStore";
import type ConnectionInformation from "@/models/ConnectionInformation";
import { getHeartbeatStore } from "./HeartbeatStore";
import { buildRequestHeader, getDefaultRestHeader } from "@/utils/CommUtils";
import axios from "axios";
import { SelectableBaseInformation } from "@/models/SelectableBaseInformation";

export const getBasicDataStatusStore = defineStore(
  "basicDataStatusStore",
  () => {
    const status = ref<Status[]>([]);
    //const statusStore = getStatusStore();
    const appName: string = "orion.status";

    function replaceStatus(statusToReplace: Status) {
      const idx = status.value.findIndex(
        (x) =>
          x.baseInformation?.id?.uuid ===
          statusToReplace.baseInformation?.id?.uuid
      );
      status.value[idx] = statusToReplace;
    }

    function removeStatus(id: string) {
      const idx = status.value.findIndex(
        (x) => x.baseInformation?.id?.uuid === id
      );
      delete status.value[idx];
    }

    function newStatus(): Status {
      return {
        baseInformation: newBaseInformation(1, ObjectType.OT_STATUS),
        isUsable: true,
        allowedForType: ObjectType.OT_SPECIFICATION,
      };
    }

    async function saveStatus(status: Status) {
      if (
        status.baseInformation?.id !== undefined &&
        status.baseInformation.id.uuid.length > 0
      ) {
        await updateStatus(status);
      } else {
        await addStatus(status);
      }
    }

    async function addStatus(statusToSave: Status) {
      try {
        const connInfo: ConnectionInformation | undefined =
          getHeartbeatStore().getBestSuitedConnection(appName);
        if (connInfo == undefined) {
          getStatusStore().setError(
            `No connection found for app ${appName} to add a new status`
          );
          return;
        }
        const request: AddStatusRequest = {
          header: buildRequestHeader(),
          status: statusToSave,
        };
        const { data } = await axios.post<SaveReply>(
          connInfo.toAddress() + "/api/v1/misc/status/add",
          request,
          {
            headers: getDefaultRestHeader("AddStatus"),
          }
        );
        //console.log(`SaveReply: ${JSON.stringify(data)}`);
        if (data.header!.successful) {
          statusToSave.baseInformation!.id!.uuid = data.uuid;
          status.value.push(statusToSave);
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

    async function updateStatus(statusToSave: Status) {
      try {
        const connInfo: ConnectionInformation | undefined =
          getHeartbeatStore().getBestSuitedConnection(appName);
        if (connInfo == undefined) {
          getStatusStore().setError(
            `No connection found for app ${appName} to update a status`
          );
          return;
        }
        const request: UpdateStatusRequest = {
          header: buildRequestHeader(),
          status: statusToSave,
        };
        const { data } = await axios.post<SaveReply>(
          connInfo.toAddress() + "/api/v1/misc/status/update",
          request,
          {
            headers: getDefaultRestHeader("UpdateStatus"),
          }
        );
        if (data.header!.successful) {
          replaceStatus(statusToSave);
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

    async function deleteStatus(statusToDelete: Status) {
      try {
        const connInfo: ConnectionInformation | undefined =
          getHeartbeatStore().getBestSuitedConnection(appName);
        if (connInfo == undefined) {
          getStatusStore().setError(
            `No connection found for app ${appName} to delete a status`
          );
          return;
        }
        const request: DeleteStatusRequest = {
          header: buildRequestHeader(),
          statusId: statusToDelete.baseInformation!.id!.uuid,
        };
        const { data } = await axios.post<ReplyHeader>(
          connInfo.toAddress() + "/api/v1/misc/status/delete",
          request,
          {
            headers: getDefaultRestHeader("DeleteStatus"),
          }
        );
        if (data.successful) {
          removeStatus(statusToDelete.baseInformation!.id!.uuid);
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

    async function getStatusWithFilter(filters: RequestFilter[]) {
      try {
        const connInfo: ConnectionInformation | undefined =
          getHeartbeatStore().getBestSuitedConnection(appName);
        if (connInfo == undefined) {
          getStatusStore().setError(
            `No connection found for app ${appName} to load status`
          );
          return;
        }
        status.value = [];
        const request: GetStatusRequest = {
          header: buildRequestHeader(),
          filters: filters,
        };
        const { data } = await axios.post<GetStatusReply>(
          connInfo.toAddress() + "/api/v1/misc/status/get",
          request,
          {
            headers: getDefaultRestHeader("GetStatus"),
          }
        );
        if (data.header!.successful) {
          status.value = data.status;
        } else {
          getStatusStore().setError(data.header!.errorMessage);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const reply: GetStatusReply = error.response!.data;
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

    async function getAllStatus() {
      try {
        const connInfo: ConnectionInformation | undefined =
          getHeartbeatStore().getBestSuitedConnection(appName);
        if (connInfo == undefined) {
          getStatusStore().setError(
            `No connection found for app ${appName} to load status`
          );
          return;
        }
        status.value = [];
        const request: GetStatusRequest = {
          header: buildRequestHeader(),
          filters: [],
        };
        const { data } = await axios.post<GetStatusReply>(
          connInfo.toAddress() + "/api/v1/misc/status/get",
          request,
          {
            headers: getDefaultRestHeader("GetStatus"),
          }
        );
        if (data.header!.successful) {
          status.value = data.status;
        } else {
          getStatusStore().setError(data.header!.errorMessage);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const reply: GetStatusReply = error.response!.data;
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

    function toSelectableBaseInformation(): SelectableBaseInformation[] {
      let infos: SelectableBaseInformation[] = [];
      for (const obj of status.value) {
        infos.push(new SelectableBaseInformation(obj.baseInformation!));
      }

      return infos;
    }

    return {
      status,
      getAllStatus,
      saveStatus,
      deleteStatus,
      newStatus,
      getStatusWithFilter,
      toSelectableBaseInformation
    };
  }
);
