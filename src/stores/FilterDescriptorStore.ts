import {
  FilterDataType,
  ObjectType,
  type ReplyHeader,
  type RequestFilterDescriptor,
  type SaveReply,
} from "@/generated/orion_common";
import { getStatusStore } from "./StatusStore";
import type ConnectionInformation from "@/models/ConnectionInformation";
import { getHeartbeatStore } from "./HeartbeatStore";
import type {
  AddRequestFilterDescriptorRequest,
  DeleteRequestFilterDescriptorRequest,
  GetRequestFilterDescriptorForObjectTypeRequest,
  GetRequestFilterDescriptorReply,
  GetRequestFilterDescriptorRequest,
  UpdateRequestFilterDescriptorRequest,
} from "@/generated/misc";
import { buildRequestHeader, getDefaultRestHeader } from "@/utils/CommUtils";
import axios from "axios";
import { getUserStore } from "./UserStore";
import { fa } from "vuetify/locale";

export const getFilterDescriptorStore = defineStore(
  "filterDescriptorStore",
  () => {
    const filterDescriptors = ref<RequestFilterDescriptor[]>([]);
    const statusStore = getStatusStore();
    const appName: string = "orion.filter";

    function replaceFilterDescriptor(descriptor: RequestFilterDescriptor) {
      const idx = filterDescriptors.value.findIndex(
        (x) => x.id?.uuid === descriptor.id?.uuid
      );
      filterDescriptors.value[idx] = descriptor;
    }

    function removeFilterDescriptor(id: string) {
      const idx = filterDescriptors.value.findIndex((x) => x.id?.uuid === id);
      delete filterDescriptors.value[idx];
    }

    async function saveFilterDescriptor(
      filterDescriptor: RequestFilterDescriptor
    ) {
      if (
        filterDescriptor.id != undefined &&
        filterDescriptor.id!.uuid.length > 0
      ) {
        await updateFilterDescriptor(filterDescriptor);
      } else {
        await addFilterDescriptor(filterDescriptor);
      }
    }

    async function addFilterDescriptor(
      filterDescriptor: RequestFilterDescriptor
    ) {
      try {
        const connInfo: ConnectionInformation | undefined =
          getHeartbeatStore().getBestSuitedConnection(appName);
        if (connInfo == undefined) {
          getStatusStore().setError(
            `No connection found for app ${appName} to add a new filter descriptor`
          );
          return;
        }
        const request: AddRequestFilterDescriptorRequest = {
          header: buildRequestHeader(),
          descriptor: filterDescriptor,
        };
        const { data } = await axios.post<SaveReply>(
          connInfo.toAddress() + "/api/v1/misc/filter/add",
          request,
          {
            headers: getDefaultRestHeader("AddFilterDescriptor"),
          }
        );
        //console.log(`SaveReply: ${JSON.stringify(data)}`);
        if (data.header!.successful) {
            filterDescriptor.id = { uuid: data.uuid };
          filterDescriptors.value.push(filterDescriptor);
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

    async function updateFilterDescriptor(
      filterDescriptor: RequestFilterDescriptor
    ) {
      try {
        const connInfo: ConnectionInformation | undefined =
          getHeartbeatStore().getBestSuitedConnection(appName);
        if (connInfo == undefined) {
          getStatusStore().setError(
            `No connection found for app ${appName} to update a parameter`
          );
          return;
        }
        const request: UpdateRequestFilterDescriptorRequest = {
          header: buildRequestHeader(),
          descriptor: filterDescriptor,
        };
        const { data } = await axios.post<SaveReply>(
          connInfo.toAddress() + "/api/v1/misc/filter/update",
          request,
          {
            headers: getDefaultRestHeader("UpdateFilterDescriptor"),
          }
        );
        if (data.header!.successful) {
          replaceFilterDescriptor(filterDescriptor);
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

    async function deleteFilterDescriptor(
      filterDescriptor: RequestFilterDescriptor
    ) {
      try {
        const connInfo: ConnectionInformation | undefined =
          getHeartbeatStore().getBestSuitedConnection(appName);
        if (connInfo == undefined) {
          getStatusStore().setError(
            `No connection found for app ${appName} to delete a filter descriptor`
          );
          return;
        }
        const request: DeleteRequestFilterDescriptorRequest = {
          header: buildRequestHeader(),
          descriptor: filterDescriptor,
        };
        const { data } = await axios.post<ReplyHeader>(
          connInfo.toAddress() + "/api/v1/misc/filter/delete",
          request,
          {
            headers: getDefaultRestHeader("DeleteFilterDescriptor"),
          }
        );
        if (data.successful) {
          removeFilterDescriptor(filterDescriptor.id!.uuid);
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

    async function getAllFilterDescriptors() {
      try {
        const connInfo: ConnectionInformation | undefined =
          getHeartbeatStore().getBestSuitedConnection(appName);
        if (connInfo == undefined) {
          getStatusStore().setError(
            `No connection found for app ${appName} to load filter descriptors`
          );
          return;
        }
        filterDescriptors.value = [];
        const request: GetRequestFilterDescriptorRequest = {
          header: buildRequestHeader(),
          filters: [],
        };
        const { data } = await axios.post<GetRequestFilterDescriptorReply>(
          connInfo.toAddress() + "/api/v1/misc/filter/get",
          request,
          {
            headers: getDefaultRestHeader("GetFilterDescriptors"),
          }
        );
        if (data.header!.successful) {
            filterDescriptors.value = data.descriptors;
            console.log(`All descriptors: ${JSON.stringify(data.descriptors)}`);
        } else {
          getStatusStore().setError(data.header!.errorMessage);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const reply: GetRequestFilterDescriptorReply = error.response!.data;
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

    async function getFilterDescriptorsForObjectType(
      objectType: ObjectType
    ): Promise<RequestFilterDescriptor[] | undefined> {
      try {
        const connInfo: ConnectionInformation | undefined =
          getHeartbeatStore().getBestSuitedConnection(appName);
        if (connInfo == undefined) {
          getStatusStore().setError(
            `No connection found for app ${appName} to load filter descriptors`
          );
          return undefined;
        }
        filterDescriptors.value = [];
        const request: GetRequestFilterDescriptorForObjectTypeRequest = {
          header: buildRequestHeader(),
          type: objectType,
        };
        const { data } = await axios.post<GetRequestFilterDescriptorReply>(
          connInfo.toAddress() + "/api/v1/misc/filter/get/type",
          request,
          {
            headers: getDefaultRestHeader("GetFilterDescriptors"),
          }
        );
        if (data.header!.successful) {
          return data.descriptors;
        } else {
          getStatusStore().setError(data.header!.errorMessage);
          return undefined;
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const reply: GetRequestFilterDescriptorReply = error.response!.data;
          getStatusStore().setError(
            reply.header?.errorCode + " // " + reply.header?.errorMessage
          );
          return undefined;
        } else {
          getStatusStore().setError(JSON.stringify(error));
          return undefined;
        }
      }
    }

    function newFilterDescriptor(): RequestFilterDescriptor {
      return {
        id: {uuid: ''},
        key: "",
        objectType: ObjectType.OT_CONFIG_PARAMETER,
        dataType: FilterDataType.FDT_STRING,
        createdBy: getUserStore().user!.baseInformation!.name,
        createdDate: 0n,
        active: true,
        obsolete: false,
      };
    }

    return {
      addFilterDescriptor,
      filterDescriptors,
      deleteFilterDescriptor,
      updateFilterDescriptor,
      getAllFilterDescriptors,
      getFilterDescriptorsForObjectType,
      saveFilterDescriptor,
      newFilterDescriptor,
    };
  }
);
