import { RequestHeader, Comment } from "@/generated/orion_common";
import { useAppStore } from "@/stores/app";
import { getUserStore } from "@/stores/UserStore";
import type { GrpcWebOptions } from "@protobuf-ts/grpcweb-transport";
import axios from 'axios';

export function buildRequestHeader(comment?: Comment | undefined): RequestHeader {
    let dummyUser = '';
    if (getUserStore().isLoggedIn) {
        dummyUser = getUserStore().user?.baseInformation!.name!;
    }
    let requestHeader: RequestHeader = {
        senderId: useAppStore().clientId,
        user: dummyUser,
        comment: comment
    }

    return requestHeader;
}

export function getDefaultRpcOptions(serviceName: string, url: string): GrpcWebOptions {
    return {
        meta: {
            'authorization': getUserStore().token,
            'servicename': serviceName,
        },
        baseUrl: url
    }
}

export function getDefaultRestHeader(serviceName: string) {
    return {
        'authorization': getUserStore().token,
        'servicename': serviceName,
        'Content-Type': 'application/json',
        Accept: 'application/json',
    }
}