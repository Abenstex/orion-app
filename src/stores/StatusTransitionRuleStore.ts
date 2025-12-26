import { ObjectType, ReplyHeader, RequestFilter, SaveReply } from "@/generated/orion_common";
import { AddStatusTransitionRuleRequest, DeleteStatusTransitionRuleRequest, GetStatusTransitionRuleReply, GetStatusTransitionRuleRequest, StatusTransitionRule, UpdateStatusRequest, UpdateStatusTransitionRuleRequest } from "@/generated/status";
import type ConnectionInformation from "@/models/ConnectionInformation";
import { newBaseInformation } from "@/utils/Utils";
import { getHeartbeatStore } from "./HeartbeatStore";
import { getStatusStore } from "./StatusStore";
import { buildRequestHeader, getDefaultRestHeader } from "@/utils/CommUtils";
import axios from "axios";
import { SelectableBaseInformation } from "@/models/SelectableBaseInformation";

export const getStatusTransitionRuleStore = defineStore(
  "statusTransitionRuleStore",
  () => {
    const rules = ref<StatusTransitionRule[]>([]);
    const appName: string = "orion.status";

    function replaceRule(ruleToReplace: StatusTransitionRule) {
      const idx = rules.value.findIndex(
        (x) =>
          x.baseInformation?.id?.uuid ===
          ruleToReplace.baseInformation?.id?.uuid
      );
      rules.value[idx] = ruleToReplace;
    }

    function removeRule(id: string) {
      const idx = rules.value.findIndex(
        (x) => x.baseInformation?.id?.uuid === id
      );
      delete rules.value[idx];
    }

    function newStatusTransitionRule(): StatusTransitionRule {
      return {
          baseInformation: newBaseInformation(1, ObjectType.OT_STATUS_TRANSITION_RULE),
          fromStatus: undefined,
          possibleNextStatus: []
      };
    }
      
      async function saveRule(rule: StatusTransitionRule) {
        if (
          rule.baseInformation?.id !== undefined &&
          rule.baseInformation.id.uuid.length > 0
        ) {
          await updateStatus(rule);
        } else {
          await addRule(rule);
        }
      }

      async function addRule(ruleToSave: StatusTransitionRule) {
        try {
          const connInfo: ConnectionInformation | undefined =
            getHeartbeatStore().getBestSuitedConnection(appName);
          if (connInfo == undefined) {
            getStatusStore().setError(
              `No connection found for app ${appName} to add a new status transition rule`
            );
            return;
          }
          const request: AddStatusTransitionRuleRequest = {
            header: buildRequestHeader(),
            rule: ruleToSave,
          };
          const { data } = await axios.post<SaveReply>(
            connInfo.toAddress() + "/api/v1/misc/status_rule/add",
            request,
            {
              headers: getDefaultRestHeader("AddStatusTransitionRule"),
            }
          );
          if (data.header!.successful) {
            ruleToSave.baseInformation!.id!.uuid = data.uuid;
            rules.value.push(ruleToSave);
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

      async function updateStatus(ruleToSave: StatusTransitionRule) {
        try {
          const connInfo: ConnectionInformation | undefined =
            getHeartbeatStore().getBestSuitedConnection(appName);
          if (connInfo == undefined) {
            getStatusStore().setError(
              `No connection found for app ${appName} to update a status transition rule`
            );
            return;
          }
          const request: UpdateStatusTransitionRuleRequest = {
            header: buildRequestHeader(),
            rule: ruleToSave,
          };
          const { data } = await axios.post<SaveReply>(
            connInfo.toAddress() + "/api/v1/misc/status_rule/update",
            request,
            {
              headers: getDefaultRestHeader("UpdateStatusTransitionRule"),
            }
          );
          if (data.header!.successful) {
            replaceRule(ruleToSave);
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
      
      async function deleteRule(ruleToDelete: StatusTransitionRule) {
        try {
          const connInfo: ConnectionInformation | undefined =
            getHeartbeatStore().getBestSuitedConnection(appName);
          if (connInfo == undefined) {
            getStatusStore().setError(
              `No connection found for app ${appName} to delete a status transition rule`
            );
            return;
          }
          const request: DeleteStatusTransitionRuleRequest = {
            header: buildRequestHeader(),
            ruleId: ruleToDelete.baseInformation!.id!.uuid,
          };
          const { data } = await axios.post<ReplyHeader>(
            connInfo.toAddress() + "/api/v1/misc/status_rule/delete",
            request,
            {
              headers: getDefaultRestHeader("DeleteStatusTransitionRule"),
            }
          );
          if (data.successful) {
            removeRule(ruleToDelete.baseInformation!.id!.uuid);
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

      async function getRules(filters: RequestFilter[] = []) {
        try {
          const connInfo: ConnectionInformation | undefined =
            getHeartbeatStore().getBestSuitedConnection(appName);
          if (connInfo == undefined) {
            getStatusStore().setError(
              `No connection found for app ${appName} to load status transition rules`
            );
            return;
          }
          rules.value = [];
          const request: GetStatusTransitionRuleRequest = {
            header: buildRequestHeader(),
            filters: filters,
          };
          const { data } = await axios.post<GetStatusTransitionRuleReply>(
            connInfo.toAddress() + "/api/v1/misc/status_rule/get",
            request,
            {
              headers: getDefaultRestHeader("GetStatus"),
            }
          );
          if (data.header!.successful) {
            rules.value = data.rules;
          } else {
            getStatusStore().setError(data.header!.errorMessage);
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const reply: GetStatusTransitionRuleReply = error.response!.data;
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
          for (const obj of rules.value) {
              infos.push(new SelectableBaseInformation(obj.baseInformation!));
          }

          return infos;
      }

      return {rules, saveRule, deleteRule, getRules, newStatusTransitionRule, toSelectableBaseInformation};
  }
);
